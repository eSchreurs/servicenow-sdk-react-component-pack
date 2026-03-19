# Phase 4 — Foundation Atoms

## Goal
Build the simplest primitive atoms that have no dependencies on other components in this library. These are the building blocks everything else is composed from — get them right before moving on.

## Reference Documents
- Project Startup Document (`docs/specs/project-startup.md`)
- Form Component Spec (`docs/specs/form-component-spec.md`) — Sections 2.3, 2.4

---

## Atoms to Build

Build in this order:

1. `FieldWrapper`
2. `Text`
3. `Label`
4. `Icon`
5. `Spinner`

---

## General Rules for All Atoms

- One component per `.tsx` file in `src/client/components/atoms/`
- All styles via `useTheme()` — never hardcoded
- Every atom accepts `style?: React.CSSProperties` and `className?: string` for overrides
- Use `useState` only — no `useReducer` needed at atom level
- Export as named export

---

## 1. FieldWrapper

The shared structural wrapper used by every field molecule. Responsible for:
- Rendering a `<label>` element associated with the input via `htmlFor`
- Rendering a red asterisk (`*`) after the label text when `mandatory` is true
- Applying a red border to the input container when `hasError` is true

```typescript
interface FieldWrapperProps {
  name: string
  label: string
  mandatory: boolean
  hasError: boolean
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}
```

---

## 2. Text

Generic typography component with variants.

```typescript
interface TextProps {
  children: React.ReactNode
  variant?: 'heading' | 'body' | 'caption' | 'label'
  style?: React.CSSProperties
  className?: string
}
```

Each variant maps to theme typography values (font size, weight, line height).

---

## 3. Label

Form field label with mandatory indicator support. Thin wrapper around `Text` with label-specific styling.

```typescript
interface LabelProps {
  htmlFor: string
  children: React.ReactNode
  mandatory?: boolean
  style?: React.CSSProperties
  className?: string
}
```

When `mandatory` is true, renders a red `*` after the label text.

---

## 4. Icon

Renders an SVG icon by name. For now, implement the following icons needed by upcoming molecules:
- `search`, `clear`, `info`, `edit`, `calendar`, `check`

```typescript
interface IconProps {
  name: 'search' | 'clear' | 'info' | 'edit' | 'calendar' | 'check'
  size?: number        // default: 16
  color?: string       // default: current color
  style?: React.CSSProperties
  className?: string
}
```

Implement icons as inline SVG — no external icon library.

---

## 5. Spinner

Loading indicator for async operations.

```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'   // default: 'md'
  style?: React.CSSProperties
  className?: string
}
```

Implement as a CSS animation — no external library.

---

## What NOT to Do
- Do not build input atoms yet — those are Phase 5
- Do not build Button, Badge, Tooltip, or Popover yet — those are Phase 6
- Do not import from any third-party package

---

## Done When
- All 5 atoms exist in `src/client/components/atoms/`
- All compile without errors
- All use `useTheme()` for styling
- All accept `style` and `className` override props
- `FieldWrapper` correctly renders label, mandatory asterisk, and error border
