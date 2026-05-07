---
phase: 01-foundation-extraction
plan: "03"
subsystem: section-registry
tags:
  - registry
  - typescript
  - foundation
dependency_graph:
  requires:
    - 01-01  # src/types/sections.ts (SectionType, SectionRenderProps, SectionSettingsProps, SectionSettings)
    - 01-02  # src/components/sections/render/hero-render.tsx, src/components/sections/settings/hero-settings.tsx
  provides:
    - src/lib/section-registry.tsx
    - src/components/sections/index.ts (updated barrel)
  affects:
    - 01-04  # page.tsx wire-up will import SECTION_REGISTRY['hero']
    - 01-05  # preview-client.tsx wire-up will import SECTION_REGISTRY['hero']
tech_stack:
  added: []
  patterns:
    - "Record<SectionType, RegistryEntry> exhaustiveness enforcement"
    - "PlaceholderRender/PlaceholderSettings stubs for unextracted section types"
key_files:
  created:
    - src/lib/section-registry.tsx
  modified:
    - src/components/sections/index.ts
decisions:
  - "Used 'use client' directive on section-registry.tsx because it imports client components (HeroRender, HeroSettings) and stores JSX in icon fields"
  - "PlaceholderSettings uses eslint-disable-next-line to suppress no-unused-vars warning — the props parameter is required for type compatibility with ComponentType<SectionSettingsProps> but is unused at runtime"
  - "Import paths use double quotes to match existing codebase convention"
metrics:
  duration: "~3 minutes"
  completed: "2026-05-07"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 1 Plan 03: Section Registry Summary

**One-liner:** Typed SECTION_REGISTRY with 14 SectionType entries — Hero uses real components, 13 stubs ensure compile-time exhaustiveness via Record<SectionType, RegistryEntry>.

## Files Produced

| File | Action | Lines |
|------|--------|-------|
| `src/lib/section-registry.tsx` | Created | 211 |
| `src/components/sections/index.ts` | Modified | 3 |

## RegistryEntry Interface (verbatim from file)

```typescript
export interface RegistryEntry {
  type: SectionType;
  render: ComponentType<SectionRenderProps>;
  settings: ComponentType<SectionSettingsProps>;
  defaultSettings: () => SectionSettings;
  displayName: string;
  icon: ReactNode;
  maxCount?: number;
}
```

Exactly 7 fields. Six required, one optional (`maxCount`). Matches D-01 verbatim.

## All 14 Registry Keys

1. `hero` — uses real `HeroRender` + `HeroSettings` (extracted in plan 02)
2. `stats` — PlaceholderRender / PlaceholderSettings; `maxCount: 1`
3. `features` — PlaceholderRender / PlaceholderSettings
4. `gamemodes` — PlaceholderRender / PlaceholderSettings
5. `discord` — PlaceholderRender / PlaceholderSettings
6. `gallery` — PlaceholderRender / PlaceholderSettings
7. `staff` — PlaceholderRender / PlaceholderSettings
8. `text` — PlaceholderRender / PlaceholderSettings
9. `rules` — PlaceholderRender / PlaceholderSettings
10. `voting` — PlaceholderRender / PlaceholderSettings
11. `store` — PlaceholderRender / PlaceholderSettings
12. `reviews` — PlaceholderRender / PlaceholderSettings
13. `faq` — PlaceholderRender / PlaceholderSettings
14. `video` — PlaceholderRender / PlaceholderSettings

## maxCount Confirmation

`maxCount: 1` is set on `stats` ONLY. No other entry sets this field. Verified:
```
grep -c "maxCount: 1" src/lib/section-registry.tsx
1
```

## No Circular Import Confirmation

Hero component files contain zero references to `section-registry`:
```
grep -c "section-registry" src/components/sections/render/hero-render.tsx
0
grep -c "section-registry" src/components/sections/settings/hero-settings.tsx
0
```

Import chain is strictly one-directional:
```
src/types/sections.ts          ← no internal imports
src/components/preview/types.ts ← no internal imports
hero-render.tsx                 ← imports from types/sections + preview/types
hero-settings.tsx               ← imports from types/sections + preview/types
section-registry.tsx            ← imports hero-render, hero-settings, types/sections
```

## TypeScript Result

`npx tsc --noEmit` output — no new errors introduced by plan 03:

Pre-existing errors (all pre-date this plan):
- `prisma/seed.ts` — PrismaClient not generated in dev environment
- `src/app/[subdomain]/page.tsx` — implicit any parameter
- `src/app/[subdomain]/preview-client.tsx` — ReactNode type error (pre-existing)
- `src/app/api/servers/[serverId]/route.ts` — Prisma import + implicit any
- `src/lib/db.ts` — PrismaClient not generated

Zero new TypeScript errors from plan 03.

## Lint Result

`npm run lint` after plan 03: 122 problems (52 errors, 70 warnings)
Baseline before plan 03: 123 problems (52 errors, 71 warnings)

Plan 03 reduced the warning count by 1 (the `_props` eslint-disable suppresses correctly). No new errors.

## Commits

| Hash | Description |
|------|-------------|
| `db1ca90` | feat(01-03): create SECTION_REGISTRY with all 14 SectionType entries |
| `9ed39bb` | feat(01-03): update sections barrel to export HeroRender and HeroSettings |
| `5cd2870` | fix(01-03): suppress no-unused-vars lint warning on PlaceholderSettings |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Lint warning on PlaceholderSettings unused props parameter**
- **Found during:** Task 1 post-commit verification
- **Issue:** `PlaceholderSettings(_props: SectionSettingsProps)` produced a lint warning because ESLint's `no-unused-vars` rule fires on `_props` — the project's ESLint config does not configure `argsIgnorePattern: '^_'`. The parameter cannot be removed because `ComponentType<SectionSettingsProps>` requires the correct function signature.
- **Fix:** Added `// eslint-disable-next-line @typescript-eslint/no-unused-vars` comment before the function declaration. This is the minimal correct fix that preserves type safety and eliminates the warning.
- **Files modified:** `src/lib/section-registry.tsx` (line 69)
- **Commit:** `5cd2870`

All other plan actions executed exactly as written.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| `src/lib/section-registry.tsx` exists | FOUND |
| `src/components/sections/index.ts` exists | FOUND |
| `01-03-SUMMARY.md` exists | FOUND |
| Commit `db1ca90` exists | FOUND |
| Commit `9ed39bb` exists | FOUND |
| Commit `5cd2870` exists | FOUND |
