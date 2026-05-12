# MineSites

## Current Milestone: v1.1 Website-Centric Model

**Goal:** Decouple websites from individual servers — a website belongs to a user, has its own custom subdomain, and can showcase multiple Minecraft servers. Server-specific sections choose which connected server to pull data from.

**Target features:**
- New `Website` model with custom subdomain, belonging to User (free: 1 website; paid: multiple)
- Lightweight `MinecraftServer` connection records linked to a Website (name, IP, port)
- Server-specific sections pick which connected server they display
- Dashboard UX rebuilt: create website → connect servers → build sections
- Clean slate: existing `Server` model replaced, no data migration

## What This Is

MineSites is a website builder designed specifically for Minecraft server owners. Unlike generic builders, it includes server-native elements — live player count, server info cards, and join buttons — that players actually expect. Server owners create a website with a custom subdomain, connect their Minecraft servers, drag in sections, customize a theme, and publish a gaming-styled page at their subdomain — without touching code. One website can showcase multiple servers.

## Core Value

A Minecraft server website that looks and feels like a gaming site — not a dashboard — built in minutes by the server owner, not a developer.

## Requirements

### Validated

- ✓ User can sign up and log in (Google OAuth + credentials) — existing
- ✓ User can add and reorder sections in a visual editor (drag-and-drop) — existing
- ✓ Images can be uploaded to profiles — existing
- ✓ Section registry pattern: new section type = 2 files + 1 registry entry (Phase 1)
- ✓ Public site CSS isolation under `.site-root`, theme variables injected at layout (Phase 2)
- ✓ API surface rebuilt to Website + MinecraftServer models: `/api/websites` (CRUD), `/api/websites/[id]/servers` (nested CRUD), section payloads carry `minecraftServerId` (Phase 7)

### Active (v1.1)

- [ ] User can create a Website with a custom subdomain (`[name].minesites.net`)
- [ ] User can connect one or more Minecraft servers (IP/port) to their Website
- [ ] Server-specific sections (Live Player Count, Server Info) pick which connected server to display
- [ ] Free tier is limited to 1 website per user
- [ ] Website dashboard replaces the server-centric dashboard (website list → website editor)

### Active (deferred from v1.0 — resumes after v1.1)

- [ ] Section editor offers 7+ Minecraft-native section types
- [ ] Full theme system: site-wide color palette + font, with per-section overrides (partially done — wiring to Website model needed)
- [ ] Paid tier unlocks more websites AND visual effects (particles, animations, parallax)

### Out of Scope

- Plugin/mod integration for player data — IP polling is sufficient for v1; plugins add server-side complexity
- Mobile app — web-first
- Real-time chat or forums — server management focus only
- Multi-language support — English only for v1
- Custom domain (non-subdomain) hosting — subdomain system is sufficient for v1

## Context

This is a brownfield project with existing working infrastructure: authentication, dashboard, section editor, and subdomain routing are all in place. The primary problem is visual: the section components rendered on public server websites inherit the same design language as the admin dashboard (clean, neutral, card-based). Server websites should feel like gaming pages — bold typography, vivid accent colors, dark backgrounds — controlled by the server owner's chosen theme. The editor itself remains a clean dashboard tool; only the output changes.

Phase 1 (Foundation & Extraction) restructured the god-component: it was 5,171 lines; it's now ~3,200. New section types go in `src/components/sections/render/` and `src/components/sections/settings/` — adding one requires only 2 files + 1 registry entry in `src/lib/section-registry.tsx`, zero edits to `page.tsx` or `preview-client.tsx`. Zero test coverage remains an open concern.

Phase 6 (Schema Reset) completed the v1.1 data model: `Server` model replaced by `Website` + `MinecraftServer`; `Section.serverId` renamed to `websiteId`; all TypeScript consumers updated; `npx tsc --noEmit` exits 0; migration history generated at `prisma/migrations/20260508111252_schema_reset/`.

Phase 7 (API Layer) rebuilt the API surface around the new model: `/api/websites` replaces `/api/servers`; nested `/api/websites/[websiteId]/servers` provides MinecraftServer CRUD with double-ownership chain; section save passes `minecraftServerId` through `section.settings` so server-scoped sections can reference a connection. Old `/api/servers/*` and `validations/server.ts` deleted; zero stale references. Dashboard action exports renamed to `createWebsite/updateWebsite/deleteWebsite` (D-14). Code review surfaced 6 advisory blockers (validation hardening, error-mapping) for follow-up; verification confirms all 4 success criteria met.

Key technical context:
- Next.js 16 App Router, TypeScript, Tailwind CSS
- Prisma + PostgreSQL for persistence
- NextAuth (beta) for auth
- Minecraft server status can be queried via publicly available status APIs (e.g., `api.mcsrvstat.us` or direct socket ping)

## Constraints

- **Tech stack**: Next.js / TypeScript / Tailwind / Prisma — no new frameworks without strong justification
- **Scope**: v1 is 7–10 section types max; resist adding more before validating the model
- **Solo builder**: one developer; prefer simple gating logic over complex billing infrastructure for v1
- **Performance**: Player count polls should be server-side and cached; never block page render

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Poll Minecraft API by IP (not plugin) | Lower barrier to entry; no server-side install required | — Pending |
| Free/paid gating at section count + effects | Simple enough to enforce without complex entitlement system | — Pending |
| Full theme system (palette + font) | Lets servers look unique without per-element design work | — Pending |
| Keep dashboard design separate from website output | Core UX problem — same styles bleed into server pages | — Pending |
| Website model decoupled from Server model (v1.1) | Original 1-server-per-website assumption is too limiting; user-centric websites enable multi-server showcases | Decided — clean break, no migration |
| Free tier: 1 website max (v1.1) | Simplest gating; MVP focus before adding multi-website paid tier | Decided |
| Server-specific sections pick a connected server (v1.1) | Natural UX when a website has multiple Minecraft servers to choose from | Decided |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-12 — Phase 7 complete (API Layer: /api/websites surface live, legacy /api/servers removed)*
