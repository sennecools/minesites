# Research Summary — MineSites

**Synthesized:** 2026-05-07
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md, PROJECT.md

---

## Executive Summary

MineSites is a brownfield website builder for Minecraft server owners. The existing
infrastructure (auth, editor, subdomain routing, image uploads) is solid. The active
milestone solves three tightly coupled problems: the public output looks like an admin
dashboard instead of a gaming site, there are not enough Minecraft-native section types to
be useful, and there is no freemium gate to support a business model.

The recommended approach is to isolate the public site's design system from the dashboard
via CSS variable scoping in the `[subdomain]/layout.tsx`, build a section registry that
makes adding types mechanical, and enforce the freemium gate in two places (server action
and editor UI). Only one new production dependency is required (`@tsparticles/slim`).
Framer Motion (already installed) handles parallax and entrance animations; Tailwind v4
with `@theme inline` handles theming; and the `'use cache'` directive (Next.js 16) handles
Minecraft status polling. The stack is deliberately minimal.

The biggest risk is compounding the existing technical debt. The editor page is already
5,171 lines. Adding new section types directly to that file will make it unmaintainable
within this milestone. Every section type must land as two new files (renderer + settings
panel) plus one registry entry — never as an addition to the god-component. The second
major risk is freemium bypass: client-only gating is trivially bypassed, so the PUT route
handler must independently validate section count and strip paid effects from free-tier
saves.

---

## Recommended Stack Additions

| Need | Solution | Notes |
|------|----------|-------|
| Minecraft status | mcstatus.io via Route Handler | Server-side only; `'use cache'` with 60s TTL |
| Particles | `@tsparticles/react` + `@tsparticles/slim` | Only new production dep; `dynamic(..., {ssr:false})` required |
| Parallax / animations | Framer Motion (already installed) | `useScroll` + `useTransform`; no new lib needed |
| Theme system | Tailwind v4 `@theme inline` + `data-theme` attr | Server-rendered attribute; zero FOUC |
| Freemium gating | `plan` field on `User` + `getPlanLimits()` helper | No external billing service for v1 |

`next.config.ts` requires `cacheComponents: true` to enable the `'use cache'` directive.

---

## Table Stakes Features

Must-have section types for v1 (all free tier):

1. **Hero** — server name, tagline, IP with copy-to-clipboard, player count, CTA button
2. **Server Info** — IP, version, edition badge, online/offline status indicator
3. **Game Modes** — card grid with image + name + description per mode
4. **Features Strip** — icon + label row for quick server highlights
5. **Voting** — list of voting site links; owner-supplied URLs, no API integration
6. **Discord CTA** — invite button banner section
7. **Text / Rules** — freeform styled text section

Differentiators worth adding in v1 if scope allows: Staff section (Minecraft skin avatars
via crafatar.com), News / Announcements feed, Season countdown timer.

Explicitly deferred to v2+: Dynmap embed, top voters leaderboard, any form builder,
analytics, forums, player auth, in-site store.

---

## Differentiators

What sets MineSites apart from generic builders and static templates:

- **Section registry pattern** — adding a section type is mechanical (2 files + 1 entry),
  so the section library can grow fast without accumulating debt
- **Gaming-native visual identity** — CSS variable isolation ensures public sites never
  inherit dashboard styling; dark backgrounds, bold typography, vivid accents by default
- **Per-section color overrides** — servers can make each section feel distinct, not just
  one flat theme across the whole page
- **Live player count** — server-side cached API poll; shows health at a glance before a
  player commits time to join
- **Paid-tier visual effects** — particles and parallax gated to paid plan; meaningful
  upgrade incentive with visible impact

---

## Critical Architectural Decisions

### 1. Section Registry

`src/lib/section-registry.ts` is the single manifest for all section types. Each entry
carries: renderer component, settings panel component, default settings, label, icon, and
`paidOnly` flag. The god-component and public dispatcher become thin consumers. Adding a
type = one registry entry + two files.

### 2. Hard Dashboard / Site Boundary

Enforced by import convention:
- `src/components/site/` never imports from `src/components/ui/`
- `src/components/sections/render/` never imports from `src/components/ui/`
- `src/components/sections/settings/` never imports from `src/components/site/`

### 3. CSS Variable Scoping

`src/app/[subdomain]/layout.tsx` wraps children in `.site-root` with inline CSS variables
from `server.theme`. Dashboard tokens are never referenced inside `.site-root`. Public
sections use `var(--site-primary)`, `var(--site-bg)` etc. — not global Tailwind tokens.

### 4. SiteTheme Type

`src/types/site-theme.ts` defines a single shared `SiteTheme` interface. Stored in
`Server.theme Json` (no migration needed; column exists). Resolved server-side and
injected before HTML is sent to the client.

### 5. Minecraft Status — Non-Blocking Pattern

Fetched in `page.tsx` via `Promise.allSettled` with a 3s `AbortSignal.timeout`. Never
awaited on the critical render path. Passed as a prop to section renderers. Graceful
"Status unavailable" fallback when the server is offline.

### Build Order (driven by dependencies)

1. Shared types + `plan.ts` + empty registry (foundation)
2. Extract existing renderers and settings panels into files (contain existing debt)
3. Theme system + CSS variable isolation (visual identity)
4. New section types via registry (static first, API-dependent last)
5. Freemium enforcement in PUT handler + editor UI
6. Visual effects layer (paid tier, `ssr: false`, FPS-capped)

---

## Top Pitfalls to Avoid

### Pitfall 1: Minecraft status on the critical render path

If `fetchServerStatus` is awaited before rendering the page, an offline Minecraft server
produces a blank page or a 30-second timeout. Prevent with `Promise.allSettled`, a hard
3-second `AbortSignal`, and a `<Suspense>` fallback on the player count section.

### Pitfall 2: Freemium gate is client-only

The "Add Section" button disable is UX feedback, not enforcement. A user can POST 20
sections directly. The `PUT /api/servers/[serverId]` handler must independently check
`sections.length <= FREE_TIER_MAX_SECTIONS` and strip `effectEnabled: true` on free saves.
This is the authoritative gate.

### Pitfall 3: God-component continues to grow

The editor page is already 5,171 lines. Every new section type added inline grows it by
~300–500 more. Extract existing panels and renderers into separate files before adding any
new section types. Enforce as a rule: a new section type must not increase the line count
of `page.tsx`.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified against live docs; only 1 new dep identified |
| Features | MEDIUM-HIGH | Based on competitor observation; not yet user-tested |
| Architecture | HIGH | Based on direct codebase inspection; standard Next.js patterns |
| Pitfalls | HIGH | All critical pitfalls are known-category issues with documented prevention |

### Gaps to Validate During Planning

- **crafatar.com rate limits** — needed for Staff section skin avatars; verify ToS before
  building
- **mcstatus.io API token** — add to env variables before building player count section;
  free tier is 5 req/s
- **NextAuth v5 `jwt()` callback** — `user.plan` must be extended via `jwt()` (not
  `session()`); verify before building freemium enforcement
- **tsparticles 3.x + React 19 compatibility** — confirm before building visual effects
  phase

---

## Sources

- mcstatus.io API: https://mcstatus.io/docs
- Next.js `'use cache'`: https://nextjs.org/docs/app/api-reference/directives/use-cache
- Tailwind v4 `@theme inline`: https://github.com/tailwindlabs/tailwindcss/discussions/15199
- tsparticles: https://github.com/tsparticles/tsparticles
- Framer Motion scroll: https://motion.dev/docs/react-scroll-animations
- NextAuth v5 migration: https://authjs.dev/getting-started/migrating-to-v5
- MinePeak.org, PikaNetwork, Minesite.org (direct observation)
- Freemium bypass: https://www.onsecurity.io/blog/pentest-findings-bypassing-freemium-through-client-side-security-controls/
- Codebase: direct inspection of `/home/senne/git/minesites/src/`
