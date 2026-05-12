---
phase: 01-foundation-extraction
plan: '02'
subsystem: ui
tags: [react, typescript, extraction, hero, components]

# Dependency graph
requires:
    - phase: 01-foundation-extraction/01-01
      provides: 'src/types/sections.ts with HeroSettings, SectionRenderProps, SectionSettingsProps interfaces'
provides:
    - 'src/components/sections/render/hero-render.tsx — HeroRender component'
    - 'src/components/sections/settings/hero-settings.tsx — HeroSettings component'
affects:
    - '01-foundation-extraction/01-03 — registry wires HeroRender and HeroSettings'
    - '01-foundation-extraction/01-04 — preview-client.tsx replaces PreviewHero with HeroRender'
    - '01-foundation-extraction/01-05 — page.tsx replaces hero settings block with HeroSettings'

# Tech tracking
tech-stack:
    added: []
    patterns:
        - 'Extraction-first pattern: create extracted component files before wiring, so registry plan (03) is trivially type-correct'
        - 'Nested settings update pattern: onUpdate({ settings: { ...section.settings, hero: { ...hero, FIELD: value } } })'
        - 'updateHero() helper: wraps nested spread in a single call, used throughout HeroSettings'
        - 'BackgroundSettingsPanel inlined: background controls inlined directly rather than importing from page.tsx'

key-files:
    created:
        - src/components/sections/render/hero-render.tsx
        - src/components/sections/settings/hero-settings.tsx
    modified: []

key-decisions:
    - 'HeroRender uses serverData.players ?? 0 — zero mockData references; player count sourced from prop'
    - 'HeroSettings imports HeroSettings type as HeroSettingsType alias to avoid name clash with the component'
    - 'BackgroundSettingsPanel inlined directly (stays in page.tsx; extracting it is out of Phase 1 scope)'
    - 'Both files use single-quote import paths matching project convention'
    - 'Worktree started behind master; merged master (wave 1 commits) before writing files'

patterns-established:
    - "Render components: 'use client', named export, SectionRenderProps from @/types/sections, isLightColor from @/components/preview/types"
    - "Settings components: 'use client', named export, SectionSettingsProps + settings type alias from @/types/sections, updateX() helper for nested updates"

requirements-completed: []

# Metrics
duration: 15min
completed: 2026-05-07
---

# Phase 01 Plan 02: Hero Component Extraction Summary

**HeroRender (160 lines) and HeroSettings (297 lines) extracted as standalone typed components using serverData.players and nested update pattern**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-05-07T00:00:00Z
- **Completed:** 2026-05-07
- **Tasks:** 2
- **Files created:** 2

## Accomplishments

- Extracted `HeroRender` from `preview-client.tsx` `PreviewHero` — identical JSX, player count replaced from `mockData.players` to `serverData.players ?? 0`
- Extracted `HeroSettings` from `page.tsx` SettingsPanel hero block — all 14 hero fields exposed as form controls with `updateHero()` nested-spread helper
- Inlined `BackgroundSettingsPanel` controls (backgroundType, backgroundColor, gradientFrom, gradientTo, backgroundImage, imageBlur, imageDarken = 7 controls) directly into `HeroSettings`
- Zero modifications to existing files — both new files are additions only

## Task Commits

Each task was committed atomically:

1. **Task 1: Create hero-render.tsx** - `bf6e470` (feat)
2. **Task 2: Create hero-settings.tsx** - `5628ffd` (feat)

## Files Created/Modified

- `src/components/sections/render/hero-render.tsx` (160 lines) — HeroRender component, extracted from preview-client.tsx PreviewHero; uses serverData.players ?? 0; four PlayerBadge styles preserved
- `src/components/sections/settings/hero-settings.tsx` (297 lines) — HeroSettings component, extracted from page.tsx hero settings block; all 14 hero fields; background controls inlined

## Decisions Made

- Used `HeroSettings as HeroSettingsType` alias import to avoid name clash between the type and the component function of the same name
- Inlined `BackgroundSettingsPanel` JSX rather than importing — importing from `page.tsx` is not feasible and extracting `BackgroundSettingsPanel` is out of Phase 1 scope
- Updated all background `text-[11px]` labels to use `settings-label` CSS class for consistency with page.tsx settings panel convention

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Merged master branch into worktree to get wave 1 files**

- **Found during:** Task 1 setup
- **Issue:** Worktree branch was at pre-wave-1 state; `src/types/sections.ts` did not exist in the worktree, causing `Cannot find module '@/types/sections'` tsc error
- **Fix:** Ran `git merge master --no-edit` — fast-forward merge bringing in wave 1 commits (sections.ts, site-theme.ts, plan.ts)
- **Files modified:** .planning/, src/types/sections.ts, src/types/site-theme.ts, src/lib/plan.ts (from merge)
- **Verification:** tsc error for @/types/sections resolved; no merge conflicts
- **Committed in:** Fast-forward merge (no merge commit created)

---

**Total deviations:** 1 auto-fixed (1 blocking/setup)
**Impact on plan:** The merge was required infrastructure; no scope creep.

## Inlined Background Controls Confirmation

The `BackgroundSettingsPanel` from `page.tsx` has been inlined into `hero-settings.tsx` as 7 field controls:

1. `backgroundType` — segmented selector (solid/gradient/image)
2. `backgroundColor` — color picker + hex input (solid mode)
3. `gradientFrom` — color picker + hex input (gradient mode)
4. `gradientTo` — color picker + hex input (gradient mode)
5. `backgroundImage` — URL text input (image mode)
6. `imageBlur` — range slider 0-20 (image mode)
7. `imageDarken` — range slider 0-100 (image mode)

## mockData.players Replacement Confirmation

`mockData.players` replaced with `serverData.players ?? 0` — 4 occurrences in the original `PreviewHero` (minimal, card, glow badge styles + default pill), all replaced with the single `players` constant derived from `serverData.players ?? 0`.

## TypeScript Status

Pre-existing errors (Prisma client, implicit any) remain unchanged. No new errors introduced by either new file.

## Issues Encountered

None beyond the blocked issue noted in Deviations.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `HeroRender` and `HeroSettings` ready to be imported by the registry in plan 03
- Both components are not yet wired in — existing UI still renders exactly as before
- Plan 03 (registry) can safely import from `render/hero-render` and `settings/hero-settings` without circular imports

---

_Phase: 01-foundation-extraction_
_Completed: 2026-05-07_
