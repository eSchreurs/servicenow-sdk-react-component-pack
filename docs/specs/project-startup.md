# 🤖 AI Agent Project Startup Document

> **Instructions for the AI Agent:** Read this document carefully and in full before taking any action. This document defines the full context, rules, and expectations for this project. Refer back to it whenever you are uncertain about scope, conventions, or priorities.

---

## 1. Project Overview

- **Project Name:** `servicenow-sdk-react-component-pack`
- **Description:** A ServiceNow scoped application that provides both server-side infrastructure and a React component library. The scoped app is installed on a ServiceNow instance via the SDK. Developers then import components from the npm-package directory within any SDK project.
- **Purpose:** To accelerate pro-code app development on the ServiceNow platform by providing a consistent, configurable, and themeable set of React components that integrate natively with ServiceNow's data layer.
- **Primary Language(s):** `TypeScript (TSX), JavaScript (ServiceNow server-side)`
- **Project Type:** `Single ServiceNow SDK Application — contains both the companion app server-side infrastructure and the React component library`

---

## 2. Goals & Objectives

### Primary Goals
- Provide a library of production-ready React components usable in any ServiceNow SDK project.
- Enable developers to instantiate and configure components entirely through props, with no internal changes needed.
- Integrate seamlessly with ServiceNow Table API and Scripted REST APIs for data retrieval and manipulation.
- Expose a centralized theme file so styling is consistent and globally configurable across all components.

### Success Criteria
- A developer can import and use components directly from the npm-package source.
- All components render correctly, retrieve data via ServiceNow APIs, and respect the active theme.
- Components are individually documented with all available props listed.

### Milestones & Build Order

The project must be built in the following sequence. The agent must never skip ahead — each phase depends on the previous being complete and stable.

| # | Phase | Deliverables |
|---|-------|-------------|
| 1 | **Project Scaffolding** | Folder structure, config files, and placeholders set up from the provided SDK repo |
| 2 | **Theme & Context** | Centralized theme file, `ThemeContext`, `ServiceNowContext`, and all shared types |
| 3 | **Service Layer** | All five services + companion app metadata endpoint |
| 4 | **Primitive Components** | `FieldWrapper`, `Text`, `Label`, `Icon`, `Spinner` |
| 5 | **Input Primitives** | `Input`, `Checkbox`, `Dropdown` |
| 6 | **Feedback & Action Components** | `Button`, `Badge`, `Tooltip`, `Popover` |
| 7 | **Field Component** | Unified `Field` component + all internal parts + `SearchBar` |
| 8 | **Form Organism** | Full `Form` component |
| 9 | **Component Explorer** | Living documentation UI Page |

---

## 3. Scope

### ✅ In Scope
- React TSX components, each in its own file
- A built-in **Component Explorer UI Page** (React app) deployed as part of the ServiceNow scoped app, serving as living documentation
- ServiceNow Table API integration for data retrieval and updates
- Scripted REST API for server-side metadata resolution (field definitions, choices, table hierarchy) and any other logic requiring Glide API access
- Centralized theme file with configurable styling variables
- Style override support via props on every component
- Display value / actual value handling: UI always shows display values, underlying database values retained internally

### ❌ Out of Scope
- No direct use of Glide APIs in the browser — all server-side logic goes through Scripted REST APIs
- No exposure of passwords, tokens, or other security objects in the browser, API responses, URLs, or code

---

## 4. Tech Stack & Architecture

### Stack
| Layer | Technology |
|-------|------------|
| Repo Structure | Single ServiceNow SDK app — no monorepo split |
| Components | React (TSX) |
| Language | TypeScript (client), JavaScript (ServiceNow server-side) |
| Styling | Inline styles via centralized theme object |
| Data Layer | ServiceNow Table API + Scripted REST APIs |
| Server-side Metadata | Scripted REST API → ServiceNow Glide APIs (GlideRecord, GlideTableHierarchy) |
| SDK | `@servicenow/sdk 4.4.0` |
| Glide Types | `@servicenow/glide 26.0.1` |
| Build Tooling | `now-sdk build (@servicenow/isomorphic-rollup)` |
| Linting | `eslint 8.50.0 + @servicenow/eslint-plugin-sdk-app-plugin` |
| Target Environment | ServiceNow SDK (IDE) |

### Repository Structure

The repository root IS the ServiceNow app. The ServiceNow IDE clones the repo and builds from the root. There is no monorepo split — everything lives in one SDK app.

The component library (`npm-package`) content lives inside `src/client/npm-package/` within the ServiceNow app. This is client-side code that runs in the browser.

### ServiceNow SDK `src/` Structure

The ServiceNow SDK enforces a strict three-way split inside `src/`:

- **`src/client/`** — All browser-executed code: React components, services, theme, types. Bundled by `now-sdk`. No Glide API access here.
- **`src/server/`** — All server-side scripts: Scripted REST API handlers. Has access to Glide APIs.
- **`src/fluent/`** — ServiceNow Fluent API definitions.

Never place client-side code in `server/` or vice versa. The SDK build system enforces this boundary at compile time.

### Data Layer

All data retrieval and mutations go through **ServiceNow Table API** or **Scripted REST APIs**.

**All server-side logic goes through the Scripted REST API** — this includes field metadata resolution (sys_dictionary, sys_dictionary_override), choice list fetching (sys_choice), and table hierarchy resolution (GlideTableHierarchy). The browser never queries these tables directly.

The single metadata endpoint (`POST /api/x_326171_ssdk_pack/rhino/metadata`) handles all of this in one round-trip per table, returning `FieldData` objects ready for use by the Form organism.

Data returned from any API surfaces the **display value** to the user while retaining the **actual stored value** internally.

### Service Layer Summary

| Service | Responsibility | Caches? |
|---------|---------------|---------|
| `CacheService` | Shared in-memory key-value store | — |
| `ServiceNowClient` | Base HTTP layer, sole caller of `fetch()` | No |
| `RhinoService` | Field metadata via companion app endpoint | Yes — per table+field-set+language |
| `RecordService` | Record CRUD via Table API | No |
| `SearchService` | Reference field typeahead search | No |

### Field Component Architecture

The library uses a single unified `Field` component rather than separate per-type field components. `Field` resolves the correct input at render time from the `type` and `isChoiceField` props, which come from live `FieldData` metadata.

This is intentional. ServiceNow field types are metadata-driven — a field's type can change in the backend without any frontend code changes. Because resolution happens at render time, the UI adapts automatically.

The resolution logic lives in `_internal/resolveFieldKind.ts`. Internal building blocks (`FieldWrapper`, `ReferenceInput`, `dateHelpers`) live in `components/atoms/_internal/` and are not exported from the public `index.ts`.

### Theming

A single **theme file** (`src/client/npm-package/theme/theme.ts`) defines all global styling variables. All component styles reference this theme via `useTheme()`. Individual components accept **style override props** for per-instance customization.

### State Management

- **Simple components** use `useState`.
- **Complex components** (those with genuinely complex interdependent state — currently only `Form`) use `useReducer`. All state transitions expressed as dispatched actions handled atomically in the reducer.
- No third-party state management libraries.

### Security

- All API calls made in the context of the currently logged-in ServiceNow user via session-based authentication — never stored credentials or hardcoded tokens.
- ServiceNow's native ACL system handles all data access control automatically.
- Sensitive data must **never** appear in browser memory (beyond session), API responses, URLs, console output, or source code.

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
- **Theme variables:** camelCase object keys (e.g. `colorPrimary`, `fontSizeBase`)

### Hard Rules
- Never place Glide API logic in the browser — always proxy through a Scripted REST API.
- Never hardcode credentials, tokens, or secrets anywhere.
- Never silently swallow errors — always handle and surface them appropriately.
- **Only the following NPM packages may be used:** those provided by ServiceNow (`@servicenow/*`) and React (`react`, `react-dom`). No other third-party NPM packages under any circumstance. Build from scratch using only these packages and native browser/TypeScript APIs.

---

## 6. File Structure

```
/ (repository root = ServiceNow app)
├── now.config.json                     # SDK app config (scope, scopeId, name)
├── now.prebuild.mjs                    # Prebuild hook
├── package.json                        # SDK dependencies
├── .eslintrc                           # ESLint config
├── docs/
│   ├── specs/                          # Spec documents
│   └── phases/                         # Phase documents
└── src/
    ├── client/
    │   ├── component-explorer/         # UI Page — living documentation (Phase 9)
    │   └── npm-package/                # React component library
    │       ├── components/
    │       │   ├── atoms/
    │       │   │   ├── _internal/      # Internal building blocks — not exported publicly
    │       │   │   │   ├── FieldWrapper.tsx
    │       │   │   │   ├── ReferenceInput.tsx
    │       │   │   │   ├── dateHelpers.ts
    │       │   │   │   └── resolveFieldKind.ts
    │       │   │   ├── Badge.tsx
    │       │   │   ├── Button.tsx
    │       │   │   ├── Checkbox.tsx
    │       │   │   ├── Dropdown.tsx
    │       │   │   ├── Field.tsx       # Unified field component
    │       │   │   ├── Icon.tsx
    │       │   │   ├── Input.tsx
    │       │   │   ├── Label.tsx
    │       │   │   ├── Popover.tsx
    │       │   │   ├── Spinner.tsx
    │       │   │   ├── Text.tsx
    │       │   │   └── Tooltip.tsx
    │       │   ├── molecules/
    │       │   │   └── SearchBar.tsx
    │       │   └── organisms/
    │       │       └── Form.tsx
    │       ├── services/
    │       │   ├── CacheService.ts
    │       │   ├── ServiceNowClient.ts
    │       │   ├── RhinoService.ts
    │       │   ├── RecordService.ts
    │       │   └── SearchService.ts
    │       ├── context/
    │       │   ├── ThemeContext.tsx
    │       │   └── ServiceNowContext.tsx
    │       ├── theme/
    │       │   └── theme.ts
    │       ├── types/
    │       │   └── index.ts
    │       └── index.ts                # Main entry point — all public exports
    ├── server/
    │   ├── tsconfig.json
    │   └── api/
    │       └── getRecordMetadata.ts    # Scripted REST API handler
    └── fluent/
        └── api/
            └── rhino.now.ts            # Fluent REST API definition
```

### Key Files
| File | Purpose |
|------|---------|
| `now.config.json` | SDK app config — scope, scopeId, name |
| `src/client/npm-package/index.ts` | Main entry point — all public exports |
| `src/client/npm-package/theme/theme.ts` | Global styling variables |
| `src/client/npm-package/components/atoms/Field.tsx` | Unified field component |
| `src/client/npm-package/components/atoms/_internal/resolveFieldKind.ts` | Field type resolution logic |
| `src/client/npm-package/components/organisms/Form.tsx` | Form organism |
| `src/client/npm-package/services/CacheService.ts` | Shared in-memory cache |
| `src/client/npm-package/services/ServiceNowClient.ts` | Base HTTP layer |
| `src/client/npm-package/services/RhinoService.ts` | Field metadata fetching and caching |
| `src/server/api/getRecordMetadata.ts` | Server-side metadata handler |
| `src/fluent/api/rhino.now.ts` | Fluent REST API definition for metadata endpoint |

---

## 7. Current Status

### ✅ Completed
- Phases 1–7 — scaffolding, theme/types, service layer, primitive components, input primitives, feedback components, Field component, SearchBar

### 📋 Up Next
- Phase 8: Form Organism

---

## 8. Known Issues & Constraints

### Constraints
- No direct browser access to Glide APIs — all server-side ServiceNow logic must be proxied via Scripted REST APIs.
- Components must function within the constraints of the ServiceNow SDK IDE environment.

### Known Gaps
- `ServiceNowProvider` is not yet wrapping the Component Explorer root (`ComponentExplorer.tsx`). This must be added before or during Phase 8, as the Form reads `language` from `useServiceNow()`.
- `resolveFieldKind` logic currently lives inline inside `Field.tsx`. It should be extracted to `_internal/resolveFieldKind.ts` for clarity.

---

## 9. Agent Instructions

### Behaviour
- **Approach:** Think through the full component design (props interface, data flow, styling, API needs) before writing any code. State your plan first.
- **Scope:** Only create or modify files relevant to the current task. Do not refactor unrelated components or files unless explicitly asked.
- **Communication:** At the end of each response, summarize what was done, what decisions were made and why, and what the suggested next step is.

### Dos ✅
- Reference the theme file for all default styling via `useTheme()` — never hardcode style values.
- Always define a full TypeScript props interface for every component.
- Route any ServiceNow server-side logic through the designated Scripted REST API.
- Show display values in the UI; retain actual values internally.
- Ask for clarification if a task is ambiguous before proceeding.

### Don'ts ❌
- Do not install or use any NPM package other than `@servicenow/*` and `react`/`react-dom`. No exceptions.
- Do not place Glide API logic or ServiceNow server-side code in browser-executed files.
- Do not hardcode colors, fonts, sizes, or other style values — always use theme variables via `useTheme()`.
- Do not expose or log tokens, passwords, or secrets anywhere.
- Do not install new dependencies without asking first.
- Do not delete or overwrite files unless explicitly instructed.
- Do not assume business logic or ServiceNow schema — always ask.

### When Stuck
If you are unsure how to proceed, stop and explain: what you understand about the task, what you are uncertain about, and what options you see. Do not guess. Do not write speculative code.

---

*Document last updated: March 2026 — maintained by EsTech Development*
