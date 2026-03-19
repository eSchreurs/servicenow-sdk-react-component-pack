# 🤖 AI Agent Project Startup Document

> **Instructions for the AI Agent:** Read this document carefully and in full before taking any action. This document defines the full context, rules, and expectations for this project. Refer back to it whenever you are uncertain about scope, conventions, or priorities.

---

## 1. Project Overview

- **Project Name:** `servicenow-sdk-react-component-pack`
- **Description:** A two-part developer toolkit consisting of (1) a ServiceNow scoped application that provides the server-side infrastructure, and (2) an NPM package of reusable React components for use in any ServiceNow SDK project. Developers install the scoped app once per instance, then import components via NPM in any SDK project.
- **Purpose:** To accelerate pro-code app development on the ServiceNow platform by providing a consistent, configurable, and themeable set of React components that integrate natively with ServiceNow's data layer.
- **Primary Language(s):** `TypeScript (TSX), JavaScript (ServiceNow server-side)`
- **Project Type:** `Monorepo — ServiceNow Scoped App + NPM React Component Library`

---

## 2. Goals & Objectives

### Primary Goals
- Provide a library of production-ready React components installable via NPM in any ServiceNow SDK project.
- Enable developers to instantiate and configure components entirely through props, with no internal changes needed.
- Integrate seamlessly with ServiceNow Table API and Scripted REST APIs for data retrieval and manipulation.
- Expose a centralized theme file so styling is consistent and globally configurable across all components.

### Success Criteria
- A developer can run `npm install servicenow-sdk-react-component-pack` and immediately import and use components.
- All components render correctly, retrieve data via ServiceNow APIs, and respect the active theme.
- Components are individually documented with all available props listed.
- [Any other success criteria to add?]

### Milestones & Build Order

The project must be built in the following sequence. The agent must never skip ahead — each phase depends on the previous being complete and stable.

| # | Phase | Deliverables |
|---|-------|-------------|
| 1 | **Project Scaffolding** | Monorepo structure, both `servicenow-app` and `npm-package` set up from the provided empty SDK repo, all config files in place |
| 2 | **Theme File** | Centralized theme file with all styling variables defined (colors, fonts, sizes, spacing, borders, border-radius) |
| 3 | **Atoms — Foundation** | `Icon`, `Text`, `Label`, `Spinner` — the simplest primitives with no dependencies on other atoms |
| 4 | **Atoms — Inputs** | `TextInput`, `TextArea`, `Checkbox`, `SelectInput`, `ReferenceInput` — all input primitives, built on top of foundation atoms where applicable |
| 5 | **Atoms — Feedback & Actions** | `Button`, `Badge`, `Tooltip`, `Popover` — interactive and informational atoms |
| 6 | **Molecules** | In order: `FormField` → `ChoiceField` → `ReferenceField` → `SearchBar` |
| 7 | **Organism: Form** | Full `Form` component, depending on all field molecules |
| 8 | **Component Explorer** | Full documentation UI Page in the ServiceNow app, covering all components built so far |

---

## 3. Scope

### ✅ In Scope
- React TSX components, each in its own file/class/object
- A built-in **Component Explorer UI Page** (React app) deployed as part of the ServiceNow scoped app, serving as living documentation: showcasing all available components, their visual appearance, available props, and usage examples
- NPM package setup and configuration (`package.json`, build tooling, exports)
- ServiceNow Table API integration for data retrieval and updates
- Scripted REST API integration, including a dedicated endpoint exposing ServiceNow's Rhino engine for server-side script evaluation (e.g. evaluating conditions that reference Script Includes)
- Centralized theme file with configurable styling variables (colors, fonts, sizes, margins, borders, etc.)
- Atomic design system: composite components built from primitive components (e.g. a Form uses InputField, Button, and Text components)
- Style override support via props on every component
- Display Value / actual value handling: UI always shows display values, underlying database values are retained internally

### ❌ Out of Scope
- No direct use of Glide APIs in the browser (all server-side logic must go through Scripted REST APIs)
- No custom ServiceNow platform UI (this is purely a React component library, not a ServiceNow scope/application)
- No exposure of passwords, tokens, or other security objects in the browser, API responses, URLs, or code
- [Any other explicit exclusions?]

---

## 4. Tech Stack & Architecture

### Stack
| Layer | Technology |
|-------|------------|
| Repo Structure | `Monorepo (Turborepo or NPM workspaces)` |
| Components | `React (TSX)` |
| Language | `TypeScript (NPM package), JavaScript (ServiceNow app)` |
| Styling | `CSS/SCSS variables via centralized theme file` |
| Data Layer | `ServiceNow Table API + Scripted REST APIs` |
| Server-side Eval | `Scripted REST API → ServiceNow Rhino Engine` |
| Package Distribution | `NPM (React library), Update Set or ServiceNow Store (scoped app)` |
| SDK | `@servicenow/sdk 4.4.0` |
| Glide Types | `@servicenow/glide 26.0.1` |
| Build Tooling | `now-sdk build (@servicenow/isomorphic-rollup)` |
| Linting | `eslint 8.50.0 + @servicenow/eslint-plugin-sdk-app-plugin` |
| Target Environment | `ServiceNow SDK (IDE)` |

### Architecture Notes

#### ServiceNow SDK `src/` Structure
The ServiceNow SDK enforces a strict three-way split inside every `src/` directory. The agent must always respect this:

- **`src/client/`** — All browser-executed code: React components, services, theme, types. Bundled by `now-sdk` via `@servicenow/isomorphic-rollup`. No Glide API access here.
- **`src/server/`** — All server-side scripts: Scripted REST API handlers, Script Includes. Has access to Glide APIs. TypeScript config lives here (`tsconfig.json`), as referenced by `now.config.json`.
- **`src/fluent/`** — ServiceNow Fluent API definitions, if used.

Never place client-side code in `server/` or vice versa. The SDK build system enforces this boundary at compile time.

#### Monorepo Structure
A ServiceNow SDK project (as created by the ServiceNow IDE) has the following structure and conventions that the agent must be aware of:

- **Build & deploy commands** are driven by `now-sdk`: `now-sdk build`, `now-sdk install` (deploy), `now-sdk transform`, `now-sdk dependencies`.
- The project uses `@servicenow/isomorphic-rollup` as the underlying bundler — this is not a standard Vite/Webpack setup.
- App naming follows the ServiceNow scoped app convention: `x-{scope}-{app-name}` (e.g. `x-326171-react-test-app`).
- `now.config.json` holds ServiceNow-specific app configuration (scope, app sys_id, instance connection, etc.).
- `now.prebuild.mjs` is a prebuild hook executed before the SDK build step.
- TypeScript is supported natively via `@types/react` and `typescript` as dev dependencies.
- React and React DOM (`19.x`) are standard dependencies.
- The `@servicenow/glide` package provides TypeScript types for Glide APIs (server-side — not available in the browser).

When the agent generates or modifies any SDK app code, it must respect these conventions and not substitute standard tooling (e.g. Vite, CRA) for the `now-sdk` build system.
The project lives in a single repository split into two distinct packages that are developed and versioned together but distributed independently:
- **`/servicenow-app`** — The ServiceNow scoped application. Installed once per instance by an administrator. Provides all server-side infrastructure: Scripted REST APIs, configuration tables, ACLs, and security setup.
- **`/npm-package`** — The React component library. Installed per SDK project by the developer via `npm install`. Contains all React components, the theme file, and API utility functions that call the endpoints provided by the ServiceNow app.

The two packages are tightly coupled: changes to a REST endpoint in the ServiceNow app must be reflected in the NPM package. Versioning must be kept in sync, with compatibility ranges clearly documented.
- Every component is its own `.tsx` file and exported class/function.
- Components follow **atomic design**: atoms (Button, Input, Text) → molecules (FormField, SearchBar) → organisms (Form, DataTable, Modal).
- All composite components are assembled from smaller components in this library.

#### Data Layer
- All data retrieval and mutations go through **ServiceNow Table API** or **Scripted REST APIs**.
- Data returned from any API must surface the **display value** to the user while retaining the **actual stored value** internally (e.g. for reference fields).
- Any logic requiring access to Glide APIs (e.g. evaluating a condition that references a Script Include) must be routed through a dedicated **Scripted REST endpoint** that executes on the ServiceNow server via the **Rhino engine** and returns the result to the browser.

#### Theming
- A single **theme file** defines all global styling variables: primary color, secondary color, fonts, sizes, margins, borders, border-radius, etc.
- All component styles reference this theme file.
- Individual components accept **style override props** to allow per-instance customization without modifying the theme.

#### State Management
- **Simple components** (atoms, simple molecules with one or two state values) use React's `useState` hook.
- **Complex components** (organisms and any molecule with genuinely complex, interdependent state) use React's built-in `useReducer` hook. `useReducer` centralises all state transitions in a single reducer function — each change is expressed as a dispatched action, and the reducer returns the new state atomically. This prevents scattered, inconsistent state updates across multiple `useState` calls.
- No third-party state management libraries are used.


- All API calls must be made in the context of the **currently logged-in ServiceNow user**. This is achieved by using session-based authentication (the browser's active ServiceNow session cookie) — never by passing stored credentials, hardcoded tokens, or service account secrets from the client side.
- By making calls as the logged-in user, ServiceNow's native **ACL system** handles all data access control automatically. The API will only return records the user is permitted to see — no additional filtering or access checks need to be implemented in the components or services.
- Sensitive data (passwords, tokens, secrets) must **never** appear in: browser memory (beyond session), API responses, URLs, console output, or source code.
- Never use or store service account credentials on the client side. If a server-side operation requires elevated access, it must be handled in a Scripted REST API on the server, scoped appropriately, and never expose the credential to the browser.

---

## 5. Coding Standards & Rules

### General Rules
- Every component lives in its own `.tsx` file and is its own exported entity.
- All components must accept and apply **style override props** in addition to their default theme-based styles.
- All API calls must include authorization headers — no unauthenticated requests.
- Never expose secrets, tokens, or passwords anywhere in client-side code, URLs, or API responses.
- Always return and display **display values** from ServiceNow; store **actual values** internally.

### Naming Conventions
- **Files:** `PascalCase.tsx` (one component per file, named after the component)
- **Components:** `PascalCase`
- **Variables/Functions:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Theme variables:** `[e.g. --color-primary, camelCase object keys — to be decided]`

- Remove the formatting/linting section — the agent is expected to be self-consistent in its formatting choices throughout the project.

### Naming Conventions
- Never place Glide API logic in the browser — always proxy through a Scripted REST API.
- Never hardcode credentials, tokens, or secrets anywhere.
- Never break atomic design: if a component needs a sub-element that could be its own component, make it one.
- Never silently swallow errors — always handle and surface them appropriately.
- **Only the following NPM packages may be used:** those provided by ServiceNow (`@servicenow/*`) and React (`react`, `react-dom`). No other third-party NPM packages are permitted under any circumstance. All functionality must be built from scratch using only these packages and native browser/TypeScript APIs.

---

## 6. File Structure

```
servicenow-sdk-react-component-pack/        # Monorepo root
├── servicenow-app/                         # ServiceNow scoped application (installed on instance)
│   ├── src/
│   │   ├── client/                         # Client-side assets
│   │   │   └── component-explorer/         # React app: living documentation UI Page
│   │   │       ├── index.html              # Entry point for the UI Page
│   │   │       ├── ComponentExplorer.tsx   # Root component: sidebar nav + content area
│   │   │       ├── pages/                  # One page per component (e.g. ButtonPage.tsx)
│   │   │       └── components/             # Explorer-specific UI (e.g. PropTable, CodeSnippet)
│   │   ├── server/                         # Server-side scripts (Scripted REST APIs, Script Includes)
│   │   │   ├── scripted_rest_apis/         # REST endpoints (Rhino evaluator, config, etc.)
│   │   │   ├── script_includes/            # Reusable server-side script includes
│   │   │   └── tsconfig.json              # Server-side TypeScript config (as per now.config.json)
│   │   └── fluent/                         # ServiceNow Fluent API definitions (if applicable)
│   ├── now.config.json                     # Scoped app config (scope, scopeId, name, tsconfigPath)
│   ├── now.prebuild.mjs                    # Prebuild hook for client asset bundling
│   ├── package.json
│   └── .eslintrc                           # ESLint with @servicenow/sdk-app-plugin
│
├── npm-package/                            # React component library (installed per SDK project)
│   ├── src/
│   │   ├── client/                         # All client-side source code
│   │   │   ├── components/                 # React components (atomic design)
│   │   │   │   ├── atoms/                  # Primitives: Button, Input, Text, Icon, etc.
│   │   │   │   ├── molecules/              # Composed: FormField, SearchBar, etc.
│   │   │   │   └── organisms/             # Complex: Form, DataTable, Modal, etc.
│   │   │   ├── services/                   # Shared services used across components
│   │   │   │   ├── tableApi.ts             # ServiceNow Table API calls
│   │   │   │   ├── rhinoApi.ts             # Scripted REST / Rhino engine calls
│   │   │   │   └── [other services]        # e.g. authService.ts, displayValueHelper.ts
│   │   │   ├── theme/                      # Centralized theme file (colors, fonts, sizes, etc.)
│   │   │   ├── types/                      # Shared TypeScript interfaces and types
│   │   │   └── index.ts                    # Main entry point — all component & service exports
│   │   └── server/                         # Server-side scripts (if npm-package needs any)
│   ├── now.config.json
│   ├── now.prebuild.mjs
│   ├── package.json
│   └── .eslintrc
│
├── package.json                            # Monorepo root — workspaces config
├── [turbo.json]                            # Optional: Turborepo config
└── README.md                               # Setup guide: instance app install + NPM usage
```

### Key Files
| File | Purpose |
|------|---------|
| `src/index.ts` | Main entry point; all components and utilities exported from here |
| `src/theme/theme.ts` | Global styling variables referenced by all components |
| `src/api/tableApi.ts` | Utility functions for ServiceNow Table API calls |
| `src/api/rhinoApi.ts` | Utility functions for the Scripted REST / Rhino engine endpoint |

---

## 7. Current Status

### ✅ Completed
- Project definition, architecture planning, and this startup document
- An empty ServiceNow SDK app repository will be provided as the starting point for the agent to build from

### 🔄 In Progress
- Empty SDK app repository setup (by EsTech Development, to be handed to agent)

### 📋 Up Next
- Phase 1: Monorepo scaffolding from the provided empty SDK repo (see Milestones & Build Order)

---

## 8. Known Issues & Constraints

### Constraints
- No direct browser access to Glide APIs — all server-side ServiceNow logic must be proxied via Scripted REST APIs.
- Components must function within the constraints of the **ServiceNow SDK IDE environment**.
- [Any ServiceNow version or SDK version constraints?]
- [Any known API rate limits or authentication constraints?]

### Bugs
- None yet — project in early stages.

### Blockers
- [Any external dependencies, approvals, or resources not yet available?]

---

## 9. Agent Instructions

### Behavior
- **Approach:** Think through the full component design (props interface, data flow, styling, API needs) before writing any code. State your plan first.
- **Scope:** Only create or modify files relevant to the current task. Do not refactor unrelated components or files unless explicitly asked.
- **Consistency:** Always follow atomic design. If you're building a molecule or organism, check whether the required atoms already exist before creating new primitives.
- **Communication:** At the end of each response, summarize what was done, what decisions were made and why, and what the suggested next step is.

### Dos ✅
- Follow atomic design strictly — build from existing primitives where possible.
- Reference the theme file for all default styling; never hardcode style values.
- Always define a full TypeScript props interface for every component.
- Route any ServiceNow server-side logic through the designated Scripted REST API.
- Show display values in the UI; retain actual values internally.
- Ask for clarification if a task is ambiguous before proceeding.

### Don'ts ❌
- Do not install or use any NPM package other than `@servicenow/*` and `react`/`react-dom`. No exceptions — not even well-known utility libraries (e.g. lodash, axios, date-fns). Build from scratch using native APIs.
- Do not place Glide API logic or ServiceNow server-side code in browser-executed files.
- Do not hardcode colors, fonts, sizes, or other style values — always use theme variables.
- Do not expose or log tokens, passwords, or secrets anywhere.
- Do not install new dependencies without asking first.
- Do not delete or overwrite files unless explicitly instructed.
- Do not assume business logic or ServiceNow schema — always ask.

### When Stuck
If you are unsure how to proceed, stop and explain: what you understand about the task, what you are uncertain about, and what options you see. Do not guess. Do not write speculative code.

---

*Document last updated: March 2026 — maintained by EsTech Development*
