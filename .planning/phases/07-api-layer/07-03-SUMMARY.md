---
phase: 07-api-layer
plan: 03
subsystem: api
tags: [next.js-app-router, prisma, zod, nextauth, minecraft-server, crud]

# Dependency graph
requires:
    - phase: 07-api-layer
      provides: 'Plan 07-01 — createMcserverSchema, updateMcserverSchema in src/lib/validations/mcserver.ts'
    - phase: 06-schema-reset
      provides: 'MinecraftServer Prisma model + Website FK with onDelete: Cascade'
provides:
    - 'POST /api/websites/[websiteId]/servers — create MinecraftServer (201)'
    - 'PUT /api/websites/[websiteId]/servers/[serverId] — update MinecraftServer'
    - 'DELETE /api/websites/[websiteId]/servers/[serverId] — remove MinecraftServer (204)'
    - 'Double ownership chain: parent Website ownership + websiteId match'
affects: [08-dashboard, connections-manager, live-player-count-section, server-info-section]

# Tech tracking
tech-stack:
    added: []
    patterns:
        - 'Double ownership chain for nested resources (parent ownership + scope match)'
        - 'Conditional Prisma payload field to preserve schema @default values'

key-files:
    created:
        - 'src/app/api/websites/[websiteId]/servers/route.ts'
        - 'src/app/api/websites/[websiteId]/servers/[serverId]/route.ts'
    modified: []

key-decisions:
    - 'Omit port from db.minecraftServer.create payload when undefined (lets Prisma @default(25565) apply rather than overriding with undefined)'
    - 'PUT/DELETE both verify existing.websiteId === url websiteId — guards against cross-website edits even when a user owns multiple websites'
    - 'DELETE returns 204 with empty body via `new NextResponse(null, { status: 204 })` (no JSON envelope on success)'

patterns-established:
    - 'Nested resource ownership chain: 401 (auth) -> 404 (parent missing) -> 403 (parent owned by other) -> 404 (child not in parent scope) -> 400 (validation) -> action'
    - 'Soft references convention (D-12): MinecraftServer deletion leaves dangling section.settings.minecraftServerId refs — renderer handles placeholder'

requirements-completed: [CONN-01, CONN-02, CONN-03]

# Metrics
duration: 2min
completed: 2026-05-12
---

# Phase 7 Plan 03: Nested MinecraftServer CRUD Summary

**POST/PUT/DELETE endpoints for MinecraftServer connections under each Website, with double ownership chain (Website owner + websiteId scope match) and zod validation via Plan 07-01 schemas.**

## Performance

- **Duration:** 2min
- **Started:** 2026-05-12T13:01:21Z
- **Completed:** 2026-05-12T13:03:24Z
- **Tasks:** 2
- **Files modified:** 2 (both created)

## Accomplishments

- POST handler creates a MinecraftServer linked to the parent Website; returns 201 with full record so callers can update local state without re-fetch (D-04).
- PUT handler updates partial fields via `updateMcserverSchema`; returns the updated record.
- DELETE handler removes a record; returns 204 (empty body).
- All three endpoints enforce the full ownership chain: auth, parent Website existence, parent Website ownership, child-belongs-to-parent (PUT/DELETE only), body validation.
- Cross-website edit prevention: PUT/DELETE check `existing.websiteId === websiteId` so an attacker who knows a MinecraftServer id under a different Website cannot mutate it.

## Task Commits

Each task was committed atomically:

1. **Task 1: POST /api/websites/[websiteId]/servers** — `4cf93fa` (feat)
2. **Task 2: PUT + DELETE /api/websites/[websiteId]/servers/[serverId]** — `b601798` (feat)

## Files Created/Modified

- `src/app/api/websites/[websiteId]/servers/route.ts` — POST handler. Imports `createMcserverSchema`; verifies session, parent Website existence + ownership, validates body, creates MinecraftServer with conditional `port` to preserve Prisma default, returns 201 with full record.
- `src/app/api/websites/[websiteId]/servers/[serverId]/route.ts` — PUT and DELETE handlers. Each verifies session, parent Website ownership, AND that the target MinecraftServer's `websiteId` matches the URL `websiteId` (404 otherwise). PUT validates body via `updateMcserverSchema` and returns the updated record. DELETE removes the record and returns 204 (no body).

## Endpoint Status Code Matrix

| Endpoint                                            | 401 | 404 (website) | 403 | 404 (server) | 400 | Success |
| --------------------------------------------------- | --- | ------------- | --- | ------------ | --- | ------- |
| POST /api/websites/[websiteId]/servers              | yes | yes           | yes | n/a          | yes | 201     |
| PUT /api/websites/[websiteId]/servers/[serverId]    | yes | yes           | yes | yes          | yes | 200     |
| DELETE /api/websites/[websiteId]/servers/[serverId] | yes | yes           | yes | yes          | n/a | 204     |

## Decisions Made

- **Conditional port spread on create** (`...(port !== undefined ? { port } : {})`) — chosen over passing `port` as-is so that omitting it in the request body lets the Prisma `@default(25565)` apply. Passing `undefined` would override the default to null.
- **Double ownership check on PUT/DELETE** — both gates are necessary: parent Website ownership prevents cross-user attacks, `existing.websiteId === websiteId` prevents an authenticated user from mutating a MinecraftServer under a different Website they also own via the wrong URL.
- **DELETE returns 204 empty body** — `new NextResponse(null, { status: 204 })` rather than a JSON envelope, matching D-04 convention. The UI just needs success/failure.

## Deviations from Plan

None — plan executed exactly as written. Both files match the literal content specified in the plan tasks; all acceptance criteria pass.

## Issues Encountered

None. tsc --noEmit clean after Task 1 and again after Task 2.

## User Setup Required

None — no external service configuration required.

## Consumer Status

No client code wires up these endpoints in this plan. The connections-manager UI that consumes them is scheduled for Phase 8 (DASH-03 / 08 phase). The endpoints exist and are reachable, but nothing in the dashboard calls them yet — verified by grepping for `/api/websites/.*/servers` against the dashboard tree before this plan; only the new route files reference the path.

## Threat Surface Review

Both routes are new authenticated mutation endpoints. Threat model coverage:

- **Unauthenticated access** — mitigated (401).
- **Authenticated cross-user mutation** — mitigated by `website.userId !== session.user.id` check returning 403.
- **Authenticated cross-website mutation by same owner** — mitigated by `existing.websiteId !== websiteId` returning 404 (PUT/DELETE).
- **Malformed input / type confusion** — mitigated by zod safeParse against schema from Plan 07-01.
- **Dangling references after delete** — accepted (D-12); renderer in deferred phase handles "No server selected" placeholder.

No new threat flags surfaced beyond what the phase context already documented.

## Next Phase Readiness

- Phase 8 (DASH-03 connections-manager UI) can now POST/PUT/DELETE against these endpoints with no further API work.
- Server-specific section renderers (deferred SECT-02 / SECT-03) can resolve `section.settings.minecraftServerId` via `db.minecraftServer.findUnique` knowing the lifecycle endpoints exist.
- `npx tsc --noEmit` exits clean across the whole project after this plan.

## Self-Check: PASSED

Files verified to exist:

- FOUND: src/app/api/websites/[websiteId]/servers/route.ts
- FOUND: src/app/api/websites/[websiteId]/servers/[serverId]/route.ts

Commits verified in git log:

- FOUND: 4cf93fa (feat(07-03): add POST /api/websites/[websiteId]/servers handler)
- FOUND: b601798 (feat(07-03): add PUT/DELETE handlers for nested MinecraftServer route)

tsc check: `npx tsc --noEmit` exits 0.

---

_Phase: 07-api-layer_
_Completed: 2026-05-12_
