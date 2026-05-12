---
phase: 07-api-layer
plan: 02
subsystem: api
tags: [next-app-router, prisma, zod, nextauth, freemium, validation]

requires:
    - phase: 01-foundation
      provides: getPlanLimits() utility used for freemium gating in PUT
    - phase: 06-schema-reset
      provides: Website / Section / MinecraftServer schema with onDelete:Cascade; review-fix guards (CR-01, CR-03, WR-05)
    - phase: 07-api-layer (plan 07-01)
      provides: createWebsiteSchema, updateWebsiteSchema (no serverIp/serverPort)

provides:
    - GET /api/websites — list authenticated user's websites
    - POST /api/websites — create Website + default Hero section, 201 on success, 409 on subdomain conflict, 401 with "Session expired" if DB user missing
    - GET /api/websites/[websiteId] — read website with sections + servers relation, 404/403/200
    - PUT /api/websites/[websiteId] — update website + bulk-replace sections; carry-forwards CR-01, CR-03, WR-05
    - DELETE /api/websites/[websiteId] — hard delete (cascade Section + MinecraftServer), 204 on success
    - Canonical convention: section.settings is a passthrough JSON; minecraftServerId persists unchanged
affects:
    - phase 07-api-layer plan 03 (servers nested CRUD will share ownership pattern)
    - phase 07-api-layer plan 04+05 (client fetch sites point at /api/websites)
    - phase 07-api-layer plan 06 (deletes legacy /api/servers/ once consumers migrate)
    - phase 08 (connections-manager + dashboard route rename)

tech-stack:
    added: []
    patterns:
        - 'Named route exports (GET/POST/PUT/DELETE) with `params: Promise<{ websiteId: string }>` Next 16 signature'
        - 'Ownership check via `findUnique({ select: { userId: true } })` before any mutation; 403 on mismatch'
        - 'Zod `safeParse` returning 400 with `error.flatten()` on invalid body'
        - 'Prisma P2002 catch wraps the unique-constraint mutation; returns 409 with friendly message'
        - "Freemium section limit sourced from `getPlanLimits('free').maxSections` — never hardcoded in the route"
        - 'section.settings JSON is passed through verbatim in tx.section.createMany → top-level keys (minecraftServerId) roundtrip without code changes'

key-files:
    created:
        - src/app/api/websites/route.ts
        - src/app/api/websites/[websiteId]/route.ts
    modified: []

key-decisions:
    - "Default 'Hero' section is auto-created on POST /api/websites (mirrors current createServer action behavior so the editor opens with a starting section)"
    - "PUT freemium gate treats both user.plan === 'pro' AND user.plan === 'paid' as bypassing the limit — defensive coverage because schema default is 'free' but historic code paths use 'pro' while getPlanLimits accepts 'paid'"
    - 'GET /api/websites/[websiteId] includes the `servers` relation so the editor and future Phase 8 connections-manager get MinecraftServers in a single round-trip'
    - 'DELETE returns 204 (no body) per D-04 spec; cascade rules on the schema do the Section + MinecraftServer cleanup automatically'
    - 'Old /api/servers/* is intentionally NOT deleted in this plan; Plan 07-06 removes it after consumers migrate'

patterns-established:
    - 'Carry-forward guards from Phase 6 are pinned by canonical IDs (CR-01, CR-03, WR-05) and re-cited in route comments to prevent future regressions'
    - 'Freemium limits source from src/lib/plan.ts — no magic numbers in API handlers'

requirements-completed: [WEB-01, WEB-02, WEB-03, CONN-04]

duration: 2min
completed: 2026-05-12
---

# Phase 07 Plan 02: API Layer — /api/websites CRUD Summary

**New /api/websites and /api/websites/[websiteId] routes ship full GET/POST/PUT/DELETE coverage with all Phase 6 review-fix guards (CR-01 subdomain validation+409, CR-03 freemium gate sourced from getPlanLimits, WR-05 P2002 catch) carried forward verbatim, and section.settings JSON passing through unchanged so minecraftServerId roundtrips without route-level handling.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-05-12T13:01:22Z
- **Completed:** 2026-05-12T13:03:37Z
- **Tasks:** 2
- **Files modified:** 2 (both newly created)

## Accomplishments

- Created `src/app/api/websites/route.ts` with GET (list) and POST (create) handlers; POST includes the D-20 session-user existence check, default Hero section creation, and the D-19 P2002 → 409 catch.
- Created `src/app/api/websites/[websiteId]/route.ts` with GET / PUT / DELETE handlers using the canonical Next 16 `params: Promise<{ websiteId: string }>` signature.
- Carried forward every Phase 6 review-fix guard textually: updateWebsiteSchema.safeParse + subdomain 409, getPlanLimits-sourced freemium gate, P2002 catch around the transactional update.
- GET includes the `servers` relation so the editor/connections-manager fetch the website + MinecraftServers in one trip.
- DELETE returns 204 and relies on schema-level cascade for Section + MinecraftServer cleanup.

## Final Endpoint Inventory

| Method | Path                      | Success           | Error responses                                                                                        |
| ------ | ------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| GET    | /api/websites             | 200 (Website[])   | 401 unauth · 500 server error                                                                          |
| POST   | /api/websites             | 201 (Website)     | 400 invalid · 401 unauth / session expired · 409 subdomain conflict · 500 error                        |
| GET    | /api/websites/[websiteId] | 200 (Website+rel) | 401 unauth · 403 ownership · 404 not-found · 500 error                                                 |
| PUT    | /api/websites/[websiteId] | 200 (Website)     | 400 invalid · 401 unauth · 403 ownership/freemium · 404 not-found · 409 subdomain conflict · 500 error |
| DELETE | /api/websites/[websiteId] | 204               | 401 unauth · 403 ownership · 404 not-found · 500 error                                                 |

## Carry-Forward Guards (confirmed present)

| Phase 6 fix                                                             | Decision | Location                                                                                                                                                                                    |
| ----------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ------------------------------------------------------------------------------------------ |
| CR-01 (subdomain validation + 409)                                      | D-17     | `src/app/api/websites/[websiteId]/route.ts:66` (updateWebsiteSchema.safeParse); `:97` and `:159` (409 "Subdomain is already taken")                                                         |
| CR-03 (freemium gate, no hardcoded constant)                            | D-18     | `src/app/api/websites/[websiteId]/route.ts:6` (import getPlanLimits); `:107` (`getPlanLimits("free").maxSections`) — explicit grep confirms no `FREE_SECTION_LIMIT = 5` literal in the file |
| WR-05 (P2002 catch on subdomain unique constraint)                      | D-19     | `src/app/api/websites/route.ts:87` (POST create); `src/app/api/websites/[websiteId]/route.ts:158` (PUT transactional update — TOCTOU race coverage)                                         |
| D-20 (session-user existence check)                                     | —        | `src/app/api/websites/route.ts:45-52` ("Session expired. Please sign out and sign back in.")                                                                                                |
| D-21 (section.settings is canonical home; minecraftServerId roundtrips) | —        | `src/app/api/websites/[websiteId]/route.ts:144` (`settings: (section.settings                                                                                                               |     | {}) as Prisma.InputJsonValue`) — unchanged passthrough inside `tx.section.createMany.data` |

## Task Commits

1. **Task 1: Create `src/app/api/websites/route.ts` (GET list + POST create)** — `1f31039` (feat)
2. **Task 2: Create `src/app/api/websites/[websiteId]/route.ts` (GET/PUT/DELETE)** — `18a5737` (feat)

## Files Created/Modified

- `src/app/api/websites/route.ts` — new GET (list user's websites) + POST (create with default Hero section, P2002 → 409, session-user existence guard)
- `src/app/api/websites/[websiteId]/route.ts` — new GET (with sections+servers), PUT (carry-forward CR-01/CR-03/WR-05; section.settings passthrough), DELETE (cascade, 204)

## TypeScript Verification

`npx tsc --noEmit` ran with no errors across the project after both tasks were committed. Per-file post-task tsc spot-checks also showed zero errors on each new file.

## Decisions Made

- POST creates a default Hero section (parity with the existing `createServer` server action so the editor opens with content).
- PUT freemium gate guards against both `user.plan === 'pro'` and `user.plan === 'paid'` — historically the schema default is `'free'` and prior code used `'pro'`, while `getPlanLimits` accepts `'paid'`. Covering both prevents regression no matter which token the seed/admin path uses.
- GET on the per-website route eagerly includes the `servers` relation. The editor/connections-manager flows in later plans need both shapes; combining them in one trip is the simpler API contract.
- DELETE relies entirely on schema-level cascade (`onDelete: Cascade` on Section + MinecraftServer). No manual cleanup needed; matches D-06.

## Deviations from Plan

None — plan executed exactly as written. Both files match the literal content blocks specified in `<action>`, and all `<acceptance_criteria>` grep checks plus the negative check (no hardcoded `FREE_SECTION_LIMIT = 5`) pass. `npx tsc --noEmit` is clean.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 07-03 (MinecraftServer per-record CRUD nested under `/api/websites/[websiteId]/servers`) can reuse the ownership-check pattern (`findUnique({ select: { userId: true } })`) established here.
- Plans 07-04 and 07-05 (client fetch migration) can now target `/api/websites/*`; both new endpoints are live alongside the legacy `/api/servers/*` routes, so the cutover is non-breaking.
- Plan 07-06 will delete `src/app/api/servers/` once all client call sites are migrated. This plan intentionally leaves the old directory in place.
- Phase 8 connections-manager will benefit from `GET /api/websites/[websiteId]` already including the `servers` relation.

## Self-Check: PASSED

Files confirmed:

- FOUND: `src/app/api/websites/route.ts`
- FOUND: `src/app/api/websites/[websiteId]/route.ts`

Commits confirmed (`git log --oneline --all | grep <hash>`):

- FOUND: `1f31039` feat(07-02): add /api/websites GET list and POST create handlers
- FOUND: `18a5737` feat(07-02): add /api/websites/[websiteId] GET, PUT, and DELETE handlers

Plan-level success criteria:

- POST creates a Website with default Hero section, returns 201, 409 on duplicate subdomain — PASSED
- PUT preserves CR-01, CR-03, WR-05 guards; persists section.settings unchanged including minecraftServerId — PASSED
- DELETE returns 204 with cascade-based cleanup — PASSED
- Freemium limit sourced from `getPlanLimits('free').maxSections` (no hardcoded constant) — PASSED

---

_Phase: 07-api-layer_
_Completed: 2026-05-12_
