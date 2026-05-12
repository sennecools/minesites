---
phase: 08-dashboard-public-site
plan: 01
subsystem: ui

tags: [next-app-router, useparams, route-rename, refactor, typescript]

# Dependency graph
requires:
  - phase: 06-schema-reset
    provides: Website + MinecraftServer Prisma models replacing Server
  - phase: 07-api-layer
    provides: /api/websites endpoint surface consumed by the editor fetch
provides:
  - Editor route directory renamed `[serverId]` -> `[websiteId]` with rename detection preserved (git history follows)
  - useParams destructure + 5 local serverId token references swept to websiteId
  - Local ServerDataState type renamed to WebsiteDataState (D-15)
  - server-actions.tsx local interface ServerActionsProps -> WebsiteActionsProps + 3 call-site sweeps
  - server-settings.tsx Server interface renamed to Website; legacy serverIp/serverPort fields dropped (D-14)
  - BL-06 description round-trip preserved verbatim in server-settings.tsx
  - .next/ build cache cleared (Pitfall 8)
  - TypeScript compile gate (npx tsc --noEmit) exits 0
affects: [08-02, 08-03, 08-04, future-dashboard-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Route directory rename in a focused commit (git mv) for clean bisect attribution"
    - "Local-type rename heuristic: only touch Server* names inside the renamed directory's scope (D-15)"

key-files:
  created: []
  modified:
    - "src/app/(dashboard)/dashboard/[serverId]/page.tsx -> src/app/(dashboard)/dashboard/[websiteId]/page.tsx (renamed + 14 ins / 14 del)"
    - "src/app/(dashboard)/dashboard/[serverId]/server-actions.tsx -> src/app/(dashboard)/dashboard/[websiteId]/server-actions.tsx (renamed + 5 ins / 5 del)"
    - "src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx -> src/app/(dashboard)/dashboard/[websiteId]/server-settings.tsx (renamed + 2 ins / 4 del — legacy fields dropped)"

key-decisions:
  - "Token sweep limited to serverId variable + local Server* type names per CONTEXT D-15; broader 'server'/'Server' string occurrences (UI labels, FAQs, mock data) left untouched — they are domain text, not the v1.1 terminology cleanup target"
  - "server-actions.tsx kept orphaned (D-15 says do not delete); type rename + sweep applied for consistency"
  - "Filename renames for sibling editor files (D-16) DEFERRED to keep diff small per plan instructions"

patterns-established:
  - "Directory rename via git mv preserves rename detection (similarity scores 99%/91%/97%) — clean bisect attribution if a later commit regresses"
  - "Build cache reset (rm -rf .next/) as a mandatory post-rename verification step (Pitfall 8)"

requirements-completed: [DASH-03]

# Metrics
duration: 8min
completed: 2026-05-12
---

# Phase 8 Plan 1: Route Rename + Local-Type Sweep Summary

**Renamed `[serverId]/` -> `[websiteId]/` editor route directory with git rename detection preserved, swept 5 local `serverId` references and 2 `Server*` type names to `Website`-equivalents, and dropped legacy `serverIp`/`serverPort` fields from `server-settings.tsx` — TypeScript compile gate clean.**

## Performance

- **Duration:** ~8 min
- **Tasks:** 1
- **Files modified:** 3 (all moved via git mv with rename detection)

## Accomplishments

- Directory renamed in one focused commit with git rename detection (similarity 99%/91%/97%) so a future bisect cleanly attributes regressions to this commit if any surface.
- Editor route param fixed at the type-system + runtime contract level — `params.websiteId as string` is the new destructure shape in `page.tsx`.
- Legacy `serverIp` / `serverPort` field references purged from the local `Server` interface in `server-settings.tsx` (now `Website` interface).
- Phase 7 BL-06 description round-trip preserved verbatim — the `key === "description"` empty-string send branch is untouched (verified: grep returns 1 hit).

## Task Commits

1. **Task 1: Rename directory and sweep param + type names** — `36ef653` (refactor)

## Files Created/Modified

- `src/app/(dashboard)/dashboard/[websiteId]/page.tsx` (renamed from `[serverId]/page.tsx`) — useParams generic + 5 local `serverId` token references swept; local `type ServerDataState` renamed to `WebsiteDataState` (D-15).
- `src/app/(dashboard)/dashboard/[websiteId]/server-actions.tsx` (renamed) — `interface ServerActionsProps` renamed to `WebsiteActionsProps`; the `serverId` prop name + 3 call-site references (`togglePublished(serverId)`, two `deleteWebsite(serverId)` call shapes) swept to `websiteId`. Component export name (`ServerActions`) preserved — D-15 scopes the rename to local *type* names, not the React component export.
- `src/app/(dashboard)/dashboard/[websiteId]/server-settings.tsx` (renamed) — `interface Server` renamed to `interface Website`; `serverIp: string | null` and `serverPort: number | null` fields dropped (D-14). `ServerSettingsProps` (the React component prop type) and the `ServerSettings` component export name preserved per D-16's "filename rename deferred" stance. BL-06 round-trip preserved verbatim.

## Decisions Made

- **Scope of the token sweep matched the plan exactly.** Only `serverId` (the camelCase variable token) and local `Server*` *type* names inside the renamed directory were swept. Broader text occurrences (UI labels like "Active Servers", "Join Server", "MC Server List", `Server` icon imports from lucide-react, FAQ strings, mock data) were left untouched — they are domain copy, not the v1.1 terminology cleanup target. CONTEXT D-15's heuristic explicitly says "local types defined in files already in this phase's scope".
- **Component export names preserved.** `ServerActions` (React component) and `ServerSettings` (React component) export names left as-is. D-15 says "rename any local Server* *type* names"; D-16 says filename + component renames are optional/deferred. Both rationales align — keep the diff minimal.
- **Build cache wipe done.** `.next/` removed per Pitfall 8 + Runtime State Inventory; a stale route manifest would silently 404 the new path until next full rebuild.

## Deviations from Plan

None - plan executed exactly as written.

The task's verification commands all pass:

| Verification | Expected | Actual |
|---|---|---|
| Old directory absent | `test ! -d "[serverId]"` | PASS |
| New directory + 3 files | all exist | PASS |
| `grep -c "serverId"` in renamed page.tsx (non-comment) | 0 | 0 |
| `params.websiteId as string` pattern | present | present |
| `interface Website` in server-settings.tsx | present | present |
| `serverIp\|serverPort` in server-settings.tsx | 0 | 0 |
| `key === "description"` (BL-06) | >= 1 | 1 |
| `npx tsc --noEmit` exit code | 0 | 0 |
| git rename detection | path move (not delete+add) | R 99%/91%/97% |

## Issues Encountered

None — the rename + sweep proceeded without surprises. The Read tool's "file state" tracking required re-reading each renamed file once before the first Edit in its new path (expected behavior, not a regression).

## TDD Gate Compliance

Not applicable — this is a `type: execute` plan (not `type: tdd`). No test gates required.

## Self-Check: PASSED

- File `src/app/(dashboard)/dashboard/[websiteId]/page.tsx` — FOUND
- File `src/app/(dashboard)/dashboard/[websiteId]/server-actions.tsx` — FOUND
- File `src/app/(dashboard)/dashboard/[websiteId]/server-settings.tsx` — FOUND
- Directory `src/app/(dashboard)/dashboard/[serverId]/` — ABSENT (correct)
- Commit `36ef653` — FOUND in git log on `worktree-agent-a6ecd9fa1c99ec6c8`
- TypeScript gate — exit 0
- `.next/` cache — cleared (directory does not exist post-rm)

## Next Phase Readiness

- Plan 08-02 (subdomain public-site cleanup) is unblocked — it can now reference `[websiteId]` as the canonical editor route param name without coordinating across a pending rename.
- Plan 08-03 (dashboard card extraction + dialog rename) is unblocked — Link hrefs like `/dashboard/${id}` continue to work because the URL pattern is unchanged.
- Plan 08-04 (ConnectionsModal + Manage Servers button in the editor top-bar) is unblocked — the `[websiteId]/page.tsx` is the integration target and now has the correct `websiteId` variable in scope.

---
*Phase: 08-dashboard-public-site*
*Plan: 01*
*Completed: 2026-05-12*
