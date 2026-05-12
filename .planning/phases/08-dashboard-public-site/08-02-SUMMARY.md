---
phase: 08-dashboard-public-site
plan: 02
subsystem: ui
tags: [refactor, typescript, public-site, prop-drop, terminology-cleanup]

requires:
  - phase: 06-schema-reset
    provides: Website model (no `serverIp`/`serverPort` on the model itself; the legacy fields lived only in client-side types and a placeholder var)
  - phase: 07-api-layer
    provides: /api/websites surface; Phase 7 D-17 verification target ([subdomain]/page.tsx already website-aware)
  - plan: 08-01
    provides: editor route directory renamed to [websiteId]/; WebsiteData consumed by SectionPreview via @/components/preview/types
provides:
  - WebsiteData interface without `serverIp` (src/components/preview/types.ts)
  - Public [subdomain] RSC passes `{ name, subdomain }` only to PreviewClient
  - Public [subdomain] layout drops the `serverIp = ""` placeholder var
  - SiteNav simplified to a single-prop branded header (Copy IP button + clipboard state removed)
  - Orphaned `serverIp` consumer in sections/hero-section.tsx cleared (prop + display block dropped, unused Button import removed)
  - Editor god-component SectionPreview call site cleared of `serverIp: null` literal (TS2353 fix)
  - TypeScript compile gate (tsc --noEmit) exits 0
affects: [08-04, future SECT-02 / SECT-03 section types that may re-introduce IP display via a section]

tech-stack:
  added: []
  patterns:
    - "Lockstep drop pattern: when a field is removed from a shared interface, all stale literals at call sites that consume that interface must drop the field in the same plan (otherwise TS2353 fires the moment the type narrows)"
    - "Orphaned consumer sweep: when a public-API type field is dropped, scan all importers of files that re-export the consumer; a clean knock-on cleanup keeps the compile gate green"

key-files:
  created: []
  modified:
    - "src/components/preview/types.ts (-1 line — `serverIp: string | null` field dropped from WebsiteData)"
    - "src/app/[subdomain]/page.tsx (-1 line — `serverIp: null as string | null,` dropped from serverData literal)"
    - "src/app/[subdomain]/layout.tsx (-1, edited 1 — `serverIp = \"\"` placeholder var dropped; `<SiteNav>` call narrowed from `serverName + serverIp` to `serverName` only)"
    - "src/components/site/nav.tsx (-30, +2 — useState/Copy/Check imports dropped; `serverIp` prop dropped; clipboard state + handleCopy + Copy IP button removed; CSS-var styling preserved verbatim)"
    - "src/components/sections/hero-section.tsx (-30, +1 — `serverIp` prop dropped from interface + destructure; conditional IP+Copy display block deleted; unused Button import dropped)"
    - "src/app/(dashboard)/dashboard/[websiteId]/page.tsx (-1, +1 — `serverIp: null,` field dropped from the inline serverData literal at line 2920 of the SectionPreview call)"
    - "src/app/[subdomain]/preview-client.tsx (UNTOUCHED — verified clean: zero serverIp references existed before the plan started)"

key-decisions:
  - "D-14 option (a) applied verbatim: SiteNav loses the `serverIp` prop entirely rather than keeping it as a `''` pass-through. The Copy IP affordance will be re-introduced via a SECT-02/SECT-03 section type when a 'default server' concept lands in the schema."
  - "Hero-section.tsx prop drop kept in scope despite the file being functionally orphaned (exported from sections/index.ts but no caller renders <HeroSection /> directly — `HeroSection` only appears as an `as` alias for HeroSettings in the god-component import block, which is unrelated). Cleaning the orphaned consumer keeps the compile gate clean and the file's public API truthful."
  - "TS compile gate deferred to end of Task 3, not after each task. Tasks 1+2 leave the codebase in a TS2353-inconsistent state (WebsiteData has no `serverIp` but page.tsx line 2920 still passes it as a literal) — running tsc earlier would falsely fail. The plan explicitly defers the gate to Task 3's verify block; this matches the lockstep-drop pattern noted in patterns-established."
  - "Compile gate run from worktree via temporary `ln -s /home/senne/git/minesites/node_modules` symlink. The symlink was removed before any commit; node_modules is gitignored so even an accidental commit would have been suppressed."

patterns-established:
  - "Lockstep drop: type-field removal + all stale-literal removals must land in the same plan; intermediate task commits leave the codebase TS-inconsistent on purpose — defer the compile gate to the last task."
  - "Orphaned consumer cleanup: when a public-API prop is dropped, sweep barrel re-exports for orphans (hero-section.tsx was the only knock-on after WebsiteData.serverIp dropped); leaving the prop on the orphan would corrupt the file's documented contract even if no caller currently uses it."

requirements-completed: [DASH-04]

duration: 3min42s
started: 2026-05-12T15:25:26Z
completed: 2026-05-12
---

# Phase 08 Plan 02: serverIp purge from public-site layer + editor SectionPreview Summary

**Dropped `serverIp` from `WebsiteData` and all 7 of its call sites in lockstep (D-14 + D-18): public-site RSC, public layout, SiteNav, the orphaned hero-section consumer, and the editor god-component's inline `SectionPreview` literal at line 2920. TS compile gate exits 0; the public route still renders via `db.website.findUnique` + `notFound()` (D-17), and the editor preview still passes the legitimate `WebsiteData` fields (`name`, `subdomain`, `players`, `maxPlayers`, `version`).**

## Performance

- **Duration:** ~3m 42s
- **Started:** 2026-05-12T15:25:26Z
- **Tasks:** 3 / 3
- **Files modified:** 6 (preview-client.tsx left untouched — verified clean at plan start)
- **Files created:** 1 (this SUMMARY)
- **Net diff:** -64 lines, +6 lines (across all 3 task commits)

## Accomplishments

- **DASH-04 success criterion 4 verification holds**: `[subdomain].minesites.net` continues to route via `db.website.findUnique({ where: { subdomain } })` → `notFound()` if unpublished → `PreviewClient`. The prop-shape narrow is invisible to the public path because `preview-client.tsx` never read `serverData.serverIp` to begin with.
- **`WebsiteData` shape now matches the v1.1 reality**: `{ name, subdomain, players?, maxPlayers?, version? }`. No legacy v1.0 fields linger. Future SECT-02/SECT-03 section types will fetch IP via a connected MinecraftServer (selected per-section), not via the layout-level `WebsiteData`.
- **`SiteNav` simplified to a branded header**: single `serverName` prop, no client state, no clipboard logic. CSS-var styling (`var(--site-card)`, `var(--site-font-display)`, `var(--site-text)`) preserved verbatim — the public-site theme system is untouched.
- **Orphaned `hero-section.tsx` consumer cleaned**: this file is exported from `sections/index.ts` but no caller renders `<HeroSection />` (the registry render path goes through `hero-render.tsx`). The `serverIp?` prop drop keeps the file's public contract truthful for any future caller and removes ~25 lines of dead conditional render.
- **TS2353 prevented in lockstep**: dropping `WebsiteData.serverIp` would have broken the editor god-component's inline `serverData={{ ..., serverIp: null, ... }}` literal at line 2920. Task 3 dropped the literal in the same plan, so `tsc --noEmit` exits 0 across the full diff.

## Task Commits

1. **Task 1: Strip serverIp from WebsiteData type and [subdomain] RSC** — `7d9cc27` (refactor)
2. **Task 2: Drop serverIp from public layout, SiteNav, and orphaned hero-section** — `d3cb6a1` (refactor)
3. **Task 3: Drop stale serverIp literal from editor SectionPreview call (TS2353 fix)** — `e68ab6a` (fix)

## Files Modified

### `src/components/preview/types.ts`
- Dropped `serverIp: string | null` from the `WebsiteData` interface. The remaining fields are `name`, `subdomain`, optional `players` / `maxPlayers` / `version`.
- Other interfaces in the file (`Section`, `StatsServer`, `FeatureItem`, `GalleryImage`) and helper functions (`isColorDark`, `isLightColor`) untouched.

### `src/app/[subdomain]/page.tsx`
- Dropped `serverIp: null as string | null,` from the `serverData` object literal (line 35). The literal is now `{ name: server.name, subdomain: server.subdomain }`.
- **D-17 carry-forwards verified intact**: `db.website.findUnique({ where: { subdomain }, include: { sections: ... } })` at line 15-24 is untouched, the `notFound()` gate at line 27 is untouched, and the published-or-preview-mode logic is untouched.

### `src/app/[subdomain]/preview-client.tsx`
- **No edit required.** Verified clean at plan start: `grep -c serverIp` returned 0. The prop type `server: WebsiteData` flows from the now-narrowed interface; TypeScript narrows automatically and no internal destructure references `serverData.serverIp`.

### `src/app/[subdomain]/layout.tsx`
- Dropped the line `const serverIp = "";   // Phase 6 placeholder; Phase 7 adds MinecraftServer lookup` (was line 77).
- Narrowed `<SiteNav serverName={serverName} serverIp={serverIp} />` → `<SiteNav serverName={serverName} />` (was line 106).
- **CSS isolation preserved**: the `.site-root` wrapper class, the data-theme attribute, the `--site-accent` / `--site-bg` / `--site-card` / `--site-text` / `--site-text-muted` / `--site-font-display` CSS vars, and all 5 font-variable classNames (Rajdhani / Orbitron / Cinzel / Exo_2 / Bebas_Neue) are untouched. CLAUDE.md rule 2 (CSS isolation under `.site-root`) is honored.

### `src/components/site/nav.tsx`
- Dropped the `useState` / `Copy` / `Check` imports (now unused).
- Dropped `serverIp: string` from `SiteNavProps`.
- Dropped the `copied` clipboard state, the `handleCopy` async handler, and the `<button aria-label="Copy server IP">` block.
- The remaining nav is a `<nav>` with a single branded `<span>{serverName}</span>` — CSS-var styling (`var(--site-card)` background, `var(--site-font-display)` font, `var(--site-text)` color) preserved verbatim.

### `src/components/sections/hero-section.tsx`
- Dropped the `Button` import (now unused).
- Dropped `serverIp?: string | null` from `HeroSectionProps`.
- Dropped the `serverIp` destructure from the function signature.
- Deleted the entire `{serverIp && (...)}` conditional IP+Copy display block (was lines 58-82). The remaining render is title + subtitle + background image gradient.

### `src/app/(dashboard)/dashboard/[websiteId]/page.tsx`
- Dropped the `serverIp: null,` token from the inline `serverData` object literal at line 2920 of the `<SectionPreview>` call. The literal is now `{ name: serverData.name, subdomain: serverData.subdomain, players: serverData.players, maxPlayers: serverData.maxPlayers, version: serverData.version }`.
- **Plan 01 carry-forwards verified intact**: `params.websiteId as string` destructure at line 2243 is unchanged (1 grep hit); `function SectionPreview({ section, serverData }: { section: Section; serverData: WebsiteData })` at line 2174 is unchanged (1 grep hit). No other line in this 3000+ line god-component was modified.

## Decisions Made

See `key-decisions` in the frontmatter. Highlights:

- **Lockstep drop applied per D-14 + D-18**: the type drop in Task 1 and the call-site literal drop in Task 3 must land in the same plan. Splitting them across plans would leave master in a TS2353-broken state between commits.
- **Hero-section.tsx orphan cleanup kept in scope** even though no active caller exists (PreviewClient routes through `hero-render.tsx`, not `hero-section.tsx`). The plan explicitly listed it as a knock-on file; leaving the orphan with a stale `serverIp` prop would corrupt the file's documented public API and cause TS errors for any future caller.
- **Compile gate deferred to Task 3, not run after each task**: Tasks 1+2 intentionally leave the codebase TS-inconsistent (type narrowed, literal still present). Only after Task 3 drops the literal does `tsc --noEmit` exit 0. This matches the plan's explicit gate placement.

## Deviations from Plan

### Process deviation (resolved cleanly)

The very first set of Edit-tool calls (Task 1 step (a) + step (b)) landed on the **main repo** path `/home/senne/git/minesites/src/...` instead of the worktree path `.claude/worktrees/agent-a2ee9b64a7c080625/src/...`. Caught immediately via `git -C <main-repo> status --short` showing two stale modifications on master after the worktree's own `git diff` showed none. Recovered by:

1. `git -C /home/senne/git/minesites checkout -- src/components/preview/types.ts "src/app/[subdomain]/page.tsx"` — restored the main repo to its pre-edit state (no commits had been made yet on main; only working-tree changes).
2. Re-issued the Edit calls with the full worktree-absolute path (`/home/senne/git/minesites/.claude/worktrees/agent-a2ee9b64a7c080625/src/...`).
3. Verified `git -C /home/senne/git/minesites status --short` shows only `?? .claude/` (no src/ changes leaked to the main repo).

Mitigation for future agents: the orchestrator-supplied parallel-execution warning explicitly mentions this CWD-slip failure mode (Wave 1's 08-03 agent had a similar but worse incident where commits landed on master and required reset). I caught this one before any commit, so no reset of any branch was needed. **Process-only deviation; no code-level deviation.**

### Code deviations

None — code surface matches the plan exactly.

**Total deviations:** 0 code-level, 1 process-level (caught pre-commit, no impact on plan output or any branch state outside the worktree).

## Auth Gates

None encountered.

## Issues Encountered

- **`node_modules` absent from worktree** — expected; the worktree is a bare checkout. Created a temporary `ln -s /home/senne/git/minesites/node_modules` symlink for the compile gate, ran `./node_modules/.bin/tsc --noEmit`, then removed the symlink before any commit. `node_modules` is gitignored so the symlink would not have been committed even if left in place.
- **Edit tool path slip on first attempt** — see "Process deviation" above. Resolved before any commit.

## Verification Evidence

### Plan-wide serverIp purge (7 files)

| File | `grep -c "serverIp"` | Expected |
|---|---|---|
| `src/components/preview/types.ts` | 0 | 0 |
| `src/app/[subdomain]/page.tsx` | 0 | 0 |
| `src/app/[subdomain]/layout.tsx` | 0 | 0 |
| `src/app/[subdomain]/preview-client.tsx` | 0 | 0 |
| `src/components/site/nav.tsx` | 0 | 0 |
| `src/components/sections/hero-section.tsx` | 0 | 0 |
| `src/app/(dashboard)/dashboard/[websiteId]/page.tsx` | 0 | 0 |

### Carry-forward preservation

| Check | Expected | Actual |
|---|---|---|
| `notFound()` in `[subdomain]/page.tsx` | >= 1 | 1 |
| `db.website.findUnique` in `[subdomain]/page.tsx` | >= 1 | 1 |
| `interface SiteNavProps` in `nav.tsx` | 1 | 1 |
| `site-root` in `[subdomain]/layout.tsx` | >= 1 | 3 |
| `<SiteNav serverName=` in `layout.tsx` with no `serverIp=` | 1 (and 0 stale) | 1 (0 stale) |
| `<SectionPreview section={section} serverData={{` in `[websiteId]/page.tsx` | 1 | 1 |
| `function SectionPreview({ section, serverData }` in `[websiteId]/page.tsx` | 1 | 1 |
| `params.websiteId as string` (Plan 01 sweep) in `[websiteId]/page.tsx` | 1 | 1 |

### TypeScript compile gate

```
./node_modules/.bin/tsc --noEmit  →  exit 0
```

TS2353 ("Object literal may only specify known properties, and 'serverIp' does not exist in type 'WebsiteData'") is resolved across the full plan diff.

### Smoke-test result

Manual smoke not performed in worktree (no dev server running here; Wave 2 verifier may run one against a wave-merged branch). Static evidence supports DASH-04 success criterion 4:

- The `[subdomain]/page.tsx` RSC continues to call `db.website.findUnique({ where: { subdomain } })` and gate via `notFound()` (verified via grep).
- The `[subdomain]/layout.tsx` continues to wrap children in `.site-root` with the full theme-CSS-var injection (verified via grep — `site-root` appears 3× in the file).
- `PreviewClient` is unchanged; its `server: WebsiteData` prop type now narrows automatically.
- `tsc --noEmit` exit 0 confirms no compile-time regression on the full Next.js + TypeScript surface.

### Build gate

`npx next build` not run in this plan (the plan's verify block marks it as `|| true` — informational only). Plan 03's SUMMARY notes that `next build` did succeed for the dashboard side after Wave 1; this plan only narrows a prop type, so a build regression is structurally unlikely if `tsc` passes.

## Threat Surface Scan

No new threat surface introduced. The plan's `<threat_model>` enumerates T-08-05 through T-08-09b; all mitigations are verified live:

- **T-08-05 (info disclosure via missing `notFound()`):** `grep -c "notFound()"` on `[subdomain]/page.tsx` returns 1; the `published || isPreviewMode` branch is untouched.
- **T-08-06 (CSS isolation break):** `.site-root` wrapper class preserved (grep returns 3 hits); no dashboard CSS tokens added to layout.tsx; only deletions.
- **T-08-07 (stored XSS via `serverName`):** React text-interpolation auto-encodes `{serverName}` in nav.tsx; no `dangerouslySetInnerHTML` added.
- **T-08-08 (Phase 7 carry-forward regressions):** This plan does not touch any API route, server action, validation schema, or middleware — verified by file scope (`files_modified` in frontmatter shows only public-site UI files + the one editor literal).
- **T-08-09 / T-08-09b (DoS via build failure):** TS compile gate exit 0.

No `threat_flag:` entries needed.

## Known Stubs

None. The deletions are pure cleanup of legacy v1.0 plumbing; no placeholder UI was introduced. The deferred "Copy IP" affordance will return via a section type (SECT-02 / SECT-03) reading from a connected MinecraftServer — not as a stub in this plan.

## TDD Gate Compliance

Not applicable — this is a `type: execute` plan (not `type: tdd`). No RED/GREEN/REFACTOR gates required.

## Self-Check

Files verified on disk in worktree `worktree-agent-a2ee9b64a7c080625`:

- `src/components/preview/types.ts` — FOUND (modified, 0 `serverIp`)
- `src/app/[subdomain]/page.tsx` — FOUND (modified, 0 `serverIp`, notFound + findUnique intact)
- `src/app/[subdomain]/layout.tsx` — FOUND (modified, 0 `serverIp`, .site-root intact)
- `src/app/[subdomain]/preview-client.tsx` — FOUND (untouched, 0 `serverIp`)
- `src/components/site/nav.tsx` — FOUND (modified, 0 `serverIp`, single-prop interface)
- `src/components/sections/hero-section.tsx` — FOUND (modified, 0 `serverIp`)
- `src/app/(dashboard)/dashboard/[websiteId]/page.tsx` — FOUND (modified, 0 `serverIp`, SectionPreview decl + `params.websiteId` intact)

Commits verified present on `worktree-agent-a2ee9b64a7c080625`:

- `7d9cc27` — FOUND (Task 1)
- `d3cb6a1` — FOUND (Task 2)
- `e68ab6a` — FOUND (Task 3)

TS compile gate exit code: 0 (recorded above).
Main-repo cross-contamination check: `git -C /home/senne/git/minesites status --short` shows only `?? .claude/` — no source files modified outside the worktree.

## Self-Check: PASSED

## Next Phase Readiness

- Wave 2 of Phase 8 (this plan, 08-02) completes the public-site verification side of Phase 8. DASH-04 success criterion 4 ("`[subdomain].minesites.net` renders the Website's published sections") holds by static analysis; a wave-merged dev-server smoke is the remaining manual verification.
- Plan 08-04 (Manage Servers button + ConnectionsModal mount in the editor top-bar) is unblocked by this plan: the `WebsiteData` type is now stable for Wave 2's editor surface work, and the SectionPreview call site in the god-component is the only line this plan touched in `[websiteId]/page.tsx` — the rest of the file (including the top-bar action cluster around line 2573-2603 where 08-04 will insert the Manage Servers button) is pristine.
- Future SECT-02 / SECT-03 section types (deferred from v1.0) will re-introduce the Copy IP / Server IP display by rendering a section that reads from a selected `MinecraftServer` connection — not by re-adding `serverIp` to `WebsiteData`. The current shape is the right v1.1 contract.

---
*Phase: 08-dashboard-public-site*
*Plan: 02*
*Completed: 2026-05-12*
