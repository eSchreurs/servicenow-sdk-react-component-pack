# Form Component Spec

> **Instructions for the AI Agent:** This document defines the full specification for the `Form` organism and all field molecules it depends on. Read it entirely before writing any code. All decisions made here take precedence over any assumptions. Refer back to the Project Startup Document for project-wide rules and constraints.

---

## 1. Overview

`Form` is the primary organism in this library. It renders a configurable, data-driven form that reads from and writes to ServiceNow records. It is fully driven by props — the consuming developer declares which fields to show, in which columns, and how to configure them. The component handles all data loading, metadata resolution, field type detection, rendering, validation, and saving.

Fields may come from **any number of tables and records**. Each field is independently declared with its own table, record sys_id, and field name. The `Form` component groups fields by `table + sysId` internally to batch API calls efficiently, but this is invisible to the developer.

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
| `ChoiceField` | `SelectInput` atom | Any field with sys_choice entries or `choice > 0` in sys_dictionary |
| `ReferenceField` | `ReferenceInput` atom | Reference type fields |
| `DateTimeField` | Native date/time input | Date, datetime, time types |

### 2.2 Type Resolution

The `Form` organism inspects each field's metadata and instantiates the correct typed field molecule. Resolution follows this priority order:

1. If the field has sys_choice entries or `choice > 0` in metadata → `ChoiceField`
2. Otherwise, switch on the sys_dictionary internal type:
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

### 2.5 Display Value Rule

This rule applies universally across the entire Form and all field components:

> **Display values are only ever used to show information to the user or for client-side filtering (e.g. dependent choice filtering). They are NEVER used for API queries, server calls, saves, record lookups, qualifier evaluation, or any other data operation. All data operations always use the actual stored value.**

Examples:
- A reference field's `sys_id` is always used when saving, searching, or evaluating qualifiers — never the display name.
- A choice field's stored integer key is always submitted on save — never the label.
- `formRecord` values used in qualifier substitution always use `.value`, never `.displayValue`.

---

`FieldWrapper` is the shared structural wrapper rendered by every field molecule.

- Rendering the field `<label>` element, associated with the input via `htmlFor`.
- Rendering the mandatory indicator — a **red asterisk (\*)** immediately after the label text when `mandatory` is true.
- Wrapping the input in a container that applies a **red border** when `hasError` is true.

```typescript
interface FieldWrapperProps {
  name: string              // Used as the input id and label htmlFor value
  label: string
  mandatory: boolean
  hasError: boolean
  children: React.ReactNode // The input atom rendered by the typed field molecule
}
```

### 2.4 Base Field Props

All typed field molecules share these props:

```typescript
interface BaseFieldProps {
  name: string
  label: string
  value: string               // Actual stored value (sys_id, integer key, raw string, etc.)
  displayValue: string        // Human-readable value shown to the user
  mandatory: boolean          // Effective mandatory state (after override resolution)
  readOnly: boolean           // Effective read-only state (after override resolution)
  hasError: boolean           // True when this field failed form validation — triggers red border
  maxLength?: number          // From sys_dictionary; enforced by the field molecule
  onChange: (field: string, value: string, displayValue: string) => void

  // Style overrides
  style?: React.CSSProperties
  className?: string
}
```

### 2.6 Shared Types

These types are referenced throughout the spec and must be defined in `src/client/types/`:

```typescript
interface ChoiceEntry {
  value: string            // Stored value (e.g. '1', 'hardware')
  label: string            // Display label shown to the user (e.g. 'High', 'Hardware')
  dependentValue?: string  // Actual stored value of the parent field this choice applies to;
                           // always the stored value, never the display value (per Section 2.5).
                           // Absent = choice is always shown regardless of parent field value.
}

interface ReferenceSearchResult {
  sysId: string
  displayValue: string
  columns: Array<{ field: string; value: string }>  // One entry per searchField, in declared order
                                                     // First entry is always the display value field
}

interface FieldMetadata {
  name: string                    // Field name (database column name)
  label: string                   // Display label from sys_dictionary
  type: string                    // Internal type (e.g. 'string', 'reference', 'boolean', 'integer')
  maxLength: number               // Maximum character length (0 if not applicable)
  mandatory: boolean              // Database-level mandatory state
  readOnly: boolean               // Database-level read-only state
  choice: number                  // 0 = not a choice field; >0 = choice field
  reference?: string              // Referenced table name (reference fields only)
  referenceLabel?: string         // Display name of the referenced table (reference fields only)
  useReferenceQualifier?: 'simple' | 'dynamic' | 'advanced'
  referenceQual?: string          // Encoded query or javascript: expression (simple/advanced)
  dynamicRefQual?: string         // sys_id of sys_filter_option_dynamic record (dynamic only)
  dependentOnField?: string       // Field name whose stored value controls this field's choice list.
                                  // Only relevant for choice fields. For reference fields,
                                  // dependent_on_field from sys_dictionary is intentionally ignored —
                                  // reference dependencies are handled by the developer via
                                  // reference.filter and onFieldChange (see Section 7.2).
}
```

---

Every field passed to the form is a `FieldDefinition` object:

```typescript
interface FieldDefinition {
  // Required
  table: string         // e.g. 'incident', 'task', 'sys_user'
  sysId: string         // sys_id of the record; empty string '' for new records
  field: string         // field name as stored in the database

  // Optional overrides (subject to override rules — see Section 5)
  label?: string        // Override the field label from sys_dictionary
  mandatory?: boolean   // Optionally force mandatory (cannot disable database-level mandatory)
  readOnly?: boolean    // Optionally force read-only (cannot disable database-level read-only)
  visible?: boolean     // Controls field visibility. Default: true. When false, the field is not
                        // rendered and is excluded from validation and save payload. The field
                        // definition must still be present in the columns array — visibility is
                        // toggled via this prop, not by adding/removing fields from columns.
                        // All fields regardless of visibility are tracked in form state and
                        // formRecord — this ensures dependent choice filtering works correctly
                        // even when the parent field is invisible.
                        // The columns prop is treated as static for the lifetime of the Form
                        // instance. To change the set of fields, remount the Form with a new key.
  defaultValue?: string // Value to pre-populate for new records (sysId = '')

  // Reference field config (only relevant for reference type fields)
  reference?: {
    searchFields?: string[]   // Fields to search and display in the typeahead dropdown
    previewFields?: string[]  // Fields to show in the record preview popover
    filter?: string           // Developer-supplied encoded query ANDed on top of any reference_qual.
                              // This prop is reactive — ReferenceField always uses the latest value
                              // when performing searches. Use with onFieldChange to implement
                              // dynamic dependencies (e.g. group membership filters).
  }
}
```

---

## 4. Form Props

```typescript
interface FormProps {
  // Required
  columns: FieldDefinition[][]    // Each array is a column; fields render top-to-bottom in declaration order

  // Behaviour
  readOnly?: boolean              // Makes entire form read-only (default: false)
  showSaveButton?: boolean        // Render the built-in Save button (default: true)
  showCancelButton?: boolean      // Render the built-in Cancel button (default: false)

  // Callbacks
  onSave?: (results: SaveResult[]) => void
  onCancel?: () => void
  onError?: (error: Error) => void
  onFieldChange?: (field: FieldDefinition, value: string, displayValue: string) => void
  // onFieldChange fires AFTER the Form has updated its internal state and formRecord.
  // This means when the developer uses onFieldChange to update reference.filter or other
  // external state, the Form's own state is already consistent at that point.
  // Note: onFieldChange is also the mechanism for implementing custom reference dependencies.
  // The Form does not auto-resolve reference dependent_on_field. The developer uses
  // onFieldChange to update reference.filter on dependent fields as needed.

  // Style overrides
  style?: React.CSSProperties
  className?: string
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

### SaveResult
```typescript
interface SaveResult {
  table: string
  sysId: string     // sys_id of the saved record — for new records this is the newly created sys_id
  isNew: boolean
}
```

---

## 5. Override Rules

Developer overrides in `FieldDefinition` can only **add** restrictions — they can never remove database-level constraints.

| Database metadata | Developer override | Effective result |
|-------------------|--------------------|-----------------|
| `mandatory: true` | `mandatory: false` | **mandatory** — database wins |
| `mandatory: true` | *(not set)* | mandatory |
| `mandatory: false` | `mandatory: true` | mandatory — developer added restriction |
| `mandatory: false` | *(not set)* | not mandatory |

The same logic applies identically to `readOnly`.

**Summary:** `effectiveState = databaseValue OR developerOverride`

UI policies are out of scope (see Section 12).

---

## 6. Table Hierarchy & Metadata Resolution

ServiceNow tables extend each other (e.g. `incident` extends `task`). Field metadata, choice lists, and reference qualifiers must always be resolved against the **full table hierarchy**, not just the immediate table.

### Resolution rules
- **Table hierarchy:** Resolved via API first, before any other metadata fetch. All subsequent fetches use the resolved hierarchy list.
- **Field metadata (sys_dictionary):** Fetch across the full hierarchy. The most specific table's entry wins.
- **Choice lists (sys_choice):** Fetch across the full hierarchy including `dependent_value` and `dependent_on_field` per entry. Use the most specific table's choices. If none found, fall back up the hierarchy until resolved or exhausted.
- **Reference qualifiers:** Always use the most specific definition found in the hierarchy.

---

## 7. Field Dependencies

### 7.1 Dependent Choice Lists

Configured in sys_dictionary via `dependent_on_field`. Each choice entry in `sys_choice` has a `dependent_value` column.

**How it works:**
- On load, the form fetches all choice entries including `dependent_value` and the `dependent_on_field` name.
- The Form resolves the current value of the parent field from its internal state and passes it to `ChoiceField` as a prop (`dependentOnField` and `dependentValue`).
- `ChoiceField` filters its visible options to only those whose `dependent_value` matches `dependentValue`, plus entries with no `dependent_value` (always shown).
- On every change to the parent field, the Form re-passes the updated `dependentValue` prop to `ChoiceField`.
- If the currently selected choice is no longer valid after a parent field change, the Form clears the `ChoiceField`'s value in its `handleFieldChange` logic — the molecule does not clear itself.
- Resolved entirely **client-side** after initial load.

**`ChoiceField` additional props (extends `BaseFieldProps`):**
```typescript
interface ChoiceFieldProps extends BaseFieldProps {
  choices: ChoiceEntry[]          // Full unfiltered choice list including dependent_value per entry
  dependentOnField?: string       // Name of the parent field this choice list depends on
  dependentValue?: string         // Current value of the parent field; ChoiceField filters against this
}
```

**`CheckboxField` behavior note:** For boolean fields, there is no meaningful distinction between `value` and `displayValue`. Both are set to the same boolean string (`'true'` or `'false'`). The `onChange` callback is called with identical `value` and `displayValue` arguments — e.g. `onChange(name, 'true', 'true')`.

### 7.2 Reference Field Dependencies

Reference field `dependent_on_field` is **not resolved automatically**. The developer handles it via `reference.filter` and `onFieldChange`. See Section 4 example.

### 7.3 Reference Qualifiers

Configured in sys_dictionary via `reference_qual`. Controls which records appear in a `ReferenceField` search. Three types:

#### Simple qualifier
A plain encoded query string. Applied directly as a filter.
```
active=true^roles=itil
```

#### Dynamic qualifier
Prefixed with `javascript:` and references `current.fieldName`. Resolved **client-side**.

The `ReferenceField` receives the full current form record state as a `formRecord` prop (`Record<string, string>` — a flat map of `fieldName → currentValue` for all fields in the form). When evaluating a dynamic qualifier, the component substitutes `current.fieldName` references using values from `formRecord`.

The Form must re-pass an updated `formRecord` on every field change, so `ReferenceField` always has the latest values for substitution. The `ReferenceField` re-evaluates the dynamic qualifier and refreshes its effective filter whenever `formRecord` changes.

**`ReferenceField` additional props (extends `BaseFieldProps`):**
```typescript
interface ReferenceFieldProps extends BaseFieldProps {
  reference: string               // The referenced table name (from sys_dictionary)
  referenceQual?: string          // Raw reference_qual string from sys_dictionary
  filter?: string                 // Developer-supplied filter from FieldDefinition.reference.filter
  searchFields?: string[]         // From FieldDefinition.reference.searchFields
  previewFields?: string[]        // From FieldDefinition.reference.previewFields
  formRecord: Record<string, string>  // Current values of all fields in the form (fieldName → value)
                                      // Used for dynamic qualifier substitution
}
```

#### Advanced qualifier
Prefixed with `javascript:` and contains Script Include calls or complex Glide logic. Sent to the **Rhino engine endpoint** for server-side evaluation. The returned encoded query is used as the filter.

The `ReferenceField` detects an advanced qualifier when the `javascript:` expression cannot be resolved purely from `formRecord` substitution (i.e. it contains identifiers beyond `current.fieldName` patterns). It calls the Rhino endpoint, debounced, passing the raw qualifier and the current `formRecord`. Re-evaluation is triggered whenever `formRecord` changes.

**`ReferenceField` additional props (extends `BaseFieldProps`):**
```typescript
interface ReferenceFieldProps extends BaseFieldProps {
  reference: string                     // The referenced table name (from sys_dictionary)
  useReferenceQualifier?: 'simple' | 'dynamic' | 'advanced'  // From sys_dictionary
  referenceQual?: string                // For simple/advanced: the encoded query or javascript: expression
  dynamicRefQual?: string               // For dynamic: sys_id of the sys_filter_option_dynamic record
  filter?: string                       // Developer-supplied filter (FieldDefinition.reference.filter)
  searchFields?: string[]
  previewFields?: string[]
  formRecord: Record<string, { value: string; displayValue: string }>
  // keyed by 'table.field' to avoid collisions in multi-table forms
  // e.g. { 'incident.assignment_group': { value: 'abc123', displayValue: 'IT Support' } }
}
```

When a `ReferenceField` searches, the effective filter is the AND-combination of:
1. Resolved `reference_qual` (simple evaluated directly; dynamic evaluated via `formRecord`; advanced evaluated via Rhino endpoint)
2. Developer-supplied `filter` from `FieldDefinition.reference.filter`

---

## 8. Field Type Behavior

All fields enforce `maxLength` from sys_dictionary — no more characters than the configured maximum may be entered or submitted.

---

### 8.1 ReferenceField

#### States

| State | Description |
|-------|-------------|
| **Empty** | Input is active and typeable. Placeholder: "Type to search…" |
| **Searching** | User is typing. Dropdown appears showing results or loading indicator |
| **Selected** | A record is chosen. Input shows display value, locked. Pen icon + "i" icon visible |
| **Read-only** | Input shows display value, locked. "i" icon visible if field has a value. Pen icon not shown |

#### Input behavior
- **Empty state:** Freely typeable. Search triggers at ≥ 2 characters, debounced 300ms. In-flight requests aborted when a new search triggers.
- **Selected state:** Display value shown, input locked. Two icons at the right end, left to right: **pen icon** then **"i" icon**:
  - **Pen icon (left)** — clears the value, returns to empty/searching state. Focus returned to input after clearing.
  - **"i" icon (right, outermost)** — opens the info popover.
- **Read-only state:** Display value shown, input locked. **"i" icon** shown at the right end if a value is present. Pen icon never shown in read-only state.
- The actual `sys_id` is stored internally; only display value is shown.

#### Search dropdown
- Appears below the input while searching (empty state only).
- **Viewport overflow:** if there is insufficient space below the input to display the dropdown without clipping, the dropdown opens upward instead. The component checks available space on render and flips direction accordingly.
- Triggered at ≥ 2 characters, debounced 300ms.
- Always searches the **display value field** of the referenced table, plus any configured `searchFields`.
- Results displayed as **columns** — one column per search field. Display value is always the first/primary column (styled prominently). Additional columns styled smaller/muted.
- Maximum 15 results.
- Dropdown states: loading indicator / "No results found" / error message.
- Clicking a result selects it: input locks, shows display value, dropdown closes.
- `Escape` closes dropdown without selecting.
- Clicking outside closes dropdown without selecting.
- **When `reference.filter` or the resolved qualifier filter changes** (e.g. because a parent field changed), any in-flight search request is aborted and the current dropdown results are cleared. If the field already has a selected value, that value is **not** automatically cleared — clearing is the developer's responsibility via `onFieldChange`.
- Effective filter = resolved `reference_qual` AND `reference.filter` (see Section 7.4).

#### Info popover ("i" icon)
- Visible whenever field has a value, including read-only state.
- Anchored so its **bottom-left corner touches the "i" icon**.
- Without `previewFields`: shows all non-`sys_`-prefixed fields with a non-empty value, humanized labels.
- With `previewFields`: shows only those fields in declared order, using sys_dictionary labels.
- Always shows **display values**, not raw stored values.
- Closed by clicking the × button in the popover header, or clicking outside.
- Loading and error states handled within the popover.

---

### 8.2 ChoiceField

- Renders as a styled dropdown showing available choice options.
- Always includes a blank option at the top **unless the field is mandatory AND already has a non-empty value**. On new records or when value is empty, the blank option is always shown regardless of mandatory state — the user must be able to see the field is empty and make a selection.
- Options show their **display label**; stored value tracked internally.
- If `dependentOnField` is set, only choices whose `dependent_value` matches `dependentValue` are shown, plus choices with no `dependent_value`.
- The Form (not the molecule) is responsible for clearing the value when the parent field changes and the selected choice is no longer valid.
- Read-only: renders as plain text (display label only).

---

### 8.3 DateTimeField

- Uses native browser input: `<input type="datetime-local">`, `<input type="date">`, or `<input type="time">` depending on mode.
- Stored value always in ServiceNow internal format (`YYYY-MM-DD HH:mm:ss` for datetime). Conversion between browser input format and ServiceNow format is handled internally.
- Can be upgraded to a custom themed date picker later without affecting any other component.
- Read-only: renders as plain text of the formatted display value.

---

### 8.4 NumberField

- Renders `<input type="number">`.
- No min/max enforcement — sys_dictionary does not define numeric range constraints for standard number fields.
- `maxLength` from sys_dictionary is enforced as a character limit on the input string (consistent with other text-input fields).
- `onChange` is called with the numeric string as both `value` and `displayValue` — e.g. `onChange(name, '42', '42')`. There is no separate display value for numeric fields.
- Read-only state: renders as plain text of the value.

---

## 9. Behavior

The `Form` organism manages complex, interdependent state and must use `useReducer` for all state management — see the Project Startup Document for the general state management rule. State transitions include load lifecycle, field changes, `formRecord` updates, validation, and save lifecycle, all of which must be expressed as dispatched actions handled atomically in the reducer.

### 9.1 Data Loading
On mount, the form:
1. Flattens all `FieldDefinition` entries from all columns.
2. Groups by **unique table** → resolves full table hierarchy per unique table. Metadata (sys_dictionary including `use_reference_qualifier`, `reference_qual`, `dynamic_ref_qual`, choice lists, and all other field metadata) is fetched **once per unique table** in a single request — reference qualifier fields are part of the metadata fetch, not a separate call.
3. Fetches choice lists (including `dependent_value` and `dependent_on_field`) per hierarchy.
4. Groups by `table + sysId` (non-empty sysId) → fetches record data. Each unique `table + sysId` combination results in one record fetch.
5. All fetches parallelised with `Promise.all` where possible.
6. Applies `defaultValue` from `FieldDefinition` for new records (`sysId = ''`). `defaultValue` is only applied if the field has no value after loading — it never overwrites an existing value.
7. Builds the initial `formRecord` — a `Record<string, { value: string; displayValue: string }>` keyed by `table.field` (e.g. `'incident.assignment_group'`) — from the loaded record data. **Every field declared in `FieldDefinition` must be present in `formRecord`**, including fields from new records (`sysId = ''`) which have no loaded data. For new records, fields are initialised with `defaultValue` if provided, or `{ value: '', displayValue: '' }`. This map is stored in Form state and passed to every `ReferenceField` on each render.
8. Renders a single `Spinner` for the entire form while loading — no fields are shown until all data is ready.
9. On any fetch failure: renders full-form error state, calls `onError`.

### 9.2 Display Values
- Every field shows its **display value** to the user.
- The **actual value** is stored internally and submitted on save.
- Both tracked in form state per field, updated together on every change.
- On every `handleFieldChange` call, the Form sets `isDirty = true` on all `ReferenceField` instances — ensuring qualifier re-resolution happens on next reference field interaction.

> Note: `formRecord` is no longer maintained by the Form. Qualifier evaluation is handled entirely server-side by the companion app, which reads the current record directly via `table` + `sysId`. The browser never evaluates qualifier expressions.

### 9.3 Mandatory Indicator
- Every field label renders a **red asterisk (\*)** immediately after the label text when the field is effectively mandatory.

### 9.4 Validation Error Display
- Validation is **only triggered on save attempt** — never on individual field changes. Clearing a mandatory field mid-edit does not immediately show an error.
- On failed validation, `hasError: true` is passed to each field that failed, triggering a **red border** via `FieldWrapper`.
- A summary error message listing all missing mandatory field labels is shown at the form level (above the action buttons).
- Individual fields do not show inline error text — the form-level summary is sufficient.
- Once a save attempt has been made and errors are showing, the errors clear when the user successfully saves or explicitly dismisses them — not on individual field edits.

### 9.5 Max Length Enforcement
- Every text input field enforces the `maxLength` value from sys_dictionary.
- The user must not be able to type, paste, or submit more characters than the configured maximum.
- Does not apply to `ReferenceField` or `ChoiceField` inputs.

### 9.6 Empty / Null Display
- If a field has no value in read-only mode, it renders as an empty field — no placeholder, no dash, no substitute text.

### 9.7 Field Render Key Strategy
- Each field is rendered with a React `key` of `table + '.' + sysId + '.' + field` (e.g. `incident.abc123.short_description`).
- `sysId` is a GUID unique across the entire ServiceNow instance — no two records on any table share a sys_id. This makes the key globally unique in almost all cases.
- `table` and `field` are included as additional specificity to safely handle new records where `sysId = ''`, where multiple new records in the same form would otherwise share an empty sysId.
- This strategy naturally prevents the same field on the same record from being declared twice in a form.

### 9.8 Saving
- Fields grouped by `table + sysId`.
- Empty `sysId` → **create** call; non-empty → **update** call.
- **Only fields explicitly declared in `FieldDefinition` are included in the save payload** — never the full record. This prevents accidentally overwriting fields that were not loaded or edited by the form.
- All save calls dispatched in parallel.
- On full success: `onSave` called with all `SaveResult` objects. For newly created records, `SaveResult.sysId` contains the newly assigned sys_id. The Form does not update its internal state with the new sysId — `sysId` comes from `FieldDefinition` props, which the parent component owns and updates via `onSave`.
- On partial failure: clearly communicate which records succeeded and which failed; call `onError`.

### 9.9 Read-Only Mode
- `readOnly={true}` at the form level forces all fields read-only and hides Save button regardless of `showSaveButton`.

---

## 10. Layout

- `columns` prop defines the layout — each array is a column, rendered left to right.
- Fields within each column render top to bottom in declaration order.
- CSS grid, number of columns derived from `columns.length`.
- Save/Cancel buttons render below the grid.
- Multi-column field spanning is out of scope.

---

## 11. Error States

| Situation | Behavior |
|-----------|----------|
| Load failure | Full-form error shown, fields not rendered, `onError` called |
| Save failure (all) | Error shown above action buttons, `onError` called |
| Save failure (partial) | Error identifies which records failed and which succeeded |
| Validation failure | Red border on failing fields + summary at form level; save not attempted |
| Field metadata not found | Renders as `StringField` with raw field name as label |

---

## 12. Out of Scope (for now)

- UI policies (mandatory/readOnly/visible overrides driven by server-side policy records)
- Automatic resolution of reference `dependent_on_field` (developer handles via `reference.filter` + `onFieldChange`)
- Custom date picker UI (native browser input used; upgradeable later in isolation)
- Field spanning (multi-column fields)
- Section headers or visual grouping of fields
- Dirty state tracking / unsaved changes warning
- Optimistic saving / auto-save
- Inline creation of new referenced records from within a `ReferenceField`

---

*Document last updated: March 2026 — maintained by EsTech Development*
