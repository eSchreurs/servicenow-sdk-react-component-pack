# Phase 7 — Molecules

## Goal
Build all field molecules. Each molecule wraps one or more atoms into a complete, self-contained field unit. Molecules are the direct children of the `Form` organism.

## Reference Documents
- Form Component Spec (`docs/specs/form-component-spec.md`) — Sections 2, 7, 8
- Service Layer Spec (`docs/specs/service-layer-spec.md`) — Sections 5, 6, 7

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
The most complex molecule. Wraps `ReferenceInput` and `Popover`. Calls `RhinoService` and `SearchService`.

```typescript
interface ReferenceFieldProps extends BaseFieldProps {
  reference: string
  qualifierType?: 'simple' | 'dynamic' | 'advanced'
  simpleQualifier?: string
  filter?: string
  searchFields?: string[]
  previewFields?: string[]
  table: string
  sysId: string
  isDirty: boolean
}
```

### Search orchestration
```
User interacts (focus or typing)
  → if dynamic/advanced AND isDirty:
      call RhinoService.resolveQualifier(table, sysId, field)
      cache result, isDirty = false
  → call SearchService.searchRecords(
      reference, term, searchFields, 15,
      qualifier + filter  ← ANDed, mutually exclusive (simple OR cached)
    )
```

- Search triggered at ≥ 2 characters, debounced 300ms
- Abort in-flight requests when new search triggers
- When `filter` or resolved qualifier changes: abort in-flight search, clear dropdown results
- Selected value NOT auto-cleared when filter changes — developer's responsibility

### Info popover
- Opens on info icon click, anchored bottom-left to icon
- Without `previewFields`: fetch all non-`sys_`-prefixed fields from referenced record, humanize labels
- With `previewFields`: fetch only those fields using `MetadataService.getFieldLabels()`
- Always shows display values in popover
- Uses `RecordService.getRecord()` for popover data

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

---

## Done When
- All 8 molecules exist in `src/client/components/molecules/`
- All compile without errors
- All use `FieldWrapper` for label/error rendering
- `ReferenceField` correctly orchestrates `RhinoService` → `SearchService`
- `ChoiceField` filters dependent choices using stored values only
- `DateTimeField` converts formats correctly in both directions
