---
phase: 08-dashboard-public-site
plan: 04
subsystem: ui
tags: [react, nextjs, react-hook-form, zod, modal, rest-crud, dashboard]

# Dependency graph
requires:
  - phase: 06-schema-reset
    provides: MinecraftServer model (name, ip, port, description, websiteId)
  - phase: 07-api-layer
    provides:
      - POST /api/websites/[websiteId]/servers (D-04 per-record CRUD)
      - PUT  /api/websites/[websiteId]/servers/[serverId]
      - DELETE /api/websites/[websiteId]/servers/[serverId]
      - GET  /api/websites/[websiteId]/servers
      - WR-04 error envelope ({ error, details? })
      - D-05 double-ownership chain (Website.userId + MinecraftServer.websiteId)
  - plan: 08-01
    provides: editor route renamed to [websiteId]/; useParams<{ websiteId }>() + websiteId variable in scope
  - plan: 08-02
    provides: WebsiteData shape stable (no serverIp); SectionPreview literal cleared
  - plan: 08-03
    provides: src/components/dashboard/ directory + barrel index.ts; WebsiteCard precedent for shared dashboard components
provides:
  - ConnectionsModal client component (src/components/dashboard/connections-modal.tsx) for DASH-03
  - Barrel re-export ConnectionsModal alongside WebsiteCard (src/components/dashboard/index.ts)
  - "Manage Servers" affordance in the editor god-component top-bar action cluster (between hasUnsavedChanges pill and Preview button)
  - <ConnectionsModal /> mount in the god-component's outermost return tree
  - WR-04 client-side error-envelope unwrap pattern (`body.error ?? <fallback>`) on every REST CRUD response — surfaces server-side messages verbatim
  - Per-record commit pattern (D-03): each CRUD action hits its own endpoint; no participation in the editor's bulk PUT save
affects: [future SECT-02 / SECT-03 section types that consume connected MinecraftServer records]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fetch-on-open + cancellation cleanup for modal-scoped data (RESEARCH Pattern 1 + Pitfall 2): `if (!isOpen) return;` gate, `let cancelled = false` flag, abort-aware setters"
    - "Row state machine (RowMode = read | edit | confirm-delete) via Record<id, RowMode> — only one row in edit/confirm mode at a time"
    - "Single ServerForm component parameterized on mode + initial — shared between add and edit, drives label copy + reset behavior"
    - "react-hook-form port field: `register('port', { valueAsNumber: true, setValueAs: v => empty? undefined : Number(v) })` so empty string → undefined → server applies Prisma @default(25565)"
    - "Modal width override via className=max-w-lg (tailwind-merge resolves max-w-md vs max-w-lg correctly — RESEARCH Pitfall 4 verified live)"
    - "Modal-mount footprint pattern in god-component: import + useState + button + mount = 12-line net delta (CLAUDE.md rule 1)"

key-files:
  created:
    - src/components/dashboard/connections-modal.tsx
  modified:
    - src/components/dashboard/index.ts
    - src/app/(dashboard)/dashboard/[websiteId]/page.tsx
  renamed: []

key-decisions:
  - "REST not Server Actions: ConnectionsModal commits via fetch + JSON to per-record endpoints. No `isRedirectError` import — the create-website-dialog uses it because `createWebsite` Server Action calls `redirect()` on success; this modal stays open and refreshes its own list."
  - "Affordance dual-state per RESEARCH Open Question 3: empty state shows a `variant=primary` 'Add Server' CTA centered under the heading; populated state shows a `variant=ghost` full-width 'Add Server' button at the bottom of the list. Both expand into the same inline form rendered inside a `bg-zinc-50 border` card."
  - "Form labels use `font-normal` (400) per UI-SPEC §Typography (only 400/600 in this file); the analog `create-website-dialog.tsx` uses `font-medium` (500) as pre-Phase-8 carry-forward. The new 'Manage Servers' top-bar button also uses `font-normal`, while the existing 'Preview' and 'Publish' cluster buttons keep their pre-Phase-8 `font-medium` — Phase 8 only governs NEW components per UI-SPEC."
  - "Net delta target hit: 12 lines added to the god-component (≤ 15 per CLAUDE.md rule 1). Modal mount JSX was folded onto a single line to stay under target."
  - "Modal close discards inline form state per UI-SPEC §Interaction Contracts: when isOpen flips to false, the effect's cleanup clears servers/rowMode/showAddForm. Reopening always fetches fresh + starts in a clean state."
  - "Single ServerForm component reused for add + edit (analog: dialog has one form). Eliminates duplication and guarantees identical Zod binding + field layout."

patterns-established:
  - "Pattern: ConnectionsModal-style modal — fetch-on-open with cancellation, per-record REST CRUD, WR-04 error envelope unwrap, toast feedback for success + verbatim server errors"
  - "Pattern: god-component mount footprint ≤ 15 lines per CLAUDE.md rule 1 (this plan: 12 lines: 1 import, 1 useState, 8 button block, 1 modal mount, 1 surrounding blank)"

requirements-completed: [DASH-03]

# Metrics
duration: 5min29s
started: 2026-05-12T15:32:29Z
completed: 2026-05-12
---

# Phase 08 Plan 04: ConnectionsModal + Manage Servers Trigger Summary

**DASH-03 closed: built `ConnectionsModal` (~431 lines) that fetches on open, lists Minecraft server connections, supports per-record add/edit/delete against the Phase 7 REST endpoints with WR-04 envelope unwrap, and wired it into the editor top-bar via a "Manage Servers" button + modal mount in a 12-line net delta (CLAUDE.md rule 1 target: ≤ 15).**

## Performance

- **Duration:** ~5m 29s
- **Started:** 2026-05-12T15:32:29Z
- **Tasks:** 2 / 2
- **Files created:** 1 (`src/components/dashboard/connections-modal.tsx` — 431 lines)
- **Files modified:** 2 (`src/components/dashboard/index.ts` +1 line; `src/app/(dashboard)/dashboard/[websiteId]/page.tsx` +12 lines)

## Accomplishments

- **DASH-03 satisfied**: the editor exposes a "Manage Servers" affordance in the top-bar action cluster that opens a modal listing connected MinecraftServer records and supports add/edit/remove against the Phase 7 endpoints (D-01 + D-02 + D-03 + D-04 + D-05 + D-06 + D-07).
- **D-03 (independent commits) honored**: each CRUD action commits to its own per-record endpoint immediately; the modal does NOT participate in the editor's `PUT /api/websites/[id]` bulk save. The modal owns its own state — `servers[]`, `rowMode`, `showAddForm`, `isLoading` — and never reaches into `serverData`, `sections`, `themeSettings`, or `navbarSettings`.
- **WR-04 error envelope respected**: all four REST calls (GET on open, POST on add, PUT on edit, DELETE on remove) read `body.error ?? <fallback>` from non-OK responses and surface server-side messages verbatim via `useToast(..., "error")`. The verification grep confirms `body.error ?? ` appears exactly 4 times in the file.
- **CLAUDE.md rule 1 honored**: net delta in the editor god-component is **+12 lines** (target: ≤ 15). The breakdown is 1 import + 1 useState + ~8 lines for the motion.button + 1 line for the single-line modal mount + 1 surrounding token. The modal body itself lives in its own file in `src/components/dashboard/`.
- **UI-SPEC §Typography compliance**: the connections-modal file has zero `font-medium` occurrences (verified with `grep -c font-medium` = 0). The new "Manage Servers" button uses `font-normal` (400). Surrounding cluster buttons ("Preview", "Publish") keep their pre-Phase-8 `font-medium` (500) — Phase 8 only governs NEW components.
- **TypeScript compile gate clean**: `tsc --noEmit` exits 0 after both tasks.

## Task Commits

1. **Task 1: Build ConnectionsModal + extend barrel** — `43b2d3c` (feat)
2. **Task 2: Mount ConnectionsModal in the editor god-component (≤ 15-line delta)** — `d0577eb` (feat)

## Files Created / Modified

### `src/components/dashboard/connections-modal.tsx` (NEW, 431 lines)

Named export: `export function ConnectionsModal({ websiteId, isOpen, onClose }: ConnectionsModalProps)`.

Internal structure (top → bottom of the file):
- Imports: React (`useState`, `useEffect`), `react-hook-form`, `zodResolver`, UI primitives (`Button`, `Input`, `Textarea`, `Modal`, `ModalHeader`, `ModalTitle`, `ModalContent`), `useToast`, `createMcserverSchema` + `CreateMcserverInput` type, lucide icons (`Server`, `Loader2`, `Pencil`, `Trash2`, `Plus`, `X`).
- Types: `McServer` (mirrors Phase 7 endpoint response — `id`, `name`, `ip`, `port`, `description: string | null`); `RowMode = "read" | "edit" | "confirm-delete"`; `ConnectionsModalProps`.
- Component `ConnectionsModal`:
  - State: `servers[]`, `isLoading`, `rowMode: Record<string, RowMode>`, `showAddForm`, `toast` from `useToast()`.
  - Helpers: `modeOf(id)`, `setOnlyRowMode(id, mode)` (single-row policy from UI-SPEC), `exitRowMode(id)`.
  - `useEffect` on `[isOpen, websiteId, toast]`: `if (!isOpen) return;` (with cleanup that clears `servers`/`rowMode`/`showAddForm` for clean reopen); `let cancelled = false` flag; in-flight `await fetch('/api/websites/{websiteId}/servers')` with WR-04 unwrap; `return () => { cancelled = true; }` cleanup.
  - CRUD handlers: `addServer`, `updateServer`, `deleteServer` — each hits the correct endpoint, unwraps `body.error`, updates local state, fires the corresponding success toast (`"Server added" | "Server updated" | "Server removed"`).
  - Render tree: `<Modal className="max-w-lg">` → `<ModalHeader>` with "Connected Minecraft Servers" title + close X button → `<ModalContent className="max-h-[60vh] overflow-y-auto scrollbar-thin">` → loading/empty/list-and-form branches.
- Sub-component `ServerRow` — read mode (two-line: name + IP:port on line 1, description on line 2 if present, edit+delete icon buttons right-aligned); edit mode (renders `<ServerForm mode="edit" initial={server}>` in a `bg-zinc-50 border` card); confirm-delete mode (red bg, `Delete '{name}'?` text, `[Cancel] [Delete]` with `autoFocus` on Delete per UI-SPEC §Accessibility).
- Sub-component `ServerForm` — single form for add + edit, parameterized on `mode` and optional `initial`. Uses `useForm<CreateMcserverInput>({ resolver: zodResolver(createMcserverSchema) })`. Two-column grid layout (Name | IP, Port | empty, Description full-width). Labels use `font-normal` (400). Port input uses `register('port', { valueAsNumber: true, setValueAs: ... })`. Submit button label: `mode === 'edit' ? 'Update Server' : 'Save Server'`. `autoFocus` on the first field per UI-SPEC §Accessibility.

Acceptance criteria coverage (all 16+ grep gates pass):
- `^export function ConnectionsModal`: 1
- `isRedirectError`: 0 (REST-not-Server-Action discipline)
- `next/dist/client/components/redirect-error`: 0
- `if (!isOpen)`: 1 (effect gate); `let cancelled = false`: 1
- `method: "POST"`: 1, `method: "PUT"`: 1, `method: "DELETE"`: 1
- `body.error ??`: 4 (one per CRUD path — GET load, POST add, PUT update, DELETE remove)
- `"Server added"`: 1, `"Server updated"`: 1, `"Server removed"`: 1
- `className="max-w-lg"`: 1
- `"No servers connected yet"`: 1
- `"Add a Minecraft server to enable Live Player Count and Server Info sections."`: 1
- `zodResolver(createMcserverSchema)`: 1
- `font-medium`: 0 (UI-SPEC weight rule)
- `placeholder="25565"`: 1
- `valueAsNumber`: 1
- `aria-label={\`Edit ${server.name}\`}`: 1 (plus `Delete \${server.name}` and `Confirm delete \${server.name}` variants)
- `"Connected Minecraft Servers"` title: 1
- Lines: 431 (≥ 200 required)

### `src/components/dashboard/index.ts` (+1 line)

Barrel gained `export { ConnectionsModal } from "./connections-modal";` alongside the existing `export { WebsiteCard, type WebsiteCardData } from "./website-card";`. Both list pages and the editor can now import from `@/components/dashboard` without reaching into the implementation files.

### `src/app/(dashboard)/dashboard/[websiteId]/page.tsx` (+12 lines net)

Baseline `wc -l`: **3187**. After Task 2: **3199**. **Net delta: +12 lines** (CLAUDE.md rule 1 target: ≤ 15).

Three additions, in order:

1. **Import** (one line, immediately after the existing `AppearanceTab` import):
   ```typescript
   import { ConnectionsModal } from "@/components/dashboard";
   ```
   No new lucide imports needed — `Server` (used by the button) was already imported by the god-component (line 48).
2. **State** (one line, immediately after `hasUnsavedChanges`):
   ```typescript
   const [connectionsOpen, setConnectionsOpen] = useState(false);
   ```
3. **Button** (8 lines, inserted between the `hasUnsavedChanges` pill and the Preview button — i.e., at the head of the top-bar action cluster):
   ```tsx
   <motion.button
     whileHover={{ scale: 1.02 }}
     whileTap={{ scale: 0.98 }}
     onClick={() => setConnectionsOpen(true)}
     className="flex items-center gap-2 px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl text-sm font-normal transition-colors"
   >
     <Server className="w-4 h-4" />
     Manage Servers
   </motion.button>
   ```
   UI-SPEC §Typography compliance verified: `font-normal` (400) on the new button. The surrounding cluster buttons (Preview = `font-medium`, Publish = `font-medium`) are pre-Phase-8 carry-forward and were NOT modified.
4. **Modal mount** (one line, immediately before the outermost wrapper `</div>`):
   ```tsx
   <ConnectionsModal websiteId={websiteId} isOpen={connectionsOpen} onClose={() => setConnectionsOpen(false)} />
   ```

What was NOT changed in the god-component:
- The sidebar (`Sections | Appearance` toggle, section list, hero settings panel).
- The canvas + `PreviewClient` mount.
- The Preview and Publish (bulk-save) buttons.
- The fetch URL or contents of `PUT /api/websites/{websiteId}` (the editor's own save path).
- `ServerDataState`, sections state, theme state, navbar state — all D-03-preserved.
- `params.websiteId as string` destructure from Plan 01 (verified 1 grep hit; no `serverId` non-comment references — `grep -v '^[[:space:]]*//' page.tsx | grep -c serverId` = 0).

## Confirmation: "Manage Servers" button typography

UI-SPEC §Typography mandates 400 (regular) and 600 (semibold) only for NEW Phase 8 components. The new button's className contains `text-sm font-normal` — `font-normal` is the Tailwind v4 utility for `font-weight: 400`. The surrounding `Preview` button uses `text-sm font-medium` (500), and the `Publish` button uses `text-sm font-medium` (500); both are pre-Phase-8 carry-forwards (introduced before this phase by the editor's original author) and were intentionally left untouched per CLAUDE.md rule 1 (don't grow / churn the god-component).

This is the same carry-forward strategy used by Plan 08-03 for the WebsiteCard status pill (the card uses `font-normal` for the new component while the analog `Badge` primitive carries `font-medium` internally — UI-SPEC weight is enforced at the new-component level).

## Decisions Made

See `key-decisions` in the frontmatter. Highlights:

- **REST not Server Actions.** The modal calls `fetch` directly to the per-record endpoints. The `isRedirectError` catch path from `create-website-dialog.tsx` is explicitly absent — `redirect()` is only thrown by Server Actions like `createWebsite`, and this modal does not invoke any Server Action.
- **Single ServerForm parameterized on mode.** Eliminates the temptation to duplicate the field layout between an `AddServerForm` and an `EditServerForm`. Only the submit-button label and the post-success `reset()` behavior diverge (add resets; edit relies on its parent to call `exitRowMode`).
- **Empty-state vs populated-state CTAs**: empty state uses a `variant=primary` (gradient accent) centered button labeled "Add Server"; populated state uses a `variant=ghost` full-width button at the bottom of the list. Both expand the same inline form. This matches RESEARCH Open Question 3's recommendation and is the cleanest visual answer for the common 0-3-server case.
- **Modal mount folded onto one line** to land at the 12-line delta target. The plan allowed up to 15 lines but flagged the mount JSX as foldable if the multi-line variant pushed the total over 15. The single-line version is still readable in context.

## Deviations from Plan

None — code surface matches the plan exactly.

The verification grep `grep -c 'fetch(\`/api/websites/\${websiteId}/servers\`)'` in the plan's automated block returns 0 (rather than 1) when executed naively because GNU grep treats `${...}` as regex metacharacters. The file content is correct — verified with `grep -cF '...'` (fixed-string flag) which returns 1. This is a verification-script portability issue, not a code deviation. A loose match `grep -c 'fetch(\`/api/websites'` returns 4 (one per CRUD path).

## Auth Gates

None encountered. The Phase 7 endpoints enforce ownership (D-05 double-chain) server-side; the modal handles 401/403/404 transparently by toast-ing the server's `body.error` message verbatim.

## Issues Encountered

- **`node_modules` absent from worktree** — expected; created the same temporary symlink that Plan 08-02's SUMMARY documented (`ln -s /home/senne/git/minesites/node_modules node_modules`), ran `./node_modules/.bin/tsc --noEmit` (exit 0 after each task), then removed the symlink before this SUMMARY commit. `node_modules` is `.gitignore`d so even leaving the symlink wouldn't have committed it, but the practice is clean.
- **Net-delta correction.** Initial Task 2 implementation landed at 16 lines (1 over target). Folded the `<ConnectionsModal />` mount onto a single line and the delta dropped to 12. No retry on Task 1.

## Verification Evidence

### Task 1 — ConnectionsModal

| Check | Expected | Actual |
|---|---|---|
| `test -f src/components/dashboard/connections-modal.tsx` | exists | exists |
| `^export function ConnectionsModal` count | 1 | 1 |
| `export { ConnectionsModal` in barrel | 1 | 1 |
| `isRedirectError` | 0 | 0 |
| `next/dist/client/components/redirect-error` | 0 | 0 |
| `if (!isOpen)` (effect gate) | 1 | 1 |
| `let cancelled = false` | 1 | 1 |
| `method: "POST"` | 1 | 1 |
| `method: "PUT"` | 1 | 1 |
| `method: "DELETE"` | 1 | 1 |
| `body.error ??` count | ≥ 4 | 4 |
| `"Server added"` / `"Server updated"` / `"Server removed"` | 1 each | 1 each |
| `className="max-w-lg"` | 1 | 1 |
| `"No servers connected yet"` | 1 | 1 |
| Empty-state body copy verbatim | 1 | 1 |
| `zodResolver(createMcserverSchema)` | 1 | 1 |
| `font-medium` | 0 | 0 |
| `placeholder="25565"` | 1 | 1 |
| `valueAsNumber` | 1 | 1 |
| `aria-label={\`Edit \${...}\`}` | 1 | 1 |
| Modal title `"Connected Minecraft Servers"` | 1 | 1 |
| Line count | ≥ 200 | 431 |
| `tsc --noEmit` | exit 0 | exit 0 |

### Task 2 — God-component mount

| Check | Expected | Actual |
|---|---|---|
| `import { ConnectionsModal }` | present | present |
| `const [connectionsOpen, setConnectionsOpen] = useState(false);` | 1 | 1 |
| `Manage Servers` literal | 1 | 1 |
| `<ConnectionsModal` | 1 | 1 |
| `websiteId={websiteId}` | 1 | 1 |
| `isOpen={connectionsOpen}` | 1 | 1 |
| `onClose={() => setConnectionsOpen(false)}` | 1 | 1 |
| `params.websiteId as string` (Plan 01 preserved) | 1 | 1 |
| `serverId` outside comments | 0 | 0 |
| Net line delta | ≤ 15 | **12** |
| `tsc --noEmit` | exit 0 | exit 0 |

### Manual smoke trace (static, against verified file contents)

The dev server is not running in the worktree; the plan's manual smoke is recorded as the intended verification sequence for the wave-merged branch:

- **Empty state → Add**: opening the modal with zero connections renders the centered `<Server>` icon + "No servers connected yet" heading + descriptive body + primary `[Add Server]` button. Clicking the button toggles `showAddForm` to true; the empty-state card disappears and the inline form replaces it inside the same `<ModalContent>`.
- **Re-open → list refresh**: closing the modal triggers the effect's cleanup (`servers`/`rowMode`/`showAddForm` cleared). Re-opening fires a fresh `GET /api/websites/{websiteId}/servers`, showing the loading spinner briefly, then rendering the persisted row.
- **Edit**: clicking the pencil icon on a read row puts the row into `edit` mode (single-row policy: setOnlyRowMode); the same `ServerForm` renders with `mode="edit"`, `initial={server}`, submit label "Update Server". On success the row exits edit mode and the local state updates from the PUT response.
- **Delete → confirm → confirm**: clicking the trash icon swaps the row into `confirm-delete` mode (red bg + `Delete '<name>'?` + `[Cancel] [Delete]`); the Delete button has `autoFocus` and `aria-label="Confirm delete <name>"`. Clicking Delete fires `DELETE /api/websites/{websiteId}/servers/<id>`; on 204 the row is removed from local state and the toast fires `"Server removed"`. Clicking Cancel exits the mode and returns to read view.
- **Server-side error (WR-04 envelope)**: submitting an invalid input (e.g., name="" or ip with spaces) hits server-side `safeParse`, server returns `{ error: "Invalid input", details: ... }` with 400. The modal's `body.error ?? "..."` unwrap catches it; the toast shows "Invalid input" verbatim. The form stays open so the user can correct.

### Carry-forward sanity (Phase 7)

| Check | Expected | Actual |
|---|---|---|
| `params.websiteId as string` (Plan 01) | preserved | 1 grep hit |
| `_count: { select: { sections: true } }` in `/api/websites/route.ts` (Plan 03) | preserved | 1 grep hit (file untouched) |
| Subdomain 409 P2002 path in `actions.ts` + `[websiteId]/route.ts` | unchanged | files untouched in this plan |
| Freemium gate in `[websiteId]/route.ts` PUT | unchanged | file untouched |
| BL-06 description round-trip in `server-settings.tsx` | unchanged | file untouched |
| `serverIp` references anywhere | 0 (Plan 02) | preserved (no edits in this plan) |

## Threat Surface Scan

No new threat surface introduced. The plan's `<threat_model>` enumerates T-08-16 through T-08-22; all dispositions hold:

- **T-08-16 (spoofing — client-supplied websiteId):** `accept` — Phase 7 endpoints re-verify `Website.userId === session.user.id` on every request. Modal cannot manufacture a websiteId belonging to another user.
- **T-08-17 (tampering — fields outside schema):** `accept` — Phase 7 `createMcserverSchema.safeParse(body)` / `updateMcserverSchema.safeParse(body)` runs server-side. Client-side Zod is UX only.
- **T-08-18 (stored XSS via name/description/ip):** `mitigate` — every render uses React text-interpolation (`{server.name}`, `{server.description}`, `{server.ip}{server.port ? \`:${server.port}\` : ''}`). No `dangerouslySetInnerHTML`. Phase 7 WR-08 IP regex still rejects HTML/JS chars server-side.
- **T-08-19 (info disclosure — generic error vs Phase 7 message):** `mitigate` — every catch reads `body.error ?? <fallback>`. Verification: `grep -c "body.error ?? "` = 4 (one per CRUD path).
- **T-08-20 (Phase 7 carry-forward regression on PUT /api/websites/[websiteId]):** `accept` — this plan does NOT touch any server-side route. Modal is per-record CRUD on the `/servers[/serverId]` route family.
- **T-08-21 (stale .next build cache after Plan 01 rename):** `mitigate` — Plan 01 already cleared `.next/`. This plan inherits the clean cache; no rename-related routing is affected.
- **T-08-22 (state entanglement with editor bulk save):** `mitigate` — modal owns `servers`/`rowMode`/`showAddForm`/`isLoading` exclusively. The god-component only manages `connectionsOpen` (boolean). The editor's `serverData`/`sections`/`themeSettings`/`navbarSettings` are untouched. D-03 verified by acceptance criteria.

No `threat_flag:` entries needed.

## Known Stubs

None. Every UI element renders real data:

- Server list flows from `GET /api/websites/{websiteId}/servers` → `setServers` → `<ul>` render.
- Form fields bind to the live `react-hook-form` instance with `zodResolver(createMcserverSchema)`.
- Toasts surface real success messages and verbatim server error messages.
- The "Manage Servers" button in the editor really opens a live modal; no placeholder dialog.

The modal body copy references "Live Player Count and Server Info sections" — these are deferred SECT-02/SECT-03 features. The wording is forward-looking but accurate (it documents WHY connections matter, even though the consuming section types ship in a later phase). UI-SPEC §Copywriting explicitly approves the phrasing.

## TDD Gate Compliance

Not applicable — this is a `type: execute` plan (not `type: tdd`). No RED/GREEN/REFACTOR gates required.

## Self-Check: PASSED

Files verified on disk in worktree `worktree-agent-a13d2d46eb4d62f1c`:

- `src/components/dashboard/connections-modal.tsx` — FOUND (431 lines, all critical greps pass)
- `src/components/dashboard/index.ts` — FOUND (`ConnectionsModal` export added alongside `WebsiteCard`)
- `src/app/(dashboard)/dashboard/[websiteId]/page.tsx` — FOUND (modified, +12 lines delta)

Commits verified present on `worktree-agent-a13d2d46eb4d62f1c`:

- `43b2d3c` — FOUND (Task 1)
- `d0577eb` — FOUND (Task 2)

TS compile gate exit code: **0** (recorded twice — after Task 1 and after Task 2).

## Next Phase Readiness

- Wave 3 completes Phase 8's main scope. DASH-03 holds via static analysis + the Plan 04 acceptance grep gauntlet. The orchestrator's wave-3 merge will integrate this plan with the rest of Phase 8.
- Future SECT-02 / SECT-03 section types (deferred from v1.0) — Live Player Count and Server Info — will read from connected MinecraftServer records added via this modal. The modal does not select a "default server"; that concept will land alongside the section types.
- The shared `src/components/dashboard/` directory now houses two co-tenants (WebsiteCard, ConnectionsModal). Future shared dashboard components follow the same `<name>.tsx` + `index.ts` barrel pattern (precedent from Plan 03 SUMMARY, reused here).

---
*Phase: 08-dashboard-public-site*
*Plan: 04*
*Completed: 2026-05-12*
