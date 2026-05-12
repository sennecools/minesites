---
phase: 07-api-layer
plan: 04
subsystem: api
tags: [server-actions, rename, dashboard, importers, d-14]

# Dependency graph
requires:
  - phase: 07-api-layer
    plan: 01
    provides: "createWebsiteSchema, updateWebsiteSchema in @/lib/validations/website (consumed by renamed actions)"
provides:
  - "createWebsite / updateWebsite / deleteWebsite server actions (renamed from createServer/updateServer/deleteServer per D-14)"
  - "dashboard list pages fetching /api/websites (renamed from /api/servers)"
affects: [07-02-website-routes, 07-05-editor-fetches, 07-06-cleanup]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server-action filename stays the same (actions.ts); only exported names track the website-centric vocabulary (D-14)"
    - "Editor route param `[serverId]` and its corresponding action parameter `serverId` are NOT renamed in this phase — that is deferred to Phase 8 (D-02)"

key-files:
  created: []
  modified:
    - "src/app/(dashboard)/dashboard/actions.ts"
    - "src/app/(dashboard)/dashboard/create-server-dialog.tsx"
    - "src/app/(dashboard)/dashboard/[serverId]/server-actions.tsx"
    - "src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx"
    - "src/app/(dashboard)/dashboard/page.tsx"
    - "src/app/(dashboard)/dashboard/servers/page.tsx"

key-decisions:
  - "D-14: rename exported action names only; keep filenames and `serverId` parameter names until Phase 8"
  - "D-19 P2002 catches preserved verbatim across the create + update flows after rename"
  - "D-20 session-user existence check preserved verbatim before db.website.create"

patterns-established:
  - "Renames inside actions.ts touched only the function-name token; bodies are byte-identical to the pre-plan version"
  - "Importer files use direct named-import renames (no aliasing) to keep the call sites self-documenting"

requirements-completed: [WEB-01, WEB-02, WEB-03]

# Metrics
duration: ~10min
completed: 2026-05-12
---

# Phase 7 Plan 04: Rename Server Actions and Dashboard Fetch URLs Summary

**Rename the three dashboard server actions (createServer/updateServer/deleteServer → *Website) per D-14, retarget every importer, and switch dashboard list pages to fetch `/api/websites` instead of `/api/servers` — with D-19 (P2002) and D-20 (session-user existence) guards preserved verbatim.**

## Performance

- **Duration:** ~10 min
- **Completed:** 2026-05-12
- **Tasks:** 3
- **Files modified:** 6 (0 created, 6 modified)

## Accomplishments

- Three exported server actions in `src/app/(dashboard)/dashboard/actions.ts` renamed in place:
  - `createServer` → `createWebsite` (line 10)
  - `updateServer` → `updateWebsite` (line 68)
  - `deleteServer` → `deleteWebsite` (line 115)
  - `togglePublished` (line 137) intentionally untouched.
- All three importer files updated to call the renamed actions:
  - `src/app/(dashboard)/dashboard/create-server-dialog.tsx` — `import { createWebsite }` + `await createWebsite(formData)`.
  - `src/app/(dashboard)/dashboard/[serverId]/server-actions.tsx` — `import { togglePublished, deleteWebsite }` + `await deleteWebsite(serverId)`.
  - `src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx` — `import { updateWebsite }` + `await updateWebsite(server.id, formData)`.
- Dashboard list pages retargeted to the new endpoint:
  - `src/app/(dashboard)/dashboard/page.tsx` — `fetch("/api/websites")` (was `/api/servers`).
  - `src/app/(dashboard)/dashboard/servers/page.tsx` — `fetch("/api/websites")` (was `/api/servers`).
- `npx tsc --noEmit` exits **0** after each task — even the editor god-component compiled cleanly in this worktree (no `[serverId]/page.tsx` action calls intercept the rename).

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename three server actions in actions.ts (createServer/updateServer/deleteServer → *Website)** — `6afb462` (refactor)
2. **Task 2: Update three action importers to the renamed exports (create-server-dialog, [serverId]/server-actions, [serverId]/server-settings)** — `bfa4987` (refactor)
3. **Task 3: Switch dashboard and servers list pages to fetch /api/websites** — `e36ffb4` (refactor)

## Files Modified (detail)

- `src/app/(dashboard)/dashboard/actions.ts` — function names on lines 10, 68, 115 only. Function bodies byte-identical to pre-plan version: P2002 catches in both create + update flows still throw `"Subdomain is already taken"`, the `userRecord` existence check still throws `"Session expired. Please sign out and sign back in."`, `createWebsiteSchema.parse`/`updateWebsiteSchema.parse`, subdomain pre-check, default Hero section creation, `revalidatePath("/dashboard")`/`revalidatePath(`/dashboard/${serverId}`)`, and `redirect(`/dashboard/${server.id}`)` — all preserved.
- `src/app/(dashboard)/dashboard/create-server-dialog.tsx` — line 18 import + line 53 call site. `isRedirectError` guard (CR-02) and controlled `open`/`onOpenChange` props (WR-03) both preserved.
- `src/app/(dashboard)/dashboard/[serverId]/server-actions.tsx` — line 15 import + line 33 call site. `togglePublished` co-import kept; delete confirmation modal untouched.
- `src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx` — line 7 import + line 50 call site. `updateWebsiteSchema` import in line 6 already website-centric (Phase 6 leftover) — only the action import changed.
- `src/app/(dashboard)/dashboard/page.tsx` — `useEffect`/`loadServers` fetch URL on line 37 only.
- `src/app/(dashboard)/dashboard/servers/page.tsx` — `useEffect`/`loadServers` fetch URL on line 41 only.

## Carry-forward Guards Confirmation (D-19 / D-20)

`actions.ts` still contains:

- `grep -c "P2002"` → **2** occurrences (one inside the `createWebsite` `try/catch` around `db.website.create`, one inside the `updateWebsite` `try/catch` around `db.website.update`) — both still throw `"Subdomain is already taken"` on `Prisma.PrismaClientKnownRequestError` with `code === "P2002"`.
- `grep -q "Session expired"` → present at the `userRecord` existence check inside `createWebsite`, before `db.website.create`.
- `grep -q "createWebsiteSchema"` / `grep -q "updateWebsiteSchema"` → both schema imports retained.

## Cross-plan Coordination

This plan runs in Wave 2 in parallel with Plan 07-02, which is the plan that actually creates the new `GET /api/websites` route handler. Within this worktree the route does not exist yet — the fetch URL changes target Plan 07-02's deliverable. Once both Wave 2 worktrees merge, the dashboard list pages will resolve to the new endpoint.

The editor god-component (`[serverId]/page.tsx`) and the legacy `src/app/api/servers/` directory plus `src/lib/validations/server.ts` cleanup are intentionally out of scope here — handled by Plans 07-05 and 07-06 respectively.

## Decisions Made

None new — plan executed exactly as written. All decisions (D-14 rename actions only, D-02 keep `serverId` route param, D-19 P2002 catch, D-20 user existence check) come from `07-CONTEXT.md` and Phase 6 review-fix and were enacted verbatim.

## Deviations from Plan

None — plan executed exactly as written.

The Edit tool initially resolved the `(dashboard)` parens via the relative path in a way that wrote to the main repo's working tree rather than the worktree's checkout. The mistaken main-repo edit was reverted with a file-scoped `git checkout -- src/app/(dashboard)/dashboard/actions.ts` in the main repo, and all subsequent Edits used the absolute worktree path `/home/senne/git/minesites/.claude/worktrees/agent-a7c9bcba06d842082/...`. No code or repo state diverged from the plan; this was a tool-path workflow correction, not a plan deviation.

## Issues Encountered

- Tool path resolution for the worktree's `(dashboard)` parens path (above) — corrected mid-task; main repo working tree restored; worktree commits clean.

## User Setup Required

None — no external service configuration, env vars, or migration steps introduced.

## TypeScript Check Confirmation

`npx tsc --noEmit` after each commit: **0 errors**, exit code 0. The plan's verification note ("tsc may still error on the editor god-component (its fetch URL is updated in Plan 07-05) — that is expected and acceptable for this plan") was permissive — in practice the worktree's `[serverId]/page.tsx` did not invoke the renamed action symbols, so the rename did not introduce any tsc diagnostics there.

## Next Plan Readiness

- Plan 07-05 (editor god-component fetch URL retarget) is unblocked: the action names it imports (if any) now match the new website-centric vocabulary, and the renamed actions remain in `./actions` relative to the dashboard tree.
- Plan 07-06 (legacy route + validation cleanup) is unblocked: nothing in this worktree depends on `src/app/api/servers/` or `src/lib/validations/server.ts` any longer (within the files this plan owns).
- No new blockers.

## Self-Check: PASSED

- `src/app/(dashboard)/dashboard/actions.ts` — FOUND (modified; new exports present)
- `src/app/(dashboard)/dashboard/create-server-dialog.tsx` — FOUND (modified; new import + call site)
- `src/app/(dashboard)/dashboard/[serverId]/server-actions.tsx` — FOUND (modified; new import + call site)
- `src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx` — FOUND (modified; new import + call site)
- `src/app/(dashboard)/dashboard/page.tsx` — FOUND (modified; new fetch URL)
- `src/app/(dashboard)/dashboard/servers/page.tsx` — FOUND (modified; new fetch URL)
- Commit `6afb462` (Task 1) — FOUND in git log
- Commit `bfa4987` (Task 2) — FOUND in git log
- Commit `e36ffb4` (Task 3) — FOUND in git log
- `npx tsc --noEmit` — clean (0 errors, exit code 0) after all three tasks

---
*Phase: 07-api-layer*
*Plan: 04*
*Completed: 2026-05-12*
