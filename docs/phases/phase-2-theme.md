# Phase 2 — Theme File & Context Providers

## Goal
Implement the centralised theme file, `ThemeContext`, and `ServiceNowContext`. Every component in subsequent phases will depend on these — they must be correct and complete before any component is built.

## Reference Documents
- Project Startup Document (`docs/specs/project-startup.md`)
- Service Layer Spec (`docs/specs/service-layer-spec.md`) — Section 9 (Context Providers)

---

## What to Build

### 1. `src/client/theme/theme.ts`
Define the `Theme` interface and `defaultTheme` object. This is the single source of truth for all styling variables.

The `Theme` interface must include at minimum:
- **Colors:** `colorPrimary`, `colorSecondary`, `colorDanger`, `colorText`, `colorTextMuted`, `colorBackground`, `colorBackgroundMuted`, `colorBorder`, `colorBorderFocus`
- **Typography:** `fontFamily`, `fontSizeSmall`, `fontSizeBase`, `fontSizeLarge`, `fontWeightNormal`, `fontWeightMedium`, `fontWeightBold`, `lineHeightBase`
- **Spacing:** `spacingXs`, `spacingSm`, `spacingMd`, `spacingLg`, `spacingXl`
- **Borders:** `borderRadius`, `borderRadiusSm`, `borderRadiusLg`, `borderWidth`
- **Inputs:** `inputHeight`, `inputPaddingHorizontal`, `inputBackgroundColor`, `inputBackgroundColorDisabled`
- **Shadows:** `shadowSm`, `shadowMd`
- **Transitions:** `transitionSpeed`

`defaultTheme` must provide sensible, clean default values for all properties. Choose a professional, neutral palette suitable for enterprise use.

Export both `Theme` and `defaultTheme`.

### 2. `src/client/context/ThemeContext.tsx`
- Import `Theme` and `defaultTheme` from `../theme/theme`
- Create `ThemeContext` with `defaultTheme` as the default value
- Implement `ThemeProvider` component — accepts optional `Partial<Theme>`, deep merges with `defaultTheme`
- Implement `useTheme()` hook — returns the current theme from context
- Export: `ThemeProvider`, `useTheme`, `ThemeContext`

### 3. `src/client/context/ServiceNowContext.tsx`
- Define `ServiceNowConfig` interface: `{ language: string }`
- Default config: `{ language: 'en' }`
- Implement `ServiceNowProvider` — accepts optional `Partial<ServiceNowConfig>`
- Implement `useServiceNow()` hook
- Export: `ServiceNowProvider`, `useServiceNow`, `ServiceNowContext`

### 4. `src/client/types/index.ts`
Define all shared domain model types and API response shapes. These will be used throughout the entire codebase — get them right now.

**API Response Shapes (raw, never used by components):**
- `RawFieldValue` — `{ value: string; display_value: string }`
- `RawRecord` — `Record<string, RawFieldValue>`
- `TableApiSingleResponse` — `{ result: RawRecord }`
- `TableApiListResponse` — `{ result: RawRecord[] }`
- `TableApiErrorResponse` — `{ error: { message: string; detail: string }; status: 'failure' }`

**Domain Models (used by components and services):**
- `RecordFieldValue` — `{ value: string; displayValue: string }`
- `ServiceNowRecord` — `Record<string, RecordFieldValue>`
- `FieldMetadata` — full interface as defined in Service Layer Spec Section 2.2
- `ChoiceEntry` — `{ value: string; label: string; dependentValue?: string }`
- `ReferenceSearchResult` — `{ sysId: string; displayValue: string; columns: Array<{ field: string; value: string }> }`

**Error:**
- `ServiceNowError` — extends `Error`, adds `status: number` and `detail: string`

Export everything from this file.

---

## What NOT to Do
- Do not implement any services yet
- Do not implement any components yet
- Do not add theme variables that are not in the list above — keep it focused

---

## Done When
- `theme.ts` exports `Theme` interface and `defaultTheme` with all required variables
- `ThemeContext.tsx` exports `ThemeProvider`, `useTheme`, and `ThemeContext`
- `ServiceNowContext.tsx` exports `ServiceNowProvider`, `useServiceNow`, and `ServiceNowContext`
- `types/index.ts` exports all shared types
- Everything compiles without errors
