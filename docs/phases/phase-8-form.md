# Phase 8 — Form Organism

## Goal
Build the `Form` organism — the primary deliverable of this entire project. It composes the `Field` component into a fully data-driven, configurable form that reads from and writes to ServiceNow records.

## Reference Documents
- Form Component Spec (`docs/specs/form-component-spec.md`) — read in full
- Service Layer Spec (`docs/specs/service-layer-spec.md`) — Sections 4, 5
- Project Startup Document (`docs/specs/project-startup.md`) — coding standards and hard rules

---

## Before Starting

Two small gaps in the existing codebase must be closed before writing Form code:

1. **Add `ServiceNowProvider` to `ComponentExplorer.tsx`** — wrap the root alongside `ThemeProvider`. The Form reads `language` from `useServiceNow()` and will silently use the default without the provider, but structurally it must be there.

2. **Extract `resolveFieldKind` from `Field.tsx`** — move the `resolveKind` function and its `InputKind` type into `src/client/npm-package/components/atoms/_internal/resolveFieldKind.ts` and import it back into `Field.tsx`. This makes the resolution logic independently readable and testable.

---

## What to Build

### `src/client/components/organisms/Form.tsx`

The Form organism must use `useReducer` for all state management. No `useState` for form state — every state transition must be expressed as a dispatched action.

---

## State Shape

Design the state shape before writing the reducer.

```typescript
interface FormState {
  status: 'loading' | 'ready' | 'saving' | 'error'
  metadata: Record<string, FieldData>          // keyed by field name
  formRecord: Record<string, {                 // keyed by 'table.field'
    value: string
    displayValue: string
  }>
  validationErrors: string[]                   // 'table.field' keys of fields with errors
  saveError: string | null
  loadError: string | null
}
```

---

## Reducer Actions

```typescript
type FormAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; metadata: Record<string, FieldData>; record: ServiceNowRecord }
  | { type: 'LOAD_ERROR'; error: Error }
  | { type: 'FIELD_CHANGED'; field: string; value: string; displayValue: string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; results: SaveResult[] }
  | { type: 'SAVE_ERROR'; error: Error }
  | { type: 'VALIDATION_FAILED'; fields: string[] }
  | { type: 'DISMISS_ERROR' }
```

`LOAD_SUCCESS` carries both `metadata` (from `RhinoService`) and `record` (from `RecordService`). The reducer must merge these into the initial `formRecord` in a single atomic transition — not two separate dispatches.

---

## Data Loading

On mount:
1. Flatten all `FieldDefinition` entries from `columns`.
2. Group by **unique table** → call `RhinoService.getRecordMetadata(table, fields, language)` once per unique table. Read `language` from `useServiceNow()`.
3. Group by **unique `table + sysId`** (non-empty sysId only) → call `RecordService.getRecord(table, sysId, fields)` once per unique record.
4. Parallelise all fetches with `Promise.all`.
5. Apply `defaultValue` from `FieldDefinition` for new records (`sysId = ''`) — only if the field has no loaded value.
6. Build initial `formRecord` keyed by `table.field`. Every declared field must be present; fields with no loaded value initialise as `{ value: '', displayValue: '' }`.
7. Dispatch `LOAD_SUCCESS` with merged metadata and record, or `LOAD_ERROR` on any failure.

---

## Field Rendering

The Form renders `<Field />` for each declared field. It passes metadata-derived props alongside the field's current value from `formRecord`.

Props passed to each `Field`:
- `name` — the field name from `FieldDefinition`
- `label` — from `FieldData.label`, or `FieldDefinition.label` if the developer supplied an override, or the raw field name if metadata was not found
- `type` — from `FieldData.type`
- `isChoiceField` — from `FieldData.isChoiceField`
- `value` / `displayValue` — from `formRecord[table.field]`
- `mandatory` — effective value: `FieldData.mandatory OR FieldDefinition.mandatory`
- `readOnly` — effective value: `FieldData.readOnly OR FieldDefinition.readOnly OR formProps.readOnly`
- `hasError` — true if this field's key is in `state.validationErrors`
- `maxLength` — from `FieldData.maxLength`
- `choices` — from `FieldData.choices`
- `dependentOnField` — from `FieldData.dependentOnField`
- `dependentValue` — resolved from `formRecord` using the parent field name
- `reference` — from `FieldData.reference`
- `referenceQual` — from `FieldData.referenceQual`
- `filter` — from `FieldDefinition.reference.filter`
- `searchFields` — from `FieldDefinition.reference.searchFields`
- `previewFields` — from `FieldDefinition.reference.previewFields`
- `table` / `sysId` — from `FieldDefinition`
- `onChange` — the Form's field change handler

Each `Field` rendered with React key: `table + '.' + sysId + '.' + field`

---

## Override Rules

Effective mandatory/readOnly = `databaseValue OR developerOverride`

- `mandatory: true` in metadata → always mandatory regardless of developer override
- `mandatory: false` in metadata → developer may add `mandatory: true`
- Same logic for `readOnly`
- Form-level `readOnly={true}` overrides all fields to read-only regardless of metadata or field-level overrides

---

## Field Change Handling

On every field change (`FIELD_CHANGED`):
1. Update `formRecord` with the new value and displayValue.
2. Find any fields whose `dependentOnField` matches the changed field name.
3. For each such field, check if its current value is still a valid choice given the new parent value. If not, clear it to `''`.
4. Call `onFieldChange` prop AFTER state has been updated.

---

## Validation

On save attempt only — never on field change:
- A field fails validation if: effective `mandatory = true` AND effective `readOnly = false` AND `visible ≠ false` AND `value === ''`.
- On failure: dispatch `VALIDATION_FAILED` with the list of failing field keys, show a summary message above the action buttons.
- `hasError={true}` is derived at render time from `state.validationErrors` — not stored per-field.
- Validation errors clear only on successful save or explicit user dismiss (`DISMISS_ERROR`).

---

## Saving

- Group declared fields by `table + sysId`.
- Build each save payload from `formRecord`: only declared field names, only stored values — never display values, never invisible fields, never fields not declared in `FieldDefinition`.
- Empty `sysId` → `RecordService.createRecord()`.
- Non-empty `sysId` → `RecordService.updateRecord()`.
- Dispatch all save calls in parallel with `Promise.all`.
- On full success: dispatch `SAVE_SUCCESS`, call `onSave` with `SaveResult[]`.
- On partial failure: identify which records succeeded and which failed, surface specific error messaging, call `onError`.

---

## Layout

- CSS grid layout. Column count = `columns.length`.
- Fields render top-to-bottom within each column.
- Save and Cancel buttons rendered below the grid.
- `readOnly={true}` at form level: all fields read-only, Save button hidden regardless of `showSaveButton`.

---

## Invisible Fields

- Not rendered in the DOM.
- Still present in `formRecord` state.
- Excluded from validation.
- Excluded from save payload.

---

## Loading & Error States

- Render a single `Spinner` while `status === 'loading'` — no partial field rendering.
- Render a full-form error state when `status === 'error'` and `loadError` is set — do not render fields.
- Render save error above action buttons when `saveError` is set.
- Render validation summary above action buttons when `validationErrors` is non-empty.

---

## Context Usage

- Read `language` from `useServiceNow()` and pass to `RhinoService.getRecordMetadata()`.
- `Field` components read theme via `useTheme()` themselves — Form does not pass theme props.

---

## Component Explorer Page

Add a `FormPage.tsx` to `src/client/component-explorer/pages/organisms/`. It must show:
- A live `Form` instance pointed at a real or plausible demo configuration
- The full props table
- A usage code snippet

Update `ComponentExplorer.tsx` to include the Form page in the navigation under an "Organisms" group.

---

## What NOT to Do
- Do not use `useState` for form state — `useReducer` only
- Do not include non-declared fields in the save payload
- Do not validate on field change — only on save attempt
- Do not call `MetadataService` — it does not exist; use `RhinoService.getRecordMetadata()`
- Do not pass display values to `RecordService.createRecord()` or `RecordService.updateRecord()`
- Do not render fields while loading — show `Spinner` only

---

## Done When
- `Form.tsx` exists in `src/client/components/organisms/`
- `ServiceNowProvider` wraps the Component Explorer root
- `resolveFieldKind` has been extracted to `_internal/resolveFieldKind.ts`
- Form uses `useReducer` with all defined action types
- Data loading calls `RhinoService.getRecordMetadata()` once per unique table and `RecordService.getRecord()` once per unique `table+sysId`, parallelised
- `LOAD_SUCCESS` merges metadata and record into initial form state atomically
- Override rules implemented correctly: `effectiveState = databaseValue OR developerOverride`
- Validation fires only on save attempt, clears on success or explicit dismiss
- Save payload contains only declared, visible fields with stored values only
- Invisible fields tracked in state but excluded from validation and save
- `onFieldChange` fires after state update, with dependent choice clearing applied first
- Form page added to Component Explorer
- Everything compiles without errors
