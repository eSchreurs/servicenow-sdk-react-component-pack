# Service Layer Spec

> **Instructions for the AI Agent:** This document defines the full specification for the service layer of the npm package. Read it entirely before writing any code. All decisions made here take precedence over any assumptions. Refer back to the Project Startup Document for project-wide rules and constraints, and to the Form Component Spec for context on how these services are consumed.
>
> The service layer is the **sole point of contact** between the React components and the ServiceNow backend. No component may make direct HTTP calls — all API communication goes through these services.

---

## 1. Architecture Overview

The service layer consists of six modules with a clear dependency hierarchy:

```
CacheService            ← shared in-memory cache, used by any service that needs caching
ServiceNowClient        ← base layer: HTTP, URL construction, error handling
       ↑
  ┌────┴──────────────┬──────────────┬──────────────┐
  │                   │              │              │
MetadataService  RecordService  SearchService  RhinoService
```

- **`CacheService`** owns all in-memory cached state. Any service that needs caching imports and uses it — never maintains its own local `Map`.
- **`ServiceNowClient`** is the only module that makes raw `fetch` calls. All other services use it exclusively for HTTP communication.
- **Domain services** own their own logic, query construction, response mapping, and delegate caching to `CacheService`. They are independently importable and usable by any component.
- All services use **relative URLs** only. Auth is handled automatically by the browser session cookie.

---

## 2. Types Architecture

All shared types live in `src/client/types/index.ts`. There is a deliberate distinction between two categories of types:

### 2.1 API Response Shapes
Raw shapes returned by the ServiceNow APIs. Services receive these and map them to domain models before returning anything to a component. Components never see raw API shapes.

```typescript
// A single field value as returned by the Table API with sysparm_display_value=all
interface RawFieldValue {
  value: string
  display_value: string
}

// A raw record as returned by the Table API — keyed by field name
type RawRecord = Record<string, RawFieldValue>

// Standard Table API single-record response envelope
interface TableApiSingleResponse {
  result: RawRecord
}

// Standard Table API multi-record response envelope
interface TableApiListResponse {
  result: RawRecord[]
}

// Standard Table API error response envelope
interface TableApiErrorResponse {
  error: {
    message: string
    detail: string
  }
  status: 'failure'
}
```

### 2.2 Domain Models
Richer, mapped objects that services return and components consume. These represent ServiceNow concepts in a form the app can work with directly.

```typescript
// A fully mapped record field value — used throughout the app
interface RecordFieldValue {
  value: string          // Actual stored value (sys_id, integer key, raw string, etc.)
  displayValue: string   // Human-readable display value shown to the user
}

// A fully mapped record — keyed by field name
type ServiceNowRecord = Record<string, RecordFieldValue>

// Field metadata as mapped from sys_dictionary
interface FieldMetadata {
  name: string
  label: string
  type: string
  maxLength: number
  mandatory: boolean
  readOnly: boolean
  choice: number
  reference?: string
  referenceLabel?: string
  useReferenceQualifier?: 'simple' | 'dynamic' | 'advanced'
  referenceQual?: string
  dynamicRefQual?: string
  dependentOnField?: string       // Only relevant for choice fields (see Form Component Spec)
}

// A single choice entry as mapped from sys_choice
interface ChoiceEntry {
  value: string
  label: string
  dependentValue?: string         // Always the stored value of the parent field, never display value
}

// A single result from a reference field search
interface ReferenceSearchResult {
  sysId: string
  displayValue: string
  columns: Array<{ field: string; value: string }>  // display value field always first
}
```

### 2.3 Mapping Rule
Every service function that calls an API receives a raw API shape and returns a domain model. This mapping always happens inside the service — never in a component. Components import and use only domain model types.

---

## 3. ServiceNowClient

**File:** `src/client/services/ServiceNowClient.ts`

The base HTTP layer. All other services use this exclusively for making requests. Never used directly by components.

### Responsibilities
- Construct full relative URLs from endpoint paths and query parameters.
- Attach required headers: `Accept: application/json`, `Content-Type: application/json`.
- Attach the ServiceNow CSRF token (`X-UserToken`) to all POST and PATCH requests. The token is available at runtime via `window.g_ck`, which ServiceNow sets globally on every page. Read it once and include it as a request header — without it, POST and PATCH requests will be rejected with 403 on instances with CSRF protection enabled.
- Execute `fetch` calls.
- Unwrap the standard Table API response envelope (`result` field).
- Detect and throw `ServiceNowError` for both HTTP errors and Table API error responses.
- Wrap non-HTTP failures (network errors, etc.) in a consistent error type.

### Shared Path Constants
To avoid duplication across services, `ServiceNowClient` exports the following path constants:

```typescript
export const TABLE_API_BASE = '/api/now/table'
```

All services import these constants from `ServiceNowClient` rather than defining their own.

### ServiceNowError
```typescript
class ServiceNowError extends Error {
  status: number        // HTTP status code (0 for network errors)
  detail: string        // Detail message from ServiceNow error response body
}
```

### Table API Response Handling
The ServiceNow Table API always wraps responses in a standard envelope. `ServiceNowClient` handles unwrapping:

- **Success (single record):** `{ result: { ... } }` → returns the `result` object
- **Success (multiple records):** `{ result: [ ... ] }` → returns the `result` array
- **Error:** `{ error: { message, detail }, status: 'failure' }` → throws `ServiceNowError`
- **HTTP error (4xx/5xx):** throws `ServiceNowError` with the HTTP status code

### Interface
```typescript
// GET — query params serialised into the URL
async function get<T>(path: string, params?: Record<string, string>): Promise<T>

// POST — body serialised as JSON
async function post<T>(path: string, body: Record<string, unknown>): Promise<T>

// PATCH — body serialised as JSON
async function patch<T>(path: string, body: Record<string, unknown>): Promise<T>
```

All functions are async, return typed promises, and throw `ServiceNowError` on any failure. The caller (domain service) is responsible for typing the response via `T`.

---

## 4. MetadataService

**File:** `src/client/services/MetadataService.ts`

All read-only ServiceNow metadata. All results are **cached in memory** for the lifetime of the browser session using a module-level `Map` — no third-party caching library. Cache is never invalidated during a session — metadata does not change while the app is running.

```typescript
// Module-level cache — persists for the browser session, resets on page refresh
const cache = new Map<string, unknown>()
```

### Functions

#### `getTableHierarchy(table: string): Promise<string[]>`
Returns the full table hierarchy as an ordered array from most specific to most general (e.g. `['incident', 'task', 'sys_activity']`).

- **Endpoint:** `GET /api/now/table/sys_db_object?sysparm_query=name={table}&sysparm_fields=name,super_class.name`
- **Cache key:** `hierarchy:{table}`
- Traverses the hierarchy by following `super_class` references until no parent exists.
- Returns the table itself as the first element.

#### `getFieldMetadata(tables: string[], fields: string[]): Promise<FieldMetadata[]>`
Returns metadata for the specified fields, resolved across the given table hierarchy using ServiceNow's override flag semantics.

- **Endpoint:** `GET /api/now/table/sys_dictionary?sysparm_query=nameIN{tables}^elementIN{fields}`
- **Cache key:** `metadata:{tables.join(',')}:{fields.sort().join(',')}`
- Fetches: `name, element, column_label, internal_type, max_length, mandatory, override_mandatory, read_only, override_read_only, choice, reference, use_reference_qualifier, reference_qual, dynamic_ref_qual, override_reference_qualifier, dependent_on_field`
- Returns one `FieldMetadata` entry per unique field name.
- Fields not found anywhere in the hierarchy are omitted — callers handle missing metadata gracefully.

**Merge algorithm** (rows sorted most-specific-first within each field):

- **Boolean fields** (`mandatory`, `read_only`): walk rows most-specific-first. The first row whose override flag (`override_mandatory` / `override_read_only`) is `true` is authoritative — use its value and stop. If no row has the override flag, fall back to the base (last) row's value. OR-across-all is wrong: a child can explicitly set `mandatory=false` with the override flag, which removes mandatory from an otherwise-mandatory parent field.
- **Qualifier fields** (`use_reference_qualifier`, `reference_qual`, `dynamic_ref_qual`): resolved as a set from one row — they must never be mixed across rows. Walk most-specific-first; the first row with `override_reference_qualifier=true` wins. If no row has the override, use the base (last) row.
- **String fields** (`column_label`, `internal_type`, `reference`, `dependent_on_field`): first non-empty, most-specific-first.
- **Number fields** (`max_length`, `choice`): first non-zero, most-specific-first.

#### `getChoices(tables: string[], fields: string[]): Promise<Record<string, ChoiceEntry[]>>`
Returns all choice entries for the specified fields, resolved across the table hierarchy.

- **Endpoint:** `GET /api/now/table/sys_choice?sysparm_query=nameIN{tables}^elementIN{fields}^language=en`
- **Cache key:** `choices:{tables.join(',')}:{fields.sort().join(',')}`
- Returns a map of `fieldName → ChoiceEntry[]`.
- For each field, uses choices from the most specific table in the hierarchy that has entries. Falls back up the hierarchy if none exist at a given level.
- Includes `dependent_value` per entry where configured.
- Fields with no choices anywhere in the hierarchy are omitted from the result map.

#### `getFieldLabels(table: string, fields: string[]): Promise<Record<string, string>>`
Returns display labels for a set of fields on a given table. Used by `ReferenceField` for the info popover.

- **Endpoint:** `GET /api/now/table/sys_dictionary?sysparm_query=name={table}^elementIN{fields}&sysparm_fields=element,column_label`
- **Cache key:** `labels:{table}:{fields.sort().join(',')}`
- Returns a map of `fieldName → label`.

---

## 5. RecordService

**File:** `src/client/services/RecordService.ts`

All record CRUD operations against the ServiceNow Table API. Results are **never cached** — records can change at any time during a session. Uses `TABLE_API_BASE` imported from `ServiceNowClient`.

### Functions

#### `getRecord(table: string, sysId: string, fields?: string[]): Promise<ServiceNowRecord>`
Fetches a single record by sys_id.

- **Endpoint:** `GET /api/now/table/{table}/{sysId}?sysparm_display_value=all&sysparm_fields={fields}`
- `sysparm_display_value=all` is always set — both actual value and display value are always returned.
- If `fields` is omitted, all fields are returned.
- Maps `RawRecord` → `ServiceNowRecord` (snake_case `display_value` → camelCase `displayValue`).

#### `createRecord(table: string, fields: Record<string, string>): Promise<ServiceNowRecord>`
Creates a new record.

- **Endpoint:** `POST /api/now/table/{table}`
- `fields` contains only field names and their actual stored values — never display values (per the display value rule).
- Returns the created record as `ServiceNowRecord`. Note: the Table API POST response only returns the fields that were submitted plus `sys_id` — not the full record. Callers should only rely on `sys_id` from the create response. The Form uses this to populate `SaveResult.sysId`.

#### `updateRecord(table: string, sysId: string, fields: Record<string, string>): Promise<ServiceNowRecord>`
Updates an existing record.

- **Endpoint:** `PATCH /api/now/table/{table}/{sysId}`
- `fields` contains only the fields to update with their actual stored values — never display values, never the full record.
- Returns the updated record as `ServiceNowRecord`.

---

## 6. SearchService

**File:** `src/client/services/SearchService.ts`

Reference field typeahead search. General-purpose — usable by any component that needs to search for ServiceNow records. Results are **never cached**. Uses `TABLE_API_BASE` imported from `ServiceNowClient`.

### Functions

#### `searchRecords(table: string, term: string, searchFields?: string[], limit?: number, filter?: string): Promise<ReferenceSearchResult[]>`
Searches a table for records matching the given term.

- **Endpoint:** `GET /api/now/table/{table}`
- Constructs an encoded query searching for `term` across `searchFields` using `CONTAINS` with OR conditions (e.g. `nameCONTAINSab^ORemailCONTAINSab`). The table's display value field is always included in the search regardless of `searchFields`.
- `filter` is an additional encoded query ANDed onto the search conditions (resolved reference qualifier + developer-supplied filter).
- `limit` defaults to 15 if not specified.
- `sysparm_display_value=all` always set.
- `sysparm_fields` set to `sys_id` + display value field + configured `searchFields`.
- Maps raw API results to `ReferenceSearchResult[]` — `columns` populated in order of `searchFields`, display value field always first.

---

## 7. RhinoService

**File:** `src/client/services/RhinoService.ts`

Responsible for server-side evaluation of reference field qualifiers. Calls a Scripted REST API in the ServiceNow companion app, which reads the qualifier directly from sys_dictionary, evaluates it using `GlideScopedEvaluator` with a real `GlideRecord` as `current`, queries the reference table, and returns filtered search results. Results are **never cached** — but calls are minimised through a dirty flag strategy (see Section 7.3).

### 7.1 Qualifier Type Handling

All `javascript:`-based qualifiers — both dynamic and advanced — are always evaluated server-side via Rhino. There is no client-side evaluation path for any `javascript:` expression. Simple qualifiers (plain encoded query strings) do not need Rhino evaluation and are applied directly as filters in `SearchService`.

| Qualifier type | `use_reference_qualifier` | Handling |
|---|---|---|
| Simple | `simple` | Applied directly as filter in `SearchService` — Rhino not involved |
| Advanced | `advanced` | Always sent to Rhino endpoint |
| Dynamic | `dynamic` | Always sent to Rhino endpoint |

### 7.2 Companion App — Scripted REST Endpoint

This endpoint is implemented in the ServiceNow companion app. It handles the entire qualified reference field search server-side — reading the qualifier from sys_dictionary, evaluating it, and returning search results. The qualifier expression never passes through the browser.

**Method:** `POST`
**Path:** `/api/x_326171_ssdk_pack/rhino/search`
**Requires authentication:** Yes — caller must be authenticated via active session.

#### Request body
```json
{
  "table": "incident",        // Table the form record belongs to (for current)
  "sysId": "abc123",          // sys_id of the form record (empty string for new records)
  "field": "assigned_to",     // The reference field name (used to look up sys_dictionary)
  "searchTerm": "john",       // The user's search input
  "searchFields": ["name", "email"],  // Additional fields to search across (display value always included)
  "limit": 15                 // Max results to return
}
```

#### Server-side execution
```javascript
(function process(request, response) {
    var body = request.body.data;

    // 1. Load current record — provides full GlideRecord context for qualifier evaluation
    var current = new GlideRecord(body.table);
    if (body.sysId) current.get(body.sysId);

    // 2. Read qualifier configuration from sys_dictionary
    var dictGR = new GlideRecord('sys_dictionary');
    dictGR.addQuery('name', body.table);
    dictGR.addQuery('element', body.field);
    dictGR.query();
    dictGR.next();

    var referenceTable = dictGR.getValue('reference');
    var qualType = dictGR.getValue('use_reference_qualifier');

    // 3. Evaluate qualifier using GlideScopedEvaluator against the actual script field
    //    on the GlideRecord — no raw string passing, no eval(), no temporary records
    var qualifier = '';
    var evaluator = new GlideScopedEvaluator();
    evaluator.putVariable('current', current);

    if (qualType === 'advanced') {
        // reference_qual is a field on sys_dictionary — exactly what GlideScopedEvaluator needs
        qualifier = evaluator.evaluateScript(dictGR, 'reference_qual') || '';
    } else if (qualType === 'dynamic') {
        // Load the dynamic filter option record and evaluate its filter_script field
        var dynGR = new GlideRecord('sys_filter_option_dynamic');
        dynGR.get(dictGR.getValue('dynamic_ref_qual'));
        qualifier = evaluator.evaluateScript(dynGR, 'filter_script') || '';
    }
    // Simple qualifier: no evaluation needed, handled client-side via SearchService

    // 4. Build search query across searchFields using CONTAINS with OR
    //    Display value field is always included regardless of searchFields
    var searchParts = [];
    var displayField = dictGR.getDisplayValue('reference'); // display field of reference table
    searchParts.push(displayField + 'CONTAINS' + body.searchTerm);
    if (body.searchFields) {
        body.searchFields.forEach(function(f) {
            if (f !== displayField) searchParts.push(f + 'CONTAINS' + body.searchTerm);
        });
    }
    var searchQuery = searchParts.join('^OR');
    if (qualifier) searchQuery = '(' + searchQuery + ')^' + qualifier;

    // 5. Query the reference table and build results
    var gr = new GlideRecord(referenceTable);
    gr.addEncodedQuery(searchQuery);
    gr.setLimit(body.limit || 15);
    gr.query();

    var results = [];
    while (gr.next()) {
        var columns = [{ field: displayField, value: gr.getDisplayValue(displayField) }];
        if (body.searchFields) {
            body.searchFields.forEach(function(f) {
                if (f !== displayField) columns.push({ field: f, value: gr.getDisplayValue(f) });
            });
        }
        results.push({ sysId: gr.getUniqueValue(), displayValue: gr.getDisplayValue(), columns: columns });
    }

    response.setBody({ result: results });
})(request, response);
```

#### Response body
```json
{
  "result": [
    {
      "sysId": "abc123",
      "displayValue": "John Smith",
      "columns": [
        { "field": "name", "value": "John Smith" },
        { "field": "email", "value": "john.smith@company.com" }
      ]
    }
  ]
}
```

Returns an empty `result` array if no records match or if qualifier evaluation fails.

#### New record behavior
When `sysId` is an empty string, `current.get()` is not called — `current` is an empty `GlideRecord` for the given table. All `current.field` references in the qualifier return empty values. This matches native ServiceNow behavior for new records.

#### Note on `reference_qual` and `javascript:` prefix
ServiceNow stores the `javascript:` prefix as part of the `reference_qual` field value for advanced qualifiers. `GlideScopedEvaluator` may need the prefix stripped before evaluation — this must be verified on a real instance. If needed, strip `javascript:` from the field value before calling `evaluateScript`.

---

### 7.3 Qualifier Caching & Dirty Flag Strategy

Rhino calls are expensive relative to direct Table API calls. To minimise them while always keeping the qualifier filter current:

#### Per `ReferenceField` instance, maintain:
```typescript
interface QualifierCache {
  resolvedFilter: string    // The encoded query string returned by the last Rhino call
  isDirty: boolean          // True if any form field has changed since last resolution
}
```

#### Rules:
- **On initial form load:** `resolvedFilter = ''`, `isDirty = true` — forces resolution on first interaction.
- **When any form field changes** (any field, not just related ones): set `isDirty = true` on all `ReferenceField` instances in the form. We cannot know which fields a qualifier depends on for dynamic/advanced types, so all are marked dirty conservatively.
- **When the user interacts with a `ReferenceField`** (focuses input or starts typing):
  - If `isDirty = false`: use `resolvedFilter` directly — no Rhino call needed.
  - If `isDirty = true`: call the Rhino endpoint, update `resolvedFilter` with the result, set `isDirty = false`, then proceed with the search using the fresh filter.
- **Simple qualifiers** (`use_reference_qualifier = 'simple'`): never use Rhino. The encoded query string from metadata is applied directly and permanently — no dirty flag needed.

#### Result:
- If the user edits 5 fields and then opens a reference field dropdown: **one Rhino call**, at the moment of interaction.
- If the user types multiple characters in the same reference field without touching other fields: **no additional Rhino calls** — the cached filter is reused for every search.
- Simple qualifiers: **zero Rhino calls** ever.

---

### 7.4 `RhinoService` Function

Since the companion app endpoint handles the entire search server-side, `RhinoService` exposes a single search function rather than a qualifier evaluation function. `SearchService` handles all non-Rhino reference searches.

#### `searchWithQualifier(table: string, sysId: string, field: string, searchTerm: string, searchFields?: string[], limit?: number): Promise<ReferenceSearchResult[]>`

Calls the companion app endpoint to perform a fully qualified reference field search server-side.

- `table` and `sysId`: identify the record to use as `current`.
- `field`: the reference field name — the endpoint reads its qualifier from sys_dictionary.
- `searchTerm`: the user's current input.
- `searchFields`: additional fields to search and display in results.
- `limit`: max results, defaults to 15.
- Returns `ReferenceSearchResult[]` mapped from the endpoint response.
- On any error, returns an empty array — the `ReferenceField` shows "No results found" rather than an error state, to avoid blocking the user.

---

## 9. React Context Providers

React Context is used to distribute shared configuration and state across the component tree without prop drilling. Context providers are not services — they hold no API logic. They are React-specific wrappers that make values available to any component inside them via `useContext`.

The following contexts are defined for this library. Developers wrap their application once with these providers at the top level.

---

### 9.1 ThemeContext

**File:** `src/client/context/ThemeContext.tsx`

Provides the active theme object to all components in the tree. Every component uses it for styling — colors, fonts, sizes, spacing, borders. Without it, components fall back to the default theme.

The `Theme` type definition and `defaultTheme` object live in `src/client/theme/theme.ts` — the single source of truth for theme shape and defaults. `ThemeContext.tsx` imports both from there. The theme file defines what a theme looks like; `ThemeContext` distributes it across the component tree.

```typescript
// src/client/theme/theme.ts — defines the shape and defaults
export interface Theme {
  colorPrimary: string
  colorSecondary: string
  colorDanger: string
  colorText: string
  colorBackground: string
  colorBorder: string
  fontFamily: string
  fontSizeBase: string
  fontSizeSmall: string
  fontSizeLarge: string
  spacingUnit: string
  borderRadius: string
  borderWidth: string
  // ... extended as needed
}

export const defaultTheme: Theme = { /* sensible defaults */ }

// src/client/context/ThemeContext.tsx — imports from theme.ts and distributes
import { Theme, defaultTheme } from '../theme/theme'

const ThemeContext = createContext<Theme>(defaultTheme)

function ThemeProvider({ theme, children }: { theme?: Partial<Theme>, children: ReactNode }) {
  const mergedTheme = { ...defaultTheme, ...theme }
  return <ThemeContext.Provider value={mergedTheme}>{children}</ThemeContext.Provider>
}

function useTheme(): Theme {
  return useContext(ThemeContext)
}
```

**Usage by developer:**
```tsx
<ThemeProvider theme={{ colorPrimary: '#0057b8', fontFamily: 'Inter' }}>
  <MyApp />
</ThemeProvider>
```

**Usage inside components:**
```tsx
const theme = useTheme()
// use theme.colorPrimary, theme.borderRadius, etc.
```

---

### 9.2 ServiceNowContext

**File:** `src/client/context/ServiceNowContext.tsx`

Provides instance-level configuration to all components. Grows over time as more instance-specific settings are needed.

```typescript
interface ServiceNowConfig {
  language: string    // Language code for choice list fetching. Default: 'en'
  // Future additions: instanceUrl (if ever needed), timezone, etc.
}

const defaultConfig: ServiceNowConfig = {
  language: 'en',
}

const ServiceNowContext = createContext<ServiceNowConfig>(defaultConfig)

function ServiceNowProvider({ config, children }: { config?: Partial<ServiceNowConfig>, children: ReactNode }) {
  const mergedConfig = { ...defaultConfig, ...config }
  return <ServiceNowContext.Provider value={mergedConfig}>{children}</ServiceNowContext.Provider>
}

function useServiceNow(): ServiceNowConfig {
  return useContext(ServiceNowContext)
}
```

**Usage by developer:**
```tsx
<ServiceNowProvider config={{ language: 'nl' }}>
  <MyApp />
</ServiceNowProvider>
```

The `Form` organism reads `language` from this context via `useServiceNow()` during data loading and passes it to `MetadataService.getChoices()`. Individual field components do not consume this context directly — the Form is the point of consumption for instance-level configuration.

---

### 9.3 UserPreferenceContext (future)

**File:** `src/client/context/UserPreferenceContext.tsx` *(not yet implemented)*

Reserved for user-specific settings that affect component behavior — e.g. preferred date format, locale, accessibility preferences, default field display options. Will follow the same pattern as `ThemeContext` and `ServiceNowContext`.

Not implemented in the current phase. Defined here to establish its place in the architecture and prevent ad-hoc solutions when the need arises.

---

## 10. Component Usage Rules

- The output of `MetadataService.getTableHierarchy()` is passed directly as the `tables` parameter to `MetadataService.getFieldMetadata()` and `MetadataService.getChoices()`. Always resolve the hierarchy first before calling these functions.
- `MetadataService.getChoices()` accepts an optional `language` parameter (defaults to `'en'`). Components or organisms that need multi-language support should pass the appropriate language code. The `Form` component may expose a `language` prop for this purpose.
- Components never import `ServiceNowClient` directly — only domain services.
- Components never construct URLs or query strings.
- Components never handle raw API response shapes — services always return mapped domain models.
- All service functions are async — components always handle loading and error states explicitly.
- `ServiceNowError` propagates from any service to the calling component. For `MetadataService` failures during form load, the Form treats these as load failures and renders the full-form error state. Failed metadata fetches are not cached — a remount will retry.
- Display values are only ever used for display and client-side filtering. All service calls use actual stored values only — never display values in queries, saves, or any data operation.

---

*Document last updated: March 2026 — maintained by EsTech Development*
