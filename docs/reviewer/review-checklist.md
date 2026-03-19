# Review Checklists — Per Phase

Use these checklists alongside the reviewer system prompt. Paste the relevant phase checklist into the review session along with the code to review.

---

## Phase 1 — Scaffolding

- [ ] Repository root contains valid SDK config files: `now.config.json`, `now.prebuild.mjs`, `package.json`, `.eslintrc`
- [ ] `now.config.json` scope is `x_est_react_pack`
- [ ] SDK config files are unchanged from the original boilerplate — not recreated or modified
- [ ] Hello User boilerplate code has been removed from `src/`
- [ ] `src/client/npm-package/` exists with correct subfolders: `components/atoms/`, `components/molecules/`, `components/organisms/`, `services/`, `context/`, `theme/`, `types/`
- [ ] `src/client/component-explorer/` exists with placeholder `index.html`
- [ ] `src/server/api/` exists and is empty
- [ ] `src/fluent/` exists and is empty
- [ ] All service placeholder files exist: `CacheService.ts`, `ServiceNowClient.ts`, `MetadataService.ts`, `RecordService.ts`, `SearchService.ts`, `RhinoService.ts`
- [ ] All context placeholder files exist: `ThemeContext.tsx`, `ServiceNowContext.tsx`
- [ ] `theme/theme.ts` and `types/index.ts` exist as placeholders
- [ ] `npm-package/index.ts` exists as placeholder main entry point
- [ ] No business logic implemented anywhere — placeholders only
- [ ] No third-party packages added to `package.json`
- [ ] App builds successfully with `now-sdk build`
- [ ] There is no monorepo root `package.json` with workspaces config — single app only

---

## Phase 2 — Theme & Types

- [ ] `Theme` interface exported from `theme/theme.ts` with all required variables
- [ ] `defaultTheme` exported from `theme/theme.ts` with sensible values
- [ ] `ThemeContext.tsx` imports `Theme` and `defaultTheme` from `theme/theme.ts` — not defined locally
- [ ] `ThemeProvider` merges partial theme with `defaultTheme`
- [ ] `useTheme()` hook exported and functional
- [ ] `ServiceNowContext.tsx` has `ServiceNowConfig` with `language` defaulting to `'en'`
- [ ] `ServiceNowProvider` and `useServiceNow()` exported
- [ ] `types/index.ts` exports all raw API shapes and domain models
- [ ] `FieldMetadata` interface matches Service Layer Spec Section 2.2 exactly
- [ ] `ServiceNowError` extends `Error` with `status` and `detail`
- [ ] No style values hardcoded anywhere outside `theme.ts`

---

## Phase 3 — Services

- [ ] `CacheService` exports `has`, `get`, `set`, `del`, `invalidate`, `clear`, `cached`
- [ ] `cached<T>` does not cache failed fetches
- [ ] `ServiceNowClient` exports `TABLE_API_BASE` constant
- [ ] `ServiceNowClient` reads `window.g_ck` and attaches `X-UserToken` on POST/PATCH
- [ ] `ServiceNowClient` unwraps `result` from API responses
- [ ] `ServiceNowClient` throws `ServiceNowError` for HTTP and API errors
- [ ] `MetadataService` uses `CacheService.cached()` for all functions
- [ ] `getTableHierarchy` calls companion app endpoint — NOT `sys_db_object` Table API
- [ ] `getFieldMetadata` merges rows per-attribute (booleans OR, strings first-non-empty, numbers first-non-zero)
- [ ] `getFieldMetadata` resolves `referenceDisplayField` via secondary batch query
- [ ] `getChoices` uses whole-table replacement strategy
- [ ] `getChoices` accepts `language` parameter defaulting to `'en'`
- [ ] Cache keys sort both `tables` and `fields` arrays
- [ ] `RecordService` never caches
- [ ] `RecordService` always uses `sysparm_display_value=all`
- [ ] `SearchService` never caches
- [ ] `SearchService` always searches on term AND filter combined
- [ ] `RhinoService` defines `RHINO_ENDPOINT` as named constant
- [ ] `RhinoService.resolveQualifier` returns empty string on error — never throws
- [ ] Companion app hierarchy endpoint uses `GlideTableHierarchy`
- [ ] Companion app Rhino endpoint uses `GlideScopedEvaluator.evaluateScript()` — not `eval()`
- [ ] Both companion app endpoints require authentication
- [ ] No service calls `fetch` directly — all via `ServiceNowClient`
- [ ] No service contains React, JSX, or hooks

---

## Phase 4 — Foundation Atoms

- [ ] All 5 atoms exist: `FieldWrapper`, `Text`, `Label`, `Icon`, `Spinner`
- [ ] All use `useTheme()` for styling — no hardcoded values
- [ ] All accept `style` and `className` override props
- [ ] `FieldWrapper` renders `<label>` with `htmlFor`, mandatory `*`, and error border
- [ ] `FieldWrapper` error border driven by `hasError` prop
- [ ] `Icon` implements all required icons as inline SVG — no external library
- [ ] `Spinner` uses CSS animation — no external library
- [ ] No atom calls any service

---

## Phase 5 — Input Atoms

- [ ] All 5 input atoms exist: `TextInput`, `TextArea`, `Checkbox`, `SelectInput`, `ReferenceInput`
- [ ] All use `useTheme()` for styling
- [ ] All respect `readOnly` — renders as plain text, not disabled input (except `Checkbox`)
- [ ] All enforce `maxLength` where applicable
- [ ] Empty read-only value renders as empty — no dash or placeholder
- [ ] `ReferenceInput` does NOT call any service — passes events to parent via callbacks
- [ ] `ReferenceInput` dropdown flips upward when insufficient space below
- [ ] `ReferenceInput` info icon only shown when value is present (including read-only)
- [ ] `ReferenceInput` pen icon NOT shown in read-only state
- [ ] No input atom calls any service

---

## Phase 6 — Feedback & Action Atoms

- [ ] All 4 atoms exist: `Button`, `Badge`, `Tooltip`, `Popover`
- [ ] `Button` loading state uses `Spinner` atom
- [ ] `Button` never uses HTML `<form>` element
- [ ] `Popover` renders via `ReactDOM.createPortal`
- [ ] `Popover` bottom-left corner anchored to anchor element
- [ ] `Popover` flips downward when insufficient space above
- [ ] `Popover` closes on outside click
- [ ] No external libraries used

---

## Phase 7 — Molecules

- [ ] All 8 molecules exist: `StringField`, `TextAreaField`, `NumberField`, `CheckboxField`, `DateTimeField`, `ChoiceField`, `ReferenceField`, `SearchBar`
- [ ] All extend `BaseFieldProps` and use `FieldWrapper`
- [ ] `DateTimeField` converts formats correctly in both directions
- [ ] `DateTimeField` read-only shows human-readable format (DD/MM/YYYY HH:mm)
- [ ] `ChoiceField` filters dependent choices using stored value — never display value
- [ ] `ChoiceField` auto-clear of invalid dependent choices handled correctly
- [ ] `ChoiceField` blank option rule: always shown unless mandatory AND value non-empty
- [ ] `ReferenceField` calls `RhinoService.resolveQualifier()` only when `isDirty` and qualifier is dynamic/advanced
- [ ] `ReferenceField` calls `SearchService` with clean qualifier — never dirty
- [ ] `ReferenceField` info popover uses `RecordService.getRecord()` and `MetadataService.getFieldLabels()`
- [ ] `ReferenceField` does NOT auto-clear value when filter changes
- [ ] `ReferenceField` search debounced at 300ms
- [ ] `ReferenceField` aborts in-flight requests when new search triggers
- [ ] No molecule calls `ServiceNowClient` directly

---

## Phase 8 — Form Organism

- [ ] `Form` uses `useReducer` — not `useState` for form state
- [ ] All state transitions expressed as dispatched actions
- [ ] `language` read from `useServiceNow()` and passed to `getChoices()`
- [ ] Field type resolution follows correct priority order (choices first, then type switch)
- [ ] Override rules correct: `effectiveState = databaseValue OR developerOverride`
- [ ] Validation fires only on save attempt — never on field change
- [ ] `hasError` passed to failing fields, summary shown at form level
- [ ] Save payload contains only declared fields — never full record
- [ ] Invisible fields excluded from validation and save but tracked in state
- [ ] `isDirty` set on all `ReferenceField` instances on every field change
- [ ] `onFieldChange` fires AFTER form state is updated
- [ ] React key per field: `table.sysId.field`
- [ ] `columns` treated as static — no re-loading on prop change
- [ ] Partial save failures reported clearly
- [ ] Form renders single `Spinner` while loading — no partial field rendering

---

## Phase 9 — Component Explorer

- [ ] Explorer renders as a ServiceNow UI Page in the companion app
- [ ] All built components have a page with live preview, props table, and code snippet
- [ ] `PropTable` and `CodeSnippet` components exist in `components/`
- [ ] Navigation managed with `useState` — no router library
- [ ] Explorer is wrapped in `ThemeProvider` and `ServiceNowProvider`
- [ ] Explorer built using the component library itself (dogfooding)
- [ ] No external syntax highlighting library
- [ ] Accessible at `x_est_react_pack_component_explorer.do`
