# Phase 9 — Component Explorer

## Goal
Build the Component Explorer — a React app deployed as a ServiceNow UI Page inside the companion app. It serves as the living documentation for all components in the library, showing developers what's available, what each component looks like, and which props it accepts.

## Reference Documents
- Project Startup Document (`docs/specs/project-startup.md`) — Component Explorer section
- Form Component Spec (`docs/specs/form-component-spec.md`) — for prop documentation

---

## Location

All Component Explorer code lives in the **companion app**:
```
servicenow-app/src/client/component-explorer/
├── index.html              — HTML entry point for the UI Page
├── main.tsx                — React bootstrap
├── ComponentExplorer.tsx   — Root component: sidebar + content area
├── pages/                  — One page per component
│   ├── atoms/
│   │   ├── ButtonPage.tsx
│   │   ├── TextPage.tsx
│   │   ├── LabelPage.tsx
│   │   ├── IconPage.tsx
│   │   ├── SpinnerPage.tsx
│   │   ├── TextInputPage.tsx
│   │   ├── TextAreaPage.tsx
│   │   ├── CheckboxPage.tsx
│   │   ├── SelectInputPage.tsx
│   │   ├── ReferenceInputPage.tsx
│   │   ├── BadgePage.tsx
│   │   ├── TooltipPage.tsx
│   │   └── PopoverPage.tsx
│   ├── molecules/
│   │   ├── StringFieldPage.tsx
│   │   ├── TextAreaFieldPage.tsx
│   │   ├── NumberFieldPage.tsx
│   │   ├── CheckboxFieldPage.tsx
│   │   ├── DateTimeFieldPage.tsx
│   │   ├── ChoiceFieldPage.tsx
│   │   ├── ReferenceFieldPage.tsx
│   │   └── SearchBarPage.tsx
│   └── organisms/
│       └── FormPage.tsx
└── components/             — Explorer-specific UI components
    ├── PropTable.tsx        — Renders a table of props for a component
    └── CodeSnippet.tsx      — Renders a code example with syntax highlighting
```

---

## ComponentExplorer Root

- Left sidebar: navigable list of all components grouped by atomic level (Atoms, Molecules, Organisms)
- Right content area: renders the selected component's page
- Navigation state managed with `useState` — a selected component key
- The Explorer itself is built using the component library it documents (dogfooding)
- Wrapped in `ThemeProvider` and `ServiceNowProvider` at the root

---

## Each Component Page

Every page must include:

### 1. Live Preview
A rendered example of the component in its default state. Where applicable, show multiple variants or states (e.g. Button shows primary, secondary, ghost, danger variants; TextInput shows normal, read-only, error states).

### 2. Props Table
A `PropTable` component that lists every prop with:
- Prop name
- Type
- Default value
- Description

### 3. Usage Code Snippet
A `CodeSnippet` showing how to import and instantiate the component with its most common props. Example:

```tsx
import { Button } from 'servicenow-sdk-react-component-pack'

<Button variant="primary" onClick={() => console.log('clicked')}>
  Save
</Button>
```

---

## PropTable Component

```typescript
interface PropDefinition {
  name: string
  type: string
  defaultValue?: string
  description: string
  required?: boolean
}

interface PropTableProps {
  props: PropDefinition[]
}
```

Renders as a clean table using theme styles.

---

## CodeSnippet Component

```typescript
interface CodeSnippetProps {
  code: string
  language?: string    // default: 'tsx'
}
```

Renders code in a styled `<pre><code>` block. No external syntax highlighting library — use theme colors for basic styling.

---

## ServiceNow UI Page

The Component Explorer is registered as a UI Page in the companion app:
- Name: `component_explorer`
- Accessible at: `x_326171_ssdk_pack_component_explorer.do` on the instance
- Entry point: `component-explorer/index.html`

---

## What NOT to Do
- Do not install any syntax highlighting libraries
- Do not build a router — use `useState` for navigation
- Do not skip any component — every built component must have a page

---

## Done When
- Component Explorer renders correctly as a ServiceNow UI Page
- All built components have a corresponding page with live preview, props table, and code snippet
- Navigation between component pages works correctly
- Explorer is built using the component library itself
- Deploys and runs on a ServiceNow instance without errors
