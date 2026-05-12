---
phase: 02-theme-system
plan: 02
subsystem: ui
tags: [css-isolation, gaming-layout, next-font, site-root, ssr-theme, sitenav]

# Dependency graph
requires:
    - phase: 02-theme-system
      plan: 01
      provides: SiteTheme, PaletteKey, FontKey, DEFAULT_THEME, THEME_PRESETS, FONT_FAMILY_MAP
provides:
    - SubdomainLayout with .site-root CSS isolation boundary
    - Server-side CSS var injection (--site-accent, --site-bg, --site-card, --site-text, --site-text-muted, --site-font-display)
    - All 5 Google Font declarations (Rajdhani, Orbitron, Cinzel, Exo 2, Bebas Neue) with variable option
    - SiteNav sticky component with server name + Copy IP button
    - React.cache() DB deduplication for layout + page co-fetch of same server row
affects: [02-03-PLAN, 02-04-PLAN, subdomain-public-pages]

# Tech tracking
tech-stack:
    added: []
    patterns:
        - Server-side CSS var injection on .site-root wrapper (inline style prop, no FOUC)
        - next/font/google multi-font with variable option — all 5 classNames applied simultaneously, active font switched by --site-font-display
        - React.cache() wrapping db.server.findUnique to deduplicate layout + page fetches in one request
        - .site-root as CSS isolation boundary — dashboard never has this class; --site-* vars never in :root

key-files:
    created:
        - src/components/site/nav.tsx
    modified:
        - src/app/[subdomain]/layout.tsx

key-decisions:
    - 'layout.tsx self-fetches theme via React.cache()-wrapped db.server.findUnique using params.subdomain — avoids prop threading from page to layout (RESEARCH.md Open Question 1 option c)'
    - 'All 5 font variable classNames applied to .site-root simultaneously; active font toggled by --site-font-display CSS var, not class removal (D-07)'
    - 'T-02-04 threat mitigated: palette key validated before THEME_PRESETS lookup; unknown keys fall back to DEFAULT_THEME.palette (cyan) — prevents undefined as CSS var value'
    - 'SiteNav root element is plain <nav> with no site-root class — inherits all --site-* vars from .site-root parent in layout'

patterns-established:
    - 'Pattern: .site-root as CSS isolation boundary — add to layout.tsx only, never on dashboard pages'
    - 'Pattern: React.cache() wraps any db call that layout.tsx and page.tsx both need in the same request'
    - 'Pattern: All --site-* CSS vars injected inline on .site-root — single source of truth for gaming theme'

requirements-completed: [VISUAL-01, VISUAL-02, THEME-02, THEME-04]

# Metrics
duration: 12min
completed: 2026-05-07
---

# Phase 2 Plan 02: Gaming-styled public site layout — .site-root, Google Fonts, SiteNav

**CSS isolation boundary (.site-root) + server-side CSS var injection + 5 Google Fonts + sticky SiteNav — public site now renders with dark gaming aesthetic, no FOUC, and a Copy IP nav**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-05-07T19:20:00Z
- **Completed:** 2026-05-07T19:32:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Rewrote `src/app/[subdomain]/layout.tsx` from a 7-line passthrough to a full Server Component that:
    - Declares all 5 Google Fonts at module top-level with `variable` option (Rajdhani, Orbitron, Cinzel, Exo_2, Bebas_Neue) per RESEARCH.md Pattern 2
    - Self-fetches server theme, name, and serverIp via `React.cache()`-wrapped `db.server.findUnique` for DB deduplication with page.tsx
    - Injects all 6 `--site-*` CSS vars inline on the `.site-root` wrapper — present in initial HTML, zero FOUC (D-14, THEME-04)
    - Applies `data-theme={palette}` attribute for potential CSS-attribute selectors
    - Sets `backgroundColor: "var(--site-bg)"` so dark base (#0e0e10) is present from first byte
    - Validates palette key before THEME_PRESETS lookup (T-02-04 threat mitigation)
    - Renders `<SiteNav>` as first child inside `.site-root`
- Created `src/components/site/nav.tsx` — sticky public site nav (56px tall) with:
    - Server name on left (var(--site-font-display), var(--site-text))
    - Copy IP button on right (var(--site-accent) background) — clipboard.writeText + 2s copied feedback
    - Lucide Copy/Check icon + "Copy IP"/"Copied!" text switching
    - No site-root class on nav element (inherits vars from .site-root parent)
    - `aria-label="Copy server IP"` for accessibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite SubdomainLayout with .site-root, 5 Google Fonts, CSS var injection** - `860d03e` (feat)
2. **Task 2: Create SiteNav sticky component with Copy IP button** - `9c1d397` (feat)

## Files Created/Modified

- `src/app/[subdomain]/layout.tsx` — Rewrote from passthrough to full themed layout with font declarations, DB self-fetch, CSS var injection, and SiteNav
- `src/components/site/nav.tsx` — New file; exports SiteNav with sticky positioning, server name, and Copy IP button with clipboard feedback

## Decisions Made

- Used `React.cache()` to deduplicate the layout's `db.server.findUnique` call with the page's own server row fetch — one SQL query per request render pass instead of two
- Layout self-fetches via `params.subdomain` (option c from RESEARCH.md Open Question 1) — cleanest pattern, avoids layout/page prop threading which App Router doesn't support for arbitrary data
- Applied all 5 font classNames simultaneously to `.site-root` — active font switched by `--site-font-display` value, not by class removal (D-07)
- T-02-04: fallback `THEME_PRESETS[palette] ?? THEME_PRESETS[DEFAULT_THEME.palette]` prevents unknown palette key from setting `undefined` as a CSS var

## Deviations from Plan

None — plan executed exactly as written. The layout self-fetch (Part A of Task 2) was implemented together with Task 1 since they are tightly coupled — both committed as a single atomic unit in Task 1.

## Issues Encountered

- Pre-existing TypeScript error in `src/app/[subdomain]/preview-client.tsx` (TS2322: Type 'unknown' is not assignable to type 'ReactNode') — documented in Plan 01 SUMMARY as pre-existing and out of scope. This plan's changes introduced zero new TypeScript errors.

## User Setup Required

None.

## Next Phase Readiness

- Plans 03 and 04 can now render public site pages with full dark gaming aesthetic
- `.site-root` boundary is established — all `--site-*` vars available to any child component on the public site
- SiteNav is rendered on every subdomain page automatically via layout
- No blockers for Wave 2 Plans 03 and 04

---

## Self-Check

### Created files exist

- `src/components/site/nav.tsx`: FOUND
- `src/app/[subdomain]/layout.tsx` (modified): FOUND

### Commits exist

- `860d03e` (Task 1): FOUND
- `9c1d397` (Task 2): FOUND

## Self-Check: PASSED

---

_Phase: 02-theme-system_
_Completed: 2026-05-07_
