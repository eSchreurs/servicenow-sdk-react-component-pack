# List & RecordList — Build Phases

> **Instructions for the AI Agent:** This document defines the phased build plan for the `List` and `RecordList` organisms. Read this document alongside the List & RecordList Component Spec and the Project Startup Document before writing any code. Complete each phase fully before starting the next. A phase is complete when all its acceptance criteria pass. Never skip ahead.

---

## Overview

| Phase | Deliverable | Depends on |
|-------|-------------|------------|
| 1 | `EmptyState` atom + `RecordService.getRecords()` | Service Layer (done) |
| 2 | `List` organism — static data, no fetching | Phase 1 |
| 3 | `RecordList` wrapper — fetching and metadata | Phase 2 |
| 4 | Built-in edit modal in `RecordList` | Phase 3 + `Form` organism (done) |

---

## Phase 1 — Prerequisites

### 1A: `EmptyState` atom

**File:** `src/client/npm-package/components/atoms/EmptyState.tsx`

Build the `EmptyState` atom as specified in Section 12 of the List & RecordList Component Spec.

- Centred layout: icon area above, message text below.
- Icon area uses theme colours only — no external images or icon libraries beyond the existing `Icon` atom.
- Message rendered with the existing `Text` atom in secondary colour.
- Accepts `style` and `className` props for override.
- Exported from `src/client/npm-package/index.ts`.

**Acceptance criteria:**
- Renders correctly with a short message.
- Renders correctly with a long message (no overflow, wraps cleanly).
- `style` and `className` props apply correctly.
- Uses `useTheme()` for all colours — no hardcoded values.

---

### 1B: `RecordService.getRecords()`

**File:** `src/client/npm-package/services/RecordService.ts` (extend existing file)

Add the `getRecords()` function to the existing `RecordService` as specified in Section 8 of the List & RecordList Component Spec.

- Uses `ServiceNowClient.get()` — never calls `fetch()` directly.
- Always appends `sysparm_display_value=all` and `sysparm_count=true` to query params.
- Appends `sys_id` to the `fields` array if not already present.
- Parses `totalCount` from the `X-Total-Count` response header.
- Maps each result from `RawRecord` → `ServiceNowRecord` using the same mapping pattern already used in `RecordService.getRecord()`. Do not duplicate the mapping logic — extract it to a shared private helper if it isn't already.
- Never caches results — consistent with all other `RecordService` functions.
- Throws `ServiceNowError` on HTTP errors, consistent with existing `RecordService` error handling.

**Acceptance criteria:**
- Called with a valid table and fields, returns `{ rows: ServiceNowRecord[], totalCount: number }`.
- `totalCount` correctly reflects the total number of records in the table matching the filter, not just the current page.
- `sys_id` is present in every returned row even when not explicitly declared in `fields`.
- `filter`, `orderBy`, `orderDirection`, `limit`, and `offset` all correctly affect the API request.
- Omitting all options fetches with default limit (20) and offset (0).
- HTTP errors surface as `ServiceNowError` with the correct status and detail.
- Uses `ServiceNowClient.get()` — confirm no direct `fetch()` calls in the implementation.

---

## Phase 2 — `List` Organism

**File:** `src/client/npm-package/components/organisms/List.tsx`

Build the `List` organism and all its molecules as specified in Sections 4–6, 11, 13–14 of the List & RecordList Component Spec.

`List` is a fully controlled component. It performs no fetching and owns no async state. All data, loading state, error state, and pagination control flow in as props. If at any point during this phase you find yourself writing a `fetch()` call, a `useEffect` that loads data, or a service import — stop. That code belongs in `RecordList` (Phase 3), not here.

### Molecules to build (all in `src/client/npm-package/components/molecules/`)

Build in this order — each molecule is independently testable before wiring into `List`.

**`ListToolbar.tsx`**
- Renders `SearchBar` atom when `showSearch` is true. Not mounted when false.
- Debounces `onSearchChange` 300ms internally — callers never debounce themselves.

**`ListHeader.tsx`**
- One heading cell per column using `ColumnDefinition.width`.
- Checkbox column first when `selectable` — uses existing `Checkbox` atom. Indeterminate when `someSelected`.
- Sortable columns render existing `Icon` atom after label:
  - sort `null` → neutral muted icon
  - `'asc'` → upward arrow, full colour
  - `'desc'` → downward arrow, full colour
- Empty cell always last — aligns with edit icon column in `ListRow`.
- Column widths applied as `grid-template-columns` so `ListHeader` and `ListRow` share the same template.

**`ListRow.tsx`**
- One cell per column. Widths match `ListHeader` exactly via the same grid template.
- Default cell content: `RecordFieldValue.displayValue`. Empty value renders nothing.
- When `ColumnDefinition.renderCell` is provided, renders its return value as cell content. Wrapper cell element always provided by `ListRow`.
- Checkbox first when `selectable` — uses existing `Checkbox` atom.
- Edit icon column always last — empty when `onEdit` is undefined. Always rendered to maintain alignment.
- Long values truncated with ellipsis. `Tooltip` shows full display value on hover — uses existing `Tooltip` atom.
- React key: `row.sysId`.

**`Pagination.tsx`**
- Pages mode: Previous, Next, and up to 7 numbered `Button` atoms with `variant="page"`. Always shows first and last page, current page ± 2, ellipsis gaps. Previous disabled on page 1, Next on last page. Active page uses Button active variant.
- Load-more mode: single `Button` labelled "Load more". Renders `Spinner` and disables when `isLoadingMore`. Not rendered when `hasMore` is false.
- Uses existing `Button` and `Spinner` atoms. No new `PageButton` atom.

### `List` organism

Wire all molecules together per Section 6 of the spec.

- Uses `useReducer` for selection state only — `SELECT_ROW`, `DESELECT_ROW`, `SELECT_ALL`, `DESELECT_ALL`.
- All other state — rows, loading, error, pagination — is controlled via props. No internal async state.
- CSS grid layout. Checkbox column `40px` first when `selectable`. Edit icon column `40px` always last.
- Full-list `Spinner` when `loading` is true — header, rows, and pagination not shown.
- Full-list error state when `error` is set — renders error message, rows not shown.
- `EmptyState` atom rendered directly (no wrapper molecule) when `rows` is empty and `loading` and `error` are both falsy.
- `ListToolbar` not mounted when `showSearch` is false.
- All style references via `useTheme()` — no hardcoded values.

**Acceptance criteria:**
- Renders a list of rows with correct column widths and alignment between header and rows.
- Edit icon column and checkbox column render in every row, maintaining alignment with header, regardless of whether `onEdit` or `selectable` is active.
- `renderCell` override renders custom content while wrapper cell element is still provided by `ListRow`.
- Selection: clicking a row checkbox calls `onRowSelect` with correct `sysId[]`. Select-all selects all visible rows. Deselect-all clears selection.
- Sort: clicking a sortable column cycles `null` → `asc` → `desc` → `null` and calls `onSortChange` correctly.
- Search: typing in the search input calls `onSearchChange` after 300ms debounce.
- Pagination pages mode: page buttons render correctly. Previous/Next disabled states correct. Ellipsis renders for skipped pages. `onPageChange` fires with correct page number.
- Pagination load-more mode: "Load more" button renders. Spinner shown when `isLoadingMore`. Button absent when `hasMore` is false.
- `loading: true` renders full-list Spinner, hides rows, header, and pagination.
- `error` set renders full-list error, hides rows.
- Empty `rows` with no error renders `EmptyState` with correct message.
- `emptyMessage` prop overrides default message.
- `style` and `className` props apply correctly.
- No `fetch()` calls, no service imports, no async logic anywhere in `List` or its molecules.

---

## Phase 3 — `RecordList` Wrapper

**File:** `src/client/npm-package/components/organisms/RecordList.tsx`

Build `RecordList` as specified in Sections 7–9, 13.2–13.5 of the List & RecordList Component Spec.

`RecordList` is a data-fetching wrapper. It contains no visual rendering code of its own. Its entire render output is `<List ... />` with state mapped to props. If at any point during this phase you find yourself writing JSX beyond that single `<List>` element — stop. Any visual concern belongs in `List`, not here.

### Service layer usage

`RecordList` uses exclusively:
- `RhinoService.getRecordMetadata()` — already exists, already cached. Do not re-cache in `RecordList`.
- `RecordService.getRecords()` — built in Phase 1B.

Never import `ServiceNowClient` or call `fetch()` directly. Never implement a local cache or `Map` for metadata — `RhinoService` handles that via `CacheService`.

### State management

Uses `useReducer` with the `RecordListAction` type defined in Section 13.2 of the spec. All state transitions expressed as dispatched actions — no direct `setState` calls.

### Data loading

On mount and on every change to `table`, `filter`, current page, sort state, or search term:

1. Derives field list from `columns[].field`.
2. Calls `RhinoService.getRecordMetadata()` and `RecordService.getRecords()` in parallel via `Promise.all`.
3. Builds `resolvedColumns` — merges declared labels with metadata labels per Section 9 of the spec.
4. Maps `ServiceNowRecord[]` to `ListRow[]` — each row gets `sysId` from `sys_id.value` and `table` from the `table` prop.
5. Dispatches `FETCH_SUCCESS`.

### Filter/search/sort reactivity

- `filter` prop change: reset to page 1, clear selection, re-fetch.
- Search term change (debounced by `ListToolbar` before reaching `RecordList`): AND onto `filter`, reset to page 1, re-fetch.
- Sort change: update `orderBy` / `orderDirection`, re-fetch. Null direction omits both.

### Column label resolution

```typescript
const resolvedColumns = props.columns.map(col => ({
  ...col,
  label: col.label ?? metadata[col.field]?.label ?? col.field,
}))
```

### Render output

The complete render output of `RecordList` is the single `<List>` element as shown in Section 7 of the spec. Nothing else.

**Acceptance criteria:**
- Mounted with a valid `table` and `columns`, fetches and renders records correctly.
- Column labels fall back to metadata labels when not explicitly declared. Fall back to raw field name when metadata is absent.
- Sort: clicking a sortable column triggers a new fetch with correct `orderBy` and `orderDirection`. Clearing sort (`null`) triggers a fetch without those params.
- Search: typing triggers a new fetch with search term ANDed onto filter. List resets to page 1.
- Pagination pages mode: page change triggers a new fetch with correct `offset`.
- Pagination load-more mode: "Load more" triggers a fetch appending to existing rows.
- `filter` prop change resets to page 1, clears selection, re-fetches.
- Selection callbacks (`onRowSelect`) fire correctly.
- `onRowEdit` prop provided: edit icon fires callback, no modal rendered.
- `onRowEdit` prop absent: edit icon is present (modal wired in Phase 4 — for now it may render a placeholder or nothing).
- `onError` called on fetch failure.
- `RhinoService.getRecordMetadata()` and `RecordService.getRecords()` called in parallel, not sequentially.
- `RhinoService` is the only caching mechanism used — no local `Map` or `CacheService` usage in `RecordList` directly.
- No visual JSX in `RecordList` beyond the single `<List>` render call.
- No direct `fetch()` calls or `ServiceNowClient` imports.

---

## Phase 4 — Built-in Edit Modal

**File:** `src/client/npm-package/components/organisms/RecordList.tsx` (extend)

Add the built-in edit modal to `RecordList` as specified in Section 10 of the List & RecordList Component Spec.

This phase depends on the `Form` organism being complete and stable. Do not begin Phase 4 until `Form` is fully built and tested.

### Behaviour

- When `onRowEdit` is not provided and the edit icon is clicked, dispatch `OPEN_EDIT_MODAL` with the row's `sysId`.
- Render a modal overlay containing a `Form` organism:
  - `table`: the `RecordList` table prop.
  - `columns`: all declared `ColumnDefinition[]` mapped to `FieldDefinition[]` with `table` and `sysId` set.
  - `showCancelButton={true}`.
  - `onCancel`: dispatch `CLOSE_EDIT_MODAL`.
  - `onSave`: dispatch `CLOSE_EDIT_MODAL`, then re-fetch the current page to reflect the updated record.
  - `onError`: call `RecordList`'s `onError` prop.
- The modal is internal to `RecordList`. It is not a public molecule or atom and must not be exported.
- When `onRowEdit` is provided by the developer, `OPEN_EDIT_MODAL` is never dispatched and the modal is never rendered.
- `Form` uses `RhinoService` and `RecordService` internally for its own data loading and saving. `RecordList` does not make additional service calls for the modal.

### Modal overlay

- Renders as a standard overlay (fixed backdrop + centred content panel).
- Backdrop click closes the modal (equivalent to Cancel).
- `Form` rendered inside a scrollable container with a reasonable max height so it does not overflow on small screens.
- Uses `useTheme()` for overlay colours — no hardcoded values.

**Acceptance criteria:**
- `onRowEdit` not provided: clicking edit icon opens modal with `Form` pre-loaded with the correct record.
- `Form` renders all declared column fields for the correct table and `sysId`.
- Cancel button and backdrop click both close the modal without saving.
- Saving via `Form` closes the modal and triggers a re-fetch of the current page — updated values visible immediately after save.
- `onRowEdit` provided: modal never renders, callback fires instead.
- Modal does not make additional service calls beyond what `Form` makes internally.
- No hardcoded styles — all colours from `useTheme()`.

---

## Cross-Phase Rules

These rules apply across all phases and must never be violated:

1. **Service layer only.** All HTTP communication goes through `ServiceNowClient` via the domain services. No component calls `fetch()` directly.
2. **No duplicate caching.** `RhinoService` caches metadata via `CacheService`. No component implements its own cache.
3. **No visual code in `RecordList`.** Its render output is always and only `<List ... />`. Any new JSX beyond that is a Phase 2 concern, not Phase 3.
4. **`List` owns zero async state.** If `List` has a `useEffect` that fetches data, something is wrong.
5. **Theme only.** All colours, spacing, and typography reference `useTheme()`. No hardcoded values.
6. **Existing atoms first.** Before creating any new visual element, check whether an existing atom covers it. `Button`, `Icon`, `Spinner`, `Checkbox`, `Tooltip`, `Text`, `SearchBar` are all available.
7. **Complete before continuing.** All acceptance criteria for a phase must pass before the next phase begins.

---

*Document last updated: March 2026 — maintained by EsTech Development*
