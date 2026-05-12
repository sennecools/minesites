---
phase: 07-api-layer
plan: 06
subsystem: api

tags: [cleanup, deletion, tsc-gate, route-rename, zod, next-app-router]

requires:
  - phase: 07-api-layer (Plan 07-02)
    provides: New /api/websites surface that replaces /api/servers
  - phase: 07-api-layer (Plan 07-03)
    provides: Nested MinecraftServer CRUD at /api/websites/[id]/servers/*
  - phase: 07-api-layer (Plan 07-04)
    provides: Renamed server actions (createWebsite/updateWebsite/deleteWebsite) and updated dashboard list-page fetch call
  - phase: 07-api-layer (Plan 07-05)
    provides: Migration of remaining /api/servers fetch calls in the dashboard editor god-component (runs in parallel; cross-worktree integration is post-merge)
provides:
  - Removal of the legacy /api/servers route directory tree
  - Removal of the legacy zod schema src/lib/validations/server.ts (createServerSchema, updateServerSchema, CreateServerInput, UpdateServerInput)
  - Final whole-project tsc --noEmit gate confirmed clean (0 errors) for this worktree
affects: [phase-08-dashboard-and-public-site]

tech-stack:
  added: []
  patterns:
    - "Hard-rename completion gate: grep for the renamed-away string across src/ must produce zero matches outside files being deleted"
    - "Worktree-scoped verification: parallel wave members verify only their own slice; cross-worktree references are resolved at post-merge time"

key-files:
  created:
    - .planning/phases/07-api-layer/07-06-SUMMARY.md
  modified: []
  deleted:
    - src/app/api/servers/route.ts
    - src/app/api/servers/[serverId]/route.ts
    - src/lib/validations/server.ts

key-decisions:
  - "Proceed with deletion despite two surviving /api/servers literals in src/app/(dashboard)/dashboard/[serverId]/page.tsx — those are owned by Plan 07-05 in a parallel worktree, per the orchestrator note in the executor prompt."
  - "Do not run tsc-as-noEmit-bootstrapping the worktree's node_modules: symlink from main repo's node_modules instead, then remove the symlink after the gate runs."

patterns-established:
  - "Deletion-only cleanup commit type: chore({phase}-{plan}): delete legacy ... — pure removal with no replacement code in the same commit"
  - "Final tsc-gate documentation: paste tsc exit code + grep 'error TS' count in SUMMARY for downstream verifier"

requirements-completed: [WEB-01, WEB-02, WEB-03, CONN-01]

duration: 132s
completed: 2026-05-12
---

# Phase 7 Plan 6: Legacy /api/servers + server.ts Cleanup Summary

**Deleted the legacy /api/servers route tree and src/lib/validations/server.ts; final tsc --noEmit gate produces zero errors, confirming Phase 7's hard rename is complete in this worktree.**

## Performance

- **Duration:** 132s (~2 min)
- **Started:** 2026-05-12T13:10:24Z
- **Completed:** 2026-05-12T13:12:36Z
- **Tasks:** 3 (1 verification, 1 deletion, 1 compile gate)
- **Files deleted:** 3
- **Files modified:** 0

## Accomplishments

- Removed `src/app/api/servers/route.ts` (GET list of user's websites — superseded by `src/app/api/websites/route.ts` from Plan 07-02).
- Removed `src/app/api/servers/[serverId]/route.ts` (GET/PUT website-by-id + sections — superseded by `src/app/api/websites/[websiteId]/route.ts` from Plan 07-02).
- Removed the now-empty `src/app/api/servers/` and `src/app/api/servers/[serverId]/` directories.
- Removed `src/lib/validations/server.ts` (legacy `createServerSchema`/`updateServerSchema` carrying the obsolete `serverIp`/`serverPort` fields, per D-13).
- Confirmed `npx tsc --noEmit` exits 0 with zero `error TS` diagnostics across the project.

## Task Commits

Each substantive task was committed atomically. Tasks 1 and 3 are gate tasks (no file changes); only Task 2 produced a commit.

1. **Task 1: Pre-deletion grep verification** — no commit (verification-only task; results in §"Task 1 Grep Results" below).
2. **Task 2: Delete src/app/api/servers/ and src/lib/validations/server.ts** — `bfe19ef` (chore)
3. **Task 3: Final tsc + lint gate** — no commit (gate-only task; results in §"Task 3 Compile Gate Results" below).

**Final SUMMARY commit:** see worktree branch tip after this file lands.

## Task 1 Grep Results

Verification commands and their output, run BEFORE deletion to confirm nothing in this worktree would break:

```text
$ grep -rn 'from "@/lib/validations/server"' src/
(no matches)

$ grep -rn "from '@/lib/validations/server'" src/
(no matches)

$ grep -rn "/api/servers" src/
src/app/api/servers/[serverId]/route.ts:7:// GET /api/servers/[serverId] - Load server data with sections
src/app/api/servers/[serverId]/route.ts:46:// PUT /api/servers/[serverId] - Save server data with sections
src/app/api/servers/route.ts:5:// GET /api/servers - List all servers for the current user
src/app/(dashboard)/dashboard/[serverId]/page.tsx:2282:        const response = await fetch(`/api/servers/${serverId}`);
src/app/(dashboard)/dashboard/[serverId]/page.tsx:2375:      const response = await fetch(`/api/servers/${serverId}`, {

$ grep -rnE "(createServerSchema|updateServerSchema|CreateServerInput|UpdateServerInput)" src/
src/lib/validations/server.ts:3:export const createServerSchema = z.object({
src/lib/validations/server.ts:18:export const updateServerSchema = createServerSchema.partial();
src/lib/validations/server.ts:20:export type CreateServerInput = z.infer<typeof createServerSchema>;
src/lib/validations/server.ts:21:export type UpdateServerInput = z.infer<typeof updateServerSchema>;

$ grep -rnE "\b(createServer|updateServer|deleteServer)\(" src/
(no matches)
```

**Interpretation:**

| Check | Result | Safe to delete? |
|-------|--------|------------------|
| Imports of `@/lib/validations/server` | 0 matches | YES |
| `/api/servers` references inside `src/app/api/servers/*` | 3 matches (self) | YES — these files are being deleted |
| `/api/servers` references in `src/app/(dashboard)/dashboard/[serverId]/page.tsx` lines 2282, 2375 | 2 matches (out-of-worktree-scope) | YES per orchestrator note — Plan 07-05 owns these in its parallel worktree |
| `createServerSchema`/`updateServerSchema`/`CreateServerInput`/`UpdateServerInput` references outside `server.ts` | 0 matches | YES |
| Legacy action call sites `createServer(`/`updateServer(`/`deleteServer(` | 0 matches | YES |

The two `/api/servers` literals in `dashboard/[serverId]/page.tsx` are inside `fetch()` URL template strings — they are NOT type-resolved by tsc, so removing the route handlers does not break the TypeScript build. They will fail at runtime when that god-component executes that fetch path, which is why Plan 07-05 (running in parallel) is the owner of that file's migration.

## Task 2 Deletion Verification

After `rm` + `rmdir`:

```text
test ! -e src/app/api/servers                                         → PASS
test ! -e src/lib/validations/server.ts                               → PASS
test -e src/app/api/websites/route.ts                                 → PASS (from 07-02)
test -e src/app/api/websites/[websiteId]/route.ts                     → PASS (from 07-02)
test -e src/app/api/websites/[websiteId]/servers/route.ts             → PASS (from 07-03)
test -e src/app/api/websites/[websiteId]/servers/[serverId]/route.ts  → PASS (from 07-03)
test -e src/lib/validations/mcserver.ts                               → PASS (from 07-01)
test -e src/lib/validations/website.ts                                → PASS (kept)
```

Commit:

```text
bfe19ef chore(07-06): delete legacy /api/servers routes and server.ts schema
 3 files changed, 216 deletions(-)
 delete mode 100644 src/app/api/servers/[serverId]/route.ts
 delete mode 100644 src/app/api/servers/route.ts
 delete mode 100644 src/lib/validations/server.ts
```

## Task 3 Compile Gate Results

### tsc

```text
$ tsc --version
Version 5.9.3

$ ./node_modules/.bin/tsc --noEmit
(no output)
$ echo $?
0

$ grep -cE "error TS" /tmp/phase7-06-tsc.log
0
```

**Result: PASS — 0 errors.**

The worktree-scoped tsc gate is clean. The two surviving `/api/servers` literal strings in `dashboard/[serverId]/page.tsx` are URL strings inside `fetch()` calls; they are not type-checked, so tsc has nothing to complain about. Runtime correctness is Plan 07-05's responsibility (parallel worktree) and is settled at post-merge time by the orchestrator.

### lint

```text
$ ./node_modules/.bin/eslint .
... (85 problems: 22 errors, 63 warnings)
```

**Result: PASS for Phase 7's contribution.**

All 22 lint errors and 63 warnings are pre-existing in files I did not touch:

```
prisma/prisma.config.ts                                  (warning)
src/app/(dashboard)/dashboard/page.tsx                   (warnings/errors)
src/app/(dashboard)/dashboard/[serverId]/page.tsx        (errors at 1203, 1320, 1393 — all pre-existing)
src/app/(marketing)/page.tsx                             (warnings)
src/app/(marketing)/page-v3.tsx                          (warnings)
src/app/(marketing)/page-v4.tsx                          (warnings)
src/app/(marketing)/page-v5.tsx                          (warnings)
src/app/[subdomain]/preview-client.tsx                   (errors at 384, 467 — pre-existing)
src/components/ImageUpload.tsx                           (warnings)
src/components/layout/sidebar.tsx                        (warnings)
src/components/sections/render/hero-render.tsx           (errors at 60, 134, 176 — pre-existing)
src/components/ui/avatar.tsx                             (warnings)
src/components/ui/card.tsx                               (error — empty interface, pre-existing)
src/components/ui/label.tsx                              (error — empty interface, pre-existing)
```

Plan 07-06 contributed **only deletions** (no new code, no new imports), so it cannot have introduced any new lint diagnostic. Per the executor's SCOPE BOUNDARY rule, pre-existing lint errors in unrelated files are out of scope and intentionally not touched.

Acceptance criterion #3 ("lint introduces no new errors attributable to Phase 7") is met.

### next build

Skipped per the plan's "Optional but recommended" guidance — the must_haves explicitly state that `npm run lint + npx tsc --noEmit` is the compile gate when `next build` is too heavy locally. Both gates pass.

## Files Created/Modified

**Deleted:**
- `src/app/api/servers/route.ts` — legacy GET list endpoint (replaced by `/api/websites/route.ts`)
- `src/app/api/servers/[serverId]/route.ts` — legacy GET/PUT website-by-id endpoint (replaced by `/api/websites/[websiteId]/route.ts`, which additionally has the DELETE handler that Plan 07-04 introduced)
- `src/lib/validations/server.ts` — legacy zod schema with obsolete `serverIp`/`serverPort` fields

**Created (this summary only):**
- `.planning/phases/07-api-layer/07-06-SUMMARY.md` — this file

## Decisions Made

- **Proceed with deletion despite cross-worktree `/api/servers` references.** The two remaining hits in `src/app/(dashboard)/dashboard/[serverId]/page.tsx` (lines 2282, 2375) are inside `fetch()` URL strings, not type-resolved imports. The orchestrator's parallel-execution note explicitly assigned Plan 07-05 ownership of those call sites and clarified that cross-worktree integration is verified at post-merge time. Refusing to delete here would block Phase 7 entirely.
- **Used a transient symlink for `node_modules`.** The worktree has no `node_modules` of its own; symlinking `/home/senne/git/minesites/node_modules` into the worktree let the tsc and lint gates run without polluting the main repo. The symlink was removed before commit; `node_modules` is already gitignored.

## Deviations from Plan

**One workflow misstep was identified and self-corrected; no plan content was deviated.**

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Restored accidental file deletions in the main repo**
- **Found during:** Task 2 (Delete legacy files)
- **Issue:** First deletion attempt was executed with `cd /home/senne/git/minesites` (the main repo) instead of in the worktree at `/home/senne/git/minesites/.claude/worktrees/agent-aa552c264d9e23ca8`. Three files were deleted from the wrong working tree.
- **Fix:** Verified the deletions were unstaged in main-repo `git status` (no commit was made), then ran `git checkout -- <each-file>` in the main repo to restore each of the three files individually (per the destructive_git_prohibition policy: single-file restores are allowed; blanket `git checkout .` is not). Switched to absolute-path-only commands (`rm "$WT/..."` and `git -C "$WT" ...`) so the working directory could not drift again. Re-ran the deletion correctly in the worktree.
- **Files modified:** None (the main-repo state was returned to its prior state; only the worktree state advanced).
- **Verification:** Main repo `git status --short` shows only the untracked `.claude/` worktree directory (which is normal). Worktree `git log --oneline` shows the legitimate Task 2 commit `bfe19ef` on top of the assigned base `e4c1ec6`.
- **Committed in:** N/A (restore left no net change; the only commit is the correct Task 2 commit `bfe19ef` in the worktree)

---

**Total deviations:** 1 auto-fixed (1 blocking — operator-environment issue, not plan content).
**Impact on plan:** None on the plan; main-repo working tree restored to clean. The Task 2 commit is in the correct worktree branch and includes exactly the three intended deletions.

## Issues Encountered

- **Initial bash sessions drifted out of the worktree cwd.** `cd /home/senne/git/minesites` (followed by relative-path operations) put me in the main repo for two commands while my assigned worktree was at `/home/senne/git/minesites/.claude/worktrees/agent-aa552c264d9e23ca8`. Resolved by switching to absolute-path-only commands and `git -C "$WT" ...` form. No data lost; main-repo tree restored before any commit was attempted there.

## Threat Flags

None — this plan only removes code, and the new surface that replaces it (Plans 07-02 through 07-05) has already had its threat surface accounted for. No new endpoints, no new auth paths, no schema changes were introduced.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- **Phase 7 hard-rename is complete in this worktree.** After all wave-3 worktrees merge (this plan + 07-05), the project will have zero `/api/servers` references anywhere in `src/` and a clean tsc gate.
- **Phase 8 (Dashboard & Public Site) can begin** once the orchestrator merges the wave-3 worktrees. The dashboard route `dashboard/[serverId]` → `dashboard/[websiteId]` rename and the connections-manager tab UI are Phase 8's explicit scope.

## Self-Check: PASSED

- Files deleted as planned:
  - `src/app/api/servers/route.ts`: MISSING (as intended)
  - `src/app/api/servers/[serverId]/route.ts`: MISSING (as intended)
  - `src/lib/validations/server.ts`: MISSING (as intended)
- New surface intact:
  - `src/app/api/websites/route.ts`: FOUND
  - `src/app/api/websites/[websiteId]/route.ts`: FOUND
  - `src/app/api/websites/[websiteId]/servers/route.ts`: FOUND
  - `src/app/api/websites/[websiteId]/servers/[serverId]/route.ts`: FOUND
  - `src/lib/validations/mcserver.ts`: FOUND
  - `src/lib/validations/website.ts`: FOUND
- Commit found in worktree: `bfe19ef` — FOUND on branch `worktree-agent-aa552c264d9e23ca8`.
- Final tsc result: `0 errors`.

---
*Phase: 07-api-layer*
*Plan: 06*
*Completed: 2026-05-12*
