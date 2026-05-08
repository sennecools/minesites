# Requirements: MineSites

**Defined:** 2026-05-07 | **Updated:** 2026-05-08 (v1.1 added)
**Core Value:** A Minecraft server website that looks and feels like a gaming site — not a dashboard — built in minutes by the server owner, not a developer.

## v1.1 Requirements

### Website Management

- [ ] **WEB-01**: User can create a Website with a name and unique custom subdomain
- [ ] **WEB-02**: User can update a Website's name and subdomain after creation
- [ ] **WEB-03**: User can delete a Website and all its associated sections and server connections

### Server Connections

- [ ] **CONN-01**: User can add a Minecraft server connection to their Website (display name, IP address, port)
- [ ] **CONN-02**: User can remove a Minecraft server connection from their Website
- [ ] **CONN-03**: User can update a Minecraft server connection's display name, IP, and port
- [ ] **CONN-04**: Server-specific sections (Live Player Count, Server Info) store a reference to a connected MinecraftServer and use its IP for data polling

### Dashboard UX

- [ ] **DASH-01**: Main dashboard page shows the user's Websites instead of Servers
- [ ] **DASH-02**: Dashboard includes a "New Website" button/dialog where user picks a name and custom subdomain
- [ ] **DASH-03**: Website editor includes a server connections manager tab for adding, editing, and removing connected Minecraft servers
- [ ] **DASH-04**: Website cards in the dashboard list display the live URL (e.g., myhardcoreserver.minesites.net)

---

## v1.0 Requirements

### Visual Design

- [ ] **VISUAL-01**: Server website pages render inside a `.site-root` scope that overrides dashboard CSS variables, so public pages look nothing like the admin dashboard
- [ ] **VISUAL-02**: Server website has its own gaming-styled base layout (dark nav, vivid accent colors, bold typography) separate from dashboard UI components

### Section Types

- [ ] **SECT-01**: User can add a Hero section with server name, tagline, background image or color, and a one-click-copy join CTA button
- [ ] **SECT-02**: User can add a Live Player Count section that polls the Minecraft server status API (mcstatus.io) using the server IP, showing online/max players with a cached, non-blocking render
- [ ] **SECT-03**: User can add a Server Info section displaying IP address (with copy button), game version, and server type
- [ ] **SECT-04**: User can add a Features/About section with freeform text describing the server
- [ ] **SECT-05**: User can add a Rules section with an ordered list of server rules
- [ ] **SECT-06**: User can add an Image Gallery section with uploaded server screenshots
- [ ] **SECT-07**: User can add a Discord CTA section with a configurable Discord invite link and join button
- [ ] **SECT-08**: User can add a Game Modes section with cards (name + optional image) for each mode (survival, skyblock, factions, etc.)
- [ ] **SECT-09**: User can add a Voting Links section listing clickable links to server list voting sites

### Theme System

- [ ] **THEME-01**: User can choose a site-wide color palette (primary, accent, background, text) from a curated set of presets
- [ ] **THEME-02**: User can choose a site-wide display font from a curated set (applied via next/font/google)
- [ ] **THEME-03**: User can override the background color of any individual section
- [ ] **THEME-04**: Theme is applied server-side via `data-theme` attribute so public pages have no flash of unstyled content

### Freemium Gating

- [ ] **FREE-01**: Free tier allows a maximum of 5 sections per page
- [ ] **FREE-02**: Paid tier allows a maximum of 15 sections per page
- [ ] **FREE-03**: Section count is enforced server-side in the save API (`PUT /api/servers/[serverId]`) — cannot be bypassed by the client
- [ ] **FREE-04**: Editor shows an upgrade prompt when a free user attempts to add a section beyond the limit

### Visual Effects (Paid Only)

- [ ] **FX-01**: Paid users can enable particle effects on any section (e.g., falling particles, fireflies)
- [ ] **FX-02**: Paid users can enable parallax scrolling on hero and gallery background images
- [ ] **FX-03**: Paid users can enable entrance animations on sections (fade-in, slide-in on scroll)
- [ ] **FX-04**: Effects are stripped server-side for free users (not just hidden in UI)

## v2 Requirements

### Content

- **CONT-01**: Staff/team section with Minecraft skin avatars (requires crafatar.com integration)
- **CONT-02**: News/announcements feed section (lightweight CMS)

### Growth

- **GROW-01**: Custom domain support (beyond subdomain)
- **GROW-02**: Basic analytics (page views, visitor count per server page)
- **GROW-03**: Server badges / embed widgets for other sites

### Payments

- **PAY-01**: In-app upgrade flow (Stripe or LemonSqueezy) to move user from free → paid plan
- **PAY-02**: Subscription management (cancel, billing history)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Plugin/mod integration for server data | IP polling is sufficient for v1; plugins add server-side complexity for users |
| In-site store (like Tebex) | Tebex is the established standard; CTA link-out covers it |
| Player stats from plugins | Requires server-side install, out of scope |
| Forums / blog CMS | Discord has won; simple text/announcements covers 95% of cases |
| Mobile app | Web-first, mobile later |
| Multi-language support | English only for v1 |
| SEO settings panel | Too advanced for target users in v1 |
| Real-time server data (WebSocket) | Polling with cache is sufficient |

## Traceability

### v1.1

| Requirement | Phase | Status |
|-------------|-------|--------|
| WEB-01 | TBD | Pending |
| WEB-02 | TBD | Pending |
| WEB-03 | TBD | Pending |
| CONN-01 | TBD | Pending |
| CONN-02 | TBD | Pending |
| CONN-03 | TBD | Pending |
| CONN-04 | TBD | Pending |
| DASH-01 | TBD | Pending |
| DASH-02 | TBD | Pending |
| DASH-03 | TBD | Pending |
| DASH-04 | TBD | Pending |

### v1.0

| Requirement | Phase | Status |
|-------------|-------|--------|
| VISUAL-01 | Phase 2 | Pending |
| VISUAL-02 | Phase 2 | Pending |
| SECT-01 | Phase 3 | Pending |
| SECT-02 | Phase 3 | Pending |
| SECT-03 | Phase 3 | Pending |
| SECT-04 | Phase 3 | Pending |
| SECT-05 | Phase 3 | Pending |
| SECT-06 | Phase 3 | Pending |
| SECT-07 | Phase 3 | Pending |
| SECT-08 | Phase 3 | Pending |
| SECT-09 | Phase 3 | Pending |
| THEME-01 | Phase 2 | Pending |
| THEME-02 | Phase 2 | Pending |
| THEME-03 | Phase 2 | Pending |
| THEME-04 | Phase 2 | Pending |
| FREE-01 | Phase 4 | Pending |
| FREE-02 | Phase 4 | Pending |
| FREE-03 | Phase 4 | Pending |
| FREE-04 | Phase 4 | Pending |
| FX-01 | Phase 5 | Pending |
| FX-02 | Phase 5 | Pending |
| FX-03 | Phase 5 | Pending |
| FX-04 | Phase 5 | Pending |

**Coverage:**
- v1.1 requirements: 11 total | Mapped to phases: 0 (TBD — roadmap pending)
- v1.0 requirements: 23 total | Mapped to phases: 23

---
*Requirements defined: 2026-05-07*
*Last updated: 2026-05-08 — v1.1 requirements added*
