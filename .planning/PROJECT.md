# MineSites

## What This Is

MineSites is a website builder designed specifically for Minecraft server owners. Unlike generic builders, it includes server-native elements — live player count, server info cards, and join buttons — that players actually expect. Server owners drag in sections, customize a theme, and publish a gaming-styled website at their own subdomain, without touching code.

## Core Value

A Minecraft server website that looks and feels like a gaming site — not a dashboard — built in minutes by the server owner, not a developer.

## Requirements

### Validated

- ✓ User can sign up and log in (Google OAuth + credentials) — existing
- ✓ User can create and manage multiple server profiles — existing
- ✓ Server websites are served at `[server].minesites.net` via subdomain routing — existing
- ✓ User can add and reorder sections in a visual editor (drag-and-drop) — existing
- ✓ Images can be uploaded to server profiles — existing

### Active

- [ ] Server website output has its own distinct visual identity (gaming-styled, not dashboard-styled)
- [ ] Section editor offers 7+ Minecraft-native section types
- [ ] Live player count section pulls data by polling the Minecraft server status API via IP
- [ ] Server info section displays IP, version, and game mode
- [ ] Full theme system: site-wide color palette + font, with per-section overrides
- [ ] Free tier is gated to max 5 sections per page
- [ ] Paid tier unlocks more sections per page AND visual effects (particles, animations, parallax)

### Out of Scope

- Plugin/mod integration for player data — IP polling is sufficient for v1; plugins add server-side complexity
- Mobile app — web-first
- Real-time chat or forums — server management focus only
- Multi-language support — English only for v1
- Custom domain (non-subdomain) hosting — subdomain system is sufficient for v1

## Context

This is a brownfield project with existing working infrastructure: authentication, dashboard, section editor, and subdomain routing are all in place. The primary problem is visual: the section components rendered on public server websites inherit the same design language as the admin dashboard (clean, neutral, card-based). Server websites should feel like gaming pages — bold typography, vivid accent colors, dark backgrounds — controlled by the server owner's chosen theme. The editor itself remains a clean dashboard tool; only the output changes.

The codebase map (`.planning/codebase/`) identified a 5,171-line god-component in the server editor and zero test coverage as existing technical concerns. New section types should avoid growing this further — extract into smaller components.

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
*Last updated: 2026-05-07 after initialization*
