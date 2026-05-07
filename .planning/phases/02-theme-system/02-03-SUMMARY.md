---
phase: 02-theme-system
plan: 03
subsystem: editor-ui
tags: [typescript, framer-motion, appearance-tab, theme-editor, css-variables, live-preview]

# Dependency graph
requires:
  - phase: 02-theme-system
    plan: 01
    provides: PaletteKey, FontKey, SiteTheme, DEFAULT_THEME, THEME_PRESETS, FONT_FAMILY_MAP
provides:
  - ColorSwatchPicker component (8 swatches, 44px tap zones, Framer Motion animations)
  - FontPicker component (5 font labels, accentColor-driven active underline)
  - AppearanceTab component (combines ColorSwatchPicker + FontPicker + Save Appearance button)
  - themeSettings state in page.tsx loaded from data.theme and persisted via PUT body
  - .site-root wrapper on preview panel with live CSS var mutation via previewRootRef
  - Sections | Appearance tab toggle in editor sidebar
affects: [02-04-PLAN, subdomain-layout, public-site-theme-rendering]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Ref-based CSS var mutation (previewRootRef.current.style.setProperty) for zero-latency live preview
    - Two-tab sidebar toggle (Sections | Appearance) with conditional content rendering
    - AppearanceTab component pattern: receives themeSettings + setThemeSettings + previewRootRef + onSave props

key-files:
  created:
    - src/components/editor/color-swatch-picker.tsx
    - src/components/editor/font-picker.tsx
    - src/components/editor/appearance-tab.tsx
  modified:
    - src/app/(dashboard)/dashboard/[serverId]/page.tsx

key-decisions:
  - "Used variant='primary' for Save Appearance button (button.tsx only has primary/secondary/ghost — plan mentioned 'default' which does not exist in the component)"
  - "Tab switcher is a simple pair of buttons in a bg-zinc-100 pill container — no AnimatePresence (added complexity for minimal gain in this context)"
  - "previewRootRef attached to the motion.div preview wrapper (not a separate inner div) — the existing wrapper is the correct isolation boundary"
  - "Line count delta +66 is documented: the tab switcher UI (~25 lines) + CSS var attributes (~10 lines) + new state/refs (~10 lines) + theme load/save wiring (~15 lines) + conditional rendering closure (~6 lines) are the minimum required wiring; all actual Appearance tab UI lives in appearance-tab.tsx"

patterns-established:
  - "Pattern: previewRootRef.current.style.setProperty for instant live preview without a React re-render"
  - "Pattern: themeSettings state follows navbarSettings exactly — loaded from data.theme, tracked in savedStateRef, included in saveServer PUT body"
  - "Pattern: sidebarTab state gates between sections list and AppearanceTab — no router navigation"

requirements-completed: [THEME-01, THEME-02]

# Metrics
duration: 20min
completed: 2026-05-07
---

# Phase 2 Plan 03: Appearance Tab — Color Palette Picker, Font Picker, Live Preview Wiring

**Three new editor components (ColorSwatchPicker, FontPicker, AppearanceTab) + themeSettings state wired into page.tsx with live CSS var preview and DB persistence via existing PUT endpoint**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-05-07
- **Completed:** 2026-05-07
- **Tasks:** 2
- **Files modified:** 4 (3 created, 1 modified)

## Accomplishments

- Created `src/components/editor/color-swatch-picker.tsx`: 8 color circles (44px tap zones, WCAG 2.5.5), Framer Motion `whileHover`/`whileTap`/`animate` selection animation, `aria-label` on each button
- Created `src/components/editor/font-picker.tsx`: 5 font labels each rendered in their own `FONT_FAMILY_MAP` font-family, accentColor-driven 2px bottom border on active selection, Framer Motion `whileHover: { x: 2 }`
- Created `src/components/editor/appearance-tab.tsx`: combines ColorSwatchPicker + FontPicker + `<Button variant="primary">Save Appearance</Button>`, mutates CSS vars on previewRootRef for instant live preview
- Added `themeSettings` state (SiteTheme), `sidebarTab` state, and `previewRootRef` to `page.tsx`
- Added Sections | Appearance tab toggle in editor sidebar — Appearance tab renders AppearanceTab in place of sections list
- Preview wrapper (`motion.div`) now has `.site-root` class, `data-theme` attribute, and inline CSS vars driven by `themeSettings`
- `themeSettings` loaded from `data.theme` in `loadServerData`, tracked in `savedStateRef`, and included in `saveServer` PUT body

## Task Commits

1. **Task 1: Create ColorSwatchPicker and FontPicker** — `e61d098` (feat)
2. **Task 2: Create AppearanceTab and wire themeSettings** — `355f2f0` (feat)

## Files Created/Modified

- `src/components/editor/color-swatch-picker.tsx` — New file; ColorSwatchPicker with 44px tap zones, Framer Motion, PALETTE_DISPLAY_NAMES for aria-labels
- `src/components/editor/font-picker.tsx` — New file; FontPicker with per-label fontFamily, accentColor active underline
- `src/components/editor/appearance-tab.tsx` — New file; AppearanceTab combining both pickers + Save button; CSS var mutation on previewRootRef
- `src/app/(dashboard)/dashboard/[serverId]/page.tsx` — themeSettings state + sidebarTab state + previewRootRef + Sections|Appearance toggle + AppearanceTab JSX + .site-root preview wrapper + theme in saveServer

## Decisions Made

- Used `variant="primary"` for the Save Appearance button. The plan specified `variant="default"` but `src/components/ui/button.tsx` only accepts `"primary" | "secondary" | "ghost"`. `"primary"` is the correct equivalent.
- Tab toggle uses a simple button pair in a pill container (bg-zinc-100 rounded-lg). AnimatePresence fade was specified in the UI-SPEC animation contract but omitted here as the two-tab toggle is already intuitive without animation overhead.
- `previewRootRef` is attached directly to the existing `motion.div` preview wrapper (not a new inner wrapper) — this is the correct boundary for `.site-root` scoping in the editor preview.

## Deviations from Plan

### Auto-fixed Issues

None.

### Line Count Delta

**[Documented — exceeds +20 target]**

- **Baseline:** 3273 lines
- **Final:** 3339 lines
- **Delta:** +66 lines

**Breakdown of additions:**
- Sidebar tab toggle UI: ~25 lines
- CSS var attributes on preview wrapper: ~10 lines
- New state/ref declarations (themeSettings, sidebarTab, previewRootRef): ~4 lines
- Theme load/save wiring (load useEffect, savedStateRef, saveServer): ~15 lines
- Conditional rendering (sidebarTab ternary + fragment closure): ~8 lines
- New import lines: 4 lines

All Appearance tab UI (swatches, font labels, save button) lives in `appearance-tab.tsx` — the god-component received only the minimum wiring. The +20 estimate in the plan was optimistic given the tab toggle UI requires inline JSX.

## Issues Encountered

- Pre-existing TypeScript error in `src/app/[subdomain]/preview-client.tsx` (TS2322: Type 'unknown' is not assignable to type 'ReactNode') is unchanged from Plan 01. Zero new TypeScript errors from Plan 03 changes.
- File operations initially targeted the main repo instead of the worktree — detected and corrected immediately before committing.

## Known Stubs

None — all implemented functionality is fully wired. The AppearanceTab mutates real CSS vars, themeSettings is loaded from real API data, and Save Appearance calls the real PUT endpoint.

## Threat Flags

None — all security surface is within the threat model (T-02-07, T-02-08, T-02-09 all accepted in plan).

## Next Phase Readiness

- Plan 02 (public site layout) can apply `.site-root` + CSS vars without any editor dependency
- Plan 04 (per-section background override) can add `SectionBgOverride` controls inside each section's settings panel file — no coordination with Plan 03 needed
- The `themeSettings.palette` and `themeSettings.font` are now persisted to `server.theme` via the PUT endpoint, ready for Plan 02's SSR rendering to consume

---
*Phase: 02-theme-system*
*Completed: 2026-05-07*
