# List & RecordList Component Spec

> **Instructions for the AI Agent:** This document defines the full specification for the `List` and `RecordList` organisms and all molecules and atoms they depend on. Read it entirely before writing any code. All decisions made here take precedence over any assumptions. Refer back to the Project Startup Document for project-wide rules and constraints, and to the Service Layer Spec for how data is loaded.
>
> **Service layer rule:** All data fetching, caching, metadata resolution, and HTTP communication must go through the existing service layer — `RecordService`, `RhinoService`, `SearchService`, `CacheService`, and `ServiceNowClient`. No component may call `fetch()` directly, construct URLs, or implement its own caching. The Service Layer Spec must be updated with the new `RecordService.getRecords()` function described in Section 7 before `RecordList` is built.

---

## 1. Overview

This spec defines two organisms that share the same internal molecule and atom structure but differ in how they receive data:

- **`List`** — the lower-level organism. Receives rows as plain data props. Has no knowledge of ServiceNow tables, fetching, or metadata. The developer supplies rows and column configuration directly. Any data source works.
- **`RecordList`** — a thin wrapper around `List` that adds ServiceNow data fetching. It owns metadata resolution, pagination, sorting, and search — then passes everything down to `List` as props. `RecordList` contains no visual code of its own. If you stripped out all the fetching logic, what remains is a component that renders `<List ... />` and nothing else.

### Why both exist

`RecordList` covers the 80% use case: one table, one filter, one list. `List` exists for cases `RecordList` structurally cannot handle:

- **Multi-table merged lists** — a unified "all my work" view combining incidents, change tasks, HR tasks, and catalog items into one sorted list. Each comes from a different table. The developer fetches each set independently, merges and sorts client-side, and passes the result to `List`.
- **Custom data sources** — data from a custom Scripted REST endpoint that returns shaped data rather than a raw table query.
- **Client-owned pagination** — when the developer controls fetching and paging logic entirely, `List` accepts external page state without imposing its own fetch cycle.

Both organisms are read-only in their list view. Row editing is handled by opening the record in a `Form` organism via the row edit action — never by making cells directly editable.

---

## 2. Component Architecture

### 2.1 Hierarchy

```
RecordList (organism)
│
│  owns: data fetching, metadata, sort/search/pagination state
│  renders internally:
│
└──► List (organism)
          │
          │  owns: visual rendering, selection state, UI interactions
          │  renders:
          │
          ├── ListToolbar (molecule)
          ├── ListHeader (molecule)
          ├── ListRow × n (molecule)
          ├── EmptyState (atom) ← used directly, no wrapper molecule
          └── Pagination (molecule)
```

`RecordList` has no visual code of its own. Every visual element — the header, rows, toolbar, pagination, empty state, loading and error states — is rendered by `List`. `RecordList` only decides what data and state to pass down.

### 2.2 Molecules

| Molecule | Responsibility |
|----------|---------------|
| `ListToolbar` | Search input + bulk action slot |
| `ListHeader` | Column heading row with sort controls |
| `ListRow` | Single data row: cells + edit icon + optional checkbox |
| `Pagination` | Page navigation controls (classic or load-more mode) |

Note: there is no `ListEmptyState` molecule. `List` uses the `EmptyState` atom directly. `EmptyState` is a general-purpose atom available to any component in the library — `Form`, `Calendar`, `Workboard` widgets, and any other organism that needs a zero-results or no-data state.

### 2.3 New Atoms

| Atom | Responsibility |
|------|---------------|
| `EmptyState` | Centred icon area + message. General-purpose — not specific to `List`. |

### 2.4 Reused Atoms (no new work)

- `Checkbox` — row selection
- `Button` — toolbar actions, edit icon, pagination buttons. Pagination uses `Button` with `variant="page"` — no separate `PageButton` atom is needed.
- `Icon` — sort direction indicator in `ListHeader`. The tri-state sort indicator is `Icon` with the appropriate icon name and colour/opacity per direction — no separate `SortIcon` atom is needed.
- `Spinner` — loading state
- `Badge` — cell display
- `Tooltip` — truncated cell content
- `SearchBar` — toolbar search input (Phase 7)

---

## 3. Service Layer Usage

> **All service calls must use the existing service layer. No new HTTP logic, URL construction, or caching may be introduced in these components.**

| Need | Service to use |
|------|---------------|
| Fetch a page of records | `RecordService.getRecords()` — new function, see Section 7 |
| Fetch field metadata and labels | `RhinoService.getRecordMetadata()` — already exists, already cached per table+field-set |
| Cache metadata results | `CacheService` — already used internally by `RhinoService`. No additional caching needed in `RecordList`. |
| Open a record for editing (built-in modal) | `RecordService.getRecord()` — already exists, used by `Form` |
| Save edits from built-in modal | `RecordService.updateRecord()` — already exists, used by `Form` |
| HTTP base layer | `ServiceNowClient` — never called directly by components |

`RecordList` calls `RhinoService.getRecordMetadata()` and `RecordService.getRecords()` in parallel on every fetch. Metadata results are cached automatically by `RhinoService` via `CacheService` — `RecordList` does not need to implement its own caching and must not do so.

---

## 4. Column Definition

```typescript
interface ColumnDefinition {
  // Required
  field: string               // Field name — used as key into each row's fields map

  // Optional display config
  label?: string              // Override column header label.
                              // RecordList: falls back to FieldData.label from metadata.
                              // List: falls back to raw field name.
  width?: string              // CSS value, e.g. '200px' or '1fr'. Default: '1fr'.
  sortable?: boolean          // Whether clicking this column header triggers a sort.
                              // Default: false.
                              // List: fires onSortChange — caller re-supplies sorted rows.
                              // RecordList: triggers a new server-side fetch with ORDER BY.
  renderCell?: (row: ListRow, value: RecordFieldValue) => React.ReactNode
                              // Custom cell renderer. Replaces default cell content only —
                              // the wrapper cell element (sizing, padding, borders) is still
                              // provided by ListRow.
}
```

### Display Value Rule

> **Display values are only ever used to show information to the user. They are NEVER used for API queries, server calls, record lookups, sort parameters, or any other data operation. All data operations always use the actual stored value.**

Default cell rendering shows `RecordFieldValue.displayValue`. The `renderCell` override receives both `value` and `displayValue` and must respect this rule.

---

## 5. List Row Type

```typescript
interface ListRow {
  sysId: string                            // Required — used as React key and passed to
                                           // onRowEdit and onRowSelect callbacks.
                                           // For non-ServiceNow data, any unique string works.
  table?: string                           // Optional — the source table for this row.
                                           // Declare when using multi-table merged data so
                                           // onRowEdit can open the correct Form.
  fields: Record<string, RecordFieldValue> // Keyed by field name, same as ServiceNowRecord.
}
```

### Multi-table rows

When `List` renders rows merged from multiple tables, each row should carry its `table` so that `onRowEdit` can route to the correct record. `List` passes `table` through to the callback unchanged — it has no opinion about what the value means.

---

## 6. List Props

`List` is a fully controlled component. It owns no async state and performs no fetching. All data, loading state, error state, and pagination control flow in as props.

```typescript
interface ListProps {
  // Data — required
  rows: ListRow[]
  columns: ColumnDefinition[]

  // Pagination support
  totalCount?: number           // Total records across all pages.
                                // Required for classic pagination. Not needed for load-more.

  // Behaviour
  selectable?: boolean          // Show checkboxes, enable row selection. Default: false.
  onRowEdit?: (sysId: string, table?: string) => void
                                // Called when the edit icon on a row is clicked.
                                // Receives sysId and optional table from the row.
                                // When not provided, edit icon is not rendered.
  onRowSelect?: (selectedSysIds: string[]) => void
                                // Called whenever selection changes.
                                // Receives the full array of currently selected sysIds.
  onSortChange?: (field: string, direction: 'asc' | 'desc' | null) => void
                                // Called when a sortable column header is clicked.
                                // List does not reorder rows — the caller re-supplies
                                // sorted rows in response.
  onSearchChange?: (term: string) => void
                                // Called when the search input value changes (debounced 300ms).
                                // List does not filter rows — the caller responds.

  // Pagination
  pagination?: {
    mode: 'pages' | 'load-more'
    pageSize: number
    currentPage?: number        // Required for mode: 'pages'
    onPageChange?: (page: number) => void
                                // Required for mode: 'pages'
    hasMore?: boolean           // Required for mode: 'load-more'
    onLoadMore?: () => void     // Required for mode: 'load-more'
    isLoadingMore?: boolean     // Shows spinner in Load More button while fetching
  }

  // State flags (controlled externally — List renders accordingly)
  loading?: boolean             // Renders full-list Spinner when true. Default: false.
  error?: Error                 // Renders full-list error state when set.

  // Customisation
  emptyMessage?: string         // Default: 'No records found.'
  showSearch?: boolean          // Show search input in toolbar. Default: false.
  style?: React.CSSProperties
  className?: string
}
```

### Example — basic read-only list

```tsx
<List
  columns={[
    { field: 'number',            label: 'Number',   width: '120px' },
    { field: 'short_description', label: 'Description' },
    { field: 'priority',          label: 'Priority', width: '100px' },
  ]}
  rows={rows}
  totalCount={total}
  pagination={{ mode: 'pages', pageSize: 20, currentPage: page, onPageChange: setPage }}
/>
```

### Example — multi-table merged list

```tsx
const [rows, setRows] = useState<ListRow[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const myUserId = 'javascript:gs.getUserID()'
  Promise.all([
    RecordService.getRecords('incident',    fields, { filter: `assigned_to=${myUserId}^active=true` }),
    RecordService.getRecords('change_task', fields, { filter: `assigned_to=${myUserId}^active=true` }),
    RecordService.getRecords('sc_task',     fields, { filter: `assigned_to=${myUserId}^active=true` }),
  ]).then(([incidents, changeTasks, catalogTasks]) => {
    const merged: ListRow[] = [
      ...incidents.rows.map(r    => ({ sysId: r.sys_id.value, table: 'incident',    fields: r })),
      ...changeTasks.rows.map(r  => ({ sysId: r.sys_id.value, table: 'change_task', fields: r })),
      ...catalogTasks.rows.map(r => ({ sysId: r.sys_id.value, table: 'sc_task',     fields: r })),
    ].sort((a, b) =>
      (a.fields.due_date?.value ?? '').localeCompare(b.fields.due_date?.value ?? '')
    )
    setRows(merged)
    setLoading(false)
  })
}, [])

<List
  columns={[
    { field: 'number',            label: 'Number',      width: '120px' },
    { field: 'short_description', label: 'Description'                 },
    { field: 'due_date',          label: 'Due',         width: '120px', sortable: true },
  ]}
  rows={rows}
  loading={loading}
  onRowEdit={(sysId, table) => openModal(sysId, table)}
  onSortChange={(field, direction) => sortRows(field, direction)}
/>
```

### Example — selectable list with bulk action

```tsx
const [selected, setSelected] = useState<string[]>([])

<List
  columns={columns}
  rows={rows}
  selectable
  onRowSelect={setSelected}
  onRowEdit={(sysId) => openDrawer(sysId)}
  totalCount={total}
  pagination={{ mode: 'pages', pageSize: 20, currentPage: page, onPageChange: setPage }}
/>

{selected.length > 0 && (
  <Button onClick={() => handleBulkDelete(selected)}>
    Delete {selected.length} records
  </Button>
)}
```

---

## 7. RecordList Props

`RecordList` is a data-fetching wrapper around `List`. It has no visual code of its own.

```typescript
interface RecordListProps {
  // Data source — required
  table: string
  columns: ColumnDefinition[]

  // Query
  filter?: string               // Encoded ServiceNow query string (sysparm_query).
                                // Reactive — when filter changes, list resets to page 1,
                                // re-fetches, and clears selection.

  // Behaviour — passed through to List
  selectable?: boolean          // Default: false.
  onRowEdit?: (sysId: string) => void
                                // When provided, overrides the built-in edit modal.
                                // When not provided, edit icon opens the built-in modal.
  onRowSelect?: (selectedSysIds: string[]) => void

  // Pagination
  pagination?: {
    mode: 'pages' | 'load-more' // Default: 'pages'
    pageSize?: number            // Default: 20
  }

  // Search
  showSearch?: boolean          // Default: false. When true, search bar triggers a new
                                // server-side fetch with the search term ANDed onto filter.

  // Callbacks
  onError?: (error: Error) => void

  // Customisation — passed through to List
  emptyMessage?: string
  style?: React.CSSProperties
  className?: string
}
```

### How RecordList renders List

`RecordList` contains no visual rendering code. Its entire render output is:

```tsx
// This is the complete render output of RecordList.
// All visual rendering is owned by List.
<List
  rows={state.rows}
  columns={state.resolvedColumns}   // Labels resolved from RhinoService metadata
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

### Example — basic RecordList

```tsx
<RecordList
  table="incident"
  filter="active=true"
  columns={[
    { field: 'number',            label: 'Number',   width: '120px'               },
    { field: 'short_description', label: 'Description'                             },
    { field: 'priority',          label: 'Priority', width: '100px', sortable: true },
    { field: 'assigned_to',       label: 'Assigned to'                             },
  ]}
  pagination={{ mode: 'pages', pageSize: 20 }}
/>
```

### Example — RecordList with custom edit handler

```tsx
<RecordList
  table="incident"
  filter={myFilter}
  columns={columns}
  onRowEdit={(sysId) => navigate(`/incidents/${sysId}`)}
  onRowSelect={(ids) => setSelectedIncidents(ids)}
  selectable
/>
```

---

## 8. Required Service Layer Addition

`RecordList` requires one new function on `RecordService`. **The Service Layer Spec must be updated and this function implemented before `RecordList` is built.**

### `RecordService.getRecords()`

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

- Uses `ServiceNowClient.get()` — never calls `fetch()` directly.
- Always sets `sysparm_display_value=all`.
- Always sets `sysparm_count=true`. `totalCount` parsed from `X-Total-Count` response header.
- `sys_id` always appended to `fields` if not already present.
- Maps each result from `RawRecord` → `ServiceNowRecord` using the existing mapping pattern from `RecordService.getRecord()`.
- Results are never cached — consistent with all other `RecordService` functions.

---

## 9. RecordList Data Loading

On mount, and on every change to `table`, `filter`, current page, sort state, or search term, `RecordList`:

1. Derives the field name list from `columns[].field`.
2. Calls `RhinoService.getRecordMetadata(table, fields)` — already exists, already cached by `RhinoService` via `CacheService`. No additional caching needed here.
3. Calls `RecordService.getRecords(table, fields, { filter, orderBy, orderDirection, limit, offset })`.
4. Both calls parallelised with `Promise.all`.
5. On fetch failure: passes `error` to `List`, calls `onError`.
6. Dispatches `FETCH_SUCCESS` — builds `resolvedColumns` by merging declared labels with metadata labels, maps `ServiceNowRecord[]` to `ListRow[]`.
7. Passes `loading: true` to `List` during initial fetch. In load-more mode, passes `isLoadingMore: true` only — existing rows remain visible.

### Column label resolution

```typescript
const resolvedColumns = props.columns.map(col => ({
  ...col,
  label: col.label ?? metadata[col.field]?.label ?? col.field,
}))
```

### Filter changes

When `filter` prop changes: reset to page 1, clear selection, re-fetch.

### Search

Search term debounced 300ms, then ANDed onto `filter` as a CONTAINS query across all declared column fields. Resets to page 1.

### Sort

Single-column sort. `asc` → `desc` → null on repeated clicks. Re-fetches with `orderBy` / `orderDirection` or without them when direction is null.

---

## 10. RecordList Built-in Edit Modal

When `onRowEdit` is not provided, clicking a row's edit icon opens a built-in modal containing a `Form` organism.

- `Form` is configured with all column fields as a single-column `FieldDefinition[]` targeting `table` and the row's `sysId`. `Form` uses `RhinoService` and `RecordService` internally — `RecordList` does not make additional service calls for the modal.
- `showCancelButton={true}` — Cancel closes the modal without saving.
- On successful `Form` save: modal closes, `RecordList` re-fetches the current page.
- The modal is entirely internal to `RecordList` — not a public component.
- When `onRowEdit` is provided, the modal is never rendered.

---

## 11. Molecule Specifications

### 11.1 ListToolbar

```typescript
interface ListToolbarProps {
  showSearch: boolean
  searchValue: string
  onSearchChange: (term: string) => void   // Already debounced 300ms inside ListToolbar
  style?: React.CSSProperties
  className?: string
}
```

- Renders the `SearchBar` atom when `showSearch` is true.
- When `showSearch` is false, `ListToolbar` is not mounted.
- Debounce owned here — callers never debounce themselves.

---

### 11.2 ListHeader

```typescript
interface ListHeaderProps {
  columns: ColumnDefinition[]
  selectable: boolean
  allSelected: boolean
  someSelected: boolean         // Checkbox renders in indeterminate state
  onSelectAll: () => void
  sortField: string | null
  sortDirection: 'asc' | 'desc' | null
  onSortChange: (field: string) => void
  style?: React.CSSProperties
  className?: string
}
```

- One heading cell per column using `ColumnDefinition.width`.
- When `selectable`, renders a `Checkbox` as the first cell. Indeterminate when `someSelected`.
- Sortable columns render an `Icon` atom after the label indicating sort direction:
  - `null` → neutral muted arrows icon (both directions implied)
  - `'asc'` → upward arrow, full colour
  - `'desc'` → downward arrow, full colour
- An empty cell always renders last to align with the edit icon column in `ListRow`.

---

### 11.3 ListRow

```typescript
interface ListRowProps {
  row: ListRow
  columns: ColumnDefinition[]
  selectable: boolean
  selected: boolean
  onSelect: (sysId: string) => void
  onEdit?: () => void
  style?: React.CSSProperties
  className?: string
}
```

- One cell per column in the same order and widths as `ListHeader`.
- Default cell content: `RecordFieldValue.displayValue`. Empty value renders nothing — no dash, no placeholder.
- When `ColumnDefinition.renderCell` is provided, its return value is rendered as cell content. The wrapper cell element is still provided by `ListRow`.
- When `selectable`, renders a `Checkbox` as the first cell.
- Edit icon column always renders as the last cell — empty when `onEdit` is undefined, to maintain column alignment with `ListHeader`.
- Long values truncated with ellipsis. `Tooltip` shows full display value on hover.
- React key: `row.sysId`.

---

### 11.4 Pagination

```typescript
interface PaginationProps {
  mode: 'pages' | 'load-more'

  // mode: 'pages'
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void

  // mode: 'load-more'
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void

  style?: React.CSSProperties
  className?: string
}
```

**Pages mode:**
- Renders Previous, Next, and up to 7 numbered `Button` atoms with `variant="page"`.
- Always shows first and last page. Shows current page ± 2. Fills gaps with an ellipsis `Button` (`variant="page"`, disabled, non-interactive).
- Previous disabled on page 1. Next disabled on last page.
- Active page uses `Button` active variant.

**Load-more mode:**
- Single `Button` labelled "Load more".
- When `isLoadingMore`: renders `Spinner` in place of label, button disabled.
- When `hasMore` is false: button not rendered.
- Existing rows remain visible while loading more.

---

## 12. EmptyState Atom

```typescript
interface EmptyStateProps {
  message: string
  style?: React.CSSProperties
  className?: string
}
```

- Centred layout: icon area above, message text below.
- Icon area renders a generic empty visual using theme colours — no external image dependency.
- Message uses `Text` atom in secondary colour.
- General-purpose — used directly by `List`, and available to any other organism in the library that needs a zero-results or no-data state (`Form`, `Calendar`, `Workboard` widgets, etc.).
- No `ListEmptyState` wrapper molecule exists — `List` uses `EmptyState` directly.

---

## 13. List State & Behavior

### 13.1 List State

`List` owns only selection state. Everything else — rows, loading, error, pagination — is controlled externally via props.

```typescript
type ListAction =
  | { type: 'SELECT_ROW';   sysId: string }
  | { type: 'DESELECT_ROW'; sysId: string }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
```

### 13.2 RecordList State

`RecordList` owns all async state and manages selection on behalf of `List`.

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

Selection is managed by `RecordList` and passed to `List` as controlled props — `List` does not maintain its own independent selection state when rendered inside `RecordList`.

### 13.3 Selection Behaviour

- Selection state is a `Set<string>` of `sysId` values.
- `SELECT_ALL` adds all currently visible `sysId` values. Does not select records on other pages.
- `DESELECT_ALL` clears the selection entirely.
- When `filter`, `sortField`, or `searchTerm` changes in `RecordList`, selection is cleared automatically.
- `onRowSelect` called after every selection change with the current selection as `string[]`.

### 13.4 Sort Behaviour

- Single-column sort only.
- Clicking an unsorted sortable column: direction `asc`.
- Clicking the active sort column: toggles `asc` → `desc` → null.
- `List.onSortChange` fires with `(field, direction)`. Null direction means the caller removes the sort.
- `RecordList` handles this internally with a new `RecordService.getRecords()` call.

### 13.5 Pagination Behaviour

**Pages mode:**
- `SET_PAGE` triggers a new fetch. `offset` = `(page - 1) * pageSize`.
- Total pages = `Math.ceil(totalCount / pageSize)`.

**Load-more mode:**
- Initial fetch uses `offset: 0`.
- `FETCH_MORE_SUCCESS` appends new rows — does not replace.
- `hasMore` is true when `rows.length < totalCount`.

---

## 14. Layout

- CSS grid. Column widths from `ColumnDefinition[].width`. Default: `1fr`.
- `ListHeader` and every `ListRow` share the same `grid-template-columns` so cells align vertically.
- Checkbox column (when `selectable`): `40px`, always first.
- Edit icon column: `40px`, always last. Renders in every row regardless of whether `onEdit` is provided, to maintain alignment with `ListHeader`.
- `ListToolbar` renders above the header, full width.
- `Pagination` renders below the last row, full width.
- During initial load, a single `Spinner` replaces the header and row area. Toolbar and pagination are not shown.

---

## 15. Error States

| Situation | Behaviour |
|-----------|-----------|
| Initial load failure (RecordList) | `error` prop passed to `List`, full-list error rendered, `onError` called |
| External `error` prop set (List) | Full-list error rendered, rows not shown |
| Load-more failure | Error shown below last visible row, existing rows remain, `onError` called |
| Page change failure | Error shown in list body, rows cleared, `onError` called |
| Field metadata not found (RecordList) | Column label falls back to raw field name. Cell renders raw `value` string. |
| Empty results (no error) | `EmptyState` atom rendered in list body |

---

## 16. Out of Scope

- Inline cell editing
- Column resizing by the user
- Column reordering by the user
- Infinite scroll (use load-more as an alternative)
- Client-side sort or search across all loaded rows
- Multi-column sort
- Row grouping or section headers
- Frozen / sticky columns
- CSV or export functionality
- Nested rows or expandable row detail panels
- Optimistic row deletion
- Automatic deduplication of merged multi-table rows — the developer is responsible

---

*Document last updated: March 2026 — maintained by EsTech Development*
