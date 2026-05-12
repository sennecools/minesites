# Phase 8: Dashboard & Public Site - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-12
**Phase:** 8-Dashboard & Public Site
**Areas discussed:** Servers-tab placement, Connection add/edit/remove UI, Dashboard list + card shape, Cleanup scope

---

## Servers-tab placement

### Question 1: Where should the connections manager live in the editor?

| Option | Description | Selected |
|--------|-------------|----------|
| Third sidebar tab | Add "Servers" alongside Sections/Appearance in the left-rail pill toggle. Discoverable, same shell. Sidebar narrow (~224-288px panel) — IP/port columns cramped. | |
| Editor top-bar tab | Add a top-level tab row (Editor \| Servers \| Settings?) above the canvas/sidebar split. Current view becomes "Editor" tab. Servers gets full width. (Recommended) | |
| Separate /dashboard/[id]/servers page | New sibling route under editor. Clean separation, but adds nav indirection. | |
| Modal from a header button | "Manage Servers" button in editor top bar opens full-screen modal. Zero layout impact on the editor. Modal lifecycle for list-CRUD usually feels worse than a real page. | ✓ |

**User's choice:** Modal from a header button
**Notes:** User overrode the recommendation. Modal keeps editor layout untouched and matches the lightweight "manage a few records" feel — Phase 7 designed per-record endpoints precisely for this scale of UI.

### Question 2: Where should the "Manage Servers" button live in the editor top bar?

| Option | Description | Selected |
|--------|-------------|----------|
| Next to Preview/Publish | Top-right action cluster. Visually grouped with other top-bar actions. (Recommended) | ✓ |
| Top-left next to breadcrumb | Near the website name. Reads as a property of the website. Top-left is currently navigation-only. | |
| In an overflow menu | Behind ⋮. Keeps top bar clean. Low discoverability for a primary management task. | |

**User's choice:** Next to Preview/Publish

### Question 3: How should the modal handle loading the MinecraftServer list?

| Option | Description | Selected |
|--------|-------------|----------|
| Fetch on open | GET /api/websites/[id]/servers on every open. Always fresh; small open-time delay. (Recommended) | ✓ |
| Include in website fetch | Editor's initial /api/websites/[id] call includes connected servers; modal reads from local state. Instant open, but extends large payload and needs invalidation on save. | |
| You decide | Pick whichever the planner judges cleaner. | |

**User's choice:** Fetch on open

### Question 4: How should a save/edit/delete inside the modal affect the editor's unsaved changes state?

| Option | Description | Selected |
|--------|-------------|----------|
| Independent commits | Each server CRUD action hits its own endpoint immediately; doesn't dirty the editor's section/theme save state. Matches the per-record API shape Phase 7 shipped. (Recommended) | ✓ |
| Defer to editor Publish | Stage server changes locally; commit via the editor Publish button. Single save flow, but would require new transactional endpoint — not what Phase 7 built. | |

**User's choice:** Independent commits

---

## Connection add/edit/remove UI

### Question 1: What's the shape of the modal content?

| Option | Description | Selected |
|--------|-------------|----------|
| List + inline add row | Existing rows shown read-only; a persistent "Add server" row/form. Edit toggles a row into edit-mode in place. Zero modal stacking, fast multi-add. (Recommended) | ✓ |
| List + secondary dialog | Existing rows read-only; "Add server" opens a second dialog. Edit also opens the dialog with prefilled values. Simpler per-form layout. Nested modals. | |
| Two-pane modal | Left pane: list of servers (selectable). Right pane: editor for selected server. Feels like a real settings UI. More layout for what's usually 1-3 records. | |

**User's choice:** List + inline add row

### Question 2: What does each list row show by default (read-mode)?

| Option | Description | Selected |
|--------|-------------|----------|
| Name + IP:port + edit/delete | Compact one-line: name primary, IP:port muted secondary, actions right. Description hidden until edit. (Recommended) | |
| Name + IP:port + description preview + actions | Two-line card: name+ip on top, description (truncated) below. Slightly heavier visually. | ✓ |
| Full field grid | All four fields visible. Scannable but noisy for 1-2 rows. | |

**User's choice:** Name + IP:port + description preview + actions
**Notes:** User accepted the slightly heavier card to keep description discoverable without an explicit edit-mode hop.

### Question 3: How does the form expose port and description?

| Option | Description | Selected |
|--------|-------------|----------|
| Port + description visible, port defaults to 25565 | Port input shown with placeholder 25565 (default applied server-side). Description optional textarea. (Recommended) | ✓ |
| Port + description hidden behind "Advanced" toggle | Only Name + IP shown by default; "Advanced" reveals port + description. Simpler first pass, extra click for what most users will want to set. | |

**User's choice:** Port + description visible, port defaults to 25565

### Question 4: How is delete confirmed?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline confirm in row | Click delete → row swaps to "Are you sure? [Cancel] [Delete]" inline. No modal-on-modal, fast for accidental clicks. (Recommended) | ✓ |
| Native confirm() dialog | Browser confirm. Zero code; ugly, can't theme. | |
| Secondary confirm modal | Stacked Modal with explicit message. Modal-on-modal. | |
| No confirm — toast undo | Delete fires immediately; toast offers "Undo". Snappy, but requires undo plumbing not yet built. | |

**User's choice:** Inline confirm in row

---

## Dashboard list + card shape

### Question 1: What do we do about the duplicate /dashboard and /dashboard/servers pages?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep both, differentiate | /dashboard = overview (stats + recent grid + tips); /dashboard/servers = full list with grid/list toggle, search, filter. Matches existing sidebar nav. (Recommended) | ✓ |
| Consolidate into /dashboard | Make /dashboard the single Websites list; delete /dashboard/servers. Less duplication. Removes the overview surface. | |
| Make /dashboard redirect to /dashboard/servers | Treat /dashboard/servers as canonical. Clean but loses overview. | |

**User's choice:** Keep both, differentiate
**Notes:** Extract a shared `WebsiteCard` so the two pages can't drift visually.

### Question 2: How should section count be sourced?

| Option | Description | Selected |
|--------|-------------|----------|
| Add _count.sections to /api/websites response | Prisma's _count include returns counts cheaply in the same query. One API call, no client gymnastics. (Recommended) | ✓ |
| Custom GROUP BY column-aggregate | Full control, more code than _count for the same result. | |
| Lazy fetch per-card | Card mounts → fetches count. Trivial backend change but N+1 client requests. | |

**User's choice:** Add _count.sections to /api/websites response

### Question 3: How should the live URL appear on the card?

| Option | Description | Selected |
|--------|-------------|----------|
| Clickable subdomain text, opens in new tab | "<subdomain>.minesites.net" becomes a real <a target="_blank"> with stopPropagation so card-click still routes to /dashboard/[id]. Meets DASH-04, minimal layout change. (Recommended) | |
| Separate "Visit site" button | Small button (↗ icon) next to the status pill. Explicit affordance, more visual chrome. | |
| Both — clickable text AND visit button | Maximum discoverability. Noisy for a tertiary action. | ✓ |

**User's choice:** Both — clickable text AND visit button
**Notes:** Both affordances point at the same URL; ensure ARIA/tooltip on the icon button.

### Question 4: What happens when a free user tries to visit/share a draft (unpublished) website URL?

| Option | Description | Selected |
|--------|-------------|----------|
| Current behavior — 404 | [subdomain]/page.tsx already calls notFound() when !server.published && !isPreviewMode. (Recommended — no change needed) | ✓ |
| Hide live URL for drafts on the card | Replace clickable subdomain with muted "Not published" text. | |
| Show "Preview" link instead | For drafts, link goes to /<subdomain>?preview=true. Useful for owners but bypasses the published gate. | |

**User's choice:** Current behavior — 404

---

## Cleanup scope

### Question 1: Should we rename the editor route directory [serverId] → [websiteId]?

| Option | Description | Selected |
|--------|-------------|----------|
| Rename to [websiteId] | Move src/app/(dashboard)/dashboard/[serverId]/ → [websiteId]/. Rename useParams() destructure; update all serverId-as-website-id references inside. Terminology aligned with Phase 6/7. ~3187-line god-component touched. (Recommended) | ✓ |
| Leave as [serverId] | Skip the rename; route param still works. Zero risk; terminology drift remains. | |

**User's choice:** Rename to [websiteId]

### Question 2: Should we rename create-server-dialog.tsx → create-website-dialog.tsx?

| Option | Description | Selected |
|--------|-------------|----------|
| Rename file + component + imports | File: create-website-dialog.tsx; component: CreateWebsiteDialog; update 2 import sites. Cheap. (Recommended) | ✓ |
| Leave the filename, content already says Website | Component already uses createWebsiteSchema/createWebsite; only filename/exported name stale. | |

**User's choice:** Rename file + component + imports

### Question 3: Should we drop serverIp/serverPort from server-settings.tsx and [subdomain]/page.tsx?

| Option | Description | Selected |
|--------|-------------|----------|
| Remove from both | server-settings.tsx Server interface drops the fields; [subdomain]/page.tsx stops setting serverIp:null in serverData; [subdomain]/layout.tsx placeholder removed; SiteNav serverIp prop reviewed. (Recommended) | ✓ |
| Remove from server-settings only | Defer [subdomain] cleanup — SiteNav currently shows IP, which needs to come from a connected MinecraftServer. | |
| Leave both, defer | Fields not actively used; leave until section types that need them land. | |

**User's choice:** Remove from both

### Question 4: What about the `Server` interface name inside the editor god-component?

| Option | Description | Selected |
|--------|-------------|----------|
| Rename to Website / WebsiteData | Sweep the god-component for local interfaces still called Server* (server-actions, server-settings, ServerData usages); rename to Website*. Complete terminology cleanup. | ✓ |
| Only rename when files are otherwise touched | If a file isn't already in scope for another change, leave its local Server* type alone — capture as a deferred sweep. (Recommended — keeps blast radius contained) | |
| Defer entirely | Phase 8 ships zero type renames in the god-component. | |

**User's choice:** Rename to Website / WebsiteData
**Notes:** User opted for the broader sweep over the more conservative "only when otherwise touched" default. Planner should still scope the sweep to files reachable from this phase's directly-touched set (the god-component and its siblings) rather than chasing ServerData references project-wide.

---

## Claude's Discretion

- Exact card metadata visual layout (where section count sits relative to status pill and visit button)
- "Add server" affordance shape inside the modal: expand-on-click button vs always-visible empty form row
- Modal width and internal scrolling behavior
- Toast vs inline error placement for connections-modal failures
- Whether to rename `server-actions.tsx` and `server-settings.tsx` filenames (optional companion to the type rename)

## Deferred Ideas

- Live status badges on Website cards (player count, ping, online indicator) — future enhancement; depends on a deferred section type and a "default server" concept
- MinecraftServer-aware SiteNav showing the active server's IP — re-introduce when SECT-02/SECT-03 land
- Wholesale god-component refactor (extracting top bar, sidebar, canvas) — post-v1.1
- Bulk operations on websites or servers
- Undo for destructive actions
- Custom-domain support beyond `.minesites.net` (v2 GROW-01)
- Live-as-you-type subdomain availability check
- `server-actions.tsx` / `server-settings.tsx` filename renames (optional)
- Top-level `/dashboard/settings/` and `/dashboard/analytics/` page rewrites
- PreviewClient internal refactor (this phase only touches its prop type)
