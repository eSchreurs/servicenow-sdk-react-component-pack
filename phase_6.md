# Phase 6 — Feedback & Action Atoms

## Goal
Build the remaining atoms — interactive and informational primitives used across molecules and organisms.

## Reference Documents
- Project Startup Document (`docs/specs/project-startup.md`)
- Form Component Spec (`docs/specs/form-component-spec.md`) — Section 8

---

## Atoms to Build

1. `Button`
2. `Badge`
3. `Tooltip`
4. `Popover`

---

## General Rules
- One component per `.tsx` file in `src/client/components/atoms/`
- All styles via `useTheme()` — never hardcoded
- Every atom accepts `style` and `className` override props

---

## 1. Button

```typescript
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'  // default: 'primary'
  size?: 'sm' | 'md' | 'lg'                               // default: 'md'
  disabled?: boolean
  loading?: boolean      // shows loading indicator, disables interaction
  type?: 'button' | 'submit'                              // default: 'button'
  style?: React.CSSProperties
  className?: string
}
```

- Loading state: show `Spinner` atom, disable click
- Never use HTML `<form>` elements

---

## 2. Badge

Small status or category indicator.

```typescript
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  style?: React.CSSProperties
  className?: string
}
```

---

## 3. Tooltip

Hover-triggered short informational text.

```typescript
interface TooltipProps {
  content: string
  children: React.ReactNode     // the element the tooltip is attached to
  position?: 'top' | 'bottom' | 'left' | 'right'   // default: 'top'
  style?: React.CSSProperties
  className?: string
}
```

- Renders via a wrapper `<div>` with relative positioning
- Tooltip content appears on hover
- Implement with CSS — no third-party tooltip library

---

## 4. Popover

Floating content container triggered by click. Used by `ReferenceField` for the record info preview.

```typescript
interface PopoverProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  anchorRef: React.RefObject<HTMLElement>   // element to anchor to
  style?: React.CSSProperties
  className?: string
}
```

- Bottom-left corner of popover anchored to the anchor element
- If insufficient space above, flips to open downward
- Close button (×) in header
- Clicking outside closes it
- Renders via a portal (`ReactDOM.createPortal`) to avoid z-index issues

---

## What NOT to Do
- Do not build any molecules yet
- Do not import any third-party libraries

---

## Done When
- All 4 atoms exist in `src/client/components/atoms/`
- All compile without errors
- All use `useTheme()` for styling
- `Popover` renders via portal and handles outside click and flip positioning
- `Button` loading state uses `Spinner` atom
