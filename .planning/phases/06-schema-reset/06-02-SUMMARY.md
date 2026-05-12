---
phase: 06-schema-reset
plan: '02'
subsystem: ui
tags: [typescript, types, rename, refactor]

dependency_graph:
    requires:
        - phase: 06-01
          provides: prisma-website-model — schema established WebsiteData semantics; this plan propagates the name into TypeScript types
    provides:
        - websitedata-interface
        - section-render-props-typed-to-websitedata
    affects:
        - 06-03
        - 06-04
        - all section render components importing SectionRenderProps
        - preview-client.tsx

tech_stack:
    added: []
    patterns:
        - ServerData renamed to WebsiteData in the high-fan-out type file (preview/types.ts) — all consumers must now use WebsiteData
        - serverIp: string | null retained inside WebsiteData as Phase 6 compile bridge (Phase 7 will remove it when MinecraftServer lookup is introduced)

key_files:
    created: []
    modified:
        - src/components/preview/types.ts
        - src/types/sections.ts

key_decisions:
    - 'serverIp: string | null kept inside WebsiteData intentionally — public layout.tsx and god-component still read this field; Phase 7 removes it when MinecraftServer model is wired'
    - 'Exactly one declaration site changed in types.ts (interface name only); field list and all other exports untouched'
    - 'Exactly two change sites in sections.ts (import token + SectionRenderProps.serverData type); all other interfaces unchanged'

patterns_established:
    - 'WebsiteData is the canonical type for website-level data passed to section render components — all section renders accept SectionRenderProps.serverData: WebsiteData'

requirements_completed:
    - WEB-01
    - CONN-01

duration: 4min
completed: '2026-05-08'
---

# Phase 06 Plan 02: Type Rename Summary

**Renamed ServerData to WebsiteData in preview/types.ts and updated the one-hop consumer (sections.ts SectionRenderProps); serverIp compile bridge preserved for Phase 7 removal.**

## Performance

- **Duration:** ~4 minutes
- **Started:** 2026-05-08T11:00:00Z
- **Completed:** 2026-05-08T11:04:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `export interface WebsiteData` now replaces `ServerData` in `src/components/preview/types.ts`
- `SectionRenderProps.serverData` in `src/types/sections.ts` is now typed as `WebsiteData`
- Zero occurrences of `ServerData` remain in either file
- `serverIp: string | null` field preserved inside `WebsiteData` as Phase 6 compile bridge

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename ServerData → WebsiteData in src/components/preview/types.ts** - `93442be` (refactor)
2. **Task 2: Update import and SectionRenderProps in src/types/sections.ts** - `c5efa44` (refactor)

## Files Created/Modified

- `src/components/preview/types.ts` - Interface renamed from ServerData to WebsiteData; all other content unchanged
- `src/types/sections.ts` - Import token and SectionRenderProps.serverData type updated to WebsiteData; 206 unchanged lines

## Decisions Made

- `serverIp: string | null` retained inside `WebsiteData` — public layout.tsx and the god-component still reference this field path; Plan 07 (MinecraftServer lookup) will remove it cleanly
- Minimally invasive diff: only two declarations changed across both files to keep the cascade impact on downstream callers (Plans 03-04) predictable

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `WebsiteData` is exported and available for all section render components and preview-client.tsx to import
- Plan 03 (section render component imports) and Plan 04 (god-component + preview-client caller updates) can now proceed — they will find `WebsiteData` ready at `@/components/preview/types`
- No blockers introduced

## Self-Check

- [x] src/components/preview/types.ts: `export interface WebsiteData` present (1 match)
- [x] src/components/preview/types.ts: `ServerData` absent (0 matches)
- [x] src/components/preview/types.ts: `serverIp` present (1 match, compile bridge preserved)
- [x] src/types/sections.ts: `WebsiteData` present (2 matches — import + SectionRenderProps)
- [x] src/types/sections.ts: `ServerData` absent (0 matches)
- [x] Commit 93442be exists (Task 1)
- [x] Commit c5efa44 exists (Task 2)

## Self-Check: PASSED

---

_Phase: 06-schema-reset_
_Completed: 2026-05-08_
