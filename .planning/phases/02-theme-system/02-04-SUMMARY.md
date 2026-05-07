---
phase: 02-theme-system
plan: 04
subsystem: ui
tags: [typescript, theme, sections, hero, background-override, THEME-03]

# Dependency graph
requires:
  - plan: 02-01
    provides: SiteTheme type contracts (PaletteKey, FontKey, SiteTheme)
provides:
  - SectionBgOverride control in hero-settings.tsx (Section Background label, hex input, Reset Background button)
  - Hero render applies section.settings.backgroundColor as inline style override with fallback to getBackgroundStyle()
affects: [hero-settings.tsx, hero-render.tsx]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "section.settings.backgroundColor (top-level) is the THEME-03 section-level override; section.settings.hero.backgroundColor is the hero internal bg — these are separate fields"
    - "sectionBgOverride ? { backgroundColor: sectionBgOverride } : getBackgroundStyle() — conditional override pattern for section-level bg"

key-files:
  created: []
  modified:
    - src/components/sections/settings/hero-settings.tsx
    - src/components/sections/render/hero-render.tsx

key-decisions:
  - "sectionBg is read from section.settings.backgroundColor (top-level), not from section.settings.hero.backgroundColor (hero-internal) — no naming collision"
  - "handleSectionBgChange calls onUpdate({ settings: { ...section.settings, backgroundColor: value } }) — spreads full settings to preserve all other keys"
  - "When sectionBgOverride is falsy (undefined or empty), getBackgroundStyle() is used unchanged — non-breaking fallback"

requirements-completed: [THEME-03]

# Metrics
duration: ~2min
completed: 2026-05-07
---

# Phase 2 Plan 04: Per-section background color override for Hero section

**Section Background color picker in hero-settings.tsx + section.settings.backgroundColor applied as inline style in hero-render.tsx (THEME-03)**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-05-07T19:18:53Z
- **Completed:** 2026-05-07T19:20:12Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added "Section Background" control group to the bottom of the Hero settings panel with a color picker, hex text field, and conditional "Reset Background" button (visible only when a color is set)
- The control reads/writes `section.settings.backgroundColor` (top-level), separate from `section.settings.hero.backgroundColor` (the hero's own internal background type field) — no naming collision
- Hero render now reads `sectionBgOverride = section.settings.backgroundColor` and applies it as the outermost wrapper `style` when truthy, falling back to `getBackgroundStyle()` when falsy
- TypeScript compiles without new errors (pre-existing TS2322 in preview-client.tsx is unchanged and out of scope)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add SectionBgOverride control to Hero settings panel** - `8ff31fa` (feat)
2. **Task 2: Apply section.settings.backgroundColor override in hero render** - `c5d3768` (feat)

## Files Created/Modified

- `src/components/sections/settings/hero-settings.tsx` — Added `sectionBg` variable (reads `section.settings.backgroundColor`), `handleSectionBgChange` callback (calls `onUpdate` to set top-level `backgroundColor`), and "Section Background" control group at the bottom of the panel
- `src/components/sections/render/hero-render.tsx` — Added `sectionBgOverride` variable and applied conditional style to outermost wrapper div

## Decisions Made

- Used `section.settings.backgroundColor` (top-level in the settings record) for the section-level override, keeping it separate from `section.settings.hero.backgroundColor` (hero's internal background) — this avoids any naming collision and matches the D-12 spec
- `handleSectionBgChange(undefined)` spreads all existing settings and sets `backgroundColor: undefined` — this cleanly removes the override without touching any other settings keys
- Default color shown in the picker when unset is `#0e0e10` (site-wide background per D-01) — so the picker starts at the current background color, giving server owners a sensible starting point

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — the backgroundColor flows directly from the settings color picker to the section render inline style. No placeholder values or hardcoded stubs introduced.

## Threat Flags

No new security surface introduced beyond what is documented in the plan's threat model (T-02-10, T-02-11). React's `style` prop serializes `backgroundColor` through its DOM serializer — no HTML injection surface. The value is stored as part of `Section.settings Json` in the DB, which already has ownership-validated PUT handling.

## Self-Check: PASSED

- `src/components/sections/settings/hero-settings.tsx` — FOUND, verified contains "Section Background", "Reset Background", `sectionBg`, `handleSectionBgChange`
- `src/components/sections/render/hero-render.tsx` — FOUND, verified contains `sectionBgOverride` and conditional style
- Commit `8ff31fa` — FOUND (Task 1)
- Commit `c5d3768` — FOUND (Task 2)
- TypeScript: only pre-existing TS2322 in preview-client.tsx (unchanged, out of scope)

---
*Phase: 02-theme-system*
*Completed: 2026-05-07*
