# Phase 3 — Service Layer

## Goal
Implement the complete service layer. All services must be fully functional before any component is built — components depend entirely on services for data. Build and complete all services in this phase.

## Reference Documents
- Service Layer Spec (`docs/specs/service-layer-spec.md`) — read in full
- Project Startup Document (`docs/specs/project-startup.md`) — Architecture Notes

---

## Build Order
Build in this exact order — each service depends on the previous:

1. `CacheService`
2. `ServiceNowClient`
3. `MetadataService`
4. `RecordService`
5. `SearchService`
6. `RhinoService`

---

## 1. CacheService (`src/client/services/CacheService.ts`)

Implement the full interface as specified in Service Layer Spec Section 2:
- `has(key)`, `get<T>(key)`, `set<T>(key, value)`, `del(key)`, `invalidate(prefix)`, `clear()`
- `cached<T>(key, fetcher)` — convenience wrapper, does not cache failed fetches

Export all functions individually — no default export.

---

## 2. ServiceNowClient (`src/client/services/ServiceNowClient.ts`)

Implement as specified in Service Layer Spec Section 3:
- Export `TABLE_API_BASE = '/api/now/table'`
- Implement `get<T>`, `post<T>`, `patch<T>`
- Read CSRF token from `window.g_ck` and attach as `X-UserToken` on POST and PATCH
- Unwrap `result` from successful responses
- Throw `ServiceNowError` for HTTP errors and Table API error responses
- Wrap network failures in `ServiceNowError` with `status: 0`

---

## 3. MetadataService (`src/client/services/MetadataService.ts`)

Implement as specified in Service Layer Spec Section 4:

### `getTableHierarchy(table)`
- Calls companion app endpoint `GET /api/x_326171_ssdk_pack/hierarchy/{table}`
- Define `HIERARCHY_ENDPOINT = '/api/x_326171_ssdk_pack/hierarchy'` as a constant
- Cache key: `hierarchy:{table}`
- **Important:** verify the returned array is ordered most-specific-first. If not, reverse it before caching.

### `getFieldMetadata(tables, fields)`
- Queries sys_dictionary with `nameIN{tables}^elementIN{fields}`
- Cache key: `metadata:{[...tables].sort().join(',')}:{[...fields].sort().join(',')}`
- Merges rows per-attribute — see Service Layer Spec Section 4 for the full merge algorithm:
  - Booleans (`mandatory`, `readOnly`): OR across all rows
  - Strings: first non-empty, most-specific-first
  - Numbers: first non-zero, most-specific-first
- After merge, resolves `referenceDisplayField` via a secondary batch query on `sys_dictionary` for `display=true` across all referenced tables. Cache key: `displayfield:{[...referencedTables].sort().join(',')}`

### `getChoices(tables, fields, language?)`
- Language defaults to `'en'`
- Cache key: `choices:{[...tables].sort().join(',')}:{[...fields].sort().join(',')}:{language}`
- Uses whole-table replacement — if any choices exist on the child table, use them entirely. Do not merge per-entry.

### `getFieldLabels(table, fields)`
- Cache key: `labels:{table}:{[...fields].sort().join(',')}`

---

## 4. RecordService (`src/client/services/RecordService.ts`)

Implement as specified in Service Layer Spec Section 5:
- `getRecord(table, sysId, fields?)` — always `sysparm_display_value=all`
- `createRecord(table, fields)` — POST, actual stored values only
- `updateRecord(table, sysId, fields)` — PATCH, actual stored values only, declared fields only
- No caching

---

## 5. SearchService (`src/client/services/SearchService.ts`)

Implement as specified in Service Layer Spec Section 6:
- `searchRecords(table, term, searchFields?, limit?, filter?, displayValueField?)`
- Always includes display value field in search
- `displayValueField` defaults to `'name'` if not provided
- Constructs OR-combined CONTAINS query across all search fields
- ANDs `filter` onto the search query
- Always `sysparm_display_value=all`
- No caching

---

## 6. RhinoService (`src/client/services/RhinoService.ts`)

Implement as specified in Service Layer Spec Section 7:
- Define `RHINO_ENDPOINT = '/api/x_326171_ssdk_pack/rhino/search'` as a constant
- `searchWithQualifier(table, sysId, field, searchTerm, searchFields?, limit?)`
  - Calls the companion app endpoint which handles the entire qualified search server-side
  - Must only be called for `dynamic` or `advanced` qualifier types — caller's responsibility
  - Returns `ReferenceSearchResult[]` on success
  - Returns empty array on any error — never throws
- No caching

---

## Companion App Endpoints

Also implement the two Scripted REST API endpoints. Each endpoint has two parts:
- A Fluent definition in `src/fluent/api/` (`.now.ts`) — declares the REST API artifact
- A handler module in `src/server/api/` (`.ts`) — exports the `process` function

### Hierarchy endpoint
- Fluent definition: `src/fluent/api/hierarchy.now.ts`
- Handler: `src/server/api/hierarchy.ts` — exports `process`
- `GET /api/x_326171_ssdk_pack/hierarchy/{table}`
- Uses `GlideTableHierarchy` — see Service Layer Spec Section 4
- Returns `{ result: string[] }` ordered most-specific-first

### Rhino endpoint
- Fluent definition: `src/fluent/api/rhino.now.ts`
- Handler: `src/server/api/rhino.ts` — exports `process`
- `POST /api/x_326171_ssdk_pack/rhino/search`
- Uses `GlideScopedEvaluator.evaluateScript()` — see Service Layer Spec Section 7.2
- Handles both `advanced` and `dynamic` qualifier types
- Performs the entire search server-side: evaluates qualifier, builds search query, queries reference table
- Returns `{ result: ReferenceSearchResult[] }` — empty array on any failure

Both endpoints require authentication. Both are scoped to `x_326171_ssdk_pack`.

---

## What NOT to Do
- Do not implement any components
- Do not cache record, search, or Rhino results
- Do not use `eval()` or `GlideEvaluator` in the companion app — use `GlideScopedEvaluator` only

---

## Done When
- All six service files are fully implemented and compile without errors
- Both companion app endpoints are implemented
- `CacheService.cached()` is used by all cacheable `MetadataService` functions
- No service calls `fetch` directly — all go through `ServiceNowClient`
- No service contains any React or JSX
