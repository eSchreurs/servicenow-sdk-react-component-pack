# List & RecordList — Phase 4: Built-in Edit Modal

> **Instructions for the AI Agent:** This document defines Phase 4 of the List & RecordList build. Read this document alongside the List & RecordList Component Spec and the Project Startup Document before writing any code. Phase 3 must be fully complete and the `Form` organism must be fully built and stable before starting this phase. Complete all acceptance criteria before declaring this component done.

---

## Context

| Phase | Deliverable | Depends on |
|-------|-------------|------------|
| 1 | `EmptyState` atom + `RecordService.getRecords()` | Service Layer (done) |
| 2 | `List` organism — static data, no fetching | Phase 1 |
| 3 | `RecordList` wrapper — fetching and metadata | Phase 2 |
| **4 (this)** | Built-in edit modal in `RecordList` | Phase 3 + `Form` (done) |

---

## Overview

Extend `RecordList` to render a built-in edit modal when the user clicks a row's edit icon and no `onRowEdit` prop has been provided by the developer.

This phase touches **one file only**:

```
src/client/npm-package/components/organisms/RecordList.tsx  (extend — do not replace)
```

No new files. No new atoms or molecules. No changes to `List`.

---

## Prerequisite Check

Before starting this phase, confirm:

- [ ] Phase 3 acceptance criteria all pass.
- [ ] The `Form` organism is fully built, stable, and tested independently.
- [ ] `Form` accepts `table`, `columns` (as `FieldDefinition[]`), `showCancelButton`, `onCancel`, `onSave`, and `onError` props as specified in the Form Component Spec.

If any of the above is not true — stop. Do not begin this phase.

---

## Behaviour

### When the modal opens

When `onRowEdit` is **not** provided by the developer and the user clicks the edit icon on a row, `RecordList` dispatches:

```typescript
{ type: 'OPEN_EDIT_MODAL', sysId: string }
```

This sets `state.editModalSysId` to the clicked row's `sysId`.

### What renders

When `state.editModalSysId` is set, render a modal overlay containing a `Form` organism:

```tsx
<Form
  columns={[
    props.columns.map(col => ({
      table: props.table,
      sysId: state.editModalSysId,
      field: col.field,
      label: col.label,       // undefined is fine — Form resolves from metadata
    }))
  ]}
  showCancelButton={true}
  onCancel={() => dispatch({ type: 'CLOSE_EDIT_MODAL' })}
  onSave={() => {
    dispatch({ type: 'CLOSE_EDIT_MODAL' })
    // Re-fetch the current page so updated values are immediately visible
    triggerFetch()
  }}
  onError={props.onError}
/>
```

`Form` handles its own data loading (`RhinoService`, `RecordService`) and saving (`RecordService.updateRecord()`). `RecordList` makes **no additional service calls** for the modal.

### When the modal closes

`CLOSE_EDIT_MODAL` sets `state.editModalSysId` to null. The modal unmounts.

### When `onRowEdit` is provided

`OPEN_EDIT_MODAL` is **never dispatched**. The modal is **never rendered**. The developer's `onRowEdit` callback fires instead — this was already wired in Phase 3.

---

## Modal Overlay

The modal overlay is **internal to `RecordList`** — it is not a public molecule or atom and must not be exported from `index.ts`.

- Renders as a fixed full-screen backdrop with a centred content panel.
- Backdrop click closes the modal — equivalent to Cancel (`CLOSE_EDIT_MODAL`).
- The content panel has a reasonable max height (`80vh`) with internal scroll — `Form` must not overflow on small screens.
- All overlay colours from `useTheme()` — no hardcoded values.

### Render position

The modal overlay renders **outside the `<List>` element** — alongside it, not inside it. `RecordList`'s render output in Phase 4 becomes:

```tsx
<>
  <List ... />                           {/* unchanged from Phase 3 */}
  {state.editModalSysId && (
    <ModalOverlay onBackdropClick={() => dispatch({ type: 'CLOSE_EDIT_MODAL' })}>
      <Form ... />
    </ModalOverlay>
  )}
</>
```

This is the only change to `RecordList`'s render output from Phase 3. `<List ... />` and all its props remain identical.

---

## Acceptance Criteria

### Modal opens correctly

- [ ] `onRowEdit` not provided: clicking the edit icon opens the modal. `Form` is pre-loaded with the correct `table` and `sysId`.
- [ ] `Form` renders all declared column fields for the clicked record.
- [ ] Modal does not open when `onRowEdit` is provided — the developer's callback fires instead.

### Modal closes correctly

- [ ] Clicking the Cancel button inside `Form` closes the modal without saving.
- [ ] Clicking the backdrop closes the modal without saving.
- [ ] After closing, the board shows the same state as before the modal opened.

### Save behaviour

- [ ] Saving via `Form` closes the modal.
- [ ] After save, `RecordList` re-fetches the current page. The updated record values are visible in the list without a manual refresh.

### Service layer

- [ ] `RecordList` makes no additional service calls for the modal — `Form` handles all data loading and saving internally.
- [ ] No new imports of `RhinoService`, `RecordService`, or `ServiceNowClient` added to `RecordList` in this phase.

### Visual

- [ ] Backdrop is rendered behind the modal panel, above the rest of the page.
- [ ] `Form` does not overflow on small screens — content panel scrolls internally.
- [ ] All overlay colours from `useTheme()` — no hardcoded values.
- [ ] Modal overlay is not exported from `index.ts`.

### Isolation

- [ ] `List` requires **zero changes** in this phase. If `List` needs to change, something is wrong.
- [ ] The `<List ... />` element inside `RecordList` is identical to Phase 3 — no new props added to it.

---

## Cross-Phase Rules (apply throughout all phases)

1. **Service layer only.** All HTTP communication goes through `ServiceNowClient` via the domain services. No component calls `fetch()` directly.
2. **No duplicate caching.** `RhinoService` caches metadata via `CacheService`. No component implements its own cache.
3. **No visual code in `RecordList` beyond `<List>` and the modal.** Its render output is `<List ... />` plus the conditional modal overlay — nothing else.
4. **`List` owns zero async state.** If `List` has a `useEffect` that fetches data, something is wrong.
5. **Theme only.** All colours, spacing, and typography reference `useTheme()`. No hardcoded values.
6. **Existing atoms first.** Before creating any new visual element, check whether an existing atom covers it.
7. **Complete before continuing.** All acceptance criteria for a phase must pass before declaring the component done.

---

*Document last updated: March 2026 — maintained by EsTech Development*
