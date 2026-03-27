# List & RecordList — Phase 3: `RecordList` Wrapper

> **Instructions for the AI Agent:** This document defines Phase 3 of the List & RecordList build. Read this document alongside the List & RecordList Component Spec and the Project Startup Document before writing any code. Phase 2 must be fully complete before starting this phase. Complete all acceptance criteria before moving to Phase 4. Never skip ahead.

---

## Context

| Phase | Deliverable | Depends on |
|-------|-------------|------------|
| 1 | `EmptyState` atom + `RecordService.getRecords()` | Service Layer (done) |
| 2 | `List` organism — static data, no fetching | Phase 1 |
| **3 (this)** | `RecordList` wrapper — fetching and metadata | Phase 2 |
| 4 | Built-in edit modal in `RecordList` | Phase 3 + `Form` (done) |

---

## Overview

Build `RecordList` as specified in Sections 7–9 and 13.2–13.5 of the List & RecordList Component Spec.

`RecordList` is a **data-fetching wrapper around `List`**. It has no visual rendering code of its own. Its entire render output is a single `<List ... />` element with `RecordList`'s state mapped to `List`'s props.

> **Critical constraint:** If at any point during this phase you find yourself writing JSX beyond that single `<List>` element — stop. Any visual concern belongs in `List` (Phase 2), not here. If `List` is missing something it needs, go back and add it to `List` first.

---

## File to create

```
src/client/npm-package/components/organisms/RecordList.tsx
```

Exported from `src/client/npm-package/index.ts`.

---

## Service Layer Usage

`RecordList` uses **exclusively** these two existing services:

- `RhinoService.getRecordMetadata(table, fields)` — already exists, already cached by `RhinoService` via `CacheService`. **Do not re-cache in `RecordList`.** Do not import or use `CacheService` directly. Do not maintain a local `Map` of metadata.
- `RecordService.getRecords(table, fields, options)` — built in Phase 1B.

**Never** import `ServiceNowClient` in `RecordList`. **Never** call `fetch()` directly. **Never** construct URLs or query strings. If you need HTTP behaviour that isn't covered by the two services above, something is wrong — stop and re-read the spec.

---

## State Management

Uses `useReducer` with the full `RecordListAction` type from Section 13.2 of the spec. All state transitions are expressed as dispatched actions — no direct `setState` calls.

```typescript
type RecordListAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; rows: ListRow[]; totalCount: number; resolvedColumns: ColumnDefinition[] }
  | { type: 'FETCH_ERROR'; error: Error }
  | { type: 'FETCH_MORE_START' }
  | { type: 'FETCH_MORE_SUCCESS'; rows: ListRow[] }
  | { type: 'FETCH_MORE_ERROR'; error: Error }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_SORT'; field: string; direction: 'asc' | 'desc' | null }
  | { type: 'SET_SEARCH'; term: string }
  | { type: 'SELECT_ROW';   sysId: string }
  | { type: 'DESELECT_ROW'; sysId: string }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
  | { type: 'OPEN_EDIT_MODAL';  sysId: string }
  | { type: 'CLOSE_EDIT_MODAL' }
  | { type: 'DISMISS_ERROR' }
```

`OPEN_EDIT_MODAL` and `CLOSE_EDIT_MODAL` are defined here but wired in Phase 4. In this phase, when no `onRowEdit` prop is provided and the edit icon is clicked, the action may be dispatched but nothing renders yet — a placeholder or no-op is acceptable for now.

---

## Data Loading

On mount and on every change to `table`, `filter`, current page, sort state, or search term, `RecordList` triggers a new fetch:

1. Dispatch `FETCH_START`.
2. Derive field list from `props.columns[].field`.
3. Call `RhinoService.getRecordMetadata(table, fields)` and `RecordService.getRecords(table, fields, { filter, orderBy, orderDirection, limit, offset })` **in parallel** via `Promise.all`. Never call them sequentially.
4. Build `resolvedColumns` from metadata — see Column Label Resolution below.
5. Map `ServiceNowRecord[]` to `ListRow[]` — each row: `sysId` from `sys_id.value`, `table` from `props.table`, `fields` from the record.
6. Dispatch `FETCH_SUCCESS` with `rows`, `totalCount`, and `resolvedColumns`.
7. On any error: dispatch `FETCH_ERROR`, call `props.onError`.

### Column label resolution

```typescript
const resolvedColumns = props.columns.map(col => ({
  ...col,
  label: col.label ?? metadata[col.field]?.label ?? col.field,
}))
```

Declared labels take precedence. Missing metadata falls back to raw field name — never throws.

---

## Reactivity

### Filter changes

When `props.filter` changes:
- Reset `currentPage` to 1.
- Clear selection (`DESELECT_ALL`).
- Re-fetch.

### Search

Search term arrives via `onSearchChange` (already debounced by `ListToolbar` before reaching `RecordList` — do not debounce again here). When a new search term arrives:
- AND the term onto `props.filter` as a CONTAINS query across all declared column fields.
- Reset to page 1.
- Re-fetch.

### Sort

When `onSortChange` fires with `(field, direction)`:
- Update `sortField` and `sortDirection` in state.
- When `direction` is null: omit `orderBy` and `orderDirection` from the next `getRecords()` call entirely.
- Re-fetch.

---

## Pagination

### Pages mode

- `SET_PAGE` triggers a re-fetch with `offset = (page - 1) * pageSize`.
- `totalPages` passed to `List` = `Math.ceil(state.totalCount / pageSize)`.

### Load-more mode

- Initial fetch uses `offset: 0`.
- When "Load more" is clicked, dispatch `FETCH_MORE_START`. Fetch the next page using `offset = state.rows.length`.
- `FETCH_MORE_SUCCESS` appends new rows to `state.rows` — does not replace them.
- `hasMore` passed to `List` = `state.rows.length < state.totalCount`.

---

## Render Output

The **complete render output** of `RecordList` is this single element. Nothing else:

```tsx
<List
  rows={state.rows}
  columns={state.resolvedColumns}
  loading={state.status === 'loading'}
  error={state.error ?? undefined}
  totalCount={state.totalCount}
  selectable={props.selectable}
  showSearch={props.showSearch}
  emptyMessage={props.emptyMessage}
  pagination={{
    mode: props.pagination?.mode ?? 'pages',
    pageSize: props.pagination?.pageSize ?? 20,
    currentPage: state.currentPage,
    onPageChange: (page) => dispatch({ type: 'SET_PAGE', page }),
    hasMore: state.rows.length < state.totalCount,
    onLoadMore: () => dispatch({ type: 'FETCH_MORE_START' }),
    isLoadingMore: state.status === 'loading-more',
  }}
  onRowEdit={props.onRowEdit ?? ((sysId) => dispatch({ type: 'OPEN_EDIT_MODAL', sysId }))}
  onRowSelect={props.onRowSelect}
  onSortChange={(field, direction) => dispatch({ type: 'SET_SORT', field, direction })}
  onSearchChange={(term) => dispatch({ type: 'SET_SEARCH', term })}
  style={props.style}
  className={props.className}
/>
```

If you are writing any JSX other than this `<List>` element inside `RecordList`'s render — stop. That code is in the wrong place.

---

## Acceptance Criteria

### Data loading

- [ ] On mount with a valid `table` and `columns`, fetches and renders records correctly.
- [ ] `RhinoService.getRecordMetadata()` and `RecordService.getRecords()` are called in parallel via `Promise.all` — not sequentially.
- [ ] Column labels fall back to metadata labels when not explicitly declared in `ColumnDefinition`.
- [ ] Column labels fall back to raw field name when metadata is absent for that field.
- [ ] Each `ListRow` has `sysId` from `sys_id.value` and `table` from `props.table`.

### Filter reactivity

- [ ] Changing `props.filter` resets to page 1, clears selection, and triggers a new fetch.
- [ ] New fetch uses the updated `filter` value.

### Search

- [ ] Typing in the search input (debounced by `ListToolbar`) triggers a new server-side fetch with the search term ANDed onto `filter`.
- [ ] List resets to page 1 on each new search term.

### Sort

- [ ] Clicking a sortable column triggers a new fetch with correct `orderBy` and `orderDirection`.
- [ ] Clearing sort (direction = `null`) triggers a new fetch without `orderBy` or `orderDirection` params.
- [ ] Only one column is sorted at a time — changing sort column clears the previous sort.

### Pagination — pages mode

- [ ] Clicking a page button triggers a new fetch with the correct `offset`.
- [ ] `totalPages` passed to `List` is `Math.ceil(totalCount / pageSize)`.

### Pagination — load-more mode

- [ ] Clicking "Load more" fetches the next page and appends rows to the existing list.
- [ ] `hasMore` is correctly `true` when more records exist and `false` when all are loaded.
- [ ] `isLoadingMore` is `true` only during a load-more fetch — not during initial load.

### Selection

- [ ] `onRowSelect` fires correctly when rows are selected/deselected via `List`.
- [ ] Selection is cleared when `filter`, `sortField`, or `searchTerm` changes.

### Edit

- [ ] `onRowEdit` provided: clicking the edit icon fires the callback. No modal rendered.
- [ ] `onRowEdit` not provided: clicking the edit icon dispatches `OPEN_EDIT_MODAL`. Modal rendering is deferred to Phase 4 — a no-op or placeholder is acceptable here.

### Error handling

- [ ] Fetch failure: `onError` is called with the error. `List` receives the error via the `error` prop and renders full-list error state.
- [ ] Load-more failure: `onError` called. Existing rows remain visible.

### Service layer

- [ ] `RhinoService` is the only caching mechanism — no local `Map`, no `CacheService` usage directly in `RecordList`.
- [ ] No `ServiceNowClient` import in `RecordList`.
- [ ] No direct `fetch()` calls in `RecordList`.

### Visual isolation

- [ ] No JSX in `RecordList`'s render beyond the single `<List ... />` element.
- [ ] `List` requires **zero changes** as a result of building `RecordList`. If `List` needs to change, the architectural boundary has been violated — stop and resolve it correctly.

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
