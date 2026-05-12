# Phase 7: API Layer - Discussion Log

**Date:** 2026-05-12
**Mode:** discuss (default)

This log is a human-readable record of the discussion that produced `07-CONTEXT.md`. It is NOT consumed by downstream agents (researcher, planner, executor) — they read `07-CONTEXT.md`. This file exists for audits and retrospectives.

---

## Areas Selected for Discussion

User selected all four proposed gray areas:

1. Route rename + UI fetch updates
2. MinecraftServer endpoint shape
3. minecraftServerId in section settings
4. Legacy cleanup scope

---

## Area 1 — Route rename + UI fetch updates

**Q:** How should /api/servers/ → /api/websites/ migrate?

**Options presented:**
- (Selected) Hard rename in Phase 7 — move directory, delete old, update every client fetch call.
- Stand up new alongside old — duplicate routes; Phase 8 deletes old.
- Keep URLs, rename internals only — defer URL prefix to Phase 8.

**Decision:** Hard rename. Ship Phase 7 in a working state. No duplicate routes.

**Sub-decisions noted (not separately asked):**
- Route param name: `[websiteId]` (matches model name).
- Dashboard route `(dashboard)/dashboard/[serverId]` keeps its param name in Phase 7 — that rename is Phase 8.
- Server actions (`createServer`/etc.) rename is deferred to Area 4.

---

## Area 2 — MinecraftServer endpoint shape

**Q1:** How should the MinecraftServer connection endpoints work?

**Options presented:**
- (Selected) Per-record CRUD — `POST /api/websites/[id]/servers`, `PUT/DELETE /api/websites/[id]/servers/[serverId]`.
- Bulk replace — single PUT replaces full array (mirrors section save).
- Hybrid — bulk PUT + DELETE on id.

**Decision:** Per-record CRUD. Ergonomic for the Phase 8 connections-manager UI.

**Q2:** How strict should the MinecraftServer IP field validation be?

**Options presented:**
- (Selected) Loose — `string` max length only.
- Hostname or IPv4 regex.
- Loose IP + separate port, no embedded port in IP.

**Decision:** Loose string validation. Trust `mcstatus.io` to reject malformed inputs at poll time. Supports hostnames, IPv4, IPv6, and any custom port syntax users might paste.

---

## Area 3 — minecraftServerId in section settings

**Q1:** Where should the minecraftServerId reference live inside section settings?

**Options presented:**
- (Selected) Top-level convention — `settings.minecraftServerId` across all server-specific section types.
- Nested per section type — `settings.live.minecraftServerId` / `settings.info.minecraftServerId`.
- Real foreign-key column on Section.

**Decision:** Top-level convention. Single shared field, easy to type and grep. Stays consistent with Phase 6 "all section data lives in settings JSON" decision.

**Q2:** How should dangling minecraftServerId references be handled?

**Options presented:**
- (Selected) Soft — renderer shows placeholder; API does nothing on dangle.
- Cascade null on delete — DELETE handler scans sections, nulls matching ids.
- Block delete if referenced — return 409 with referenced sections listed.

**Decision:** Soft. No enforcement at the API layer. Renderer (in a deferred phase) handles "no server selected" placeholder UX.

---

## Area 4 — Legacy cleanup scope

**Q:** Which legacy items should Phase 7 also clean up? (multiSelect)

**Options selected:**
- ✓ Delete `src/lib/validations/server.ts`
- ✓ Rename `createServer`/`updateServer`/`deleteServer` actions → `createWebsite`/`updateWebsite`/`deleteWebsite`
- ✓ Remove unused `serverIp`/`serverPort` fields from editor state
- ✗ Defer all to Phase 8 (rejected by selecting the other three)

**Decision:** Do all three cleanups in Phase 7. The planner may split the god-component cleanup (D-15) into its own narrow plan if it risks entangling with the API work.

---

## Deferred Ideas Captured

- Dashboard route rename `dashboard/[serverId]` → `dashboard/[websiteId]` — Phase 8.
- Connections-manager tab UI — Phase 8 (DASH-03).
- Section renderers consuming `minecraftServerId` — deferred v1.0 SECT-02/SECT-03.
- "No server selected" placeholder UX — deferred to the renderer phase.
- `create-server-dialog.tsx` filename rename — Phase 8.

---

## Carry-Forward Items (do not regress)

Reminded from Phase 6 fix pass:
- Subdomain uniqueness + zod validation in PUT (CR-01).
- Freemium section limit in PUT (CR-03), sourced from `src/lib/plan.ts` if possible.
- P2002 catch in `actions.ts` (WR-05).
- Session user existence check in `createWebsite` action (recent commit `ef51d4a`).
- `Section.settings` is canonical home for section content (Phase 6 D-05).

---

*End of log.*
