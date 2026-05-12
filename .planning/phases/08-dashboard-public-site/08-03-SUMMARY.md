---
phase: 08-dashboard-public-site
plan: 03
subsystem: ui
tags: [react, nextjs, tailwind, framer-motion, prisma, dashboard]

requires:
  - phase: 06-schema-reset
    provides: Website model with Section relation (sections aggregated via Prisma _count)
  - phase: 07-api-layer
    provides: GET /api/websites list endpoint; Phase 7 carry-forwards (D-19 P2002 subdomain 409, D-20 user existence check, BL-02 target-specific 409, apiErrorResponse wrapping)
provides:
  - Shared WebsiteCard component (src/components/dashboard/website-card.tsx) consumed by both /dashboard and /dashboard/servers
  - Section count on Website cards via Prisma _count.sections (server-aggregated)
  - Live URL visit affordance on Website cards with reverse-tab-nabbing mitigation (target=_blank + rel=noreferrer noopener + stopPropagation)
  - Renamed dialog: CreateWebsiteDialog at create-website-dialog.tsx (D-13 full rename — file + component + props interface)
affects: [08-04 phase-cleanup terminology sweep, future SECT-* section types that may surface section count elsewhere]

tech-stack:
  added: []
  patterns:
    - "Shared dashboard component pattern: src/components/dashboard/<name>.tsx + barrel re-export from index.ts"
    - "Card-link with nested action anchor: outer Link wraps motion.div; inner <a target=_blank> uses stopPropagation (NOT preventDefault) to let new-tab fire while blocking parent navigation"
    - "Prisma _count.sections inside Website.findMany select block — server-aggregated count avoids N+1 client fetches"

key-files:
  created:
    - src/components/dashboard/website-card.tsx
    - src/components/dashboard/index.ts
  modified:
    - src/app/api/websites/route.ts
    - src/app/(dashboard)/dashboard/page.tsx
    - src/app/(dashboard)/dashboard/servers/page.tsx
  renamed:
    - src/app/(dashboard)/dashboard/create-server-dialog.tsx -> src/app/(dashboard)/dashboard/create-website-dialog.tsx

key-decisions:
  - "_count.sections lives only on the LIST route GET /api/websites; the per-record route already returns full sections arrays so _count there would be redundant (anti-pattern per RESEARCH)"
  - "WebsiteCard uses p-6 outer padding (UI-SPEC 24px) instead of inherited p-5 from the analog"
  - "Status pill uses font-normal (400) in this card per UI-SPEC §Typography (only 400/600); the analog used font-medium (500). Badge component still carries font-medium internally — UI-SPEC weight rule is enforced at the card-component level."
  - "Visit anchor uses stopPropagation, NOT preventDefault — preventDefault would block the new-tab open (Pitfall 3)"
  - "D-13 applied fully: both file and component renamed. D-16 (which covers server-actions/server-settings) was correctly NOT extended to this dashboard dialog."
  - "Grid-card stagger timing unified at 0.2 + index * 0.1 (the /dashboard timing). /dashboard/servers previously used i * 0.05; the shared component absorbs both into one consistent cadence — a positive D-08 outcome."

patterns-established:
  - "Pattern: src/components/dashboard/<name>.tsx + index.ts barrel for shared dashboard components consumed across multiple pages"
  - "Pattern: visit-anchor inside card-link uses stopPropagation; menu-button inside card-link uses preventDefault — the two have different semantics (anchor has its own destination, button does not)"
  - "Pattern: Prisma server-side aggregation via _count.<relation> in findMany select — applied to Website.sections, reusable for future MinecraftServer counts"

requirements-completed: [DASH-01, DASH-02, DASH-04]

duration: 5min
completed: 2026-05-12
---

# Phase 08 Plan 03: Website Cards + Section Count + Dialog Rename Summary

**Shared WebsiteCard component (Layers badge for `_count.sections`, target=_blank visit anchor with stopPropagation), Prisma `_count.sections` on `GET /api/websites`, and full D-13 dialog rename (file + component + props interface) — both list pages now consume the same card and the same renamed dialog.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-12T15:15:29Z
- **Completed:** 2026-05-12T15:20:38Z
- **Tasks:** 3 / 3
- **Files created:** 3 (website-card.tsx, dashboard/index.ts, this SUMMARY)
- **Files modified:** 3 (route.ts, dashboard/page.tsx, dashboard/servers/page.tsx)
- **Files renamed:** 1 (create-server-dialog.tsx -> create-website-dialog.tsx, 97% similarity per git)

## Accomplishments

- DASH-01: Both `/dashboard` and `/dashboard/servers` render the shared `<WebsiteCard />` instead of inline JSX — no more visual drift between the two pages.
- DASH-04: Every card now exposes the live URL twice: as a muted subtitle (`{subdomain}.minesites.net`) and as a hover-revealed Visit affordance that opens `https://{subdomain}.minesites.net` in a new tab. Click safety wired: `rel="noreferrer noopener"` + `stopPropagation` so the dashboard tab does not also navigate to the editor.
- DASH-02 (D-13 full): `CreateWebsiteDialog` is the only name now. Old file `create-server-dialog.tsx` is gone; both import sites updated; zero `CreateServerDialog` references remain anywhere in `src/`.
- One-line server change: `_count: { select: { sections: true } }` inside `findMany.select` adds section counts to every list-endpoint record. The per-record route `[websiteId]/route.ts` was left untouched (anti-pattern).
- Phase 7 carry-forwards preserved: subdomain 409 P2002 catch, session-user existence check (D-20), `apiErrorResponse` wrapping, `createWebsiteSchema.safeParse` — all intact on POST.

## Task Commits

1. **Task 1: Extend GET /api/websites with _count.sections** — `ea9c79a` (feat)
2. **Task 2: Create shared WebsiteCard component** — `75fa009` (feat)
3. **Task 3: Rename create-server-dialog -> create-website-dialog + wire WebsiteCard into both list pages** — `01c2752` (refactor)

## Files Created / Modified

- `src/app/api/websites/route.ts` — one-line addition inside the GET handler's `select` block; POST handler untouched
- `src/components/dashboard/website-card.tsx` (NEW, 115 lines) — shared card; `Layers` badge for section count; `<a target="_blank" rel="noreferrer noopener" onClick={stopPropagation}>` visit anchor; `p-6` outer padding; `font-normal` status pill (no `font-medium`)
- `src/components/dashboard/index.ts` (NEW) — barrel: `export { WebsiteCard, type WebsiteCardData }`
- `src/app/(dashboard)/dashboard/create-website-dialog.tsx` (RENAMED + edited) — `interface CreateServerDialogProps` → `CreateWebsiteDialogProps`; `export function CreateServerDialog` → `CreateWebsiteDialog`; nothing else touched (the `useForm + zodResolver(createWebsiteSchema) + FormData + isRedirectError catch + reset on close` pattern is intact)
- `src/app/(dashboard)/dashboard/page.tsx` — `WebsiteData._count: { sections: number }`; import `WebsiteCard` + `CreateWebsiteDialog`; replaced ~70 lines of inline card JSX with `{servers.map((website, i) => <WebsiteCard ... />)}`; dropped now-unused `MoreHorizontal` and `Link` imports
- `src/app/(dashboard)/dashboard/servers/page.tsx` — same `_count` interface extension; grid view replaced with `<WebsiteCard />`; the list-view `<table>` block (filteredServers.map → motion.tr) preserved verbatim; dropped `MoreHorizontal` and `ArrowUpRight` imports (`Link` kept for breadcrumb + table edit links)

## Decisions Made

See `key-decisions` in the frontmatter. Highlights:

- **D-13 full rename applied.** The previous plan revision considered keeping the filename and only renaming the export, citing D-16. That was a misreading: D-16 covers `server-actions.tsx` / `server-settings.tsx` (sibling files in the editor route directory), NOT this dashboard-level dialog. CONTEXT D-13 explicitly mandates renaming both layers.
- **Anti-pattern avoided.** `_count` was deliberately NOT added to `src/app/api/websites/[websiteId]/route.ts`. That route already returns the full `sections` array; `_count.sections` there would be redundant and confusing.
- **Stagger timing unified.** /dashboard previously used `0.2 + i * 0.1`; /dashboard/servers grid used `i * 0.05`. The shared component picks the /dashboard cadence. Trivial visual diff on the list page, but consistency is the point of D-08.

## Deviations from Plan

None planned-vs-actual on the code surface itself.

### Process deviation (not a code change)

The first attempt to commit Task 1 landed on `master` in the main repo, not on the per-agent worktree branch. This happened because the Bash tool resets cwd between commands and an early `cd /home/senne/git/minesites` resolved to the main repo (not the worktree at `.claude/worktrees/agent-aa8acb9d42ad6f226`). I caught it before any subsequent task ran, reset master back to its prior `99c339a` (only my own commit was reverted — zero concurrent work between base and HEAD), preserved the unrelated `.planning/STATE.md` change via stash, and redid Task 1 inside the worktree using absolute paths (`git -C <worktree>` plus full file paths in Edit/Write). All three task commits and the SUMMARY-bearing commit live on the worktree branch `worktree-agent-aa8acb9d42ad6f226`. Per the worktree-protocol guidance, I did NOT use `git update-ref refs/heads/master` for the recovery — a plain `git reset --hard 99c339a` on master was the chosen path because no concurrent commits existed and the alternative was leaving master with a stray feature commit that would confuse the orchestrator's merge.

**Total deviations:** 0 code-level, 1 process-level (recovered cleanly; no impact on plan output).
**Impact on plan:** None. The final tree state matches the plan exactly.

## Issues Encountered

- `npx next build --no-lint` errored ("unknown option '--no-lint'") — current Next.js (16) doesn't accept that flag. Re-ran `npx next build` plain; build succeeded.
- That's the only friction. Three commits, three clean tasks.

## Verification Evidence

### Task 1 — API
- `grep -c "_count: { select: { sections: true } }" src/app/api/websites/route.ts` → **1**
- `grep -c "_count" src/app/api/websites/[websiteId]/route.ts` → **0** (anti-pattern avoided)
- Phase 7 carry-forwards: `Subdomain is already taken` (1), `Session expired` (1), `createWebsiteSchema.safeParse` (1), `apiErrorResponse` (3), `PrismaClientKnownRequestError` (1) — all present.
- `npx tsc --noEmit` → exit 0.

### Task 2 — WebsiteCard
- `wc -l src/components/dashboard/website-card.tsx` → **115** (≥ 60 required).
- `grep -c 'rel="noreferrer noopener"'` → **1**; `target="_blank"` → **1**; `e.stopPropagation()` → **1**; `_count.sections` → **2** (render + aria-label); `Visit live site for` → **1**.
- `grep -c "onClick.*preventDefault"` → **1** (the MoreHorizontal options button — visit anchor uses `stopPropagation` exclusively).
- `grep -c "p-6 rounded-2xl"` → **1**; `grep -c "font-medium"` → **0** (UI-SPEC weight rule honored at the card-component level).
- `npx tsc --noEmit` → exit 0.

### Task 3 — Rename + wire
- Old file `create-server-dialog.tsx` removed (`test ! -e` passes). New file `create-website-dialog.tsx` exists.
- `grep -rc "CreateServerDialog" src/` → **0** (purged everywhere).
- Both list pages: `<WebsiteCard ` present (1 each), `<CreateWebsiteDialog ` present (1 each), `_count: { sections: number }` present (1 each), `from "@/components/dashboard"` present (1 each).
- Old import path: 0 references in both files.
- `filteredServers.map` count: 2 (one for grid view via WebsiteCard, one for list-view table — table preserved as-is per plan).
- `npx tsc --noEmit` → exit 0.
- `npx next build` → succeeded, all 19 routes compiled.

## Threat Surface Scan

No new threat surface introduced beyond what the plan's `<threat_model>` already documented. T-08-10 through T-08-15 mitigations are all verified live:

- **T-08-11 (reverse tab-nabbing):** `rel="noreferrer noopener"` on the visit anchor.
- **T-08-12 (click bubbling):** `onClick={(e) => e.stopPropagation()}` on the visit anchor.
- **T-08-13 (Phase 7 carry-forwards):** unchanged POST handler.

No `threat_flag:` entries needed.

## Known Stubs

None. Every UI element renders real data:

- `_count.sections` flows from Prisma `findMany` → `WebsiteData._count.sections` → Badge content.
- `subdomain` flows from `Website.subdomain` → `<a href={`https://${subdomain}.minesites.net`}>`.
- `published` flows to status pill text + color.

No placeholder text, hardcoded empties, or "coming soon" surfaces in `WebsiteCard`.

## Self-Check: PASSED

- `src/app/api/websites/route.ts`: FOUND (modified, contains `_count: { select: { sections: true } }`)
- `src/components/dashboard/website-card.tsx`: FOUND (115 lines, all critical greps pass)
- `src/components/dashboard/index.ts`: FOUND (barrel re-export)
- `src/app/(dashboard)/dashboard/create-website-dialog.tsx`: FOUND (`export function CreateWebsiteDialog` + `interface CreateWebsiteDialogProps`)
- `src/app/(dashboard)/dashboard/create-server-dialog.tsx`: MISSING (correct — git mv'd)
- `src/app/(dashboard)/dashboard/page.tsx`: FOUND (modified — `<WebsiteCard />`, `<CreateWebsiteDialog />`, `_count` in interface)
- `src/app/(dashboard)/dashboard/servers/page.tsx`: FOUND (modified — grid view uses `<WebsiteCard />`, list-view table preserved)

Commits verified present on `worktree-agent-aa8acb9d42ad6f226`:

- `ea9c79a`: FOUND (Task 1)
- `75fa009`: FOUND (Task 2)
- `01c2752`: FOUND (Task 3)

## Next Phase Readiness

- Wave 1 of Phase 8 is on track. This plan (08-03) lands DASH-01, DASH-02, DASH-04. Plan 08-01 (`ConnectionsModal` + Manage Servers button) and 08-02 (`[serverId]` -> `[websiteId]` directory rename + local-type sweep + legacy `serverIp`/`serverPort` removal) are the other Wave-1 plans; both are independent of this one's file surface.
- The shared `WebsiteCard` component will be the natural reuse target if/when 08-04 (cleanup) or a future SECT-* phase needs to surface a Website summary outside the two list pages.

---
*Phase: 08-dashboard-public-site*
*Completed: 2026-05-12*
