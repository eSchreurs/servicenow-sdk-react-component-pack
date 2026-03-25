# Review Checklists — Per Phase

Use these checklists alongside the reviewer system prompt. Paste the relevant phase checklist into the review session along with the code to review.

---

## Phase 1 — Scaffolding

- [ ] Repository root contains valid SDK config files: `now.config.json`, `now.prebuild.mjs`, `package.json`, `.eslintrc`
- [ ] `now.config.json` scope is `x_326171_ssdk_pack`
- [ ] SDK config files are unchanged from the original boilerplate — not recreated or modified
- [ ] Hello User boilerplate code has been removed from `src/`
- [ ] `src/client/npm-package/` exists with correct subfolders: `components/atoms/`, `components/atoms/_internal/`, `components/molecules/`, `components/organisms/`, `services/`, `context/`, `theme/`, `types/`
- [ ] `src/client/component-explorer/` exists with placeholder `index.html`
- [ ] `src/server/api/` exists and is empty
- [ ] `src/fluent/` exists and is empty
- [ ] All service placeholder files exist: `CacheService.ts`, `ServiceNowClient.ts`, `RhinoService.ts`, `RecordService.ts`, `SearchService.ts`
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
- [ ] `FieldData` interface present with: `name`, `label`, `mandatory`, `readOnly`, `maxLength`, `type`, `isChoiceField`, `choices`, optional `reference`, `referenceQual`, `dependentOnField`
- [ ] `FieldData` does NOT contain `value`, `displayValue`, `useReferenceQualifier`, or `dynamicRefQual`
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
- [ ] `RhinoService` exports `getRecordMetadata(table, fields, language?)` — no `resolveQualifier`, no `searchWithQualifier`
- [ ] `RhinoService.getRecordMetadata` does not accept or use `sysId`
- [ ] `RhinoService` cache key includes table, language, and sorted fields — no sysId in key
- [ ] `RhinoService` uses `CacheService.cached()` — no local Map
- [ ] `RhinoService` returns empty object on error — never throws
- [ ] `RecordService` never caches
- [ ] `RecordService` always uses `sysparm_display_value=all`
- [ ] `SearchService` never caches
- [ ] `SearchService` constructs OR-combined CONTAINS query, ANDs filter onto search conditions
- [ ] Companion app metadata endpoint (`getRecordMetadata.ts`) accepts `table`, `fields`, `language` — no `sysId`
- [ ] Companion app handler uses `GlideTableHierarchy` for hierarchy resolution
- [ ] Companion app handler queries `sys_dictionary_override` and applies overrides correctly
- [ ] Companion app handler pre-resolves `referenceQual` per qualifier type
- [ ] Companion app handler returns safe defaults for fields not found in sys_dictionary
- [ ] No service calls `fetch` directly — all via `ServiceNowClient`
- [ ] No service contains React, JSX, or hooks

---

## Phase 4 — Primitive Components (Foundation)

- [ ] All 5 components exist: `FieldWrapper` (in `_internal/`), `Text`, `Label`, `Icon`, `Spinner`
- [ ] All use `useTheme()` for styling — no hardcoded values
- [ ] All accept `style` and `className` override props
- [ ] `FieldWrapper` renders `<label>` with `htmlFor`, mandatory `*`, and error outline
- [ ] `FieldWrapper` error outline driven by `hasError` prop
- [ ] `Icon` implements all required icons as inline SVG — no external library
- [ ] `Spinner` uses CSS animation — no external library
- [ ] No component calls any service

---

## Phase 5 — Input Primitives

- [ ] All 3 input primitives exist: `Input`, `Checkbox`, `Dropdown`
- [ ] All use `useTheme()` for styling
- [ ] `Input` and `Dropdown` render as plain text (not a disabled input) when `readOnly` is true
- [ ] `Checkbox` renders as disabled non-interactive checkbox when `readOnly` is true
- [ ] Empty read-only value renders as empty — no dash or placeholder
- [ ] No input primitive calls any service

---

## Phase 6 — Feedback & Action Components

- [ ] All 4 components exist: `Button`, `Badge`, `Tooltip`, `Popover`
- [ ] `Button` loading state uses `Spinner`
- [ ] `Button` never uses HTML `<form>` element
- [ ] `Popover` renders via `ReactDOM.createPortal`
- [ ] `Popover` bottom-left corner anchored to anchor element
- [ ] `Popover` flips downward when insufficient space above
- [ ] `Popover` closes on outside click and Escape key
- [ ] No external libraries used

---

## Phase 7 — Field Component & SearchBar

- [ ] `Field.tsx` exists in `components/atoms/`
- [ ] `SearchBar.tsx` exists in `components/molecules/`
- [ ] `_internal/FieldWrapper.tsx` exists and is used by `Field`
- [ ] `_internal/ReferenceInput.tsx` exists and is used by `Field` for reference types
- [ ] `_internal/dateHelpers.ts` exists and is used by `Field` for date/time types
- [ ] `Field` uses `useTheme()` for all styling — no hardcoded values
- [ ] `Field` accepts `style` and `className` override props
- [ ] Type resolution: `isChoiceField` takes priority over `type`; all type cases handled; unknown types fall back to text input
- [ ] `Field` does NOT call any service directly — reference orchestration handled by the internal `ReferenceField` sub-component inside `Field.tsx`
- [ ] Date/time `Field`: converts ServiceNow format to browser input format on display, and back on change
- [ ] Date/time `Field` read-only shows human-readable format (`DD/MM/YYYY HH:mm` etc.)
- [ ] Choice `Field`: filters dependent choices using stored value — never display value
- [ ] Choice `Field` blank option rule: always shown unless `mandatory` is true AND `value` is non-empty
- [ ] Reference `Field`: `referenceQual` passed directly as-is to `SearchService` for all qualifier types
- [ ] Reference `Field`: developer-supplied `filter` ANDed with `referenceQual` when both present
- [ ] Reference `Field`: selected value NOT auto-cleared when `filter` changes
- [ ] Reference `Field`: info popover uses `RecordService.getRecord()` for values
- [ ] Reference `Field`: info popover uses `RhinoService.getRecordMetadata()` for labels when `previewFields` specified
- [ ] Reference `Field`: search debounced at 300ms, in-flight requests aborted on new search
- [ ] `SearchBar` debounces `onChange`, shows search icon and clear icon
- [ ] Nothing in `_internal/` is exported from `index.ts`
- [ ] No component in this phase calls `ServiceNowClient` directly

---

## Phase 8 — Form Organism

- [ ] `Form.tsx` exists in `src/client/components/organisms/`
- [ ] `ServiceNowProvider` wraps the Component Explorer root in `ComponentExplorer.tsx`
- [ ] `resolveFieldKind` extracted to `_internal/resolveFieldKind.ts` (or confirmed still inline — acceptable if deliberate)
- [ ] `Form` uses `useReducer` — not `useState` for form state
- [ ] All state transitions expressed as dispatched actions — no direct setState anywhere
- [ ] `FormState` shape includes: `status`, `metadata`, `formRecord`, `validationErrors`, `saveError`, `loadError`
- [ ] `LOAD_SUCCESS` action carries both `metadata` and `record` and merges them atomically in the reducer
- [ ] `language` read from `useServiceNow()` and passed to `RhinoService.getRecordMetadata()`
- [ ] Data loading: `RhinoService.getRecordMetadata()` called once per unique table
- [ ] Data loading: `RecordService.getRecord()` called once per unique `table+sysId`
- [ ] Both fetch groups parallelised with `Promise.all`
- [ ] `defaultValue` applied for new records (`sysId = ''`) only when field has no loaded value
- [ ] Every declared field present in `formRecord` after load, even fields with no loaded value
- [ ] Form renders `<Field />` for each declared visible field — not individual typed components
- [ ] Override rules correct: `effectiveState = databaseValue OR developerOverride`; form-level `readOnly` overrides all
- [ ] `dependentValue` resolved from `formRecord` and passed to dependent choice fields
- [ ] Dependent choice fields auto-cleared in reducer when parent value changes and current selection is no longer valid
- [ ] `onFieldChange` fires AFTER state update and AFTER dependent clearing
- [ ] Validation fires only on save attempt — never on field change
- [ ] Validation excludes invisible fields and read-only fields
- [ ] `hasError` derived at render time from `state.validationErrors` — not stored per field in state
- [ ] Validation summary shown above action buttons when `validationErrors` is non-empty
- [ ] Save payload contains only declared, visible fields — stored values only, never display values
- [ ] Invisible fields excluded from save payload
- [ ] Save groups fields by `table + sysId`
- [ ] Empty `sysId` → `createRecord`, non-empty → `updateRecord`
- [ ] Save calls parallelised with `Promise.all`
- [ ] Partial save failures reported clearly — which records succeeded and which failed
- [ ] Single `Spinner` shown while loading — no partial field rendering
- [ ] Full-form error state shown on load failure — no fields rendered
- [ ] Save error shown above action buttons
- [ ] Form page added to Component Explorer under Organisms
- [ ] `MetadataService` is NOT referenced anywhere — `RhinoService.getRecordMetadata()` only
- [ ] Compiles without errors

---

## Phase 9 — Component Explorer

- [ ] Explorer renders as a ServiceNow UI Page in the companion app
- [ ] All built components have a page with live preview, props table, and code snippet
- [ ] `PropTable` and `CodeSnippet` components exist in `components/`
- [ ] Navigation managed with `useState` — no router library
- [ ] Explorer root wrapped in both `ThemeProvider` and `ServiceNowProvider`
- [ ] Explorer built using the component library itself
- [ ] No external syntax highlighting library
- [ ] Accessible at `x_326171_ssdk_pack_component_explorer.do`
