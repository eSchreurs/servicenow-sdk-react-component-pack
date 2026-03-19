# Phase 5 — Input Atoms

## Goal
Build all input primitive atoms. These are the raw input elements that field molecules wrap — they render HTML inputs with theme styling and shared behavior but no label, validation, or form context.

## Reference Documents
- Project Startup Document (`docs/specs/project-startup.md`)
- Form Component Spec (`docs/specs/form-component-spec.md`) — Sections 2.4, 8

---

## Atoms to Build

Build in this order:

1. `TextInput`
2. `TextArea`
3. `Checkbox`
4. `SelectInput`
5. `ReferenceInput`

---

## General Rules for All Input Atoms

- One component per `.tsx` file in `src/client/components/atoms/`
- All styles via `useTheme()` — never hardcoded
- Every atom accepts `style` and `className` override props
- All inputs enforce `maxLength` from props where applicable
- Read-only state renders as plain text — no interactive input
- All inputs are controlled components — they receive `value` and call `onChange`

---

## 1. TextInput

Single-line text input.

```typescript
interface TextInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  mandatory?: boolean
  maxLength?: number
  placeholder?: string
  inputType?: string     // 'text' | 'email' | 'url' | etc. Default: 'text'
  hasError?: boolean
  style?: React.CSSProperties
  className?: string
}
```

- Enforces `maxLength` via the native `maxLength` attribute
- Read-only: renders as plain text (`<span>`) — not a disabled input
- Empty read-only value: renders as empty, no placeholder

---

## 2. TextArea

Multi-line text input.

```typescript
interface TextAreaProps {
  id: string
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  mandatory?: boolean
  maxLength?: number
  placeholder?: string
  rows?: number          // default: 4
  hasError?: boolean
  style?: React.CSSProperties
  className?: string
}
```

- Enforces `maxLength`
- Read-only: renders as plain text

---

## 3. Checkbox

Boolean toggle input.

```typescript
interface CheckboxProps {
  id: string
  value: boolean
  onChange: (value: boolean) => void
  readOnly?: boolean
  hasError?: boolean
  style?: React.CSSProperties
  className?: string
}
```

- Read-only: renders as a disabled, non-interactive checkbox
- No `maxLength` applicable

---

## 4. SelectInput

Dropdown choice input.

```typescript
interface SelectOption {
  value: string
  label: string
}

interface SelectInputProps {
  id: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  readOnly?: boolean
  mandatory?: boolean
  hasError?: boolean
  placeholder?: string    // shown as first empty option when no value selected
  style?: React.CSSProperties
  className?: string
}
```

- Read-only: renders as plain text (display label of selected option)
- Empty read-only value: renders as empty

---

## 5. ReferenceInput

Search input for looking up ServiceNow records. This is the most complex input atom — it manages its own search interaction state but does NOT call any services directly. The parent molecule handles all service calls and passes results down as props.

```typescript
interface ReferenceSearchColumn {
  field: string
  value: string
}

interface ReferenceResult {
  sysId: string
  displayValue: string
  columns: ReferenceSearchColumn[]
}

interface ReferenceInputProps {
  id: string
  value: string           // actual stored value (sys_id)
  displayValue: string    // shown in the input when a value is selected
  onChange: (value: string, displayValue: string) => void
  onSearchTermChange: (term: string) => void   // called when user types — parent triggers search
  onClear: () => void
  searchResults: ReferenceResult[]
  isSearching: boolean
  searchError?: string
  readOnly?: boolean
  mandatory?: boolean
  hasError?: boolean
  placeholder?: string    // default: 'Type to search...'
  style?: React.CSSProperties
  className?: string
}
```

### States
- **Empty:** input is typeable, placeholder shown
- **Searching:** dropdown visible with results or loading indicator
- **Selected:** display value shown, input locked. Pen icon (left) + Info icon (right) visible
- **Read-only:** display value shown, locked. Info icon visible if value present. No pen icon.

### Dropdown behavior
- Opens when results are available or search is in progress
- Results shown as columns — first column primary (larger), additional columns secondary (smaller/muted)
- "No results found" when results empty and not searching
- Closes on `Escape` or click outside
- Flips upward if insufficient space below

### Icons
- **Pen icon:** clears value, returns to empty state, restores focus to input
- **Info icon:** calls `onInfoClick` — parent handles popover rendering

```typescript
// Add to props:
onInfoClick?: () => void    // called when info icon clicked — only shown when value is present
```

---

## What NOT to Do
- Do not call any services from input atoms — that is the molecule's responsibility
- Do not render labels or validation messages — that is `FieldWrapper`'s responsibility
- Do not build `DateTimeField` yet — that comes with molecules

---

## Done When
- All 5 input atoms exist in `src/client/components/atoms/`
- All compile without errors
- All use `useTheme()` for styling
- All respect `readOnly`, `maxLength`, and `hasError` props
- `ReferenceInput` manages dropdown and icon states correctly
