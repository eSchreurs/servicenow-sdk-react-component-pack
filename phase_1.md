# Phase 1 — Project Scaffolding

## Goal
Set up the complete monorepo folder structure, config files, and boilerplate so that all subsequent phases have a clean, correct foundation to build on. No business logic is implemented in this phase.

## Reference Documents
- Project Startup Document (`docs/specs/project-startup.md`)

---

## What to Build

### Monorepo root
- `package.json` — workspaces config pointing to `servicenow-app` and `npm-package`
- `README.md` — brief description of the project and two-step setup instructions

### `/servicenow-app`
Set up as a valid ServiceNow SDK application:
- `now.config.json` — scope: `x_est_react_pack`, name: `ServiceNow React Component Pack`
- `now.prebuild.mjs` — standard SDK prebuild script (copy from boilerplate)
- `package.json` — SDK dependencies (`@servicenow/sdk`, `@servicenow/glide`, `@servicenow/isomorphic-rollup`, `react`, `react-dom`, TypeScript, ESLint)
- `.eslintrc` — SDK ESLint config
- `src/client/` — empty, ready for Component Explorer
- `src/server/tsconfig.json` — server-side TypeScript config
- `src/server/` — empty, ready for Scripted REST APIs
- `src/fluent/` — empty

### `/npm-package`
Set up as a valid ServiceNow SDK application that will also serve as the component library:
- `now.config.json`
- `now.prebuild.mjs`
- `package.json`
- `.eslintrc`
- `src/client/components/atoms/` — empty
- `src/client/components/molecules/` — empty
- `src/client/components/organisms/` — empty
- `src/client/services/` — empty, with placeholder files for each service (no implementation yet):
  - `CacheService.ts`
  - `ServiceNowClient.ts`
  - `MetadataService.ts`
  - `RecordService.ts`
  - `SearchService.ts`
  - `RhinoService.ts`
- `src/client/context/` — empty, with placeholder files:
  - `ThemeContext.tsx`
  - `ServiceNowContext.tsx`
- `src/client/theme/theme.ts` — empty placeholder
- `src/client/types/index.ts` — empty placeholder
- `src/client/index.ts` — main entry point, empty for now
- `src/server/tsconfig.json`
- `src/server/` — empty

---

## What NOT to Do
- Do not implement any logic, types, or exports yet — placeholders only
- Do not create any component files yet
- Do not modify any SDK config files beyond what is specified above

---

## Done When
- Both `servicenow-app` and `npm-package` build without errors (`now-sdk build`)
- All folders and placeholder files exist in the correct locations
- No business logic anywhere — only structure and config
