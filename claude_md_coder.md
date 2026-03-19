# CLAUDE.md — ServiceNow SDK React Component Pack

You are building the **servicenow-sdk-react-component-pack** for EsTech Development. This file contains non-negotiable rules that apply to every session. Read it completely before writing any code.

For task-specific instructions, read the phase document provided in the session prompt.

---

## Project in One Sentence

A ServiceNow scoped app that contains both the server-side infrastructure and a React component library, allowing developers to build pro-code ServiceNow SDK applications using pre-built, themeable React components.

---

## Repository Structure

The repository root IS the ServiceNow app. The ServiceNow IDE clones and builds from the root. There is no monorepo split.

```
/ (root = ServiceNow app)
├── now.config.json
├── src/
│   ├── client/
│   │   ├── component-explorer/    ← UI Page documentation app
│   │   └── npm-package/           ← React component library
│   │       ├── components/
│   │       │   ├── atoms/
│   │       │   ├── molecules/
│   │       │   └── organisms/
│   │       ├── services/
│   │       ├── context/
│   │       ├── theme/
│   │       ├── types/
│   │       └── index.ts
│   ├── server/
│   │   └── api/                   ← Scripted REST APIs
│   └── fluent/
└── docs/
```

---

## Absolute Rules

### Packages
- Only `@servicenow/*`, `react`, and `react-dom` are permitted
- No other npm packages — ever, for any reason

### HTTP & URLs
- Only `ServiceNowClient` calls `fetch` — no other module ever calls `fetch` directly
- Components never call `ServiceNowClient` — only domain services do
- Always use relative URLs — never hardcode absolute instance URLs
- All endpoint paths are named constants — never inline strings

### Security
- Never store or expose credentials, tokens, or passwords anywhere
- All POST and PATCH requests include `X-UserToken` from `window.g_ck`

### Data
- Display values are only for showing to the user and client-side filtering
- Never use display values in API calls, saves, queries, or any data operation
- Always use actual stored values for all data operations

### Caching
- All caching goes through `CacheService` — no service maintains its own `Map`

### Styling
- Never hardcode colors, fonts, sizes, or spacing in components
- All styles reference the theme via `useTheme()`
- Every component accepts `style` and `className` override props

### Architecture
- Services contain no React, JSX, or hooks — plain TypeScript only
- Components only consume domain model types — never raw API shapes
- One component per `.tsx` file, named after the component (`PascalCase.tsx`)
- Simple components use `useState` — complex organisms use `useReducer`
- Before building anything, check if it already exists in the codebase

### SDK
- Build with `now-sdk build` — never substitute with Vite, CRA, or other tools
- Never put client code in `src/server/` or server code in `src/client/`
- Never modify `now.config.json` unless explicitly instructed

### Atomic Design
- Atoms first, then molecules, then organisms — never skip levels
- If a sub-element could be its own component, make it one
- Check for existing components and services before creating new ones

---

## Self-Check Before Every Response

- Am I about to use a third-party package? → **Stop**
- Am I calling `fetch` outside of `ServiceNowClient`? → **Stop**
- Am I hardcoding a URL, color, font, or size? → **Stop**
- Am I using a display value in a data operation? → **Stop**
- Am I putting API logic in a component? → **Stop**
- Am I putting UI/React logic in a service? → **Stop**
- Does this already exist somewhere in the codebase? → **Use it**

---

*EsTech Development — March 2026*
