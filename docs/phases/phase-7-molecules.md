# Phase 7 — Molecules

## Goal
Build all field molecules. Each molecule wraps one or more atoms into a complete, self-contained field unit. Molecules are the direct children of the `Form` organism.

## Reference Documents
- Form Component Spec (`docs/specs/form-component-spec.md`) — Sections 2, 7, 8
- Service Layer Spec (`docs/specs/service-layer-spec.md`) — Sections 5, 6

---

## Build Order

1. `StringField`
2. `TextAreaField`
3. `NumberField`
4. `CheckboxField`
5. `DateTimeField`
6. `ChoiceField`
7. `ReferenceField`
8. `SearchBar`

---

## General Rules for All Field Molecules

- One component per `.tsx` file in `src/client/components/molecules/`
- All field molecules extend `BaseFieldProps` (defined in `types/index.ts`)
- All use `FieldWrapper` for label, mandatory asterisk, and error border
- All use `useTheme()` for any additional styling
- All accept `style` and `className` override props
- Read-only rendering: plain text, no interactive input
- Empty read-only value: renders as empty field — no dash, no placeholder

### BaseFieldProps reminder
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

---

## 1. StringField
Wraps `TextInput`. For string fields ≤ 255 chars.
- Passes `maxLength`, `readOnly`, `hasError` to `TextInput`
- `onChange`: calls parent with same string for both `value` and `displayValue`

## 2. TextAreaField
Wraps `TextArea`. For string fields > 255 chars or `text` type.
- Same pattern as `StringField`

## 3. NumberField
Wraps `TextInput` with `inputType="number"`.
- `onChange`: calls parent with numeric string for both `value` and `displayValue`

## 4. CheckboxField
Wraps `Checkbox`.
- `onChange`: calls parent with `'true'` or `'false'` for both `value` and `displayValue`
- Read-only: disabled non-interactive checkbox

## 5. DateTimeField
Wraps native browser date/time input directly (no separate atom).

```typescript
interface DateTimeFieldProps extends BaseFieldProps {
  mode: 'datetime' | 'date' | 'time'
}
```

- `datetime` → `<input type="datetime-local">`
- `date` → `<input type="date">`
- `time` → `<input type="time">`

**Format conversion (required):**
- On load (ServiceNow → browser): `YYYY-MM-DD HH:mm:ss` → `YYYY-MM-DDTHH:mm`
- On change (browser → ServiceNow): `YYYY-MM-DDTHH:mm` → `YYYY-MM-DD HH:mm:00`
- Read-only display: human-readable format — `DD/MM/YYYY HH:mm` for datetime, `DD/MM/YYYY` for date, `HH:mm` for time

## 6. ChoiceField
Wraps `SelectInput`. Handles dependent choice filtering client-side.

```typescript
interface ChoiceFieldProps extends BaseFieldProps {
  choices: ChoiceEntry[]
  dependentOnField?: string
  dependentValue?: string
}
```

- Filters visible choices: show entries where `dependentValue` matches `dependentValue` prop, plus entries with no `dependentValue`
- Matching uses stored value (`.value`) — never display value
- Always includes blank option unless `mandatory` is true AND `value` is non-empty
- Read-only: renders display label of selected option as plain text
- `onChange`: calls parent with stored value and display label

## 7. ReferenceField
The most complex molecule. Wraps `ReferenceInput` and `Popover`. Calls `SearchService` for typeahead search and `RecordService` for the info popover.

```typescript
interface ReferenceFieldProps extends BaseFieldProps {
  reference: string           // Referenced table name
  referenceQual?: string      // Qualifier string from FieldData — passed as-is to SearchService
  filter?: string             // Developer-supplied filter, ANDed with referenceQual
  searchFields?: string[]
  previewFields?: string[]
  table: string               // Parent form record table (for info popover label fetching)
  sysId: string               // Parent form record sysId
}
```

### Search orchestration

```
User types (≥ 2 characters, debounced 300ms)
  → build effective filter:
      if referenceQual AND filter → '(referenceQual)^filter'
      if referenceQual only       → referenceQual
      if filter only              → filter
      if neither                  → no filter
  → call SearchService.searchRecords(
        reference, term, searchFields, 15, effectiveFilter
    )
  → abort in-flight requests when new search triggers
```

- All qualifier types (simple, dynamic, advanced) are passed as-is — the Table API evaluates them server-side
- When `filter` changes: abort in-flight search, clear dropdown results. Selected value is NOT auto-cleared.

### Info popover
- Opens on info icon click, anchored bottom-left to icon
- Without `previewFields`: fetch the referenced record via `RecordService.getRecord()`, show all non-`sys_`-prefixed fields with a non-empty value, use field name humanized as label
- With `previewFields`: fetch record via `RecordService.getRecord()`, fetch labels via `RhinoService.getRecordMetadata(reference, previewFields)`, show only declared fields in order
- Always shows display values in popover
- Uses `Popover` atom for rendering

### onChange
- Calls parent with `sys_id` as `value` and display name as `displayValue`

## 8. SearchBar
General-purpose search input. Wraps `TextInput` + `Icon`.

```typescript
interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number    // default: 300
  style?: React.CSSProperties
  className?: string
}
```

- Search icon on the left
- Clear icon on the right when value is non-empty
- Debounces `onChange` calls

---

## What NOT to Do
- Do not build the `Form` organism yet — that is Phase 8
- Do not duplicate service logic inside molecules — use the service layer
- Do not call `ServiceNowClient` directly from any molecule
- Do not call `RhinoService.resolveQualifier` — it does not exist
- Do not implement a dirty flag strategy for qualifiers — `referenceQual` is static metadata

---

## Done When
- All 8 molecules exist in `src/client/components/molecules/`
- All compile without errors
- All use `FieldWrapper` for label/error rendering
- `ReferenceField` passes `referenceQual` directly to `SearchService` for all qualifier types
- `ReferenceField` info popover uses `RecordService.getRecord()` for values and `RhinoService.getRecordMetadata()` for labels when `previewFields` is specified
- `ChoiceField` filters dependent choices using stored values only
- `DateTimeField` converts formats correctly in both directions
