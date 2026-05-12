---
phase: 06-schema-reset
plan: '03'
subsystem: api
tags: [prisma, api, server-actions, subdomain, website-model]

# Dependency graph
requires:
    - phase: 06-schema-reset
      plan: '01'
      provides: prisma-website-model + db.website.* client + website validation schemas
provides:
    - all 14 Prisma call sites updated from db.server.* to db.website.*
    - serverIp/serverPort removed from all Prisma operations
    - Section.websiteId used in createMany/deleteMany (not serverId)
    - public subdomain files pass serverIp as empty placeholder (Phase 7 wires MinecraftServer)
affects:
    - 06-04 (dashboard page files — same rename pattern)
    - 06-05 (any remaining TypeScript compilation tasks)
    - Phase 07 (MinecraftServer lookup will replace serverIp placeholder)

# Tech tracking
tech-stack:
    added: []
    patterns:
        - 'Prisma model rename: all db.server.* -> db.website.* across call sites'
        - 'Section FK rename: serverId -> websiteId in createMany/deleteMany'
        - 'Phase-N placeholder comment for stub fields: serverIp set to empty string with lookup deferred'

key-files:
    created: []
    modified:
        - src/app/(dashboard)/dashboard/actions.ts
        - src/app/api/servers/route.ts
        - src/app/api/servers/[serverId]/route.ts
        - src/app/[subdomain]/layout.tsx
        - src/app/[subdomain]/page.tsx

key-decisions:
    - 'Local variable names (server, updatedServer, existingServer) partially renamed to website variants for clarity — not a hard requirement but improves readability'
    - 'serverIp left as empty string / null placeholder in subdomain files per plan spec; Phase 7 will wire MinecraftServer lookup'

patterns-established:
    - 'All db.server.* and tx.server.* references replaced — no Server model access remains in these 5 files'
    - 'Section.websiteId replaces Section.serverId in all Prisma operations'

requirements-completed:
    - WEB-01
    - CONN-01

# Metrics
duration: ~8min
completed: '2026-05-08'
---

# Phase 06 Plan 03: Prisma Call-Site Rename Summary

**Renamed all 14 db.server._ Prisma call sites to db.website._ across 5 files; removed serverIp/serverPort from Prisma operations; updated Section FK from serverId to websiteId in createMany/deleteMany.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-08T10:50:00Z
- **Completed:** 2026-05-08T11:00:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Updated actions.ts: 9 db.server._ calls renamed to db.website._; validation imports switched from server.ts to website.ts; serverIp/serverPort removed from rawData in createServer and updateServer
- Updated api/servers/route.ts: db.server.findMany renamed to db.website.findMany; serverIp removed from select clause
- Updated api/[serverId]/route.ts: GET handler and PUT ownership check use db.website.findUnique; transaction uses tx.website.update; section FK renamed from serverId to websiteId in both deleteMany and createMany
- Updated [subdomain]/layout.tsx: getServerData uses db.website.findUnique; serverIp set to empty string placeholder (Phase 7 will add MinecraftServer lookup)
- Updated [subdomain]/page.tsx: db.website.findUnique; serverIp: null in serverData object

## Task Commits

Each task was committed atomically:

1. **Task 1: Update actions.ts and api/servers/route.ts** - `a54e21b` (feat)
2. **Task 2: Update api/[serverId]/route.ts and public subdomain files** - `5505a7f` (feat)

## Files Created/Modified

- `src/app/(dashboard)/dashboard/actions.ts` — 9 db.server._ -> db.website._; validation import from website.ts; serverIp/serverPort removed
- `src/app/api/servers/route.ts` — db.website.findMany; serverIp removed from select
- `src/app/api/servers/[serverId]/route.ts` — GET+PUT handlers using db.website.\*; tx.website.update; websiteId FK in section operations
- `src/app/[subdomain]/layout.tsx` — db.website.findUnique; serverIp = "" placeholder
- `src/app/[subdomain]/page.tsx` — db.website.findUnique; serverIp: null placeholder

## Decisions Made

- Local variable names partially updated (server -> website, existingServer -> existingWebsite) for clarity; parameter names like `serverId` intentionally left unchanged since they refer to the URL param (not the Prisma model)
- serverIp set to empty string / null placeholder in public subdomain files as specified by plan — Phase 7 will wire actual MinecraftServer lookup

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

| File                           | Line | Stub                      | Reason                                                   |
| ------------------------------ | ---- | ------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| src/app/[subdomain]/layout.tsx | 77   | `const serverIp = "";`    | Phase 6 placeholder; Phase 7 adds MinecraftServer lookup |
| src/app/[subdomain]/page.tsx   | 34   | `serverIp: null as string | null`                                                    | Phase 6 placeholder; Phase 7 adds MinecraftServer lookup |

These stubs are intentional and required by the plan. The `SiteNav` component still receives `serverIp` (as an empty string) and renders gracefully without it. Real server IP data will be wired in Phase 7 via the MinecraftServer model.

## Threat Flags

None — no new network endpoints, auth paths, or file access patterns introduced. The existing auth guards (session?.user?.id checks) are preserved in all API routes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 14 Prisma call sites in these 5 files now use db.website._ — zero db.server._ references remain
- Plan 04 (dashboard page files) can now proceed with the same rename pattern
- TypeScript compilation of these files depends on the Prisma Client generated in Plan 01 having db.website.\* APIs (confirmed in 06-01-SUMMARY.md: 134 references)

---

_Phase: 06-schema-reset_
_Completed: 2026-05-08_

## Self-Check: PASSED

- [x] src/app/(dashboard)/dashboard/actions.ts exists and verified
- [x] src/app/api/servers/route.ts exists and verified
- [x] src/app/api/servers/[serverId]/route.ts exists and verified
- [x] src/app/[subdomain]/layout.tsx exists and verified
- [x] src/app/[subdomain]/page.tsx exists and verified
- [x] .planning/phases/06-schema-reset/06-03-SUMMARY.md exists
- [x] Commit a54e21b exists (Task 1)
- [x] Commit 5505a7f exists (Task 2)
- [x] Zero db.server._ / tx.server._ references across all 5 files
