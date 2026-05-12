# Phase 7: API Layer - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild the HTTP API surface around the v1.1 data model: `/api/servers/*` routes are renamed and reshaped into `/api/websites/[websiteId]/*`; full per-record CRUD for `MinecraftServer` connections is added under each website; and section save/load accepts a `minecraftServerId` reference inside `settings` so server-specific section types (Live Player Count, Server Info) know which connected Minecraft server to poll.

**In scope:**
- Hard rename: `src/app/api/servers/[serverId]/` → `src/app/api/websites/[websiteId]/`; old route directory deleted.
- New nested endpoints: `POST /api/websites/[id]/servers`, `PUT /api/websites/[id]/servers/[serverId]`, `DELETE /api/websites/[id]/servers/[serverId]` — per-record CRUD for `MinecraftServer`.
- New validation schema for `MinecraftServer` (e.g. `src/lib/validations/mcserver.ts`) — loose string IP, integer port 1–65535, name + optional description.
- Section save path in `PUT /api/websites/[id]` accepts and persists `settings.minecraftServerId` as a top-level key on any section type's settings JSON.
- Update **every** client fetch call (dashboard `page.tsx`, dashboard `[serverId]/page.tsx` editor, `actions.ts`, anywhere else) to point at the new URLs.
- Rename server actions: `createServer` → `createWebsite`, `updateServer` → `updateWebsite`, `deleteServer` → `deleteWebsite` in `src/app/(dashboard)/dashboard/actions.ts`, plus update call sites (dialog).
- Delete `src/lib/validations/server.ts` (legacy schema with `serverIp`/`serverPort`).
- Remove unused `serverIp`/`serverPort` fields from the editor's local `WebsiteData` state and any leftover UI inputs.

**Out of scope:**
- Dashboard route rename `dashboard/[serverId]` → `dashboard/[websiteId]` (Phase 8).
- Connections-manager tab UI for adding/editing MinecraftServer records (Phase 8 — the API endpoints exist after Phase 7, the UI consumes them in Phase 8).
- New section types that consume `minecraftServerId` (Live Player Count, Server Info renderers — deferred v1.0 phases).
- Public site renderer changes for `minecraftServerId`-aware sections (deferred).
- Migrating any production data — none exists.

</domain>

<decisions>
## Implementation Decisions

### Route Migration
- **D-01: Hard rename in Phase 7.** Move `src/app/api/servers/[serverId]/` to `src/app/api/websites/[websiteId]/`; move `src/app/api/servers/route.ts` to `src/app/api/websites/route.ts`. Delete the old `src/app/api/servers/` directory entirely — no duplicate routes. Phase 7 ships in a working state (editor + dashboard fetch the new URLs successfully).
- **D-02: Route param name is `[websiteId]`** in the new API route paths (matches the model name). Note: the dashboard route `(dashboard)/dashboard/[serverId]` keeps its current param name for Phase 7 — renaming that is a Phase 8 concern. Fetch calls from the dashboard route will look like `fetch(\`/api/websites/${serverId}\`)` — passing the same id under a different name is fine.
- **D-03: Update every client fetch call** as part of this phase: dashboard list page, dashboard editor god-component, `actions.ts` if it does any fetches, public `[subdomain]` routes if they call APIs, etc. The planner does a grep for `"/api/servers"` and updates every hit.

### MinecraftServer Endpoint Shape
- **D-04: Per-record CRUD.** Three endpoints under each website:
  - `POST /api/websites/[websiteId]/servers` — body `{ name, ip, port?, description? }`; creates one record; returns 201 with the full record.
  - `PUT /api/websites/[websiteId]/servers/[serverId]` — body partial of the same shape; updates one record; returns the updated record.
  - `DELETE /api/websites/[websiteId]/servers/[serverId]` — removes one record; returns 204 (or the deleted record).
- **D-05: Ownership enforcement.** Every endpoint first verifies the authenticated user owns the parent `Website` via `db.website.findUnique({ where: { id: websiteId }, select: { userId: true } })` and returns 403 on mismatch. Mirrors the existing pattern in the website PUT route.
- **D-06: Cascade on website delete is automatic.** `MinecraftServer` has `onDelete: Cascade` to `Website` in the schema; `DELETE /api/websites/[id]` doesn't need manual server cleanup.

### MinecraftServer Validation
- **D-07: Loose IP validation.** The `ip` field is `z.string().min(1).max(253)` (DNS hostname max). Accepts hostnames (`play.example.com`), IPv4, IPv6, even embedded `:port`. mcstatus.io rejects garbage at poll time. No regex.
- **D-08: Port is a separate integer** `z.number().int().min(1).max(65535)`, default `25565` at the Prisma layer. Not validated to be free of conflict with anything else.
- **D-09: Name and description fields.** `name: z.string().min(1).max(50)`, `description: z.string().max(200).optional()` — planner can fine-tune limits but the shape is set.

### Section.settings.minecraftServerId Convention
- **D-10: Top-level key.** Server-specific section types (Live Player Count, Server Info, and any future server-scoped types) store their reference as `settings.minecraftServerId: string | undefined` at the top of the settings object — not nested under a per-type key.
- **D-11: Type definition.** A shared TypeScript interface fragment captures the convention so future section settings interfaces can extend or include it. Concrete shape decided by the planner — e.g. `interface ServerScopedSettings { minecraftServerId?: string }`. The PUT route persists this field unchanged inside `settings`; no special handling.
- **D-12: Soft references — no enforcement.** When a `MinecraftServer` is deleted, sections referencing its id are left as-is. Dangling references are handled at render time (a future renderer concern in deferred v1.0 phases) — the section displays a "No server selected" placeholder. The Phase 7 API does NOT scan-and-nullify on delete and does NOT block delete on inbound references.

### Legacy Cleanup
- **D-13: Delete `src/lib/validations/server.ts`** entirely. The legacy `createServerSchema` / `updateServerSchema` with `serverIp` + `serverPort` is unused once `/api/servers/*` is gone. Grep the codebase for any remaining import of `@/lib/validations/server` and update or remove.
- **D-14: Rename server actions in `actions.ts`:** `createServer` → `createWebsite`, `updateServer` → `updateWebsite`, `deleteServer` → `deleteWebsite`. Update call sites: `create-server-dialog.tsx` (and any other importer). The dialog filename itself is NOT renamed in Phase 7 — that's part of the Phase 8 editor rewrite.
- **D-15: Drop `serverIp` / `serverPort` from editor state.** In the dashboard editor god-component (`dashboard/[serverId]/page.tsx`), remove `serverIp` and `serverPort` from the local `WebsiteData` interface and any local state shape. Remove the corresponding form inputs (if any are still rendered). The fields are already not sent in PUT (WR-01); this finishes the cleanup. If touching the god-component poses risk, the planner can split this into a dedicated narrow plan so it doesn't entangle with API work.
- **D-16: Validation alignment.** `src/lib/validations/website.ts` already lacks `serverIp`/`serverPort` — no change needed there. Confirm before deleting `server.ts` that nothing imports `createServerSchema`/`updateServerSchema`/`CreateServerInput`/`UpdateServerInput`.

### Carry-Forward from Phase 6 (do not regress)
- **D-17: Subdomain uniqueness and schema validation in PUT** (CR-01 fix, commit `9276714`) must remain — body parsed via `updateWebsiteSchema.safeParse`, 409 on subdomain conflict, 403 on ownership mismatch.
- **D-18: Freemium section limit in PUT** (CR-03 fix) must remain — checks `user.plan !== "pro"` against `FREE_SECTION_LIMIT = 5` before accepting a section payload. The limit constant should be sourced from `src/lib/plan.ts` if possible (Phase 1 introduced `getPlanLimits()`) — confirm at planning time.
- **D-19: P2002 unique-constraint catch in `actions.ts`** (WR-05 fix) must remain — `db.website.create` and `db.website.update` are wrapped in try/catch that detects `PrismaClientKnownRequestError` with code `P2002` and throws `"Subdomain is already taken"`.
- **D-20: Session user existence check in `createWebsite` action** (recent commit `ef51d4a`) must remain — verify the session user exists in the DB before creating a Website.
- **D-21: `Section.settings` is the canonical home** for section content (Phase 6 D-05). Section-level `title`/`subtitle` columns are legacy; new fields like `minecraftServerId` go in `settings`, not as schema columns.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Definition
- `.planning/ROADMAP.md` §Phase 7 — Success criteria (4 numbered items), goal, requirements list
- `.planning/REQUIREMENTS.md` §WEB-01, WEB-02, WEB-03, CONN-01, CONN-02, CONN-03, CONN-04 — what these endpoints must enable

### Prior Phase Context
- `.planning/phases/06-schema-reset/06-CONTEXT.md` — Phase 6 schema decisions; section.settings is canonical home, onDelete:Cascade everywhere
- `.planning/phases/06-schema-reset/06-REVIEW-FIX.md` — fixes that must not regress (CR-01 subdomain validation, CR-03 freemium enforcement, WR-05 P2002 catch)

### Current Schema (input to all routes)
- `prisma/schema.prisma` — Website, MinecraftServer, Section, User models; FK relations and cascade rules

### Current Validation Schemas
- `src/lib/validations/website.ts` — keep, already aligned (no serverIp/serverPort)
- `src/lib/validations/server.ts` — DELETE in this phase
- New: `src/lib/validations/mcserver.ts` (or equivalent) — to be created

### Current API Routes (to be renamed/rewritten)
- `src/app/api/servers/route.ts` — GET list (already uses db.website); becomes `src/app/api/websites/route.ts`
- `src/app/api/servers/[serverId]/route.ts` — GET/PUT (already uses db.website); becomes `src/app/api/websites/[websiteId]/route.ts`; needs new DELETE handler too
- New: `src/app/api/websites/[websiteId]/servers/route.ts` — POST
- New: `src/app/api/websites/[websiteId]/servers/[serverId]/route.ts` — PUT, DELETE

### Client Fetch Call Sites (must update)
- `src/app/(dashboard)/dashboard/page.tsx` — calls `/api/servers` (list)
- `src/app/(dashboard)/dashboard/servers/page.tsx` — calls `/api/servers` (list)
- `src/app/(dashboard)/dashboard/[serverId]/page.tsx` — calls `/api/servers/[serverId]` (load + save)
- `src/app/(dashboard)/dashboard/actions.ts` — server actions; do NOT call fetch but DO call `db.website` directly; rename the exported actions per D-14
- `src/app/(dashboard)/dashboard/create-server-dialog.tsx` — imports `createServer` action; update import to `createWebsite`
- Grep `"/api/servers"` across the project to catch any other call sites

### Plan Limits Source
- `src/lib/plan.ts` — `getPlanLimits()` from Phase 1; planner should source `FREE_SECTION_LIMIT` from here instead of hardcoding in the route (carry-forward D-18)

### Architecture Context
- `.planning/codebase/ARCHITECTURE.md` — app structure
- `.planning/codebase/CONVENTIONS.md` — Next.js API route patterns
- `.planning/codebase/INTEGRATIONS.md` — external services touched

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/auth.ts` — `auth()` helper used by every API route for session retrieval; reuse pattern.
- `src/lib/db.ts` — Prisma client singleton; all routes use `db.<model>.*`.
- `src/lib/validations/website.ts` — `createWebsiteSchema` and `updateWebsiteSchema` (partial); both already used by routes and actions.
- `src/lib/plan.ts` — plan-limit helper for freemium gating (introduced Phase 1).
- The existing `src/app/api/servers/[serverId]/route.ts` PUT handler is a near-complete template: validates body with zod, checks ownership via select query, runs in `db.$transaction`, returns NextResponse JSON. The new website route reuses this skeleton.

### Established Patterns
- API route file structure: named exports `GET`, `PUT`, `POST`, `DELETE` taking `(request: NextRequest, { params }: { params: Promise<{ ... }> })`.
- Ownership check: `findUnique({ where: { id }, select: { userId: true } })` then compare to `session.user.id`. 403 on mismatch.
- Body validation: `schema.safeParse(body)` → 400 with `parseResult.error.flatten()` on failure.
- Unique-constraint conflicts: catch `PrismaClientKnownRequestError` with code `P2002` and return 409 with a clean message.
- Error response shape: `NextResponse.json({ error: "...", details?: ... }, { status: N })`.
- Transactional section save: `tx.section.deleteMany({ where: { websiteId } })` then `tx.section.createMany(...)` — bulk replace on every save. Keep this for the section save path in the new website PUT.

### Integration Points
- `mcstatus.io` polling (deferred v1.0 SECT-02): once Live Player Count section type lands, its server-side fetcher reads `section.settings.minecraftServerId`, resolves it via `db.minecraftServer.findUnique`, then polls. Phase 7 only sets up the data plumbing.
- NextAuth session: `session.user.id` is the identifier; available everywhere `auth()` is called.

</code_context>

<specifics>
## Specific Ideas

- For `POST /api/websites/[id]/servers`, return 201 with the full created record (id + all fields) so the client can update local state without a re-fetch.
- For `DELETE /api/websites/[id]/servers/[serverId]`, returning the deleted record (or 204) is fine; UI just needs success/failure.
- `MinecraftServer.name` and `MinecraftServer.description` distinction: `name` is the chosen display label ("Survival", "Creative"); `description` is optional flavor text ("PvP enabled", "Vanilla 1.20.4"). The planner should NOT add validation that conflicts these meanings.
- When the planner writes the new schemas, mirror the existing `website.ts` style: a base `create*Schema`, a `.partial()` `update*Schema`, and exported types via `z.infer`.

</specifics>

<deferred>
## Deferred Ideas

- Dashboard route rename `dashboard/[serverId]` → `dashboard/[websiteId]` — Phase 8 (editor rewrite).
- Connections-manager tab UI in editor — Phase 8 (DASH-03).
- Section type renderers that consume `minecraftServerId` (Live Player Count, Server Info) — deferred v1.0 SECT-02/SECT-03.
- "No server selected" placeholder UX for sections with a dangling `minecraftServerId` — deferred to the renderer phase.
- `create-server-dialog.tsx` filename rename to `create-website-dialog.tsx` — Phase 8.
- Soft-delete vs hard-delete on Website — out of scope; hard delete (cascade) is sufficient for v1.
- Audit log / activity history for Website + MinecraftServer changes — not on roadmap.

</deferred>

---

*Phase: 7-API-Layer*
*Context gathered: 2026-05-12*
