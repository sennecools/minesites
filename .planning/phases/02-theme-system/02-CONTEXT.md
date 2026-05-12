# Phase 2: Theme System - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a visually distinct gaming identity for public server websites: a dark-clean base layout, 8 selectable accent color presets, 5 Google Font options, and a per-section background override. The admin dashboard must be completely unaffected. Public pages have no flash of unstyled content (theme applied server-side).

**In scope:**

- `.site-root` CSS scope in `src/app/[subdomain]/layout.tsx` — hard boundary isolating public site styles from dashboard
- Gaming-styled base layout for public sites (dark background, bold typography, sticky nav, elevated card surfaces)
- Sticky nav component with server name + one-click IP copy button
- 8 color preset swatches (accent-only, fixed dark bg/text) — stored in `Server.theme.palette`
- 5 Google Fonts (Rajdhani default, Orbitron, Cinzel, Exo 2, Bebas Neue) — stored in `Server.theme.font`
- Theme applied server-side via `data-theme` attribute on `.site-root` — no FOUC
- Per-section background color override (THEME-03) — stored in `section.settings.backgroundColor`
- "Appearance" tab in the editor sidebar (alongside "Sections") with live preview

**Out of scope:**

- Custom hex color input (presets only in Phase 2)
- Light-background theme variant
- Marketing pages or dashboard visual changes
- Visual effects (Phase 5)
- New section types (Phase 3)

</domain>

<decisions>
## Implementation Decisions

### Gaming Baseline Aesthetic (VISUAL-02)

- **D-01:** Dark & clean aesthetic — near-black background (`#0e0e10`), near-white text (`#f4f4f5`), slightly elevated card surfaces (`#1a1a1f`). Vivid accent color is the only per-server variable on top of this fixed dark palette.
- **D-02:** Sticky navigation bar at top: server logo/name on the left, server IP with one-click-copy button on the right. No anchor links to sections in Phase 2 (simplest useful nav).
- **D-03:** Nav is sticky — fixed at the top of the viewport as user scrolls. Keeps the IP copy always accessible; standard on gaming sites.

### Color Palette Presets (THEME-01)

- **D-04:** Single-accent-color model — each preset defines one accent color; background (`#0e0e10`), text (`#f4f4f5`), and card (`#1a1a1f`) are fixed across all presets. Owner picks a vibe, not 4 hex codes. Always looks coherent.
- **D-05:** 8 presets:
    - Cyan `#06b6d4` — water/sky/aquatic servers
    - Emerald `#10b981` — survival/nature/farming servers
    - Violet `#8b5cf6` — magic/RPG servers
    - Orange `#f97316` — creative/build servers
    - Red `#ef4444` — PvP/faction/war servers
    - Gold `#eab308` — prison/economy/SMP servers
    - Pink `#ec4899` — skyblock/casual/friendly servers
    - White `#f4f4f5` — clean/minimalist servers
- **D-06:** Stored as `Server.theme = { palette: "cyan" | "emerald" | ... , font: "rajdhani" | ... }`. The server component looks up the hex value from a static preset map at render time.

### Font Options (THEME-02)

- **D-07:** Rajdhani is the default gaming font — loaded statically in the subdomain layout. All 5 fonts are declared in the subdomain layout with `next/font/google` (build-time static declarations). The active font is toggled via a CSS variable under `.site-root`.
- **D-08:** 5 available fonts:
    - `Rajdhani` — default; condensed, strong, military/tech feel
    - `Orbitron` — futuristic, sci-fi, space servers
    - `Cinzel` — epic fantasy, magic, lore servers
    - `Exo 2` — modern, clean, general-purpose gaming
    - `Bebas Neue` — high-impact, esports, PvP
- **D-09:** Font applies to the display/heading font-family CSS variable (`--site-font-display`). Body text uses a legible fallback (system-ui or Inter) regardless of the theme font choice.

### Theme Editor UX (THEME-01/THEME-02/THEME-03)

- **D-10:** Dedicated "Appearance" tab in the editor sidebar — alongside the existing "Sections" tab. No navigation to a new page; the user stays in the editor and can see the preview update live.
- **D-11:** Live preview — clicking a color swatch or font option immediately updates the preview panel (applies CSS vars client-side). The Save button persists to the database. Same UX as design tools (Webflow, Squarespace).
- **D-12:** Per-section background override (THEME-03) lives in each section's settings panel under a "Background" control. Stores as `section.settings.backgroundColor: string | undefined`. When set, overrides the site-wide dark bg for that section only.

### CSS Isolation (VISUAL-01)

- **D-13:** All public site styles live under `.site-root` CSS scope. The `.site-root` class is added to the `<body>` or wrapper `<div>` in `src/app/[subdomain]/layout.tsx`. Dashboard pages never have this class — complete isolation by class scoping.
- **D-14:** Theme CSS custom properties are injected inline on the `.site-root` element by the Server Component (e.g., `style={{ '--site-accent': '#06b6d4', '--site-font-display': 'Rajdhani' }}`). This is server-rendered, so the theme is present in the initial HTML — no FOUC. The `data-theme` attribute (per THEME-04) triggers any CSS that varies by theme name.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Definition

- `.planning/ROADMAP.md` §Phase 2 — Goal, success criteria (4 numbered items), requirements: VISUAL-01, VISUAL-02, THEME-01, THEME-02, THEME-03, THEME-04
- `.planning/REQUIREMENTS.md` §Visual Design + §Theme System — Full requirement text for VISUAL-01, VISUAL-02, THEME-01, THEME-02, THEME-03, THEME-04

### Existing Files to Modify

- `src/app/[subdomain]/layout.tsx` — currently a passthrough; receives `.site-root` class, font declarations, and theme prop injection
- `src/app/[subdomain]/page.tsx` — Server Component that fetches `server.theme`; passes theme to layout
- `src/app/[subdomain]/preview-client.tsx` — client renderer; receives theme for live preview in editor context
- `src/app/globals.css` — existing dashboard `:root` variables; must NOT be modified for site styles
- `src/types/site-theme.ts` — `SiteTheme` stub from Phase 1 (5 optional fields); may need update to match D-06 schema

### Editor Files to Modify

- `src/app/(dashboard)/dashboard/[serverId]/page.tsx` — add "Appearance" tab to sidebar, wire theme state to preview

### Database

- `prisma/schema.prisma` — `Server.theme Json?` already exists (no migration needed); `Section.settings Json` stores per-section `backgroundColor`

### Phase 1 Decisions

- `.planning/phases/01-foundation-extraction/01-CONTEXT.md` — D-08: SiteTheme stub; CSS scoping decision (`.site-root`)
- `src/lib/section-registry.tsx` — registry for section dispatch; Appearance tab is additive, does not break registry

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/components/ui/button.tsx` — use for IP copy button in nav and editor controls
- `src/components/ui/` barrel — Input, Label, Select available for theme editor controls
- `framer-motion` — already in stack; use for accent swatch selection animation and font preview
- `src/lib/utils.ts` — `cn()` for conditional Tailwind class merging
- Lucide icons (`Copy`, `Check`) — for IP copy button feedback

### Established Patterns

- `"use client"` at top of all interactive components; Server Components (no directive) for data-fetching pages
- Zustand for cross-component state (`useSidebarStore` pattern) — consider for active sidebar tab (Sections vs Appearance)
- `@/` path alias for all imports
- CSS custom properties already used in `globals.css` — same pattern for `.site-root` scoped vars
- Named exports for components, default exports for Next.js pages/layouts
- Framer Motion `initial/animate/exit` + `whileHover` pattern used throughout

### Integration Points

- `src/app/[subdomain]/layout.tsx` — add `.site-root` wrapper + inject CSS vars inline on server render
- `src/app/(dashboard)/dashboard/[serverId]/page.tsx` — add Appearance tab to the left sidebar; share theme state with the existing preview panel
- `src/app/api/servers/[serverId]/route.ts` — already handles `theme` field in PUT body (check if it passes through to Prisma update)
- `src/app/[subdomain]/preview-client.tsx` — may need theme-aware CSS vars passed through for live editor preview

</code_context>

<specifics>
## Specific Ideas

- The Appearance tab preview described by the user: color swatches as clickable circles (`● Cyan ● Emerald ● Violet / ● Orange ● Red ● Gold / ● Pink ● White`), font options as named clickable labels.
- Font choice applies to `--site-font-display` CSS variable under `.site-root` — body text uses a legible non-gaming fallback regardless of theme font.
- All 5 fonts declared statically in `src/app/[subdomain]/layout.tsx` with `next/font/google` — Next.js requires static declarations, cannot be dynamic.
- Per-section bg override stored as `section.settings.backgroundColor` — a hex string or `undefined` (meaning "use site default"). Section render components check for this value and apply it to their outer wrapper.

</specifics>

<deferred>
## Deferred Ideas

- **Custom hex input** — free-form accent color picker beyond the 8 presets. Deferred: presets are sufficient for Phase 2; custom color is a Phase 2+ enhancement.
- **Light-background theme variant** — some server owners may want a light theme. Not in scope for Phase 2 (fixed dark base); can be a future preset extension.
- **Anchor links in nav** — auto-generated links to each section for smooth scrolling. Deferred: adds complexity (section IDs, scroll behavior). Phase 2 nav is name + IP only.

</deferred>

---

_Phase: 2-Theme System_
_Context gathered: 2026-05-07_
