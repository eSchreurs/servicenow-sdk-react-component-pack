# Form Component Spec

> **Instructions for the AI Agent:** This document defines the full specification for the `Form` organism and all field molecules it depends on. Read it entirely before writing any code. All decisions made here take precedence over any assumptions. Refer back to the Project Startup Document for project-wide rules and constraints, and to the Service Layer Spec for how data is loaded.

---

## 1. Overview

`Form` is the primary organism in this library. It renders a configurable, data-driven form that reads from and writes to ServiceNow records. It is fully driven by props — the consuming developer declares which fields to show, in which columns, and how to configure them. The component handles all data loading, metadata resolution, field type detection, rendering, validation, and saving.

Fields may come from **any number of tables and records**. Each field is independently declared with its own table, record sys_id, and field name. The `Form` component groups fields by `table` and by `table + sysId` internally to batch API calls efficiently, but this is invisible to the developer.

---

## 2. Field Architecture

### 2.1 Hierarchy

Fields follow a two-level structure:

- **`Field` (abstract base molecule)** — owns all shared field concerns: value, display value, onChange, effective mandatory state, effective readOnly state, validation error state, and the label/validation wrapper (`FieldWrapper` atom). Never rendered directly.
- **Typed field molecules** — each extends `Field` and renders the appropriate input atom for its type. These are the components the `Form` renders.

| Molecule | Renders | Used when |
|----------|---------|-----------|
| `StringField` | `TextInput` atom | String fields ≤ 255 chars |
| `TextAreaField` | `TextArea` atom | String fields > 255 chars, or `text` type |
| `NumberField` | `TextInput` (number) | Integer, decimal, float types |
| `CheckboxField` | `Checkbox` atom | Boolean type |
| `ChoiceField` | `SelectInput` atom | Any field with `isChoiceField: true` in metadata |
| `ReferenceField` | `ReferenceInput` atom | Reference type fields |
| `DateTimeField` | Native date/time input | Date, datetime, time types |

### 2.2 Type Resolution

The `Form` organism inspects each field's `FieldData` and instantiates the correct typed field molecule. Resolution follows this priority order:

1. If `isChoiceField` is true in metadata → `ChoiceField`
2. Otherwise, switch on `type`:
   - `string` with `maxLength > 255` → `TextAreaField`
   - `string` → `StringField`
   - `text`, `html`, `translated_text` → `TextAreaField`
   - `integer`, `decimal`, `float`, `currency` → `NumberField`
   - `boolean` → `CheckboxField`
   - `reference` → `ReferenceField`
   - `glide_date_time` → `DateTimeField` (mode: datetime)
   - `glide_date` → `DateTimeField` (mode: date)
   - `glide_time` → `DateTimeField` (mode: time)
   - All others → `StringField` (safe fallback)

### 2.3 FieldWrapper

`FieldWrapper` is the shared structural wrapper rendered by every field molecule.

- Renders the field `<label>` element associated with the input via `htmlFor`.
- Renders a **red asterisk (\*)** after the label text when `mandatory` is true.
- Wraps the input in a container that applies a **red border** when `hasError` is true.

```typescript
interface FieldWrapperProps {
  name: string
  label: string
  mandatory: boolean
  hasError: boolean
  children: React.ReactNode
}
```

### 2.4 Base Field Props

```typescript
interface BaseFieldProps {
  name: string
  label: string
  value: string
  displayValue: string
  mandatory: boolean
  readOnly: boolean
  hasError: boolean
  maxLength?: number
  onChange: (field: string, value: string, displayValue: string) => void
  style?: React.CSSProperties
  className?: string
}
```

### 2.5 Display Value Rule

> **Display values are only ever used to show information to the user or for client-side filtering. They are NEVER used for API queries, server calls, saves, record lookups, or any other data operation. All data operations always use the actual stored value.**

---

## 3. Field Definition

Every field passed to the form is a `FieldDefinition` object:

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
2. Groups by **unique table** → calls `RhinoService.getRecordMetadata(table, fields)` once per unique table. This returns all field metadata and choices in one round-trip per table.
3. Groups by **unique `table + sysId`** (non-empty sysId) → calls `RecordService.getRecord(table, sysId, fields)` once per unique record to fetch current values.
4. All fetches parallelised with `Promise.all` where possible.
5. Applies `defaultValue` from `FieldDefinition` for new records (`sysId = ''`). Only applied if the field has no loaded value.
6. Builds the initial `formRecord` — a `Record<string, { value: string; displayValue: string }>` keyed by `table.field` — from the loaded record data. Every declared field must be present, with `{ value: '', displayValue: '' }` for fields with no loaded value.
7. Renders a single `Spinner` for the entire form while loading.
8. On any fetch failure: renders full-form error state, calls `onError`.

---

## 7. Field Dependencies

### 7.1 Dependent Choice Lists

Configured in sys_dictionary via `dependent_on_field`. Resolved entirely client-side after initial load.

- The Form resolves the current value of the parent field from its internal state and passes it to `ChoiceField` as `dependentValue`.
- `ChoiceField` filters its visible options to only those whose `dependentValue` matches, plus entries with no `dependentValue`.
- If the currently selected choice is no longer valid after a parent field change, the Form clears the `ChoiceField`'s value in its `handleFieldChange` logic.

**`ChoiceField` additional props:**
```typescript
interface ChoiceFieldProps extends BaseFieldProps {
  choices: ChoiceEntry[]
  dependentOnField?: string
  dependentValue?: string
}
```

### 7.2 Reference Field Dependencies

Reference field `dependent_on_field` is **not resolved automatically**. The developer handles it via `reference.filter` and `onFieldChange`.

### 7.3 Reference Qualifiers

Qualifier data is returned as a `referenceQual` string in `FieldData` from `RhinoService.getRecordMetadata()`. The `ReferenceField` receives this as a prop and passes it directly to `SearchService.searchRecords()` as part of the filter. All three qualifier types are natively evaluated server-side by the Table API — no client-side evaluation is needed.

| `referenceQual` value | Behaviour |
|---|---|
| Plain encoded query (simple) | Passed directly as filter, ANDed with `reference.filter` |
| `fieldDYNAMICsysId` sentinel (dynamic) | Passed directly as filter, ANDed with `reference.filter` |
| `javascript:` expression (advanced) | Passed directly as filter, ANDed with `reference.filter` |
| `null` / absent | No qualifier filter applied — only `reference.filter` used |

**`ReferenceField` additional props:**
```typescript
interface ReferenceFieldProps extends BaseFieldProps {
  reference: string           // Referenced table name
  referenceQual?: string      // Qualifier string from FieldData — passed as-is to SearchService
  filter?: string             // Developer-supplied filter from FieldDefinition.reference.filter
  searchFields?: string[]
  previewFields?: string[]
  table: string               // Parent form record table (for info popover label fetching)
  sysId: string               // Parent form record sysId
}
```

When searching, the effective filter is always `referenceQual AND filter` when both are present, or whichever is non-null when only one is present.

---

## 8. Field Type Behavior

### 8.1 ReferenceField

#### States

| State | Description |
|-------|-------------|
| **Empty** | Input is typeable. Placeholder: "Type to search…" |
| **Searching** | Dropdown shows results or loading indicator |
| **Selected** | Display value shown, locked. Pen icon + "i" icon visible |
| **Read-only** | Display value shown, locked. "i" icon visible if value present |

#### Input behavior
- Search triggers at ≥ 2 characters, debounced 300ms.
- In-flight requests aborted when new search triggers.
- **Pen icon** — clears value, returns to empty state, focus returned to input.
- **"i" icon** — opens the info popover.
- When `reference.filter` changes: abort in-flight search, clear dropdown results. Selected value is NOT auto-cleared.

#### Search
- Calls `SearchService.searchRecords()` with effective filter.
- Maximum 15 results.
- Results displayed as columns — display value always first/primary.

#### Info popover
- Without `previewFields`: fetches all non-`sys_`-prefixed fields from the referenced record, humanizes labels using `RecordService.getRecord()`.
- With `previewFields`: fetches only those fields using labels from `RhinoService.getRecordMetadata()`.
- Always shows display values.

#### onChange
Calls parent with `sys_id` as `value` and display name as `displayValue`.

---

### 8.2 ChoiceField

- Always includes a blank option **unless the field is mandatory AND already has a non-empty value**.
- Options show display label; stored value tracked internally.
- Filters by `dependentValue` client-side.
- Read-only: renders as plain text (display label only).
- `onChange`: calls parent with stored value and display label.

---

### 8.3 DateTimeField

```typescript
interface DateTimeFieldProps extends BaseFieldProps {
  mode: 'datetime' | 'date' | 'time'
}
```

- `datetime` → `<input type="datetime-local">`
- `date` → `<input type="date">`
- `time` → `<input type="time">`

**Format conversion:**
- ServiceNow → browser: `YYYY-MM-DD HH:mm:ss` → `YYYY-MM-DDTHH:mm`
- Browser → ServiceNow: `YYYY-MM-DDTHH:mm` → `YYYY-MM-DD HH:mm:00`
- Read-only display: `DD/MM/YYYY HH:mm` for datetime, `DD/MM/YYYY` for date, `HH:mm` for time.

---

### 8.4 NumberField

- Renders `<input type="number">`.
- `maxLength` enforced as character limit on the input string.
- `onChange`: called with numeric string as both `value` and `displayValue`.

---

### 8.5 CheckboxField

- `onChange`: called with `'true'` or `'false'` as both `value` and `displayValue`.
- Read-only: disabled non-interactive checkbox.

---

## 9. Form State & Behavior

The `Form` organism must use `useReducer` for all state management. All state transitions are expressed as dispatched actions.

### 9.1 Reducer Actions

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

### 9.2 Field Change Handling

On every field change (`FIELD_CHANGED`):
- Update `formRecord` in state.
- Re-filter dependent `ChoiceField` options.
- Auto-clear invalid dependent choice values.
- Call `onFieldChange` prop AFTER state is updated.

### 9.3 Validation

On save attempt only — never on field change:
- Fields where effective `mandatory = true` AND `readOnly = false` AND `visible = true` must have non-empty value.
- On failure: dispatch `VALIDATION_FAILED`, show summary above action buttons, apply `hasError` to failing fields.
- Errors clear only on successful save or explicit dismiss.

### 9.4 Saving

- Group fields by `table + sysId`.
- Only include fields explicitly declared in `FieldDefinition` — never the full record.
- Invisible fields excluded from save payload.
- Empty `sysId` → `RecordService.createRecord()`.
- Non-empty `sysId` → `RecordService.updateRecord()`.
- All saves dispatched in parallel.
- `onSave` called with `SaveResult[]` on full success.
- Partial failures: communicate which records succeeded and failed, call `onError`.

### 9.5 Read-Only Mode

`readOnly={true}` at form level forces all fields read-only and hides Save button.

### 9.6 Empty / Null Display

Fields with no value in read-only mode render as empty — no placeholder, no dash.

### 9.7 Field Render Key Strategy

Each field rendered with React key: `table + '.' + sysId + '.' + field`

### 9.8 Max Length Enforcement

Every text input field enforces `maxLength` from metadata. Does not apply to `ReferenceField` or `ChoiceField`.

### 9.9 Mandatory Indicator

Red asterisk (\*) after label text when field is effectively mandatory.

### 9.10 Loading & Error States

- Single `Spinner` while loading — no partial field rendering.
- Full-form error state on load failure.
- Save error shown above action buttons.

---

## 10. Layout

- CSS grid, columns derived from `columns.length`.
- Fields fill top-to-bottom within each column, left-to-right across columns.
- Save/Cancel buttons below the grid.
- `readOnly={true}` at form level: all fields read-only, Save button hidden.

---

## 11. Invisible Fields

- Not rendered.
- Still tracked in state and `formRecord`.
- Excluded from validation and save payload.

---

## 12. Error States

| Situation | Behavior |
|-----------|----------|
| Load failure | Full-form error shown, fields not rendered, `onError` called |
| Save failure (all) | Error shown above action buttons, `onError` called |
| Save failure (partial) | Error identifies which records failed and which succeeded |
| Validation failure | Red border on failing fields + summary at form level |
| Field metadata not found | Renders as `StringField` with raw field name as label |

---

## 13. Out of Scope

- Dynamic and advanced reference qualifier evaluation (infrastructure in place, evaluation not yet implemented)
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
