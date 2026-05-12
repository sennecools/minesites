# Phase 8: Dashboard & Public Site - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the UX surface that consumes the Phase 7 API and Phase 6 model. The dashboard already lists websites correctly (both `/dashboard` and `/dashboard/servers` already fetch `/api/websites`); the create dialog already creates websites; the public site already routes by subdomain via `db.website.findUnique`. Phase 8 finishes the v1.1 milestone by adding the MinecraftServer connections manager to the editor, surfacing the live URL + section count on Website cards, and completing the terminology/cleanup pass that Phase 7 deferred.

**In scope:**

- **Connections manager (DASH-03):** "Manage Servers" button in the editor top-bar action cluster (next to Preview/Publish) opens a modal that fetches `GET /api/websites/[id]/servers` on open. List + inline add row pattern; two-line read rows (name + IP:port on top, description preview below, edit/delete actions right-aligned); add/edit form shows port (placeholder `25565`) and description by default; delete confirmed inline via row swap. Each CRUD action commits independently against its Phase-7 endpoint.
- **Website cards (DASH-01, DASH-04):** Section count fetched via Prisma `_count.sections` in `GET /api/websites`. Live URL rendered as both a clickable `<subdomain>.minesites.net` anchor (target="\_blank", `stopPropagation` so card-click still routes to editor) AND a small "↗" visit button. Draft (`!published`) behavior unchanged — `[subdomain]/page.tsx` still `notFound()`s.
- **Dashboard page layout (DASH-01):** Keep both `/dashboard` (overview: stats + recent grid + tips) and `/dashboard/servers` (full list with search/filter/grid-list toggle). Update both card grids in lockstep so they share the same Website card component shape.
- **Create-website dialog (DASH-02):** Already uses `createWebsiteSchema` and `createWebsite` action. Subdomain uniqueness validation stays as it is — server-side P2002 catch → 409 (Phase 7 D-19). File and component rename: `create-server-dialog.tsx` → `create-website-dialog.tsx`, `CreateServerDialog` → `CreateWebsiteDialog`, update the two import sites.
- **Public routing verification (success criterion 4):** Confirm `[subdomain].minesites.net` renders the Website's published sections via the existing `[subdomain]/page.tsx` + middleware path. Drop `serverIp: null` from the `serverData` object passed to `PreviewClient`. Review `[subdomain]/layout.tsx`'s `serverIp = ""` placeholder + `SiteNav` prop — remove or replace with a comment noting the future MinecraftServer hookup.
- **Route directory rename:** `src/app/(dashboard)/dashboard/[serverId]/` → `src/app/(dashboard)/dashboard/[websiteId]/`. The 3187-line god-component `page.tsx` and siblings (`server-actions.tsx`, `server-settings.tsx`) move with the directory; all `useParams<{ serverId }>()` destructures and local `serverId` references rename to `websiteId`.
- **Legacy field removal:** Drop `serverIp`/`serverPort` from `server-settings.tsx`'s local `Server` interface and the form (form does not render them currently — type-level only). Drop `serverIp: null` from `[subdomain]/page.tsx`'s `serverData`. Reconcile `[subdomain]/layout.tsx`'s `serverIp` placeholder and `SiteNav` prop with the new model.
- **Type-name sweep (god-component):** Rename local `Server*` interfaces still present in `dashboard/[websiteId]/` files to `Website*` (e.g., `ServerData` → `WebsiteData`, `ServerProps` → `WebsiteProps`). The model-side rename is done; this cleans up local types.

**Out of scope:**

- New section type renderers that consume `minecraftServerId` (Live Player Count, Server Info) — deferred v1.0 SECT-02/SECT-03.
- The MinecraftServer-aware logic in `[subdomain]/layout.tsx`'s `SiteNav` (showing the active server's IP in the public nav) — depends on the deferred section types and on a "default server" concept that isn't in the schema.
- Custom domains beyond subdomains (v2 GROW-01).
- Live status badges on Website cards in the dashboard list (e.g., player count, ping) — not in DASH-\* requirements; future enhancement.
- Analytics page (`/dashboard/analytics/`) — out of scope for v1.1; leave the existing page as-is.
- Top-level `/dashboard/settings/` page — separate concern, leave as-is.
- Wholesale god-component refactor — only the route param rename and the local-type sweep above; broader extraction is post-v1.1.
- Undo/restore for deleted MinecraftServer or Website records.
- Bulk operations (multi-select delete, bulk import).
- Subdomain change re-routing UX (the dashboard URL is keyed on `id`, not `subdomain`, so no client-side redirect work is needed).

</domain>

<decisions>
## Implementation Decisions

### Connections Manager Placement (DASH-03)

- **D-01: Modal pattern.** A "Manage Servers" button in the editor top-bar action cluster (right side, next to Preview/Publish at `dashboard/[websiteId]/page.tsx` ~line 2580) opens a modal. NOT a third sidebar tab, NOT a separate route, NOT a top-bar tab row. The sidebar's "Sections" / "Appearance" toggle stays untouched.
- **D-02: Fetch on open.** The modal calls `GET /api/websites/[websiteId]/servers` (existing Phase-7 endpoint) every time it opens. No payload extension to the editor's initial `/api/websites/[id]` load. List always fresh; small open-time spinner is acceptable.
- **D-03: Independent commits.** Add (`POST`), edit (`PUT`), and delete (`DELETE`) each hit their own Phase-7 endpoint immediately when the user confirms. They do NOT participate in the editor's "Publish" (PUT `/api/websites/[id]`) save flow. The editor's dirty-state tracking is unaffected by modal actions.

### Connections Manager UX

- **D-04: List + inline add row.** The modal body is a vertical list of existing rows plus a persistent "Add server" affordance (button that expands into the inline form, OR an always-visible empty form row — planner picks whichever feels less cluttered for the common 1-3-server case). No secondary stacked modal, no two-pane layout.
- **D-05: Two-line read row.** Each existing-server row shows: line 1 — name (primary text) + `IP:port` (muted secondary, monospace or similar visual differentiation); line 2 — description preview (truncated to ~80 chars with `line-clamp-1`). Edit/delete action buttons right-aligned. Row hover surface for affordance; edit toggles the row into edit-mode in place.
- **D-06: Form fields visible by default.** Add/edit form exposes all four fields without an "Advanced" toggle: name (required), IP/hostname (required), port (placeholder `25565`, optional in form — server-side default applies), description (optional textarea). Validation maps to `src/lib/validations/mcserver.ts` (Phase 7 — D-07 loose-string IP, D-08 port 1-65535, D-09 name max 50, description max 200). Show inline field errors; surface server `error` messages via toast.
- **D-07: Inline delete confirm.** Clicking delete swaps the row into a confirm state (`"Delete '<name>'? [Cancel] [Delete]"`) inline. No `confirm()` browser dialog. No stacked modal. No silent-delete-with-undo (would require new undo plumbing).

### Dashboard Cards (DASH-01, DASH-04)

- **D-08: Keep both pages, share the card.** `/dashboard` continues as the overview (stats + recent grid + Pro tips). `/dashboard/servers` continues as the full list (search/filter/grid-list toggle). Both render the same Website card. Extract a shared `WebsiteCard` component (likely `src/components/dashboard/website-card.tsx`) so the two pages cannot drift visually. Both grids currently inline-duplicate ~80 lines of card JSX — that's the prime extraction target.
- **D-09: Section count via `_count`.** Update the `GET /api/websites` route's Prisma query to `include: { _count: { select: { sections: true } } }`. The response shape gains `_count.sections: number`. Card renders it as part of the metadata row (e.g., "5 sections" pill or icon-prefixed text). NOT a lazy per-card fetch; NOT a custom GROUP BY.
- **D-10: Live URL — clickable text + visit button.** Card renders `<subdomain>.minesites.net` as a real `<a href="https://{subdomain}.minesites.net" target="_blank" rel="noreferrer noopener" onClick={stopPropagation}>` so card-body-click still routes to `/dashboard/{websiteId}`. Additionally, a small "↗" icon button beside the status pill provides an explicit visit affordance with `aria-label="Visit live site"`. Both go to the same URL.
- **D-11: Draft behavior unchanged.** No special "Not published" treatment of the URL on the card itself — the card always shows the URL. `[subdomain]/page.tsx` continues to `notFound()` when `!server.published && !isPreviewMode`. The preview-mode bypass (`?preview=true`) is unchanged and remains owner-facing-only by virtue of needing knowledge of the URL pattern.

### Cleanup / Terminology Sweep

- **D-12: Route directory rename.** Move `src/app/(dashboard)/dashboard/[serverId]/` → `src/app/(dashboard)/dashboard/[websiteId]/`. The three files (`page.tsx`, `server-actions.tsx`, `server-settings.tsx`) move with the directory. `useParams<{ serverId: string }>()` becomes `useParams<{ websiteId: string }>()`; all local `serverId` variable references become `websiteId`. Internal `Link` hrefs from peer dashboard pages (`/dashboard/${id}`) keep working since the URL pattern is the same — only the route param name changes.
- **D-13: Dialog file/component rename.** `create-server-dialog.tsx` → `create-website-dialog.tsx`; `CreateServerDialog` → `CreateWebsiteDialog`. Update the two import sites: `src/app/(dashboard)/dashboard/page.tsx` and `src/app/(dashboard)/dashboard/servers/page.tsx`.
- **D-14: Legacy `serverIp` / `serverPort` removal.**
    - `server-settings.tsx` — Drop `serverIp` and `serverPort` from the local `Server` interface (file is also subject to the rename to `website-settings.tsx`? — planner decides; not required for this phase but consistent).
    - `[subdomain]/page.tsx` — Remove `serverIp: null` from the `serverData` object passed to `PreviewClient`. Update `PreviewClient` prop typing so the field no longer needs to exist (`src/app/[subdomain]/preview-client.tsx`).
    - `[subdomain]/layout.tsx` — The line `const serverIp = "";   // Phase 6 placeholder; Phase 7 adds MinecraftServer lookup` is now misleading. Two options: (a) drop the var + drop the `serverIp` prop from `SiteNav`; (b) keep the prop but pass `""` with a comment that the SECT-02/SECT-03 phase will wire a default MinecraftServer. **Pick (a)** — drop the prop entirely. The future section-type phase can re-add it. Reduces dead code in the meantime.
    - `SiteNav` component — drop the `serverIp` prop and any rendering that depended on it.
- **D-15: God-component local-type sweep.** Inside `dashboard/[websiteId]/page.tsx` (and `server-actions.tsx`, `server-settings.tsx` siblings), rename any local interfaces still called `Server*` to `Website*`. Specific names spotted: `Server` interface in `server-settings.tsx` (currently `{ id, name, subdomain, description, serverIp, serverPort }` — becomes `Website` interface with the latter two dropped per D-14). `ServerData` references in the god-component → `WebsiteData`. **Heuristic for the planner:** only touch local types defined in files already in this phase's scope; do not chase `ServerData` references in completely unrelated files (the editor-page extraction is a separate concern).
- **D-16: Filename renames for the sibling editor files (optional).** `server-actions.tsx` and `server-settings.tsx` filenames are stale but functional. The planner MAY rename to `website-actions.tsx` and `website-settings.tsx` if it doesn't significantly expand the diff; otherwise the local-type rename is sufficient.

### Public Routing Verification (success criterion 4)

- **D-17: Existing path is correct.** `src/app/[subdomain]/page.tsx` already calls `db.website.findUnique({ where: { subdomain }, include: { sections: ... } })`. `src/middleware.ts` already rewrites `myserver.minesites.net` → `/myserver`. Phase 8 does not modify these; it verifies them and updates the data shape (drop `serverIp: null`).
- **D-18: PreviewClient prop shape.** The `serverData` object passed to `PreviewClient` becomes `{ name, subdomain }` only. If `PreviewClient` internally has stale references to `serverIp` on its incoming prop, update the prop type and remove the field. (Implementation note: `PreviewClient` is a long file, but the public prop interface is the contract that matters here.)

### Carry-Forward from Phase 7 (do not regress)

- **D-19: All Phase 7 carry-forwards remain.** Subdomain uniqueness 409 on PUT (Phase 6 CR-01 fix), freemium section limit (Phase 6 CR-03 fix), P2002 catch in `actions.ts` (Phase 6 WR-05 fix), session-user existence check in `createWebsite` action — all stay intact. Phase 8 changes UI/routing/cleanup but does not touch the server-side guards.
- **D-20: MinecraftServer ownership enforcement.** All MinecraftServer endpoints already check that the authenticated user owns the parent Website via the double-ownership chain (Phase 7 D-05). The connections modal makes no changes to backend trust boundaries.

### Claude's Discretion

- **Exact card metadata layout.** Section count placement (next to status pill? in description row? as its own row?) is a polish call within the existing card shell. The planner / UI phase will tune visual hierarchy.
- **"Add server" affordance — button-that-expands vs always-visible empty form row.** Either lands within D-04's "list + inline add row" decision. Pick whichever reads cleaner for the empty state (0 servers) and the populated state (1-3 servers).
- **Modal width and content scrolling behavior.** The existing `Modal` component (`src/components/ui/modal.tsx`) sets the chrome; the connections modal fits inside it. The planner picks max-width and any internal scrolling rules.
- **Toast vs inline error messaging for connections-modal failures.** Inline for validation; toast (existing `ToastProvider`) for server errors and successes. Planner can tune.
- **Whether to rename `server-actions.tsx` and `server-settings.tsx` filenames** (D-16) — only if the diff stays small. The user did not require this; the local-type rename is the floor.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Definition

- `.planning/ROADMAP.md` §Phase 8 — Success criteria (4 numbered items), goal, requirements list
- `.planning/REQUIREMENTS.md` §DASH-01, DASH-02, DASH-03, DASH-04 — Dashboard UX requirements covered by this phase

### Prior Phase Context

- `.planning/phases/06-schema-reset/06-CONTEXT.md` — Schema decisions; `MinecraftServer` model shape (D-03 name/ip/port/description); `Website` model (D-01 subdomain unique); cascade rules (D-04); section.settings canonical (D-05)
- `.planning/phases/07-api-layer/07-CONTEXT.md` — API endpoints this phase consumes; especially D-04 (per-record CRUD shape: `POST /api/websites/[id]/servers`, `PUT /api/websites/[id]/servers/[serverId]`, `DELETE` same), D-05 (ownership chain), D-07–D-09 (validation shape), D-17–D-20 (carry-forward guards that must not regress)
- `.planning/phases/07-api-layer/07-REVIEW-FIX.md` (if present — confirm during planning) — Phase 7 fix log; do not regress WR-04, WR-07, WR-08, WR-09

### Current Schema

- `prisma/schema.prisma` — `Website` (id, name, subdomain unique, sections, servers, userId), `MinecraftServer` (id, name, ip, port, description, websiteId), `Section` (websiteId, type, settings JSON, visible, order)

### Validation Schemas (consumed by the connections modal)

- `src/lib/validations/mcserver.ts` — `createMcServerSchema`, `updateMcServerSchema` (Phase 7 D-07–D-09)
- `src/lib/validations/website.ts` — `createWebsiteSchema`, `updateWebsiteSchema` (still consumed by `create-website-dialog.tsx`)

### API Endpoints (consumed; do not modify)

- `src/app/api/websites/route.ts` — `GET` list (extend response to include `_count.sections` per D-09) + `POST` create
- `src/app/api/websites/[websiteId]/route.ts` — `GET` single, `PUT` update (sections + theme + navbar), `DELETE`
- `src/app/api/websites/[websiteId]/servers/route.ts` — `POST` create MinecraftServer
- `src/app/api/websites/[websiteId]/servers/[serverId]/route.ts` — `PUT` update, `DELETE`

### Files Touched in This Phase

- `src/app/(dashboard)/dashboard/page.tsx` — overview page; update card grid to consume `_count.sections`; render shared `WebsiteCard`
- `src/app/(dashboard)/dashboard/servers/page.tsx` — list page; same card extraction
- `src/app/(dashboard)/dashboard/create-server-dialog.tsx` — rename to `create-website-dialog.tsx` (file + component)
- `src/app/(dashboard)/dashboard/actions.ts` — already uses `createWebsite` / `updateWebsite` / `deleteWebsite` (Phase 7 D-14); no rename needed
- `src/app/(dashboard)/dashboard/[serverId]/` — rename entire directory to `[websiteId]/`; rewrite `useParams` destructure in `page.tsx`, `server-actions.tsx`, `server-settings.tsx`
- `src/app/(dashboard)/dashboard/[serverId]/page.tsx` — add "Manage Servers" button in top-bar action cluster (~line 2580 area, next to Preview/Publish); render new `ConnectionsModal` controlled by local state; local `Server*` types renamed (D-15)
- `src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx` — drop `serverIp`/`serverPort` from the `Server` interface; rename `Server` → `Website` (and possibly filename per D-16)
- `src/app/[subdomain]/page.tsx` — drop `serverIp: null` from `serverData`; update prop shape
- `src/app/[subdomain]/preview-client.tsx` — update incoming `server` prop typing (no more `serverIp`)
- `src/app/[subdomain]/layout.tsx` — drop the `serverIp = ""` placeholder and the `serverIp` prop on `<SiteNav />`
- `src/components/sections/site-nav` (or wherever `SiteNav` lives — confirm path during planning) — drop the `serverIp` prop and any rendering that used it

### New Files

- `src/components/dashboard/website-card.tsx` (or equivalent path) — shared Website card; consumed by both `/dashboard` and `/dashboard/servers`
- `src/components/dashboard/connections-modal.tsx` (or equivalent) — the MinecraftServer connections manager modal (open via "Manage Servers" button)

### UI Primitives (reuse, do not fork)

- `src/components/ui/modal.tsx` — `Modal`, `ModalHeader`, `ModalTitle`, `ModalContent`, `ModalFooter`
- `src/components/ui/button.tsx`, `input.tsx`, `textarea.tsx`, `toast.tsx` (`ToastProvider`/`useToast`)
- `src/components/ui/card.tsx` — for the shared `WebsiteCard` outer shell
- `src/components/ui/index.ts` — barrel for cleaner imports

### Architecture Context

- `.planning/codebase/ARCHITECTURE.md` — app structure; subdomain rewrite middleware; Server Actions vs API split
- `.planning/codebase/STRUCTURE.md` — where to add new components (`src/components/dashboard/` for dashboard-specific shared bits)
- `.planning/codebase/CONVENTIONS.md` — Next.js patterns, file naming (kebab-case .tsx for components)
- `src/middleware.ts` — subdomain rewrite logic; verify path during success-criterion-4 testing, do not modify

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/components/ui/modal.tsx` — `Modal` (controlled `isOpen`), `ModalHeader`/`ModalTitle`/`ModalContent`/`ModalFooter` — used by `CreateServerDialog`; the connections manager modal reuses the same chrome.
- `src/components/ui/toast.tsx` — `ToastProvider` is mounted at root layout; `useToast()` hook is available everywhere; reuse for connections CRUD success/error feedback.
- `src/lib/validations/mcserver.ts` — Phase 7's Zod schemas; pair with `@hookform/resolvers/zod` + `react-hook-form` like `CreateServerDialog` does.
- `src/lib/utils.ts` — `formatRelativeTime` (WR-09 dedupe) already shared; use it for "Updated 3 days ago" if cards surface the updatedAt timestamp.
- Existing `CreateServerDialog` is the template for `useForm + zodResolver + Modal + FormData submit + isRedirectError catch + reset on close`. The connections modal's per-row form follows the same pattern (minus the redirect — it stays in the modal after save).

### Established Patterns

- **Card grid duplication.** `/dashboard/page.tsx` and `/dashboard/servers/page.tsx` both inline ~80 lines of identical card JSX (the Link wrapper + status pill + subdomain text + MoreHorizontal button). Extracting `WebsiteCard` is the highest-leverage shared component for this phase — both pages will visibly drift otherwise.
- **Local state + `useEffect` fetch.** Both list pages do `useState<WebsiteData[]>([])` + `useEffect(() => fetch('/api/websites'))`. The editor's connections-modal mirrors this pattern (open → fetch → setState).
- **Section save is bulk-replace.** `PUT /api/websites/[id]` deletes all sections and recreates from the payload (Phase 7 D-04). Phase 8 does NOT touch the section save path; the connections modal lives entirely outside it.
- **Subdomain uniqueness already enforced.** Schema-level `@unique` + Prisma P2002 catch in `actions.ts` (Phase 6 WR-05) + 409 response in `PUT /api/websites/[id]` (Phase 6 CR-01). No new validation work needed for DASH-02.
- **`[subdomain]/page.tsx` is already website-aware.** It queries `db.website.findUnique` and gates on `published || isPreviewMode`. Success criterion 4 is mostly a verification + data-shape cleanup, not a routing rewrite.

### Integration Points

- **Editor top-bar action cluster** (`dashboard/[websiteId]/page.tsx` ~line 2580): currently `Preview` + `Publish` (which is actually Save). The new "Manage Servers" button slots between them, before `Preview` or before `Publish` — planner decides on visual order.
- **API response shape change.** `GET /api/websites` adds `_count: { sections: number }` to each Website. Update the `WebsiteData` interface in both list pages (and the shared `WebsiteCard`). Internal callers (e.g., dashboard `/dashboard/servers` `filteredServers` filter) don't reference the new field — extension is additive.
- **`isRedirectError` import path.** `CreateServerDialog` imports from `next/dist/client/components/redirect-error` — an internal path. The connections modal does NOT need this (no `redirect()` after server-action calls — the modal stays open and refreshes its list).
- **Public `[subdomain]` rendering.** No new section type renderers in this phase. Existing `PreviewClient` switch-case still dispatches on `section.type`.

</code_context>

<specifics>
## Specific Ideas

- **Modal title.** "Connected Minecraft Servers" or "Server Connections". Planner picks; either reads correctly.
- **Empty state in the modal.** A short line like "No servers connected yet. Add one to enable Live Player Count and Server Info sections." — this proactively tells the user why connections matter. (Live Player Count and Server Info are deferred v1.0 SECT-02/SECT-03 — the message is forward-looking, but the wording is accurate as a feature description.)
- **Section count rendering on the card.** Match the existing status-pill visual language: small rounded badge or inline icon-prefixed text. The card's "Info" `<div>` currently sits empty between description and footer — section count slots there naturally.
- **Visit button visual.** Reuse the `ArrowUpRight` icon already imported in both list pages (used today for the "Edit" hover affordance). Keep it small and muted by default; brighten on hover. Place it adjacent to the live-status pill in the card footer.
- **Inline delete confirm copy.** "Delete '{name}'?" with right-aligned `[Cancel] [Delete]` buttons; delete button is red. ~3-4 second auto-revert is NOT needed — the user explicitly clicks Cancel or Delete.
- **Form layout.** Two columns at modal width >= 480px: Name | IP on row 1, Port | (empty) on row 2, Description full-width on row 3. Single-column collapse below that breakpoint.
- **Route rename order.** Do the directory rename first (in a focused commit), then the in-file `serverId` → `websiteId` token sweep (in a follow-up commit) — so a regression bisect cleanly identifies which step broke something. Planner's call whether to split into two plans or two commits within one plan.

</specifics>

<deferred>
## Deferred Ideas

- **Live status badges on Website cards** (player count, ping, online/offline indicator) — out of DASH-\* scope; depends on a deferred Live Player Count section type and a "default server" concept. Future enhancement.
- **MinecraftServer-aware `SiteNav`** (the public site's top nav showing the IP of a connected server) — depends on a "default server" selection on the Website (no such field today) and on the SECT-02/SECT-03 section types. Re-introduce the `serverIp` prop when those land.
- **Wholesale god-component refactor** — Phase 1's promise (every new section type = 2 files + 1 registry entry) holds; extracting the editor's other concerns (top bar, sidebar, canvas) is a post-v1.1 cleanup.
- **Bulk operations** (multi-select delete websites or servers, bulk import IPs from a paste) — not requested.
- **Undo for destructive actions** (recently-deleted websites and servers recoverable for N hours) — not requested.
- **Custom-domain support** beyond `.minesites.net` subdomain — v2 GROW-01.
- **Live-as-you-type subdomain availability check** — not requested; on-submit + 409 catch is the chosen UX (Phase 7 D-19 carry-forward).
- **`server-actions.tsx` and `server-settings.tsx` filename renames** — optional per D-16; planner can defer if the diff would balloon.
- **Top-level `/dashboard/settings/` and `/dashboard/analytics/` page rewrites** — separate concerns; out of scope.
- **PreviewClient internal refactor** — only the prop type and `serverIp` reference change in this phase; internal section dispatch is untouched.

</deferred>

---

_Phase: 8-Dashboard-Public-Site_
_Context gathered: 2026-05-12_
