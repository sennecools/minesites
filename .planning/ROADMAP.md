# Roadmap: MineSites

**Current Milestone:** v1.1 — Website-Centric Model
**Previous Milestone:** v1.0 — Minecraft website builder with gaming identity (phases 1-2 complete)
**Config:** Coarse granularity | YOLO mode | Parallel execution

## Overview

## v1.1: Website-Centric Model

The current codebase ties each website to one Minecraft server. This milestone decouples them: a `Website` belongs to a user, can showcase multiple Minecraft servers, and lives at a custom subdomain the user chooses. The existing section registry and theme infrastructure (phases 1–2) remain valid and are re-pointed at the new `Website` model. Work proceeds in dependency order: schema first, then API, then UI.

## v1.1 Phases

- [ ] **Phase 6: Schema Reset** — Drop `Server` model, introduce `Website` + `MinecraftServer` models, update `Section` to use `websiteId`
- [ ] **Phase 7: API Layer** — CRUD API for Website and MinecraftServer; update section save/load to use `websiteId`; CONN-04 server picker stored in section settings
- [ ] **Phase 8: Dashboard & Public Site** — Website list dashboard, create-website dialog, connection manager tab in editor, public routing by website subdomain

---

## v1.0: Minecraft Website Builder (phases 1-2 complete; phases 3-5 deferred to post-v1.1)

Starting from a working but visually inconsistent brownfield app, this milestone transforms the public site output into a genuine gaming-styled website builder. Work proceeds in dependency order: shared foundations first, then visual isolation, then new section types (enabled by the registry pattern), then freemium enforcement, and finally the paid-tier visual effects layer.

## v1.0 Phases

- [x] **Phase 1: Foundation & Extraction** - Shared types, plan.ts, section registry, extract existing section code out of the god-component
- [x] **Phase 2: Theme System** - CSS variable isolation, gaming-styled site layout, full theme controls in the editor
- [ ] **Phase 3: Section Types** - All 9 Minecraft-native section types delivered via the registry *(deferred — resumes after v1.1)*
- [ ] **Phase 4: Freemium Gating** - Server-side section count enforcement, User.plan field, upgrade prompt in editor *(deferred)*
- [ ] **Phase 5: Visual Effects** - Particles, parallax, entrance animations — paid tier only, stripped server-side for free accounts *(deferred)*

## Phase Details

### Phase 6: Schema Reset
**Goal:** The Prisma schema is updated to reflect the user-centric website model: `Server` is removed, `Website` and `MinecraftServer` are introduced, `Section` references `websiteId`. The app compiles and the database migrates cleanly from a fresh state.
**UI hint:** no
**Requirements:** WEB-01 (schema foundation), CONN-01 (schema foundation)
**Success Criteria** (what must be TRUE):
  1. `prisma/schema.prisma` defines `Website` (id, name, subdomain, theme, published, userId, sections, servers) and `MinecraftServer` (id, name, ip, port, websiteId); the old `Server` model is absent.
  2. `Section` model has `websiteId` (not `serverId`); all foreign key relationships are correct.
  3. `npx prisma migrate dev` runs to completion on a fresh database with no errors.
  4. TypeScript compiles with zero errors after all type references are updated from `Server`/`serverId` to `Website`/`websiteId`.
**Plans:** 4 plans

**Wave 1** *(schema foundation — all subsequent plans depend on this)*
- [x] 06-01-PLAN.md — Schema rewrite (Website + MinecraftServer models), migration, prisma generate, website.ts validation

**Wave 2** *(parallel — no file overlap between plans)*
- [x] 06-02-PLAN.md — Core type rename: ServerData → WebsiteData in preview/types.ts and sections.ts
- [x] 06-03-PLAN.md — Prisma call site renames: all 14 db.server.* calls across 5 files

**Wave 3** *(depends on Wave 2 — closes remaining TS surface and runs compile check)*
- [ ] 06-04-PLAN.md — Remaining TS references (6 files) + god-component import + npx tsc --noEmit gate

### Phase 7: API Layer
**Goal:** All server-side API routes are rebuilt to use the new `Website` and `MinecraftServer` models; sections are saved and loaded by `websiteId`; server-specific sections store a `minecraftServerId` reference.
**UI hint:** no
**Requirements:** WEB-01, WEB-02, WEB-03, CONN-01, CONN-02, CONN-03, CONN-04
**Success Criteria** (what must be TRUE):
  1. `GET /api/websites` returns the authenticated user's websites; `POST /api/websites` creates a new website with name/subdomain validation (uniqueness enforced).
  2. `GET/PUT/DELETE /api/websites/[websiteId]` reads, updates (name, subdomain, theme, sections), and deletes a website owned by the authenticated user.
  3. `POST/PUT/DELETE /api/websites/[websiteId]/servers` manages MinecraftServer connection records linked to the website.
  4. Section save payload accepts a `minecraftServerId` field in settings; server-specific sections (Live Player Count, Server Info) persist and retrieve which server connection to use.
**Plans:** TBD

### Phase 8: Dashboard & Public Site
**Goal:** The dashboard shows a list of the user's websites; users can create a website, manage its connected servers in the editor, and view the live public site routed by the website's custom subdomain.
**UI hint:** yes
**Requirements:** DASH-01, DASH-02, DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. `/dashboard` renders a grid of Website cards showing name, subdomain URL (clickable), and section count — no Server cards.
  2. "New Website" button opens a dialog; user enters name and subdomain; subdomain uniqueness is validated before save.
  3. Website editor includes a "Servers" tab listing connected MinecraftServer records with add/edit/remove controls.
  4. Visiting `[subdomain].minesites.net` renders the Website's published sections (not a Server's) — the public routing layer uses the `Website.subdomain` field.
**Plans:** TBD

---

## v1.0 Phase Details

### Phase 1: Foundation & Extraction
**Goal:** The codebase is restructured so that every future section type lands as two files plus one registry entry — never as lines added to the god-component.
**UI hint:** no
**Requirements:** (none — this phase is preparatory; it creates the scaffolding that all subsequent requirements are built on)
**Success Criteria** (what must be TRUE):
  1. `src/lib/section-registry.ts` exists and exports a typed registry; the existing Hero section is registered there and renders identically to before.
  2. The editor page (`page.tsx`) has not grown in line count; existing Hero renderer and settings panel live in their own files under `src/components/sections/`.
  3. `src/types/site-theme.ts` defines the `SiteTheme` interface and `src/lib/plan.ts` defines `getPlanLimits()`.
  4. Adding a new section type requires only two new files and one registry entry — no edits to `page.tsx`.
**Plans:** 6 plans (5 + 1 gap closure)
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
**Plans:** 4 plans

**Wave 1**
- [x] 02-01-PLAN.md — SiteTheme type update + theme-presets.ts static lookup tables (THEME_PRESETS, FONT_FAMILY_MAP)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 02-02-PLAN.md — Public site layout: .site-root isolation, 5 Google Fonts, CSS var injection, SiteNav
- [x] 02-03-PLAN.md — Editor Appearance tab: ColorSwatchPicker, FontPicker, AppearanceTab, page.tsx wiring
- [x] 02-04-PLAN.md — Per-section background override: SectionBgOverride in hero-settings + hero-render

**Cross-cutting constraints:**
- `.site-root` class must appear exactly once per page (layout.tsx wrapper only — never on child components)
- `globals.css` `:root` variables must not be modified — all public site CSS vars use the `--site-` prefix
- God-component (`src/app/(dashboard)/dashboard/[serverId]/page.tsx`) must not grow in net line count

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

### v1.1

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 6. Schema Reset | 0/4 | Not started | - |
| 7. API Layer | 0/TBD | Not started | - |
| 8. Dashboard & Public Site | 0/TBD | Not started | - |

### v1.0

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Extraction | 6/6 | Complete | 2026-05-07 |
| 2. Theme System | 4/4 | Complete | 2026-05-07 |
| 3. Section Types | 0/TBD | Deferred (post-v1.1) | - |
| 4. Freemium Gating | 0/TBD | Deferred (post-v1.1) | - |
| 5. Visual Effects | 0/TBD | Deferred (post-v1.1) | - |
