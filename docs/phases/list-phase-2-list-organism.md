# List & RecordList — Phase 2: `List` Organism

> **Instructions for the AI Agent:** This document defines Phase 2 of the List & RecordList build. Read this document alongside the List & RecordList Component Spec and the Project Startup Document before writing any code. Phase 1 must be fully complete before starting this phase. Complete all acceptance criteria before moving to Phase 3. Never skip ahead.

---

## Context

| Phase | Deliverable | Depends on |
|-------|-------------|------------|
| 1 | `EmptyState` atom + `RecordService.getRecords()` | Service Layer (done) |
| **2 (this)** | `List` organism — static data, no fetching | Phase 1 |
| 3 | `RecordList` wrapper — fetching and metadata | Phase 2 |
| 4 | Built-in edit modal in `RecordList` | Phase 3 + `Form` (done) |

---

## Overview

Build the `List` organism and all four molecules it depends on. `List` is a **fully controlled component** — it performs no data fetching and owns no async state. All data, loading state, error state, and pagination control flow in as props from the outside.

> **Critical constraint:** If at any point during this phase you find yourself writing a `fetch()` call, a `useEffect` that loads data, or importing a service — stop. That code belongs in `RecordList` (Phase 3), not here. `List` has no knowledge of ServiceNow tables, APIs, or metadata.

Build and verify each molecule independently before wiring them into `List`. Each molecule is testable in isolation.

---

## Files to create

```
src/client/npm-package/components/molecules/ListToolbar.tsx
src/client/npm-package/components/molecules/ListHeader.tsx
src/client/npm-package/components/molecules/ListRow.tsx
src/client/npm-package/components/molecules/Pagination.tsx
src/client/npm-package/components/organisms/List.tsx
```

All must be exported from `src/client/npm-package/index.ts`.

---

## Molecule 1: `ListToolbar`

**File:** `src/client/npm-package/components/molecules/ListToolbar.tsx`

```typescript
interface ListToolbarProps {
  showSearch: boolean
  searchValue: string
  onSearchChange: (term: string) => void
  style?: React.CSSProperties
  className?: string
}
```

- Renders the existing `SearchBar` atom when `showSearch` is true.
- When `showSearch` is false, `ListToolbar` is **not mounted** — returns null.
- Debounces `onSearchChange` **300ms internally**. The prop is called with the debounced value. Callers never debounce themselves.
- All colours via `useTheme()`.

---

## Molecule 2: `ListHeader`

**File:** `src/client/npm-package/components/molecules/ListHeader.tsx`

```typescript
interface ListHeaderProps {
  columns: ColumnDefinition[]
  selectable: boolean
  allSelected: boolean
  someSelected: boolean
  onSelectAll: () => void
  sortField: string | null
  sortDirection: 'asc' | 'desc' | null
  onSortChange: (field: string) => void
  style?: React.CSSProperties
  className?: string
}
```

- One heading cell per column. Width of each cell comes from `ColumnDefinition.width` (default `1fr`).
- Column widths applied as `grid-template-columns`. **This exact template must be shared with `ListRow`** so cells align vertically across header and rows.
- When `selectable` is true, renders an existing `Checkbox` atom as the **first cell** (`40px` fixed width). Indeterminate state when `someSelected` is true and `allSelected` is false.
- Sortable columns (`ColumnDefinition.sortable === true`) render an existing `Icon` atom after the label text indicating current sort state:
  - `sortField !== column.field` or `sortDirection === null` → neutral muted icon (both directions implied)
  - `sortDirection === 'asc'` → upward arrow, full colour
  - `sortDirection === 'desc'` → downward arrow, full colour
  - Clicking the heading cell calls `onSortChange(column.field)`.
- Non-sortable columns are not interactive.
- An **empty cell** (`40px` fixed width) always renders as the **last cell** — aligns with the edit icon column in `ListRow`.
- All colours via `useTheme()`.

---

## Molecule 3: `ListRow`

**File:** `src/client/npm-package/components/molecules/ListRow.tsx`

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

- One cell per column in the same order and widths as `ListHeader`. **Uses the same `grid-template-columns` value** — not a separate calculation.
- Default cell content: `RecordFieldValue.displayValue`. When display value is empty, renders nothing — no dash, no placeholder, no empty string.
- When `ColumnDefinition.renderCell` is provided for a column, calls it with `(row, value)` and renders its return value as the cell content. The **wrapper cell element** (sizing, padding, border) is still provided by `ListRow` — only the content is replaced.
- When `selectable` is true, renders an existing `Checkbox` atom as the **first cell** (`40px`). Checking it calls `onSelect(row.sysId)`.
- Edit icon column always renders as the **last cell** (`40px`). When `onEdit` is provided, renders an `Icon` button that calls `onEdit()` on click. When `onEdit` is undefined, the cell renders empty — it still occupies its `40px` to maintain alignment with `ListHeader`.
- Long values that overflow their column width are truncated with ellipsis (`text-overflow: ellipsis`). When truncation occurs, the existing `Tooltip` atom shows the full `displayValue` on hover.
- React key for this component when rendered in a list: `row.sysId`.
- All colours via `useTheme()`.

---

## Molecule 4: `Pagination`

**File:** `src/client/npm-package/components/molecules/Pagination.tsx`

```typescript
interface PaginationProps {
  mode: 'pages' | 'load-more'

  // mode: 'pages' only
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void

  // mode: 'load-more' only
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void

  style?: React.CSSProperties
  className?: string
}
```

**Pages mode:**
- Renders Previous, Next, and up to 7 page number buttons using the existing `Button` atom with `variant="page"`.
- Page number display rules: always show first page, always show last page, always show current page ± 2. Fill remaining slots with an ellipsis button (`Button` with `variant="page"`, disabled, non-interactive, label `"…"`) where pages are skipped.
- Previous button disabled when `currentPage === 1`. Next button disabled when `currentPage === totalPages`.
- Current page button renders in active state via `Button` active variant.
- `onPageChange` called with the target page number when a page button is clicked.

**Load-more mode:**
- Renders a single `Button` labelled "Load more".
- When `isLoadingMore` is true: renders existing `Spinner` atom in place of the label, button disabled.
- When `hasMore` is false: button is not rendered at all.
- Existing rows remain visible to the user while loading more — this component renders nothing blocking.

Both modes use existing `Button` and `Spinner` atoms only. **No new `PageButton` atom is created.**

---

## `List` Organism

**File:** `src/client/npm-package/components/organisms/List.tsx`

Wire all four molecules together per Sections 6, 13.1, and 14 of the List & RecordList Component Spec.

### State

`List` uses `useReducer` for **selection state only**:

```typescript
type ListAction =
  | { type: 'SELECT_ROW';   sysId: string }
  | { type: 'DESELECT_ROW'; sysId: string }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
```

All other state — rows, loading, error, pagination — is **controlled externally via props**. `List` never derives or owns those values.

### Layout

- CSS grid. Column widths from `ColumnDefinition[].width`. Default `1fr`.
- Checkbox column (`40px`) always first when `selectable`.
- Edit icon column (`40px`) always last.
- `ListToolbar` above the header, full width. Not mounted when `showSearch` is false.
- `ListHeader` below toolbar.
- `ListRow` × n below header.
- `Pagination` below last row, full width.

### Rendering rules

- `loading: true` → render full-list `Spinner`. Header, rows, toolbar, and pagination are **not shown**.
- `error` set → render full-list error message. Rows are not shown.
- `rows` empty AND `loading` false AND `error` falsy → render `EmptyState` atom directly with `emptyMessage` prop (default: `'No records found.'`). No wrapper molecule.
- Normal state → render toolbar, header, rows, pagination.

### Selection behaviour

- `SELECT_ALL` adds all current `row.sysId` values to the selection set.
- `DESELECT_ALL` clears the selection set.
- After every selection state change, call `onRowSelect` with the current selection as `string[]`.
- `onRowSelect` is called after the state update, not before.

### All colours via `useTheme()` — no hardcoded values anywhere in `List` or its molecules.

---

## Acceptance Criteria

### Layout and rendering

- [ ] Rows render with correct column widths. Header and row cells align vertically — same grid template in `ListHeader` and `ListRow`.
- [ ] Edit icon column always renders in every row, maintaining alignment with the header empty cell, regardless of whether `onEdit` is provided.
- [ ] Checkbox column always renders in every row when `selectable` is true, maintaining alignment with the header checkbox cell.
- [ ] `renderCell` override renders custom content while the wrapper cell element (sizing, padding) is still provided by `ListRow`.
- [ ] Empty `displayValue` renders nothing in the cell — no dash, no placeholder.
- [ ] Long values truncate with ellipsis. `Tooltip` shows full display value on hover.

### Loading and error states

- [ ] `loading: true` renders full-list `Spinner`. Header, rows, toolbar, and pagination are hidden.
- [ ] `error` set renders full-list error message. Rows are hidden.
- [ ] Empty `rows` with no error and no loading renders `EmptyState` with the default message.
- [ ] `emptyMessage` prop overrides the default empty message.

### Selection

- [ ] Clicking a row checkbox calls `onRowSelect` with the correct `string[]` of selected `sysId` values.
- [ ] Select-all checkbox selects all currently visible rows and calls `onRowSelect`.
- [ ] Deselecting the select-all checkbox clears all selections and calls `onRowSelect` with `[]`.
- [ ] Select-all renders in indeterminate state when some but not all rows are selected.

### Sort

- [ ] Clicking a sortable column header when unsorted calls `onSortChange(field, 'asc')`.
- [ ] Clicking the active sort column a second time calls `onSortChange(field, 'desc')`.
- [ ] Clicking the active sort column a third time calls `onSortChange(field, null)`.
- [ ] `Icon` atom in header reflects the current sort state correctly for each column.
- [ ] Non-sortable columns do not respond to clicks.

### Search

- [ ] Typing in the search input calls `onSearchChange` with the typed value after exactly 300ms debounce — not on every keystroke.

### Pagination — pages mode

- [ ] Page buttons render correctly for various `totalPages` values. First, last, current ± 2 always shown. Ellipsis fills gaps.
- [ ] Previous button disabled on page 1. Next button disabled on last page.
- [ ] Current page button renders in active state.
- [ ] Clicking a page button calls `onPageChange` with the correct page number.

### Pagination — load-more mode

- [ ] "Load more" button renders when `hasMore` is true.
- [ ] Clicking "Load more" calls `onLoadMore`.
- [ ] `isLoadingMore: true` renders `Spinner` in button and disables it.
- [ ] `hasMore: false` — button is not rendered.

### Constraints

- [ ] No `fetch()` calls anywhere in `List` or any of its molecules.
- [ ] No service imports (`RecordService`, `RhinoService`, etc.) anywhere in `List` or its molecules.
- [ ] No `useEffect` that loads or fetches data.
- [ ] No hardcoded colour values — all via `useTheme()`.
- [ ] `style` and `className` props apply correctly on `List`.
- [ ] All new components exported from `index.ts`.

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
