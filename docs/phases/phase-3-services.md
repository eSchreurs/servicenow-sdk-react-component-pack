# Phase 3 — Service Layer

## Goal
Implement the complete service layer. All services must be fully functional before any component is built — components depend entirely on services for data.

## Reference Documents
- Service Layer Spec (`docs/specs/service-layer-spec.md`) — read in full
- Project Startup Document (`docs/specs/project-startup.md`) — Architecture Notes

---

## Build Order
Build in this exact order — each service depends on the previous:

1. `CacheService`
2. `ServiceNowClient`
3. `RhinoService` + companion app metadata endpoint
4. `RecordService`
5. `SearchService`

---

## 1. CacheService (`src/client/services/CacheService.ts`)

Implement the full interface:
- `has(key)`, `get<T>(key)`, `set<T>(key, value)`, `del(key)`, `invalidate(prefix)`, `clear()`
- `cached<T>(key, fetcher)` — convenience wrapper, does not cache failed fetches

Export all functions individually — no default export.

---

## 2. ServiceNowClient (`src/client/services/ServiceNowClient.ts`)

- Export `TABLE_API_BASE = '/api/now/table'`
- Implement `get<T>`, `post<T>`, `patch<T>`
- Read CSRF token from `window.g_ck` and attach as `X-UserToken` on POST and PATCH
- Unwrap `result` from successful responses
- Throw `ServiceNowError` for HTTP errors and Table API error responses
- Wrap network failures in `ServiceNowError` with `status: 0`

---

## 3. RhinoService (`src/client/services/RhinoService.ts`) + Companion App Endpoint

### Client — `RhinoService.ts`

Implement `getRecordMetadata(table, fields)`:
- Posts `{ table, fields }` to `/api/x_326171_ssdk_pack/rhino/metadata`
- Cache key: `recordmetadata:{table}:{[...fields].sort().join(',')}`
- `sysId` is NOT part of the cache key or request body — metadata is not record-specific
- Uses `CacheService.cached()` — no local Map
- Returns `Record<string, FieldData>` — empty object on any error, never throws
- Normalises null values from server to `undefined` for optional fields

### Server — `src/server/api/getRecordMetadata.ts`

Implements `POST /api/x_326171_ssdk_pack/rhino/metadata`.

Accepts: `{ table, fields, language? }`

Executes in order:
1. Build table hierarchy using `GlideTableHierarchy`, most-specific-first
2. Query `sys_dictionary` for all fields across the hierarchy — most-specific row wins per field
3. Query `sys_dictionary_override` and apply overrides (mandatory, readOnly, referenceQual, dependentOnField)
4. Pre-resolve `referenceQual`:
   - `simple` → `reference_qual_condition` value
   - `dynamic` → `fieldDYNAMICsysId` sentinel string
   - `advanced` → `reference_qual` javascript: expression
5. For choice fields, query `sys_choice` filtered by language — use most-specific table's choices
6. Return one entry per requested field. Fields not found return safe defaults (type: `string`, all false/zero)

### Fluent definition — `src/fluent/api/rhino.now.ts`

Declares the Scripted REST API artifact for the metadata endpoint. Requires authentication.

---

## 4. RecordService (`src/client/services/RecordService.ts`)

- `getRecord(table, sysId, fields?)` — always `sysparm_display_value=all`
- `createRecord(table, fields)` — POST, actual stored values only
- `updateRecord(table, sysId, fields)` — PATCH, actual stored values only, declared fields only
- No caching

---

## 5. SearchService (`src/client/services/SearchService.ts`)

- `searchRecords(table, term, searchFields?, limit?, filter?, displayValueField?)`
- Display value field always included in search and always first in result columns
- `displayValueField` defaults to `'name'` if not provided
- Constructs OR-combined CONTAINS query across all search fields
- ANDs `filter` onto the search query
- Always `sysparm_display_value=all`
- No caching

---

## What NOT to Do
- Do not implement any components
- Do not cache record or search results
- Do not add `sysId` to the metadata cache key or request body
- Do not use `eval()` on the server — use `GlideTableHierarchy` and `GlideRecord` only
- No service calls `fetch` directly — all go through `ServiceNowClient`
- No service contains any React or JSX

---

## Done When
- All five service files are fully implemented and compile without errors
- Companion app metadata endpoint is implemented and deployed
- `CacheService.cached()` is used by `RhinoService`
- `RhinoService.getRecordMetadata()` signature is `(table, fields)` — no sysId
- `FieldData` type contains no `value`, `displayValue`, `useReferenceQualifier`, or `dynamicRefQual`
- No service calls `fetch` directly
- No service contains React or JSX
