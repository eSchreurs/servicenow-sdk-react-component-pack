# Phase 8 — Form Organism

## Goal
Build the `Form` organism — the primary deliverable of this entire project. It composes all molecules into a fully data-driven, configurable form that reads from and writes to ServiceNow records.

## Reference Documents
- Form Component Spec (`docs/specs/form-component-spec.md`) — read in full
- Service Layer Spec (`docs/specs/service-layer-spec.md`) — Sections 4, 5

---

## What to Build

### `src/client/components/organisms/Form.tsx`

The Form organism must use `useReducer` for all state management. All state transitions are expressed as dispatched actions.

---

## Reducer Actions

Define a `FormAction` type covering all state transitions:

```typescript
type FormAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; record: ServiceNowRecord; metadata: FieldMetadata[]; choices: Record<string, ChoiceEntry[]> }
  | { type: 'LOAD_ERROR'; error: Error }
  | { type: 'FIELD_CHANGED'; field: string; value: string; displayValue: string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; results: SaveResult[] }
  | { type: 'SAVE_ERROR'; error: Error }
  | { type: 'VALIDATION_FAILED'; fields: string[] }
  | { type: 'DISMISS_ERROR' }
```

---

## Data Loading

On mount:
1. Flatten all `FieldDefinition` entries from `columns`
2. Group by unique `table` → call `MetadataService.getTableHierarchy()` per table
3. Call `MetadataService.getFieldMetadata()` and `MetadataService.getChoices()` per hierarchy — pass `language` from `useServiceNow()`
4. Group by `table + sysId` (non-empty) → call `RecordService.getRecord()` per unique record
5. All fetches parallelised with `Promise.all` where possible
6. Apply `defaultValue` for new records (`sysId = ''`) only if field has no loaded value
7. Dispatch `LOAD_SUCCESS` or `LOAD_ERROR`

---

## Field Rendering

The Form resolves the correct molecule per field using this priority:
1. Has choices OR `choice > 0` in metadata → `ChoiceField`
2. Switch on `type`:
   - `string` ≤ 255 → `StringField`
   - `string` > 255, `text`, `html`, `translated_text` → `TextAreaField`
   - `integer`, `decimal`, `float`, `currency` → `NumberField`
   - `boolean` → `CheckboxField`
   - `reference` → `ReferenceField`
   - `glide_date_time` → `DateTimeField` mode=datetime
   - `glide_date` → `DateTimeField` mode=date
   - `glide_time` → `DateTimeField` mode=time
   - All others → `StringField`

Each field is rendered with React key: `table + '.' + sysId + '.' + field`

---

## Override Rules

Effective mandatory/readOnly = `databaseValue OR developerOverride`

- `mandatory: true` in metadata → always mandatory, developer cannot override to false
- `mandatory: false` in metadata → developer may set to true
- Same for `readOnly`

---

## Field Change Handling

On every field change (`FIELD_CHANGED`):
- Update `record` and `displayValues` in state
- Set `isDirty = true` on all `ReferenceField` instances
- Re-filter dependent `ChoiceField` options (Form handles auto-clear of invalid dependent choices)
- Call `onFieldChange` prop AFTER state is updated

---

## Validation

On save attempt only — never on field change:
- Fields where effective `mandatory = true` AND `readOnly = false` AND `visible = true` must have non-empty value
- Invisible fields are excluded from validation
- On failure: dispatch `VALIDATION_FAILED`, show summary above action buttons, apply red border to failing fields via `hasError` prop
- Errors clear only on successful save or explicit dismiss

---

## Saving

- Group fields by `table + sysId`
- Only include fields explicitly declared in `FieldDefinition` — never the full record
- Invisible fields excluded from save payload
- Empty `sysId` → `RecordService.createRecord()`
- Non-empty `sysId` → `RecordService.updateRecord()`
- All saves dispatched in parallel
- `onSave` called with `SaveResult[]` on full success
- Partial failures: communicate which records succeeded and failed, call `onError`

---

## Layout

- CSS grid, columns derived from `columns.length`
- Fields fill top-to-bottom within each column, left-to-right across columns
- Save/Cancel buttons below the grid
- `readOnly={true}` at form level: all fields read-only, Save button hidden

---

## Invisible Fields

- Not rendered
- Still tracked in state and `isDirty` propagation
- Excluded from validation and save payload

---

## Loading & Error States

- Single `Spinner` while loading — no partial field rendering
- Full-form error state on load failure
- Save error shown above action buttons

---

## Context Usage

- Read `language` from `useServiceNow()` and pass to `MetadataService.getChoices()`
- `ReferenceField` instances read theme via `useTheme()` themselves — Form does not pass theme

---

## What NOT to Do
- Do not use `useState` for form state — `useReducer` only
- Do not include non-declared fields in save payload
- Do not validate on field change — only on save attempt
- Do not auto-clear `ReferenceField` value when filter changes — that is developer's responsibility

---

## Done When
- `Form.tsx` exists in `src/client/components/organisms/`
- Uses `useReducer` with all defined action types
- Correctly resolves field types and renders appropriate molecules
- Override rules implemented correctly (database wins for restrictions)
- Validation fires only on save, applies `hasError` to failing fields
- Save groups by `table + sysId`, only saves declared fields
- Invisible fields tracked in state but excluded from validation and save
- Compiles without errors
