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

`LOAD_SUCCESS` carries both `metadata` (from `RhinoService.getRecordMetadata()`) and `record` (from `RecordService.getRecord()`). The reducer merges these into a single consistent form state.

---

## Data Loading

On mount:
1. Flatten all `FieldDefinition` entries from `columns`
2. Group by **unique table** → call `RhinoService.getRecordMetadata(table, fields)` once per unique table. This returns all field metadata and choices in one round-trip.
3. Group by **unique `table + sysId`** (non-empty sysId) → call `RecordService.getRecord(table, sysId, fields)` once per unique record to fetch current values.
4. All fetches parallelised with `Promise.all`
5. Apply `defaultValue` for new records (`sysId = ''`) only if field has no loaded value
6. Build initial `formRecord` — keyed by `table.field` — from loaded record data. Every declared field must be present; fields with no loaded value initialised as `{ value: '', displayValue: '' }`
7. Dispatch `LOAD_SUCCESS` with merged metadata and record, or `LOAD_ERROR` on any failure

Pass `language` from `useServiceNow()` to `RhinoService.getRecordMetadata()`.

---

## Field Rendering

The Form resolves the correct molecule per field using this priority:
1. `isChoiceField === true` in metadata → `ChoiceField`
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
- Update `formRecord` in state
- Re-filter dependent `ChoiceField` options
- Auto-clear invalid dependent choice values
- Call `onFieldChange` prop AFTER state is updated

---

## Validation

On save attempt only — never on field change:
- Fields where effective `mandatory = true` AND `readOnly = false` AND `visible = true` must have non-empty value
- Invisible fields excluded from validation
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
- Still tracked in state and `formRecord`
- Excluded from validation and save payload

---

## Loading & Error States

- Single `Spinner` while loading — no partial field rendering
- Full-form error state on load failure
- Save error shown above action buttons

---

## Context Usage

- Read `language` from `useServiceNow()` and pass to `RhinoService.getRecordMetadata()`
- `ReferenceField` instances read theme via `useTheme()` themselves — Form does not pass theme

---

## What NOT to Do
- Do not use `useState` for form state — `useReducer` only
- Do not include non-declared fields in save payload
- Do not validate on field change — only on save attempt
- Do not call `MetadataService` — it does not exist; use `RhinoService.getRecordMetadata()`
- Do not implement a dirty flag strategy for reference qualifiers — `referenceQual` is static and passed as-is to `SearchService`

---

## Done When
- `Form.tsx` exists in `src/client/components/organisms/`
- Uses `useReducer` with all defined action types
- Data loading calls `RhinoService.getRecordMetadata()` once per unique table and `RecordService.getRecord()` once per unique `table+sysId`, parallelised
- `LOAD_SUCCESS` correctly merges metadata and record into form state
- Field type resolution uses `isChoiceField` boolean, then type switch
- Override rules implemented correctly (database wins for restrictions)
- Validation fires only on save, applies `hasError` to failing fields
- Save groups by `table + sysId`, only saves declared fields
- Invisible fields tracked in state but excluded from validation and save
- Compiles without errors
