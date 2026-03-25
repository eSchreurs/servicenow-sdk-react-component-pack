# Form Component Spec

> **Instructions for the AI Agent:** This document defines the full specification for the `Form` organism and the `Field` component it depends on. Read it entirely before writing any code. All decisions made here take precedence over any assumptions. Refer back to the Project Startup Document for project-wide rules and constraints, and to the Service Layer Spec for how data is loaded.

---

## 1. Overview

`Form` is the primary organism in this library. It renders a configurable, data-driven form that reads from and writes to ServiceNow records. It is fully driven by props — the consuming developer declares which fields to show, in which columns, and how to configure them. The component handles all data loading, metadata resolution, field type detection, rendering, validation, and saving.

Fields may come from **any number of tables and records**. Each field is independently declared with its own table, record sys_id, and field name. The `Form` component groups fields by `table` and by `table + sysId` internally to batch API calls efficiently, but this is invisible to the developer.

---

## 2. The Field Component

### 2.1 Overview

`Field` is a single unified component that handles all field types. The Form renders `<Field />` for every declared field — the correct input is resolved automatically at render time from the field's metadata.

This is a deliberate architectural choice. ServiceNow field types are metadata-driven and can change in the backend (e.g. a plain string field gaining a choice list). Because `Field` resolves its input type from live `FieldData` at render time, these changes are reflected in the UI automatically with no frontend code changes required.

`Field` is located at `src/client/npm-package/components/atoms/Field.tsx`. It composes the following internal primitives:

- `_internal/FieldWrapper` — label, mandatory asterisk, error border wrapper
- `_internal/ReferenceInput` — the typeahead search input used for reference fields
- `_internal/dateHelpers` — pure format conversion functions for date/time fields
- `Input` atom — single-line text input
- `Checkbox` atom — boolean toggle
- `Dropdown` atom — choice select input
- Native `<input type="datetime-local|date|time">` — date/time inputs

### 2.2 Type Resolution

`Field` resolves the correct input kind via `_internal/resolveFieldKind.ts`. Resolution follows this priority order:

1. If `isChoiceField` is true in metadata → renders `Dropdown`
2. Otherwise, switch on `type`:
   - `string` with `maxLength > 255` → renders `TextArea`
   - `string` → renders `Input`
   - `text`, `html`, `translated_text` → renders `TextArea`
   - `integer`, `decimal`, `float`, `currency` → renders `Input` (type="number")
   - `boolean` → renders `Checkbox`
   - `reference` → renders `ReferenceInput` (with popover orchestration)
   - `glide_date_time` → renders native datetime-local input
   - `glide_date` → renders native date input
   - `glide_time` → renders native time input
   - All others → renders `Input` (safe fallback)

### 2.3 FieldWrapper

`FieldWrapper` is the structural wrapper rendered by `Field` for every input type.

- Renders the field `<label>` element associated with the input via `htmlFor`.
- Renders a **red asterisk (\*)** after the label text when `mandatory` is true.
- Wraps the input in a container that applies a **red outline** when `hasError` is true.

```typescript
interface FieldWrapperProps {
  name: string
  label: string
  mandatory: boolean
  hasError: boolean
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  containerStyle?: React.CSSProperties  // optional override for the input container div
}
```

### 2.4 Field Props

```typescript
interface FieldProps {
  // Core — always required
  name: string
  label: string
  type: string                  // ServiceNow field type from FieldData
  value: string
  displayValue?: string         // Required for reference fields; optional for others
  mandatory: boolean
  readOnly: boolean
  hasError: boolean
  onChange: (field: string, value: string, displayValue: string) => void

  // Shared optional
  maxLength?: number
  style?: React.CSSProperties
  className?: string

  // Choice field props — required when isChoiceField is true
  isChoiceField?: boolean
  choices?: ChoiceEntry[]
  dependentOnField?: string     // informational only — filtering uses dependentValue
  dependentValue?: string       // current stored value of the parent field

  // Date/time props
  mode?: 'datetime' | 'date' | 'time'   // normally derived from type; override if needed

  // Reference field props — required when type === 'reference'
  reference?: string            // referenced table name from FieldData
  referenceQual?: string        // qualifier string from FieldData — passed as-is to SearchService
  filter?: string               // developer-supplied filter, ANDed with referenceQual
  searchFields?: string[]
  previewFields?: string[]
  table?: string                // parent form record table (for info popover)
  sysId?: string                // parent form record sysId (for info popover)
}
```

### 2.5 Display Value Rule

> **Display values are only ever used to show information to the user or for client-side filtering. They are NEVER used for API queries, server calls, saves, record lookups, or any other data operation. All data operations always use the actual stored value.**

---

## 3. Field Definition

Every field passed to the Form is a `FieldDefinition` object:

```typescript
interface FieldDefinition {
  // Required
  table: string
  sysId: string         // Empty string '' for new records
  field: string

  // Optional overrides (subject to override rules — see Section 5)
  label?: string
  mandatory?: boolean
  readOnly?: boolean
  visible?: boolean     // Default: true. When false, not rendered, excluded from validation
                        // and save payload, but tracked in state.
  defaultValue?: string // Pre-populate for new records (sysId = '') only

  // Reference field config
  reference?: {
    searchFields?: string[]
    previewFields?: string[]
    filter?: string     // Reactive — always uses latest value when searching
  }
}
```

---

## 4. Form Props

```typescript
interface FormProps {
  columns: FieldDefinition[][]    // Each array is a column; fields render top-to-bottom
  readOnly?: boolean              // Makes entire form read-only (default: false)
  showSaveButton?: boolean        // Default: true
  showCancelButton?: boolean      // Default: false
  onSave?: (results: SaveResult[]) => void
  onCancel?: () => void
  onError?: (error: Error) => void
  onFieldChange?: (field: FieldDefinition, value: string, displayValue: string) => void
  style?: React.CSSProperties
  className?: string
}

interface SaveResult {
  table: string
  sysId: string     // For new records, the newly created sys_id
  isNew: boolean
}
```

### Example — basic form
```tsx
<Form
  columns={[
    [
      { table: 'incident', sysId: 'abc123', field: 'short_description' },
      { table: 'incident', sysId: 'abc123', field: 'description' },
    ],
    [
      { table: 'incident', sysId: 'abc123', field: 'priority' },
      { table: 'incident', sysId: 'abc123', field: 'assigned_to' },
    ],
  ]}
  onSave={(results) => console.log(results)}
/>
```

### Example — assignment_group / assigned_to dependency
```tsx
const [assignedToFilter, setAssignedToFilter] = useState<string>('')

const handleFieldChange = (field: FieldDefinition, value: string) => {
  if (field.field === 'assignment_group') {
    setAssignedToFilter(value ? `group_members.user.sys_id=${value}` : '')
  }
}

<Form
  columns={[
    [
      { table: 'incident', sysId: 'abc123', field: 'assignment_group' },
      {
        table: 'incident',
        sysId: 'abc123',
        field: 'assigned_to',
        reference: { filter: assignedToFilter }
      },
    ],
  ]}
  onFieldChange={handleFieldChange}
/>
```

---

## 5. Override Rules

Developer overrides can only **add** restrictions — they can never remove database-level constraints.

| Database metadata | Developer override | Effective result |
|-------------------|--------------------|-----------------|
| `mandatory: true` | `mandatory: false` | **mandatory** — database wins |
| `mandatory: true` | *(not set)* | mandatory |
| `mandatory: false` | `mandatory: true` | mandatory — developer added restriction |
| `mandatory: false` | *(not set)* | not mandatory |

**Summary:** `effectiveState = databaseValue OR developerOverride`

Same logic applies to `readOnly`.

---

## 6. Data Loading

On mount, the Form:

1. Flattens all `FieldDefinition` entries from all columns.
2. Groups by **unique table** → calls `RhinoService.getRecordMetadata(table, fields, language)` once per unique table. `language` is read from `useServiceNow()`. This returns all field metadata and choices in one round-trip per table.
3. Groups by **unique `table + sysId`** (non-empty sysId) → calls `RecordService.getRecord(table, sysId, fields)` once per unique record to fetch current values.
4. All fetches parallelised with `Promise.all`.
5. Applies `defaultValue` from `FieldDefinition` for new records (`sysId = ''`). Only applied if the field has no loaded value.
6. Builds the initial `formRecord` — a `Record<string, { value: string; displayValue: string }>` keyed by `table.field` — from the loaded record data. Every declared field must be present, with `{ value: '', displayValue: '' }` for fields with no loaded value.
7. Renders a single `Spinner` for the entire form while loading.
8. On any fetch failure: renders full-form error state, calls `onError`.

---

## 7. Field Dependencies

### 7.1 Dependent Choice Lists

Configured in sys_dictionary via `dependent_on_field`. Resolved entirely client-side after initial load.

- The Form resolves the current stored value of the parent field from its internal state and passes it to the dependent `Field` as `dependentValue`.
- `Field` (when rendering a choice input) filters visible options to only those whose `dependentValue` matches, plus entries with no `dependentValue`. Matching always uses stored values — never display values.
- If the currently selected choice is no longer valid after a parent field change, the Form clears the dependent field's value in its `FIELD_CHANGED` handling logic before calling `onFieldChange`.

### 7.2 Reference Field Dependencies

Reference field `dependent_on_field` is **not resolved automatically**. The developer handles it via `reference.filter` on the `FieldDefinition` and `onFieldChange` on the Form.

### 7.3 Reference Qualifiers

Qualifier data is returned as a `referenceQual` string in `FieldData` from `RhinoService.getRecordMetadata()`. The Form passes this string to `Field` as `referenceQual`. `Field` passes it directly to `SearchService.searchRecords()` as part of the filter. All three qualifier types are natively evaluated server-side by the Table API — no client-side evaluation is needed.

| `referenceQual` value | Behaviour |
|---|---|
| Plain encoded query (simple) | Passed directly as filter, ANDed with `reference.filter` |
| `fieldDYNAMICsysId` sentinel (dynamic) | Passed directly as filter, ANDed with `reference.filter` |
| `javascript:` expression (advanced) | Passed directly as filter, ANDed with `reference.filter` |
| `null` / absent | No qualifier filter applied — only `reference.filter` used |

When searching, the effective filter is `referenceQual AND filter` when both are present, or whichever is non-null when only one is present.

---

## 8. Field Type Behaviour

### 8.1 Reference type

#### States

| State | Description |
|-------|-------------|
| **Empty** | Input is typeable. Placeholder: "Type to search…" |
| **Searching** | Dropdown shows results or loading indicator |
| **Selected** | Display value shown, locked. Pen icon (left) + info icon (right) visible |
| **Read-only** | Display value shown, locked. Info icon visible if value is present |

#### Input behaviour
- Search triggers at ≥ 2 characters, debounced 300ms.
- In-flight requests aborted when a new search triggers.
- **Pen icon** — clears value, returns to empty state, focus returned to input.
- **Info icon** — opens the info popover.
- When `filter` changes: abort in-flight search, clear dropdown results. Selected value is NOT auto-cleared.

#### Search
- Calls `SearchService.searchRecords()` with effective filter.
- Maximum 15 results.
- Results displayed as columns — display value always first/primary.

#### Info popover
- Without `previewFields`: fetches all non-`sys_`-prefixed fields from the referenced record via `RecordService.getRecord()`, humanises field names as labels.
- With `previewFields`: fetches only those fields via `RecordService.getRecord()`, fetches labels via `RhinoService.getRecordMetadata()`.
- Always shows display values.

#### onChange
Calls parent with `sys_id` as `value` and display name as `displayValue`.

---

### 8.2 Choice type (isChoiceField)

- Always includes a blank option **unless the field is mandatory AND already has a non-empty value**.
- Options show display label; stored value tracked internally.
- Filters visible options by `dependentValue` client-side using stored values only — never display values.
- Read-only: renders as plain text (display label of selected option).
- `onChange`: calls parent with stored value and display label.

---

### 8.3 Date/time types

Format conversion handles the mismatch between ServiceNow's stored format and the browser's native input format. All conversion logic lives in `_internal/dateHelpers.ts`.

| Type | Input element | Mode |
|---|---|---|
| `glide_date_time` | `<input type="datetime-local">` | `datetime` |
| `glide_date` | `<input type="date">` | `date` |
| `glide_time` | `<input type="time">` | `time` |

**Format conversion:**
- ServiceNow → browser: `YYYY-MM-DD HH:mm:ss` → `YYYY-MM-DDTHH:mm`
- Browser → ServiceNow: `YYYY-MM-DDTHH:mm` → `YYYY-MM-DD HH:mm:00`
- Read-only display: `DD/MM/YYYY HH:mm` for datetime, `DD/MM/YYYY` for date, `HH:mm` for time.

---

### 8.4 Numeric types (`integer`, `decimal`, `float`, `currency`)

- Renders `<input type="number">`.
- `maxLength` enforced as a character limit on the input string.
- `onChange`: called with the numeric string as both `value` and `displayValue`.

---

### 8.5 Boolean type

- `onChange`: called with `'true'` or `'false'` as both `value` and `displayValue`.
- Read-only: renders as a disabled, non-interactive checkbox.

---

### 8.6 String / text types

- `string` with `maxLength ≤ 255` or no `maxLength`: renders `<input type="text">`.
- `string` with `maxLength > 255`, `text`, `html`, `translated_text`: renders `<textarea>`.
- Read-only: renders as plain text. Empty value renders as empty — no placeholder, no dash.
- `onChange`: called with the same string as both `value` and `displayValue`.

---

## 9. Form State & Behaviour

The `Form` organism uses `useReducer` for all state management. All state transitions are expressed as dispatched actions — no direct `setState` calls anywhere in the Form.

### 9.1 State Shape

```typescript
interface FormState {
  status: 'loading' | 'ready' | 'saving' | 'error'
  metadata: Record<string, FieldData>       // keyed by field name
  formRecord: Record<string, {              // keyed by 'table.field'
    value: string
    displayValue: string
  }>
  validationErrors: string[]                // list of 'table.field' keys with errors
  saveError: string | null
  loadError: string | null
}
```

### 9.2 Reducer Actions

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

`LOAD_SUCCESS` carries both `metadata` (from `RhinoService`) and `record` (from `RecordService`). The reducer merges these into the initial `formRecord` in a single atomic transition.

### 9.3 Field Change Handling

On every field change (`FIELD_CHANGED`):
1. Update `formRecord` in state with the new value and displayValue.
2. Check all other fields for dependent choice lists whose `dependentOnField` matches the changed field.
3. For any dependent choice field whose currently selected value is no longer valid given the new parent value, clear its value to `''`.
4. Call `onFieldChange` prop AFTER state is updated.

### 9.4 Validation

On save attempt only — never on field change:
- A field fails validation if: effective `mandatory = true` AND effective `readOnly = false` AND `visible = true` AND `value` is empty string.
- On failure: dispatch `VALIDATION_FAILED` with the list of failing field keys, show a summary message above the action buttons, pass `hasError={true}` to each failing `Field`.
- Validation errors clear only on successful save or when the user explicitly dismisses.

### 9.5 Saving

- Group declared fields by `table + sysId`.
- Build payload for each group containing only declared field names and their current stored values from `formRecord`. Never include the full record; never include display values; never include invisible fields.
- Empty `sysId` → `RecordService.createRecord()`.
- Non-empty `sysId` → `RecordService.updateRecord()`.
- All save calls dispatched in parallel with `Promise.all`.
- On full success: dispatch `SAVE_SUCCESS`, call `onSave` with `SaveResult[]`.
- On partial failure: identify which records succeeded and which failed, show specific error messaging, call `onError`.

### 9.6 Read-Only Mode

`readOnly={true}` at form level forces all fields into read-only mode and hides the Save button regardless of `showSaveButton`.

### 9.7 Empty / Null Display

Fields with no value in read-only mode render as empty — no placeholder text, no dash.

### 9.8 Field Render Key

Each `Field` rendered with React key: `table + '.' + sysId + '.' + field`

### 9.9 Max Length Enforcement

`maxLength` from metadata is passed to `Field` and enforced on text and number inputs. Not applicable to reference or choice fields.

### 9.10 Loading & Error States

- Single `Spinner` rendered for the entire form while loading — no partial field rendering.
- Full-form error state on load failure — fields not rendered, `onError` called.
- Save error displayed above action buttons.

---

## 10. Layout

- CSS grid layout. Column count derived from `columns.length`.
- Fields fill top-to-bottom within each column, left-to-right across columns.
- Save/Cancel buttons rendered below the grid.
- `readOnly={true}` at form level: all fields read-only, Save button hidden.

---

## 11. Invisible Fields

- Not rendered in the DOM.
- Still tracked in `formRecord` state.
- Excluded from validation.
- Excluded from save payload.

---

## 12. Error States

| Situation | Behaviour |
|-----------|----------|
| Load failure | Full-form error shown, fields not rendered, `onError` called |
| Save failure (all records) | Error shown above action buttons, `onError` called |
| Save failure (partial) | Error identifies which records failed and which succeeded |
| Validation failure | `hasError` applied to failing fields + summary at form level |
| Field metadata not found | Renders as plain text input with raw field name as label |

---

## 13. Out of Scope

- UI policies
- Automatic resolution of reference `dependent_on_field`
- Custom date picker UI
- Field spanning
- Section headers or visual grouping
- Dirty state tracking / unsaved changes warning
- Optimistic saving / auto-save
- Inline creation of new referenced records

---

*Document last updated: March 2026 — maintained by EsTech Development*
