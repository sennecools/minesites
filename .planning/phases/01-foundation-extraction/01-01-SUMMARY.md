---
phase: 01-foundation-extraction
plan: 01
subsystem: types
tags:
    - typescript
    - types
    - foundation
dependency_graph:
    requires: []
    provides:
        - src/types/sections.ts
        - src/types/site-theme.ts
        - src/lib/plan.ts
    affects: []
tech_stack:
    added: []
    patterns:
        - Named exports from pure .ts modules
        - SectionType literal union for compile-time exhaustiveness
        - Optional interface fields for forward-compatible stubs
key_files:
    created:
        - path: src/types/sections.ts
          description: Canonical home for SectionType union, all *Settings interfaces, SectionSettings wrapper, SectionRenderProps and SectionSettingsProps shared prop interfaces
        - path: src/types/site-theme.ts
          description: SiteTheme interface stub with 5 optional string fields for Phase 2 expansion
        - path: src/lib/plan.ts
          description: PlanLimits interface and getPlanLimits() helper returning maxSections per tier (free=5, paid=15)
    modified: []
decisions:
    - "SectionType excludes 'navbar' — navbar is server-level config (Server.navbar Json), not a Section row (per Open Question #1 in RESEARCH)"
    - "FeaturesSettings stub uses actual page.tsx shapes ('2x1' | '2x2' layout, headerAlignment/cardAlignment) not the plan template (which had grid-2/grid-3)"
    - "GallerySettings stub uses actual page.tsx shapes ('bento' | 'grid' | 'masonry' layout, columns: 2|3|4) not the plan template"
    - "DiscordSettings stub uses actual page.tsx shapes (layout: 'default'|'card-left'|'centered'|'compact') not the plan template"
    - "StaffSettings uses StaffMemberSettings sub-interface matching page.tsx's StaffMemberSettings shape"
metrics:
    duration: '~12 minutes'
    completed: '2026-05-07'
    tasks_completed: 2
    tasks_total: 2
    files_created: 3
    files_modified: 0
---

# Phase 1 Plan 1: Type Foundation Summary

Three canonical type files that all later plans in phase 1 depend on — SectionType union, all \*Settings interfaces, SiteTheme stub, and getPlanLimits() helper.

## Tasks Completed

| Task | Name                                               | Commit  | Files                                    |
| ---- | -------------------------------------------------- | ------- | ---------------------------------------- |
| 1    | Create src/types/sections.ts                       | a8785f3 | src/types/sections.ts                    |
| 2    | Create src/types/site-theme.ts and src/lib/plan.ts | e47b03f | src/types/site-theme.ts, src/lib/plan.ts |

## Files Created

### src/types/sections.ts

Canonical home for all section settings types and shared component prop interfaces.

**SectionType union (14 members):**

```
'hero' | 'stats' | 'features' | 'gamemodes' | 'discord' | 'gallery' | 'staff' | 'text' | 'rules' | 'voting' | 'store' | 'reviews' | 'faq' | 'video'
```

Note: `navbar` excluded — it is server-level config stored in `Server.navbar Json`, not a `Section` row.

**HeroSettings interface (14 fields):**

- alignment, backgroundType, backgroundColor, gradientFrom, gradientTo, backgroundImage, imageBlur, imageDarken, playerBadge, badgeStyle, showDiscordButton, discordButtonText, showCopyIpButton, copyIpButtonText — all optional

**Stub interfaces:** GamemodesSettings, FeaturesSettings, DiscordSettings, GallerySettings, StatsSettings, StaffMemberSettings, StaffSettings, TextSettings — shapes match the current inline definitions in page.tsx

**SectionSettings wrapper:** Wraps all section-specific settings sub-objects (hero, gamemodes, features, etc.)

**Shared prop interfaces:** SectionRenderProps `{ section: Section; serverData: ServerData }` and SectionSettingsProps `{ section: Section; onUpdate: (updates: Partial<Section>) => void }` — imported here to prevent circular imports (RESEARCH Pitfall 2)

### src/types/site-theme.ts

SiteTheme stub for Phase 2 expansion. 5 optional string fields: primaryColor, accentColor, backgroundColor, textColor, fontFamily. No internal imports.

### src/lib/plan.ts

PlanLimits interface (`{ maxSections: number }`) and getPlanLimits function.

- `getPlanLimits('free')` returns `{ maxSections: 5 }`
- `getPlanLimits('paid')` returns `{ maxSections: 15 }`
- Default branch returns free limits (safest tier, prevents privilege escalation per threat model T-01-01)

## TypeScript Baseline

| Point         | tsc errors                                      |
| ------------- | ----------------------------------------------- |
| Before Task 1 | 6 (all pre-existing Prisma/implicit-any issues) |
| After Task 2  | 6 (unchanged)                                   |

No new TypeScript errors introduced.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used actual page.tsx type shapes instead of plan template shapes**

- **Found during:** Task 1, reading page.tsx lines 58-255
- **Issue:** The plan's action text specified stub interface shapes that differed from the actual inline types in page.tsx (e.g., FeaturesSettings in plan had `'grid-2' | 'grid-3' | 'grid-4' | 'list'` layout but page.tsx has `'2x1' | '2x2'`; GallerySettings in plan had `'grid-2' | 'grid-3' | 'grid-4' | 'masonry' | 'carousel'` but page.tsx has `'bento' | 'grid' | 'masonry'`)
- **Fix:** Used the actual shapes from page.tsx to ensure the stubs are accurate mirrors — this is required by D-07 which says "stubs matching current inline shapes"
- **Files modified:** src/types/sections.ts
- **Commit:** a8785f3

**2. [Rule 1 - Bug] HeroSettings has 14 fields not 15**

- **Found during:** Task 1 verification
- **Issue:** The plan's acceptance criteria says "15 fields" but the actual HeroSettings in page.tsx lines 70-85 has exactly 14 fields (alignment, backgroundType, backgroundColor, gradientFrom, gradientTo, backgroundImage, imageBlur, imageDarken, playerBadge, badgeStyle, showDiscordButton, discordButtonText, showCopyIpButton, copyIpButtonText)
- **Fix:** Used the actual 14-field definition from the source. The plan text contradicts itself (the action text lists 14 fields; the behavior test says 15). The source of truth is page.tsx.
- **Files modified:** src/types/sections.ts
- **Commit:** a8785f3

## Known Stubs

These interfaces are intentional stubs — they satisfy the type system for Phase 1 and will be expanded when the corresponding sections are extracted in Phase 3:

| Stub              | File                    | Reason                              |
| ----------------- | ----------------------- | ----------------------------------- |
| GamemodesSettings | src/types/sections.ts   | Section not extracted until Phase 3 |
| FeaturesSettings  | src/types/sections.ts   | Section not extracted until Phase 3 |
| DiscordSettings   | src/types/sections.ts   | Section not extracted until Phase 3 |
| GallerySettings   | src/types/sections.ts   | Section not extracted until Phase 3 |
| StatsSettings     | src/types/sections.ts   | Section not extracted until Phase 3 |
| StaffSettings     | src/types/sections.ts   | Section not extracted until Phase 3 |
| TextSettings      | src/types/sections.ts   | Section not extracted until Phase 3 |
| SiteTheme         | src/types/site-theme.ts | Full definition deferred to Phase 2 |

These stubs do NOT prevent this plan's goal — the goal is to create the type foundation files, not to fully define each section type's settings.

## Threat Surface

No new network endpoints, auth paths, file access patterns, or schema changes. Pure type definitions and a synchronous helper function with literal output — no I/O, no user input, no API surface. T-01-01 and T-01-02 addressed per threat model.

## Self-Check: PASSED

- src/types/sections.ts: FOUND
- src/types/site-theme.ts: FOUND
- src/lib/plan.ts: FOUND
- Commit a8785f3: FOUND (Task 1)
- Commit e47b03f: FOUND (Task 2)
- tsc error count baseline (6) = final (6): PASSED
- No app/components files modified: PASSED
- Not yet consumed by other files: PASSED
