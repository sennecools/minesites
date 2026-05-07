# Phase 2: Theme System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-07
**Phase:** 2-Theme System
**Areas discussed:** Gaming baseline look, Color palette presets, Font options, Theme editor placement

---

## Gaming Baseline Look

| Option | Description | Selected |
|--------|-------------|----------|
| Dark & clean | Near-black backgrounds, vivid accent pops, clean sans-serif, modern gaming feel | ✓ |
| Gritty / textured | Dark with noise/grain textures, heavier borders, underground/edgy feel | |
| Gradient-heavy neon | Bold gradient overlays, glowing borders, esports tournament aesthetic | |

**User's choice:** Dark & clean

---

| Option | Description | Selected |
|--------|-------------|----------|
| Server name + IP copy button | Simple: name/logo on left, IP with copy on right | ✓ |
| Server name + anchor links | Logo + auto-generated section links, smooth scroll | |
| Minimal — logo/name only | Just name/logo, scroll to find content | |

**User's choice:** Server name + IP copy button

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sticky nav | Stays visible as user scrolls, always accessible | ✓ |
| Static nav | Scrolls away with page | |

**User's choice:** Sticky

---

## Color Palette Presets

| Option | Description | Selected |
|--------|-------------|----------|
| Single accent + smart derivation | One accent color, fixed dark bg/text derived automatically | ✓ |
| Full palette presets | All 4-5 values per preset, supports light-background variants | |

**User's choice:** Single accent color + smart derivation

---

| Option | Description | Selected |
|--------|-------------|----------|
| 6 presets — gaming spectrum | Cyan, Emerald, Violet, Orange, Red, Gold | |
| 8 presets — expanded set | Same 6 + Pink + White | ✓ |
| 4 presets — minimal | Cyan, Emerald, Violet, Orange | |

**User's choice:** 8 presets (Cyan, Emerald, Violet, Orange, Red, Gold, Pink, White)

---

## Font Options

| Option | Description | Selected |
|--------|-------------|----------|
| Inter (existing) | Already loaded, clean but not gaming-y | |
| Rajdhani or Russo One | Gaming-flavored bold font as default | ✓ |

**User's choice:** Gaming default font

---

| Option | Description | Selected |
|--------|-------------|----------|
| Rajdhani | Condensed, strong, military/tech | ✓ |
| Russo One | Bold geometric all-caps, maximum impact | |

**User's choice:** Rajdhani as default

---

| Option | Description | Selected |
|--------|-------------|----------|
| 5 fonts — range of gaming styles | Rajdhani, Orbitron, Cinzel, Exo 2, Bebas Neue | ✓ |
| 3 fonts — focused | Rajdhani, Orbitron, Cinzel | |
| 7 fonts — more variety | 5-font set + Press Start 2P + MedievalSharp | |

**User's choice:** 5 fonts (Rajdhani, Orbitron, Cinzel, Exo 2, Bebas Neue)

---

## Theme Editor Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated "Appearance" tab in sidebar | New tab alongside Sections; color + font picker with live preview | ✓ |
| Settings panel within editor | Collapsible section at top of existing settings panel | |
| Separate page | Own route at /dashboard/[serverId]/theme | |

**User's choice:** Dedicated Appearance tab in sidebar

---

| Option | Description | Selected |
|--------|-------------|----------|
| Live preview | Theme updates immediately in preview panel; Save persists to DB | ✓ |
| Save-to-preview | Changes appear only after clicking Save | |

**User's choice:** Live preview

---

## Claude's Discretion

- CSS isolation mechanism: `.site-root` scoping with inline CSS var injection on the server element (FOUC-safe, no separate CSS file needed)
- FOUC prevention implementation: theme hex values injected as inline `style` on `.site-root` element by the Server Component
- Font loading: all 5 fonts declared statically in `[subdomain]/layout.tsx` with `next/font/google`; active font toggled via CSS var

## Deferred Ideas

- Custom hex color picker (beyond the 8 presets) — future Phase 2+ enhancement
- Light-background theme variant — fixed dark base is sufficient for Phase 2
- Anchor nav links (smooth scroll to sections) — adds complexity; deferred from Phase 2 nav
