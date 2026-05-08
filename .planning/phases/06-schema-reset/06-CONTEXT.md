# Phase 6: Schema Reset - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Update the Prisma schema so the app no longer has a `Server` model. Introduce `Website` and `MinecraftServer` in its place. Rename `Section.serverId` → `Section.websiteId`. The app must compile with zero TypeScript errors and `npx prisma migrate dev` must succeed on a fresh database.

**In scope:**
- `prisma/schema.prisma` — remove `Server`, add `Website` and `MinecraftServer`, update `Section` foreign key
- `User.servers` relation → `User.websites`
- All TypeScript imports/references updated from `Server`/`serverId` to `Website`/`websiteId`
- Prisma migration that runs cleanly on a fresh database
- Zero TypeScript compile errors across the project

**Out of scope:**
- Building new API routes (Phase 7)
- Dashboard or public site UI changes (Phase 8)
- Section type extraction or visual effects (Phases 3–5, deferred post v1.1)
- Seed data or data migration from existing dev database

</domain>

<decisions>
## Implementation Decisions

### Website Model Shape
- **D-01:** `Website` carries the following fields: `id`, `name`, `subdomain` (unique), `description`, `logo`, `banner`, `navbar: Json`, `theme: Json`, `published`, `userId`, `createdAt`, `updatedAt` — plus relations `sections Section[]` and `servers MinecraftServer[]`. The `description`, `logo`, `banner`, and `navbar` fields are carried over from the old `Server` model (they are website-level branding/config, not Minecraft-server-specific).
- **D-02:** `User` relation: `servers Server[]` is renamed to `websites Website[]` on the `User` model.

### MinecraftServer Model Shape
- **D-03:** `MinecraftServer` carries: `id`, `name` (display name), `ip`, `port` (default 25565), `description`, `websiteId`, `createdAt`, `updatedAt`. The `description` field is included (e.g., "main survival", "creative hub") to help owners label connections on multi-server websites.
- **D-04:** `MinecraftServer` relation: `website Website` via `websiteId` with `onDelete: Cascade`.

### Section Model Update
- **D-05:** `Section.serverId` is renamed to `Section.websiteId`. The relation points to `Website` instead of `Server`. Index updated from `@@index([serverId])` to `@@index([websiteId])`. The top-level `title` and `subtitle` fields on `Section` are left as-is for this phase (cleanup is out of scope).

### TypeScript Compilation Strategy
- **D-06:** Phase 6's TypeScript goal is zero compile errors — not semantic correctness of dashboard and API code that will be rewritten in Phases 7–8. The planner should choose the least-work path to compile: for dashboard/editor files that will be fully rewritten, minimal renames (type references only) are acceptable. For API routes (`/api/servers/*`), they may be left with broken runtime behavior as long as they compile.
- **D-07:** The existing `src/app/api/servers/` routes reference `prisma.server`. These will be rebuilt in Phase 7. For Phase 6, update type references to compile (rename `prisma.server` → `prisma.website` where needed) without guaranteeing runtime correctness.

### Migration Approach
- **D-08:** Fresh database migration only — no data preservation. The success criteria explicitly says "from a fresh state." Dev database data is throwaway. The Prisma migration file should stand alone (no data migration steps).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Definition
- `.planning/ROADMAP.md` §Phase 6 — Success criteria (4 numbered items), goal, requirements list
- `.planning/REQUIREMENTS.md` §WEB-01, CONN-01 — Schema foundation requirements for this phase

### Current Schema (to be replaced)
- `prisma/schema.prisma` — Current Server + Section models; starting point for the migration

### Files That Reference Server/serverId (TypeScript scope)
- `src/app/api/servers/[serverId]/route.ts` — API route using prisma.server
- `src/app/api/servers/route.ts` — API route using prisma.server
- `src/app/(dashboard)/dashboard/actions.ts` — Server actions
- `src/app/(dashboard)/dashboard/create-server-dialog.tsx` — Uses Server type
- `src/app/(dashboard)/dashboard/page.tsx` — Dashboard listing servers
- `src/app/(dashboard)/dashboard/[serverId]/page.tsx` — 5171-line god-component (Server references)
- `src/app/(dashboard)/dashboard/[serverId]/server-actions.tsx` — Server actions
- `src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx` — Server settings
- `src/app/[subdomain]/layout.tsx` — Public site fetches Server by subdomain
- `src/app/[subdomain]/page.tsx` — Public site page
- `src/app/[subdomain]/preview-client.tsx` — Uses ServerData type
- `src/components/preview/types.ts` — Defines ServerData, Section types
- `src/components/sections/hero-section.tsx` — May reference ServerData
- `src/components/sections/render/hero-render.tsx` — May reference ServerData
- `src/components/sections/settings/hero-settings.tsx` — May reference ServerData
- `src/lib/validations/server.ts` — Server validation schema
- `src/types/sections.ts` — Section types (may reference Server shape)

### Architecture Context
- `.planning/codebase/CONCERNS.md` §Technical Debt — Mock data and god-component notes (relevant context for what Phase 6 must not break)
- `.planning/codebase/ARCHITECTURE.md` — Overall app structure

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `prisma/schema.prisma` — Current schema is the direct starting point; the migration diffs from this file
- `src/components/preview/types.ts` — Defines `ServerData` type; must be updated to `WebsiteData` (or equivalent) to clear TypeScript errors across the public renderer files
- `src/lib/validations/server.ts` — Zod validation schema for server creation; will need a `website.ts` equivalent

### Established Patterns
- `Section.settings: Json` is the canonical home for all section content — `title`/`subtitle` top-level fields are legacy and not used for new work
- `onDelete: Cascade` is used consistently; maintain this on `Website → Section` and `Website → MinecraftServer` relations
- `@@index([userId])` on the main user-owned model is the existing pattern; carry it to `Website`

### Integration Points
- `src/app/[subdomain]/` — public site currently fetches `prisma.server.findFirst({ where: { subdomain } })`. This becomes `prisma.website.findFirst(...)` in Phase 6 (type update; full logic fix deferred to Phase 7-8)
- `src/app/(dashboard)/dashboard/[serverId]/` — URL routing uses `serverId`; the directory name and route param do NOT need to change in Phase 6 (routing restructure is Phase 8)
- NextAuth session ties to `User`; the `User.websites` relation change is schema-only, no auth changes needed

</code_context>

<specifics>
## Specific Ideas

- `serverIp` and `serverPort` from the old `Server` model move to `MinecraftServer` as `ip` and `port` — cleaner naming
- `MinecraftServer.description` gives owners a way to label connections on multi-server websites (e.g., "main survival", "creative hub")
- `Website` keeps `description`, `logo`, `banner`, and `navbar: Json` from the old `Server` — these are website-level branding/config fields

</specifics>

<deferred>
## Deferred Ideas

- Section.title / Section.subtitle column cleanup — noted as legacy but out of scope for Phase 6; leave for a future cleanup phase
- Semantic correctness of dashboard files (Phase 8 rewrites them)
- Semantic correctness of API routes (Phase 7 rebuilds them)

</deferred>

---

*Phase: 6-Schema-Reset*
*Context gathered: 2026-05-08*
