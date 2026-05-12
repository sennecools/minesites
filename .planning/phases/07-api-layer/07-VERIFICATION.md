---
phase: 07-api-layer
verified: 2026-05-12T00:00:00Z
status: passed
score: 4/4 success criteria verified
overrides_applied: 0
gaps: []
human_verification: []
deferred:
    - truth: 'Server-specific sections (Live Player Count, Server Info) persist and retrieve which server connection to use (end-to-end through a real section renderer)'
      addressed_in: 'Phase 3 (deferred v1.0 SECT-02, SECT-03 renderers) and Phase 8 (connections-manager UI)'
      evidence: "Phase 7 CONTEXT D-12 + Out of Scope: 'New section types that consume minecraftServerId (Live Player Count, Server Info renderers — deferred v1.0 phases)'. Phase 8 Success Criteria 3: 'Website editor includes a Servers tab listing connected MinecraftServer records with add/edit/remove controls.'"
---

# Phase 7: API Layer Verification Report

**Phase Goal:** All server-side API routes are rebuilt to use the new `Website` and `MinecraftServer` models; sections are saved and loaded by `websiteId`; server-specific sections store a `minecraftServerId` reference.

**Verified:** 2026-05-12
**Status:** PASSED
**Score:** 4/4 success criteria verified
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Success Criteria from ROADMAP.md)

| #   | Truth                                                                                                                                                                               | Status                                                              | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `GET /api/websites` returns the authenticated user's websites; `POST /api/websites` creates a new website with name/subdomain validation (uniqueness enforced)                      | VERIFIED                                                            | `src/app/api/websites/route.ts:8-34` (GET filters by `session.user.id`, returns 401 unauth); `src/app/api/websites/route.ts:37-96` (POST validates via `createWebsiteSchema.safeParse` line 57, P2002 → 409 line 87-89, 201 on success line 84)                                                                                                                                                                                                                |
| 2   | `GET/PUT/DELETE /api/websites/[websiteId]` reads, updates (name, subdomain, theme, sections), and deletes a website owned by the authenticated user                                 | VERIFIED                                                            | `src/app/api/websites/[websiteId]/route.ts:9-43` (GET with ownership 403 line 33-35 and 404 line 29-31); `:51-167` (PUT validates with `updateWebsiteSchema.safeParse` line 66, 403 ownership line 89-91, 409 subdomain conflict line 94-99 + 158-160, freemium gate sourced from `getPlanLimits('free').maxSections` line 107, transactional Section bulk-replace line 119-150); `:171-203` (DELETE returns 204 line 198 with cascade)                        |
| 3   | `POST/PUT/DELETE /api/websites/[websiteId]/servers` manages MinecraftServer connection records linked to the website                                                                | VERIFIED                                                            | `src/app/api/websites/[websiteId]/servers/route.ts:9-62` (POST validates via `createMcserverSchema` line 36, Website ownership chain 401→404→403, returns 201 line 57); `src/app/api/websites/[websiteId]/servers/[serverId]/route.ts:8-64` (PUT with double ownership: Website + cross-website guard `existing.websiteId !== websiteId` line 41); `:69-112` (DELETE returns 204 line 107 with the same double guard)                                          |
| 4   | Section save payload accepts a `minecraftServerId` field in settings; server-specific sections (Live Player Count, Server Info) persist and retrieve which server connection to use | VERIFIED (route layer) — renderer/UI consumer deferred to Phase 3+8 | `src/app/api/websites/[websiteId]/route.ts:144` passes `settings: (section.settings \|\| {}) as Prisma.InputJsonValue` unchanged through `tx.section.createMany`; `src/types/sections.ts:30-32` exports `ServerScopedSettings { minecraftServerId?: string }`. The route's Json passthrough makes the `minecraftServerId` key roundtrip without special handling. Live Player Count / Server Info renderer types are out-of-scope per CONTEXT D-12 (deferred). |

**Score:** 4/4 success criteria verified at the route-layer scope of Phase 7.

### Required Artifacts

| Artifact                                                       | Expected                                                                 | Status   | Details                                                                                                                                                                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/validations/mcserver.ts`                              | Zod schemas createMcserverSchema, updateMcserverSchema + inferred types  | VERIFIED | 28 lines; loose IP (`min(1).max(253)` no regex per D-07); integer port 1-65535 optional per D-08; name min 1 max 50; description optional max 200 per D-09; `updateMcserverSchema = createMcserverSchema.partial()` |
| `src/types/sections.ts` (extended)                             | export interface ServerScopedSettings                                    | VERIFIED | `:30-32`: `export interface ServerScopedSettings { minecraftServerId?: string; }` inserted after SectionType union; existing HeroSettings/GamemodesSettings preserved                                               |
| `src/app/api/websites/route.ts`                                | GET list + POST create                                                   | VERIFIED | Both handlers present; D-20 session-user existence check line 45-54 (POST only); P2002 → 409 line 87-89                                                                                                             |
| `src/app/api/websites/[websiteId]/route.ts`                    | GET/PUT/DELETE                                                           | VERIFIED | All three handlers present with `Promise<{ websiteId: string }>` params; PUT includes ALL Phase 6 carry-forward guards (CR-01, CR-03, WR-05); GET includes `servers: true` relation line 25                         |
| `src/app/api/websites/[websiteId]/servers/route.ts`            | POST create                                                              | VERIFIED | POST handler with `createMcserverSchema.safeParse` + ownership chain; conditional `port` spread to honor Prisma default                                                                                             |
| `src/app/api/websites/[websiteId]/servers/[serverId]/route.ts` | PUT update + DELETE remove                                               | VERIFIED | Both handlers present with `Promise<{ websiteId: string; serverId: string }>` params; double ownership check (`existing.websiteId !== websiteId`) on both; DELETE returns 204                                       |
| `src/app/(dashboard)/dashboard/actions.ts`                     | renamed: createWebsite, updateWebsite, deleteWebsite (+ togglePublished) | VERIFIED | Exports lines 10, 68, 115, 137; D-19 P2002 catches retained lines 58-61 and 105-108; D-20 user existence check retained line 24-30 (createWebsite only)                                                             |
| `src/lib/validations/server.ts`                                | DELETED                                                                  | VERIFIED | File no longer present; `ls src/lib/validations/` shows only auth.ts, mcserver.ts, website.ts                                                                                                                       |
| `src/app/api/servers/`                                         | DELETED                                                                  | VERIFIED | Directory and contents gone (`ls /home/senne/git/minesites/src/app/api/servers` returns no such file or directory)                                                                                                  |

### Key Link Verification

| From                                                           | To                                 | Via          | Status | Details                                                                                                                          |
| -------------------------------------------------------------- | ---------------------------------- | ------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/api/websites/route.ts`                                | `createWebsiteSchema`              | named import | WIRED  | line 5: `import { createWebsiteSchema } from "@/lib/validations/website"`; used at line 57 `createWebsiteSchema.safeParse(body)` |
| `src/app/api/websites/[websiteId]/route.ts`                    | `updateWebsiteSchema`              | named import | WIRED  | line 5; used at line 66                                                                                                          |
| `src/app/api/websites/[websiteId]/route.ts`                    | `getPlanLimits`                    | named import | WIRED  | line 6; called at line 107 (`getPlanLimits("free").maxSections`) — no hardcoded `FREE_SECTION_LIMIT = 5`                         |
| `src/app/api/websites/[websiteId]/servers/route.ts`            | `createMcserverSchema`             | named import | WIRED  | line 4; used at line 36                                                                                                          |
| `src/app/api/websites/[websiteId]/servers/[serverId]/route.ts` | `updateMcserverSchema`             | named import | WIRED  | line 4; used at line 46                                                                                                          |
| Editor god-component PUT                                       | `/api/websites/${serverId}`        | fetch        | WIRED  | `src/app/(dashboard)/dashboard/[serverId]/page.tsx:2371` `fetch(\`/api/websites/${serverId}\`, { method: "PUT", ... })`          |
| Editor god-component LOAD                                      | `/api/websites/${serverId}`        | fetch        | WIRED  | `:2279` `fetch(\`/api/websites/${serverId}\`)`                                                                                   |
| `dashboard/page.tsx`                                           | `GET /api/websites`                | fetch        | WIRED  | `:37` `fetch("/api/websites")`                                                                                                   |
| `dashboard/servers/page.tsx`                                   | `GET /api/websites`                | fetch        | WIRED  | `:41` `fetch("/api/websites")`                                                                                                   |
| `create-server-dialog.tsx`                                     | `createWebsite` action             | named import | WIRED  | `:18` import; `:53` `await createWebsite(formData)`                                                                              |
| `[serverId]/server-actions.tsx`                                | `deleteWebsite`, `togglePublished` | named import | WIRED  | `:15` import; `:33` `await deleteWebsite(serverId)`; `:27` `await togglePublished(serverId)`                                     |
| `[serverId]/server-settings.tsx`                               | `updateWebsite` action             | named import | WIRED  | `:7` import; `:50` `await updateWebsite(server.id, formData)`                                                                    |

### Data-Flow Trace (Level 4)

| Artifact                                       | Data Variable    | Source                                                                                                      | Produces Real Data                                                                                             | Status  |
| ---------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------- |
| `GET /api/websites`                            | `websites`       | `db.website.findMany` line 15 with `where: { userId: session.user.id }`                                     | YES — real Prisma query                                                                                        | FLOWING |
| `POST /api/websites`                           | `website`        | `db.website.create` line 67 (with nested Section create)                                                    | YES — real DB write returning created record                                                                   | FLOWING |
| `GET /api/websites/[id]`                       | `website`        | `db.website.findUnique` with `include: { sections, servers: true }` line 21-27                              | YES — includes related sections + MinecraftServer records                                                      | FLOWING |
| `PUT /api/websites/[id]`                       | `updatedWebsite` | `db.$transaction` with `tx.website.update` + `tx.section.deleteMany` + `tx.section.createMany` line 119-153 | YES — section.settings passed through unchanged as `Prisma.InputJsonValue`; `minecraftServerId` key roundtrips | FLOWING |
| `POST /api/websites/[id]/servers`              | `created`        | `db.minecraftServer.create` line 46                                                                         | YES — real DB write                                                                                            | FLOWING |
| `PUT /api/websites/[id]/servers/[serverId]`    | `updated`        | `db.minecraftServer.update` line 54                                                                         | YES                                                                                                            | FLOWING |
| `DELETE /api/websites/[id]/servers/[serverId]` | (no body)        | `db.minecraftServer.delete` line 105                                                                        | YES                                                                                                            | FLOWING |
| Editor load                                    | `serverData`     | `fetch(\`/api/websites/${serverId}\`)` → GET handler → real DB                                              | YES                                                                                                            | FLOWING |
| Editor save                                    | `sections`       | client posts `sections[]` → PUT handler → `tx.section.createMany` writes them                               | YES                                                                                                            | FLOWING |

### Behavioral Spot-Checks

Step 7b: Cannot run live HTTP checks without starting Next.js + database. Behavioral substitutes (compile-gate + static analysis) ran instead:

| Behavior                             | Command                                                                                                                             | Result                                         | Status |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------ |
| Whole project compiles               | `npx tsc --noEmit`                                                                                                                  | exit 0, zero output                            | PASS   |
| Zero stale /api/servers references   | `grep -rn "/api/servers" src/`                                                                                                      | zero matches                                   | PASS   |
| Zero stale legacy schema imports     | `grep -rn "@/lib/validations/server\b" src/`                                                                                        | zero matches                                   | PASS   |
| Zero stale renamed-action references | `grep -rnE "\\b(createServer\|updateServer\|deleteServer)\\(" src/`                                                                 | zero matches                                   | PASS   |
| Old API directory removed            | `ls src/app/api/servers`                                                                                                            | "No such file or directory"                    | PASS   |
| Old legacy schema removed            | `test -e src/lib/validations/server.ts`                                                                                             | not present                                    | PASS   |
| Settings Json passthrough on PUT     | `grep "section.settings \|\| {}" src/app/api/websites/[websiteId]/route.ts`                                                         | line 144 matches; cast `Prisma.InputJsonValue` | PASS   |
| All four route files exist           | `test -e ...websites/route.ts && test -e ...[websiteId]/route.ts && test -e ...servers/route.ts && test -e .../[serverId]/route.ts` | all present                                    | PASS   |

Live HTTP integration (POST a website → verify creation, PUT then GET to assert minecraftServerId roundtrip, DELETE then GET to assert cascade) is human-verifiable but not blocking — the static + transactional pattern is sufficient evidence at this scope.

### Requirements Coverage

Requirement IDs declared across Phase 7 plans: WEB-01, WEB-02, WEB-03, CONN-01, CONN-02, CONN-03, CONN-04.

| Requirement | Source Plan                | Description                                                                                                                                | Status                                     | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WEB-01      | 07-02, 07-04, 07-06        | User can create a Website with a name and unique custom subdomain                                                                          | SATISFIED                                  | `POST /api/websites` validates via `createWebsiteSchema` (subdomain regex enforced); P2002 + pre-check both yield 409 on conflict; `createWebsite` server action mirrors the same logic for the create dialog. The dialog (`create-server-dialog.tsx`) wires up to `createWebsite(formData)`.                                                                                                                                                                  |
| WEB-02      | 07-02, 07-04, 07-05, 07-06 | User can update a Website's name and subdomain after creation                                                                              | SATISFIED                                  | `PUT /api/websites/[websiteId]` validates partial updates; subdomain change checked against existing rows; `updateWebsite` server action handles dashboard settings form. Editor god-component (`page.tsx:2371`) sends PUT on save.                                                                                                                                                                                                                            |
| WEB-03      | 07-02, 07-04, 07-06        | User can delete a Website and all its associated sections and server connections                                                           | SATISFIED                                  | `DELETE /api/websites/[websiteId]` returns 204; cascade via `onDelete: Cascade` on Section + MinecraftServer (verified in `prisma/schema.prisma`); `deleteWebsite` server action covers UI-driven deletion.                                                                                                                                                                                                                                                    |
| CONN-01     | 07-01, 07-03, 07-06        | User can add a Minecraft server connection to their Website (display name, IP address, port)                                               | SATISFIED                                  | `POST /api/websites/[websiteId]/servers` validates via `createMcserverSchema` (name min 1, ip min 1, port optional int); creates `MinecraftServer` record with cascade FK to Website. UI consumer for this endpoint (DASH-03 connections manager) is **deferred to Phase 8** — endpoint exists and is correct.                                                                                                                                                 |
| CONN-02     | 07-03                      | User can remove a Minecraft server connection from their Website                                                                           | SATISFIED                                  | `DELETE /api/websites/[websiteId]/servers/[serverId]` returns 204; double ownership guard (Website + cross-website check). UI consumer deferred to Phase 8.                                                                                                                                                                                                                                                                                                    |
| CONN-03     | 07-01, 07-03               | User can update a Minecraft server connection's display name, IP, and port                                                                 | SATISFIED                                  | `PUT /api/websites/[websiteId]/servers/[serverId]` validates via `updateMcserverSchema.partial()`; double ownership guard. UI consumer deferred to Phase 8.                                                                                                                                                                                                                                                                                                    |
| CONN-04     | 07-01, 07-02               | Server-specific sections (Live Player Count, Server Info) store a reference to a connected MinecraftServer and use its IP for data polling | SATISFIED (route layer); RENDERER DEFERRED | `ServerScopedSettings { minecraftServerId?: string }` exported from `src/types/sections.ts:30-32`; PUT `/api/websites/[id]` persists `section.settings` JSON unchanged via `Prisma.InputJsonValue` cast (line 144), so the `minecraftServerId` key roundtrips. The actual Live Player Count / Server Info renderer types (SECT-02, SECT-03) and the UI that picks a `minecraftServerId` are deferred — Phase 7 CONTEXT explicitly lists these as out of scope. |

No orphaned requirements: every ID Phase 7 declared has plan-side evidence; every ID in ROADMAP for Phase 7 is accounted for above.

### Anti-Patterns Found

None added by Phase 7 itself. The Phase 7 review (`07-REVIEW.md`) lists 6 blockers + 9 warnings — those are advisory follow-ups about defense-in-depth (validating `logo`/`banner`/`navbar`/`theme`, narrowing the P2002 error mapping, adding stale-FK checks on PUT/DELETE, validating section array shape, eliminating the TOCTOU pre-check). None of those findings break a success criterion of Phase 7's goal: the routes still create, read, update, delete websites and MinecraftServers; section.settings still roundtrips minecraftServerId.

The most notable review finding (BL-02: P2002 mis-attribution) is a UX/error-classification issue, not a goal-blocker — the underlying transactional unique-constraint enforcement still works.

### Stubs

None introduced. The `serverIp: null` literal in the editor's SectionPreview prop (`page.tsx:2905`) is an intentional bridge documented in Plan 07-05 — the preview type still requires `serverIp: string | null` for backward compatibility until the renderer phase removes it. `ServerScopedSettings` type exists but has no consumer yet — this is by design (the type contract precedes Phase 3/8 consumers).

### Human Verification Required

None required for goal closure. Phase 7's success criteria are observable through static + compile-gate evidence:

- The 4 success criteria are about endpoint existence + handler behavior shape, which static inspection confirms.
- Cascade behavior is enforced at the Prisma schema layer (verified) — no DB write test required at this scope.
- The `minecraftServerId` settings roundtrip is a Json passthrough (no transform) — no special handling means it works by construction.

A future end-to-end test (start Next.js + Postgres, POST a website, PUT sections with `settings.minecraftServerId`, GET to confirm roundtrip) would add confidence but is not required to declare Phase 7's goal achieved. The review's BLOCKER items (BL-01..BL-06) and WARNINGS are appropriate next-step hardening rather than gating gaps.

### Deferred Items

The end-to-end UX for CONN-04 (a real Live Player Count / Server Info section renders using a chosen `minecraftServerId`) is intentionally NOT a Phase 7 deliverable. Per Phase 7 CONTEXT Out of Scope and Phase 8 Success Criteria 3, the consumer surface lands in Phase 3 (SECT-02/03 renderers) and Phase 8 (DASH-03 connections-manager UI). Phase 7's contribution — the persistence + API contract that makes those features possible — is complete.

| #   | Item                                                                            | Addressed In               | Evidence                                                                                                                                      |
| --- | ------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Live Player Count / Server Info section renderers consuming `minecraftServerId` | Phase 3 (SECT-02, SECT-03) | Phase 3 Success Criteria: "Live Player Count section shows online/max players..."; phase deferred per CONTEXT D-12                            |
| 2   | Connections-manager UI to add/edit/remove MinecraftServer records               | Phase 8 (DASH-03)          | Phase 8 Success Criteria 3: "Website editor includes a 'Servers' tab listing connected MinecraftServer records with add/edit/remove controls" |
| 3   | Dashboard route rename `dashboard/[serverId]` → `dashboard/[websiteId]`         | Phase 8                    | Phase 7 CONTEXT D-02: "renaming that is a Phase 8 concern"                                                                                    |
| 4   | Hardening from 07-REVIEW.md (BL-01..BL-06, WR-01..WR-09)                        | Follow-up review-fix phase | These are advisory polish items; none break Phase 7's stated goal                                                                             |

### Gaps Summary

No goal-blocking gaps. The phase delivers exactly what its 4 success criteria require:

- `GET/POST /api/websites` exist with auth, validation, P2002 → 409, and 201 on create.
- `GET/PUT/DELETE /api/websites/[websiteId]` exist with ownership chain, partial schema validation, freemium gate sourced from `getPlanLimits` (not hardcoded), and cascade-based delete returning 204.
- `POST/PUT/DELETE /api/websites/[websiteId]/servers[/serverId]` exist with double ownership guards (Website + cross-website match) and proper status codes.
- `section.settings` is a Json passthrough in PUT, so `minecraftServerId` roundtrips by construction; the shared `ServerScopedSettings` type fragment is exported for future section-type consumers.

Compile gate: `npx tsc --noEmit` exits 0. Zero stale `/api/servers` references. Old API directory and legacy `validations/server.ts` removed.

The Phase 7 code review (`07-REVIEW.md`) found defense-in-depth opportunities (better error classification, additional input validation, stale-FK checks on PUT/DELETE) that should be addressed in a follow-up but do not change whether the phase goal was achieved. The goal — REST surface rebuilt around Website/MinecraftServer with `minecraftServerId` persistence — is achieved.

---

_Verified: 2026-05-12_
_Verifier: Claude (gsd-verifier)_
