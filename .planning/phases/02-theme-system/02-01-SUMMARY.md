---
phase: 02-theme-system
plan: 01
subsystem: ui
tags: [typescript, theme, css-variables, site-theme, palette, fonts]

# Dependency graph
requires:
  - phase: 01-foundation-extraction
    provides: SiteTheme stub in src/types/site-theme.ts that this plan replaces
provides:
  - PaletteKey and FontKey TypeScript unions (8 and 5 members respectively)
  - SiteTheme interface with { palette: PaletteKey; font: FontKey }
  - DEFAULT_THEME constant ({ palette: 'cyan', font: 'rajdhani' })
  - THEME_PRESETS static lookup (palette key → D-05 accent hex)
  - FONT_FAMILY_MAP static lookup (font key → literal font-family string)
  - FONT_DISPLAY_NAMES and PALETTE_DISPLAY_NAMES for UI labels
affects: [02-02-PLAN, 02-03-PLAN, 02-04-PLAN, subdomain-layout, appearance-tab, color-swatch-picker]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Static lookup tables for theme data (THEME_PRESETS, FONT_FAMILY_MAP) — pure constants, no runtime deps
    - Literal font-family strings in FONT_FAMILY_MAP (not var(--font-*)) for editor preview compatibility (Pitfall 5)

key-files:
  created:
    - src/lib/theme-presets.ts
  modified:
    - src/types/site-theme.ts

key-decisions:
  - "Use literal font-family strings in FONT_FAMILY_MAP (e.g., \"'Rajdhani', sans-serif\") rather than var(--font-*) — works in both subdomain layout and editor preview context where font CSS vars are unavailable"
  - "FONT_FAMILY_MAP added extra display name maps (FONT_DISPLAY_NAMES, PALETTE_DISPLAY_NAMES) per plan spec for downstream AppearanceTab UI"

patterns-established:
  - "Pattern: Import PaletteKey and FontKey from @/types/site-theme in all theme-consuming files"
  - "Pattern: THEME_PRESETS[palette] for hex lookup; FONT_FAMILY_MAP[font] for CSS font-family value"
  - "Pattern: DEFAULT_THEME as the safe fallback when server.theme is null or undefined"

requirements-completed: [THEME-01, THEME-02, THEME-04]

# Metrics
duration: 5min
completed: 2026-05-07
---

# Phase 2 Plan 01: SiteTheme type contract and static theme lookup tables

**PaletteKey (8-member union) + FontKey (5-member union) + THEME_PRESETS + FONT_FAMILY_MAP published as shared type contracts for all Phase 2 plans**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-07T19:11:00Z
- **Completed:** 2026-05-07T19:16:08Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Replaced the Phase 1 SiteTheme stub (5 optional generic fields) with the locked D-06 schema: `{ palette: PaletteKey; font: FontKey }` — required fields, strict unions
- Created `src/lib/theme-presets.ts` with THEME_PRESETS (8 D-05 hex values), FONT_FAMILY_MAP (5 literal font-family strings), FONT_DISPLAY_NAMES, and PALETTE_DISPLAY_NAMES
- TypeScript compiles with zero new errors; the one pre-existing error in preview-client.tsx (TS2322) was present before these changes and is out of scope

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace SiteTheme stub with locked D-06 schema** - `6508dbb` (feat)
2. **Task 2: Create theme-presets.ts with THEME_PRESETS and FONT_FAMILY_MAP** - `927bfb4` (feat)

## Files Created/Modified

- `src/types/site-theme.ts` - Replaced stub; now exports PaletteKey (8-member union), FontKey (5-member union), SiteTheme interface, DEFAULT_THEME constant
- `src/lib/theme-presets.ts` - New file; exports THEME_PRESETS (accent hex per D-05), FONT_FAMILY_MAP (literal font-family strings), FONT_DISPLAY_NAMES, PALETTE_DISPLAY_NAMES

## Decisions Made

- Used literal font-family strings (`"'Rajdhani', sans-serif"`) in FONT_FAMILY_MAP rather than `var(--font-rajdhani)` — per Pitfall 5 in RESEARCH.md, the CSS font vars from next/font/google are only available under the subdomain layout, not in the editor preview panel. Literal strings work in both contexts.
- Added FONT_DISPLAY_NAMES and PALETTE_DISPLAY_NAMES to theme-presets.ts (specified in the plan's Task 2 code) as they are needed by downstream AppearanceTab UI components.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Pre-existing TypeScript error in `src/app/[subdomain]/preview-client.tsx` (TS2322: Type 'unknown' is not assignable to type 'ReactNode') exists before this plan and is unchanged. Logged as out-of-scope per deviation rules — the file was not modified in this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plans 02, 03, and 04 can now import PaletteKey, FontKey, SiteTheme, DEFAULT_THEME from `@/types/site-theme`
- Plans 02, 03, and 04 can now import THEME_PRESETS, FONT_FAMILY_MAP, FONT_DISPLAY_NAMES, PALETTE_DISPLAY_NAMES from `@/lib/theme-presets`
- No blockers — all type contracts and static data are published

---

_Phase: 02-theme-system_
_Completed: 2026-05-07_
