# Roadmap: MineSites

**Milestone:** v1.0 — Minecraft website builder with gaming identity
**Status:** Active
**Config:** Coarse granularity | YOLO mode | Parallel execution

## Overview

Starting from a working but visually inconsistent brownfield app, this milestone transforms the public site output into a genuine gaming-styled website builder. Work proceeds in dependency order: shared foundations first, then visual isolation, then new section types (enabled by the registry pattern), then freemium enforcement, and finally the paid-tier visual effects layer.

## Phases

- [ ] **Phase 1: Foundation & Extraction** - Shared types, plan.ts, section registry, extract existing section code out of the god-component
- [ ] **Phase 2: Theme System** - CSS variable isolation, gaming-styled site layout, full theme controls in the editor
- [ ] **Phase 3: Section Types** - All 9 Minecraft-native section types delivered via the registry
- [ ] **Phase 4: Freemium Gating** - Server-side section count enforcement, User.plan field, upgrade prompt in editor
- [ ] **Phase 5: Visual Effects** - Particles, parallax, entrance animations — paid tier only, stripped server-side for free accounts

## Phase Details

### Phase 1: Foundation & Extraction
**Goal:** The codebase is restructured so that every future section type lands as two files plus one registry entry — never as lines added to the god-component.
**UI hint:** no
**Requirements:** (none — this phase is preparatory; it creates the scaffolding that all subsequent requirements are built on)
**Success Criteria** (what must be TRUE):
  1. `src/lib/section-registry.ts` exists and exports a typed registry; the existing Hero section is registered there and renders identically to before.
  2. The editor page (`page.tsx`) has not grown in line count; existing Hero renderer and settings panel live in their own files under `src/components/sections/`.
  3. `src/types/site-theme.ts` defines the `SiteTheme` interface and `src/lib/plan.ts` defines `getPlanLimits()`.
  4. Adding a new section type requires only two new files and one registry entry — no edits to `page.tsx`.
**Plans:** 5 plans
- [x] 01-01-PLAN.md — Foundation types: src/types/sections.ts, src/types/site-theme.ts, src/lib/plan.ts
- [x] 01-02-PLAN.md — Extract Hero render and Hero settings into src/components/sections/{render,settings}/
- [x] 01-03-PLAN.md — Build SECTION_REGISTRY (Record<SectionType, RegistryEntry>) and update sections barrel
- [x] 01-04-PLAN.md — Editor god-component cleanup: remove mockServer/initialSections, wire registry, replace inline Hero settings block
- [x] 01-05-PLAN.md — Public renderer wire-up: dedupe types, route hero through SECTION_REGISTRY, delete inline PreviewHero
- [x] 01-06-PLAN.md — Gap closure (SC4): generalize SectionPreview/SettingsPanel/preview-client dispatch via SECTION_REGISTRY[type]

### Phase 2: Theme System
**Goal:** Public server websites have a visually distinct gaming identity controlled by a theme the server owner configures; the admin dashboard is completely unaffected.
**UI hint:** yes
**Requirements:** VISUAL-01, VISUAL-02, THEME-01, THEME-02, THEME-03, THEME-04
**Success Criteria** (what must be TRUE):
  1. Visiting `[server].minesites.net` renders a dark-background, bold-typography page — not the neutral card-based dashboard design — with no flash of unstyled content.
  2. Dashboard pages at the same time look exactly as before; no shared styles bleed in either direction.
  3. A server owner can open the editor, pick a color palette preset, pick a font, and see both applied immediately on the public site without a code deploy.
  4. A server owner can override the background color of an individual section independently of the site-wide palette.
**Plans:** TBD

### Phase 3: Section Types
**Goal:** Server owners can build a complete, useful Minecraft server page using 9 Minecraft-native section types, including a live player count that never blocks page load.
**UI hint:** yes
**Requirements:** SECT-01, SECT-02, SECT-03, SECT-04, SECT-05, SECT-06, SECT-07, SECT-08, SECT-09
**Success Criteria** (what must be TRUE):
  1. A server owner can add all 9 section types from the editor: Hero, Live Player Count, Server Info, Features/About, Rules, Image Gallery, Discord CTA, Game Modes, and Voting Links.
  2. The Live Player Count section shows online/max players (or a graceful "Status unavailable" fallback) without delaying the rest of the page — an offline Minecraft server produces no blank page or timeout.
  3. Hero section displays server name, tagline, background image or color, and a one-click-copy join CTA button.
  4. Each section type has appropriate editor controls (settings panel) and renders correctly inside the `.site-root` CSS scope established in Phase 2.
**Plans:** TBD

### Phase 4: Freemium Gating
**Goal:** Free accounts are limited to 5 sections and this limit cannot be bypassed by the client; paid accounts can have up to 15 sections and the editor communicates the limit clearly.
**UI hint:** yes
**Requirements:** FREE-01, FREE-02, FREE-03, FREE-04
**Success Criteria** (what must be TRUE):
  1. A free user who has 5 sections cannot add a 6th section via the editor UI — an upgrade prompt is shown instead.
  2. A free user who attempts to POST 6 or more sections directly to `PUT /api/servers/[serverId]` receives a server-side error; the extra sections are not saved.
  3. A paid user can add up to 15 sections with no gate or prompt.
  4. The `User` model has a `plan` field and `getPlanLimits()` returns correct thresholds for both tiers.
**Plans:** TBD

### Phase 5: Visual Effects
**Goal:** Paid users can apply particles, parallax, and entrance animations to their server website; free users see none of these effects regardless of what the editor state contains.
**UI hint:** yes
**Requirements:** FX-01, FX-02, FX-03, FX-04
**Success Criteria** (what must be TRUE):
  1. A paid user can enable particle effects on any section and see them rendered on the public site.
  2. A paid user can enable parallax scrolling on hero and gallery background images.
  3. A paid user can enable entrance animations (fade-in or slide-in on scroll) on sections.
  4. A free user's public site renders with zero particle, parallax, or animation effects — even if `effectEnabled: true` was set in the database — because the PUT handler strips effects on free-tier saves.
**Plans:** TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Extraction | 6/6 | Verifying | - |
| 2. Theme System | 0/TBD | Not started | - |
| 3. Section Types | 0/TBD | Not started | - |
| 4. Freemium Gating | 0/TBD | Not started | - |
| 5. Visual Effects | 0/TBD | Not started | - |
