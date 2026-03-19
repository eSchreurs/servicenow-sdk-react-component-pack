# Phase 1 — Project Scaffolding

## Goal
Set up the complete folder structure, config files, and boilerplate so that all subsequent phases have a clean, correct foundation to build on. No business logic is implemented in this phase.

## Important — Repository Structure
The repository root IS the ServiceNow app. The ServiceNow IDE clones the repo and builds from the root. There is no monorepo split — everything lives in one SDK app.

The component library (`npm-package`) content lives inside `src/client/npm-package/` within the ServiceNow app. This is client-side code that runs on the instance.

## Reference Documents
- Project Startup Document (`docs/specs/project-startup.md`)

---

## Starting Point
The repository already contains a Hello User boilerplate — a working SDK app with `now.config.json`, `now.prebuild.mjs`, `package.json`, `.eslintrc`, and a basic `src/` structure. 

**Do not delete or replace the SDK config files** (`now.config.json`, `now.prebuild.mjs`, `package.json`, `.eslintrc`). These are correct and must be preserved. Only add to and reorganise the `src/` folder.

---

## Target Structure

```
/ (repository root = ServiceNow app)
├── CLAUDE.md
├── now.config.json              ← preserve existing
├── now.prebuild.mjs             ← preserve existing
├── package.json                 ← preserve existing
├── .eslintrc                    ← preserve existing
├── docs/
│   ├── specs/                   ← spec documents
│   └── phases/                  ← phase documents
└── src/
    ├── client/
    │   ├── component-explorer/  ← Phase 9: UI Page for documentation
    │   │   └── index.html       ← placeholder only
    │   └── npm-package/         ← the React component library
    │       ├── components/
    │       │   ├── atoms/       ← empty
    │       │   ├── molecules/   ← empty
    │       │   └── organisms/   ← empty
    │       ├── services/        ← placeholder files only
    │       │   ├── CacheService.ts
    │       │   ├── ServiceNowClient.ts
    │       │   ├── MetadataService.ts
    │       │   ├── RecordService.ts
    │       │   ├── SearchService.ts
    │       │   └── RhinoService.ts
    │       ├── context/         ← placeholder files only
    │       │   ├── ThemeContext.tsx
    │       │   └── ServiceNowContext.tsx
    │       ├── theme/
    │       │   └── theme.ts     ← placeholder only
    │       ├── types/
    │       │   └── index.ts     ← placeholder only
    │       └── index.ts         ← main entry point, empty for now
    ├── server/
    │   ├── tsconfig.json        ← preserve existing if present
    │   └── api/                 ← empty, ready for Scripted REST APIs
    └── fluent/                  ← empty
```

---

## What to Do

### 1. Preserve existing SDK config
Do not touch `now.config.json`, `now.prebuild.mjs`, `package.json`, `.eslintrc`. These are correct.

### 2. Clean up existing Hello User code
Remove any existing Hello User application code from `src/` — components, pages, or logic from the boilerplate. Keep the folder structure the SDK expects but remove the boilerplate content.

### 3. Create the new folder structure
Create all folders and placeholder files as shown in the target structure above.

### 4. Placeholder files
All service and context files should be valid empty TypeScript/TSX files — just an empty export or a single comment. No implementation yet.

```typescript
// CacheService.ts — placeholder
export {}
```

### 5. Update `src/client` entry point
The existing boilerplate likely has an `index.html` and `main.tsx` at the client root. Keep these but simplify to a minimal "Component Pack" placeholder page that confirms the app loads. This will be replaced in Phase 9 by the Component Explorer.

---

## What NOT to Do
- Do not implement any logic, types, or exports yet — placeholders only
- Do not create any component files yet
- Do not modify any SDK config files
- Do not install any new npm packages

---

## Done When
- The app builds successfully with `now-sdk build`
- All folders and placeholder files exist in the correct locations
- Existing SDK config files are untouched
- No business logic anywhere — only structure and placeholders
- The app deploys to the instance without errors
