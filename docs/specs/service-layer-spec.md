# Service Layer Spec

> **Instructions for the AI Agent:** This document defines the full specification for the service layer of the npm package. Read it entirely before writing any code. All decisions made here take precedence over any assumptions. Refer back to the Project Startup Document for project-wide rules and constraints, and to the Form Component Spec for context on how these services are consumed.
>
> The service layer is the **sole point of contact** between the React components and the ServiceNow backend. No component may make direct HTTP calls — all API communication goes through these services.

---

## 1. Architecture Overview

The service layer consists of five modules with a clear dependency hierarchy:

```
CacheService            ← shared in-memory cache, used by any service that needs caching
ServiceNowClient        ← base layer: HTTP, URL construction, error handling
       ↑
  ┌────┴──────────────┬──────────────┬──────────────┐
  │                   │              │              │
RhinoService     RecordService  SearchService      │
(metadata)                                         │
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
interface RawFieldValue {
  value: string
  display_value: string
}

type RawRecord = Record<string, RawFieldValue>

interface TableApiSingleResponse {
  result: RawRecord
}

interface TableApiListResponse {
  result: RawRecord[]
}

interface TableApiErrorResponse {
  error: {
    message: string
    detail: string
  }
  status: 'failure'
}
```

### 2.2 Domain Models
Richer, mapped objects that services return and components consume.

```typescript
interface RecordFieldValue {
  value: string          // Actual stored value
  displayValue: string   // Human-readable display value shown to the user
}

type ServiceNowRecord = Record<string, RecordFieldValue>

// Static field metadata returned by RhinoService.getRecordMetadata().
// Never contains record values — those come from RecordService.
interface FieldData {
  name: string
  label: string
  mandatory: boolean
  readOnly: boolean
  maxLength: number
  type: string
  isChoiceField: boolean
  choices: ChoiceEntry[]
  reference?: string       // Referenced table name (reference fields only)
  referenceQual?: string   // Qualifier string — all three types are passed directly to the
                           // Table API which evaluates them natively server-side:
                           //   simple    → plain encoded query (e.g. 'active=true')
                           //   dynamic   → 'fieldDYNAMICsysId' sentinel
                           //   advanced  → javascript: expression string
  dependentOnField?: string
}

interface ChoiceEntry {
  value: string
  label: string
  dependentValue?: string   // Always the stored value of the parent field, never display value
}

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
- Attach the ServiceNow CSRF token (`X-UserToken`) to all POST and PATCH requests. Read from `window.g_ck`.
- Execute `fetch` calls.
- Unwrap the standard Table API response envelope (`result` field).
- Detect and throw `ServiceNowError` for both HTTP errors and Table API error responses.
- Wrap non-HTTP failures (network errors, etc.) in a consistent error type.

### Shared Path Constants
```typescript
export const TABLE_API_BASE = '/api/now/table'
```

### ServiceNowError
```typescript
class ServiceNowError extends Error {
  status: number        // HTTP status code (0 for network errors)
  detail: string        // Detail message from ServiceNow error response body
}
```

### Interface
```typescript
async function get<T>(path: string, params?: Record<string, string>): Promise<T>
async function post<T>(path: string, body: Record<string, unknown>, params?: Record<string, string>): Promise<T>
async function patch<T>(path: string, body: Record<string, unknown>, params?: Record<string, string>): Promise<T>
```

---

## 4. RhinoService

**File:** `src/client/services/RhinoService.ts`

Responsible for fetching all static field metadata in a single server-side round-trip. The companion app endpoint handles table hierarchy resolution, sys_dictionary lookup, override application, and choice list fetching — all in one call. Results are **cached per table+field-set** for the lifetime of the browser session.

### Endpoint
**Method:** `POST`
**Path:** `/api/x_326171_ssdk_pack/rhino/metadata`
**Requires authentication:** Yes.

### Cache key
`recordmetadata:{table}:{fields.sort().join(',')}`

Note: `sysId` is not part of the cache key — metadata is not record-specific.

### Function

#### `getRecordMetadata(table: string, fields: string[]): Promise<Record<string, FieldData>>`
Fetches static field metadata for all requested fields in one round-trip.

- Posts `{ table, fields }` to the metadata endpoint.
- Returns a map of `fieldName → FieldData`.
- Failed fetches are not cached — a remount will retry.
- Returns an empty object on any error — callers handle missing metadata gracefully.

### What the server returns per field
- `name`, `label`, `mandatory`, `readOnly`, `maxLength`, `type`, `isChoiceField`, `choices[]`
- `reference` (optional) — referenced table name
- `referenceQual` (optional) — pre-resolved qualifier string (see Section 2.2 for format)
- `dependentOnField` (optional)

---

## 5. RecordService

**File:** `src/client/services/RecordService.ts`

All record CRUD operations against the ServiceNow Table API. Results are **never cached**. Uses `TABLE_API_BASE` imported from `ServiceNowClient`.

### Functions

#### `getRecord(table: string, sysId: string, fields?: string[]): Promise<ServiceNowRecord>`
Fetches a single record by sys_id.

- `sysparm_display_value=all` always set.
- If `fields` is omitted, all fields are returned.
- Maps `RawRecord` → `ServiceNowRecord`.

#### `createRecord(table: string, fields: Record<string, string>): Promise<ServiceNowRecord>`
Creates a new record.

- POST to `/api/now/table/{table}`.
- `fields` contains only actual stored values — never display values.
- Returns the created record. Callers should rely only on `sys_id` from the response.

#### `updateRecord(table: string, sysId: string, fields: Record<string, string>): Promise<ServiceNowRecord>`
Updates an existing record.

- PATCH to `/api/now/table/{table}/{sysId}`.
- `fields` contains only the fields to update with actual stored values — never the full record.

---

## 6. SearchService

**File:** `src/client/services/SearchService.ts`

Reference field typeahead search. Results are **never cached**. Uses `TABLE_API_BASE` imported from `ServiceNowClient`.

### Functions

#### `searchRecords(table: string, term: string, searchFields?: string[], limit?: number, filter?: string, displayValueField?: string): Promise<ReferenceSearchResult[]>`
Searches a table for records matching the given term.

- Display value field always included in search, always first in results columns.
- `displayValueField` defaults to `'name'` if not provided — callers with metadata should always pass the resolved value.
- Constructs OR-combined CONTAINS query across all search fields.
- `filter` is ANDed onto the search conditions.
- `limit` defaults to 15.
- `sysparm_display_value=all` always set.

---

## 7. RhinoService — Companion App Endpoint

**File:** `src/server/api/getRecordMetadata.ts`

The server-side handler for `POST /api/x_326171_ssdk_pack/rhino/metadata`. Handles everything needed to return complete static field metadata:

1. Builds table hierarchy using `GlideTableHierarchy`, most-specific-first.
2. Queries `sys_dictionary` for all requested fields across the hierarchy. Most-specific row wins per field.
3. Queries `sys_dictionary_override` and applies overrides (mandatory, readOnly, referenceQual, dependentOnField).
4. For choice fields, queries `sys_choice` filtered by language, uses most-specific table's choices.
5. Pre-resolves `referenceQual`:
   - `simple` → reads `reference_qual_condition`
   - `dynamic` → encodes as `fieldDYNAMICsysId` sentinel
   - `advanced` → reads `reference_qual` javascript: expression
6. Returns one entry per requested field. Fields not found in sys_dictionary return a safe default (type: `string`, all false/zero).

### Request body
```json
{
  "table": "incident",
  "fields": ["short_description", "priority", "assigned_to"],
  "language": "en"
}
```

### Response body
```json
{
  "result": {
    "short_description": {
      "name": "short_description",
      "label": "Short description",
      "mandatory": true,
      "readOnly": false,
      "maxLength": 160,
      "type": "string",
      "isChoiceField": false,
      "choices": [],
      "reference": null,
      "referenceQual": null,
      "dependentOnField": null
    }
  }
}
```

---

## 8. Reference Qualifier Handling

### Qualifier types

| Type | `referenceQual` value | How `ReferenceField` uses it |
|---|---|---|
| Simple | Plain encoded query string | Passed directly as `filter` to `SearchService.searchRecords()` |
| Dynamic | `fieldDYNAMICsysId` sentinel | Passed directly as `filter` to `SearchService.searchRecords()` |
| Advanced | `javascript:` expression string | Passed directly as `filter` to `SearchService.searchRecords()` |
| None | `null` / absent | No qualifier filter applied |

All three qualifier types are fully supported. The `referenceQual` string is passed as-is to `SearchService.searchRecords()` which includes it in the Table API query. ServiceNow's Table API evaluates all three formats natively server-side via `GlideRecord.addEncodedQuery()` — no client-side evaluation is needed.

The developer-supplied `filter` from `FieldDefinition.reference.filter` is always ANDed on regardless of qualifier type.

---

## 9. React Context Providers

### 9.1 ThemeContext

**File:** `src/client/context/ThemeContext.tsx`

Provides the active theme to all components. `Theme` type and `defaultTheme` live in `src/client/theme/theme.ts`. `ThemeContext` imports both and distributes via context.

```typescript
function ThemeProvider({ theme, children }: { theme?: Partial<Theme>, children: ReactNode })
function useTheme(): Theme
```

### 9.2 ServiceNowContext

**File:** `src/client/context/ServiceNowContext.tsx`

Provides instance-level configuration. Currently holds `language` (default: `'en'`), used by the Form when calling `getRecordMetadata`.

```typescript
interface ServiceNowConfig {
  language: string
}

function ServiceNowProvider({ config, children }: { config?: Partial<ServiceNowConfig>, children: ReactNode })
function useServiceNow(): ServiceNowConfig
```

---

## 10. Component Usage Rules

- Components never import `ServiceNowClient` directly — only domain services.
- Components never construct URLs or query strings.
- Components never handle raw API response shapes — services always return mapped domain models.
- All service functions are async — components always handle loading and error states explicitly.
- `ServiceNowError` propagates from any service to the calling component.
- Display values are only ever used for display and client-side filtering. All service calls use actual stored values only.

---

*Document last updated: March 2026 — maintained by EsTech Development*
