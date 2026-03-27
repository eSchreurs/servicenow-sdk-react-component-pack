# List & RecordList — Phase 1: Prerequisites

> **Instructions for the AI Agent:** This document defines Phase 1 of the List & RecordList build. Read this document alongside the List & RecordList Component Spec and the Project Startup Document before writing any code. Complete all acceptance criteria in this phase before moving to Phase 2. Never skip ahead.

---

## Context

| Phase | Deliverable | Depends on |
|-------|-------------|------------|
| **1 (this)** | `EmptyState` atom + `RecordService.getRecords()` | Service Layer (done) |
| 2 | `List` organism — static data, no fetching | Phase 1 |
| 3 | `RecordList` wrapper — fetching and metadata | Phase 2 |
| 4 | Built-in edit modal in `RecordList` | Phase 3 + `Form` (done) |

Phase 1 delivers two independent prerequisites. Neither depends on the other — they can be built in any order or in parallel. Both must be complete before Phase 2 begins.

---

## 1A: `EmptyState` Atom

**File:** `src/client/npm-package/components/atoms/EmptyState.tsx`

Build the `EmptyState` atom as specified in Section 12 of the List & RecordList Component Spec.

This is a general-purpose atom. It is not specific to `List` — it will be used by any organism in the library that needs a zero-results or no-data state, including `Form`, `Calendar`, and `Workboard` widgets. Design it accordingly: no List-specific assumptions, no List-specific props.

### Requirements

- Centred layout: icon area above, message text below.
- Icon area uses the existing `Icon` atom and theme colours only — no external images, no hardcoded colours.
- Message rendered with the existing `Text` atom in secondary colour.
- Accepts `message`, `style`, and `className` props.
- All colours referenced via `useTheme()` — no hardcoded values anywhere.
- Exported from `src/client/npm-package/index.ts`.

### Props interface

```typescript
interface EmptyStateProps {
  message: string
  style?: React.CSSProperties
  className?: string
}
```

### Acceptance criteria

- [ ] Renders correctly with a short message.
- [ ] Renders correctly with a long message — no overflow, wraps cleanly.
- [ ] `style` and `className` props apply to the outer container.
- [ ] Uses `useTheme()` for all colours — confirm no hardcoded colour values in the file.
- [ ] Uses existing `Icon` and `Text` atoms — no new primitives introduced.
- [ ] Exported from `index.ts`.

---

## 1B: `RecordService.getRecords()`

**File:** `src/client/npm-package/services/RecordService.ts` (extend existing file — do not create a new file)

Add `getRecords()` to the existing `RecordService` as specified in Section 8 of the List & RecordList Component Spec.

### Requirements

- Uses `ServiceNowClient.get()` — never calls `fetch()` directly.
- Always appends `sysparm_display_value=all` and `sysparm_count=true` to query params.
- Appends `sys_id` to the `fields` array if not already present — callers should not need to remember this.
- Parses `totalCount` from the `X-Total-Count` response header.
- Maps each result from `RawRecord` → `ServiceNowRecord` using the same mapping pattern already used in `RecordService.getRecord()`. Do not duplicate the mapping logic — extract it to a shared private helper if it is not already one. The mapping pattern must be identical to what `getRecord()` uses.
- Never caches results — consistent with all other `RecordService` functions.
- Throws `ServiceNowError` on HTTP errors — consistent with existing `RecordService` error handling. Do not introduce new error types.

### Function signature

```typescript
getRecords(
  table: string,
  fields: string[],
  options?: {
    filter?: string          // sysparm_query value
    orderBy?: string         // Field name to sort by
    orderDirection?: 'asc' | 'desc'
    limit?: number           // sysparm_limit. Default: 20.
    offset?: number          // sysparm_offset. Default: 0.
  }
): Promise<{ rows: ServiceNowRecord[]; totalCount: number }>
```

### Acceptance criteria

- [ ] Called with a valid table and fields, returns `{ rows: ServiceNowRecord[], totalCount: number }`.
- [ ] `totalCount` reflects the total number of matching records across all pages — not just the current page. Parsed from `X-Total-Count` response header.
- [ ] `sys_id` is present in every returned row even when not explicitly declared in `fields`.
- [ ] `filter` correctly maps to `sysparm_query` in the API request.
- [ ] `orderBy` and `orderDirection` correctly map to `sysparm_orderby` / `sysparm_orderby_desc` as appropriate.
- [ ] `limit` correctly maps to `sysparm_limit`. Defaults to 20 when omitted.
- [ ] `offset` correctly maps to `sysparm_offset`. Defaults to 0 when omitted.
- [ ] Omitting all options fetches with default limit (20) and offset (0).
- [ ] HTTP errors surface as `ServiceNowError` with correct `status` and `detail`.
- [ ] No direct `fetch()` calls — uses `ServiceNowClient.get()` exclusively.
- [ ] No caching introduced — results are always fetched fresh.
- [ ] Mapping from `RawRecord` → `ServiceNowRecord` uses the same logic as `getRecord()` — no duplicated mapping code.

---

## Cross-Phase Rules (apply throughout all phases)

1. **Service layer only.** All HTTP communication goes through `ServiceNowClient` via the domain services. No component calls `fetch()` directly.
2. **No duplicate caching.** `RhinoService` caches metadata via `CacheService`. No component implements its own cache.
3. **No visual code in `RecordList`.** Its render output is always and only `<List ... />`.
4. **`List` owns zero async state.** If `List` has a `useEffect` that fetches data, something is wrong.
5. **Theme only.** All colours, spacing, and typography reference `useTheme()`. No hardcoded values.
6. **Existing atoms first.** Before creating any new visual element, check whether an existing atom covers it.
7. **Complete before continuing.** All acceptance criteria for a phase must pass before the next phase begins.

---

*Document last updated: March 2026 — maintained by EsTech Development*
