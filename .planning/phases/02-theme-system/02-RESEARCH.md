# Phase 2: Theme System - Research

**Researched:** 2026-05-07
**Domain:** CSS variable scoping, Next.js font loading, editor state management, public site layout
**Confidence:** HIGH

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Gaming Baseline Aesthetic (VISUAL-02)**

- D-01: Dark & clean aesthetic — near-black background (`#0e0e10`), near-white text (`#f4f4f5`), slightly elevated card surfaces (`#1a1a1f`). Vivid accent color is the only per-server variable.
- D-02: Sticky navigation bar at top: server logo/name on the left, server IP with one-click-copy button on the right. No anchor links to sections in Phase 2.
- D-03: Nav is sticky — fixed at the top of the viewport as user scrolls.

**Color Palette Presets (THEME-01)**

- D-04: Single-accent-color model — each preset defines one accent color; background, text, and card are fixed across all presets.
- D-05: 8 presets: Cyan `#06b6d4`, Emerald `#10b981`, Violet `#8b5cf6`, Orange `#f97316`, Red `#ef4444`, Gold `#eab308`, Pink `#ec4899`, White `#f4f4f5`.
- D-06: Stored as `Server.theme = { palette: "cyan" | "emerald" | ..., font: "rajdhani" | ... }`. Server component looks up hex from static preset map at render time.

**Font Options (THEME-02)**

- D-07: All 5 fonts declared statically in subdomain layout with `next/font/google`. Active font toggled via CSS variable under `.site-root`.
- D-08: 5 fonts: Rajdhani (default), Orbitron, Cinzel, Exo 2, Bebas Neue.
- D-09: Font applies to `--site-font-display`. Body text uses system-ui or Inter regardless.

**Theme Editor UX (THEME-01/THEME-02/THEME-03)**

- D-10: Dedicated "Appearance" tab in the editor sidebar alongside "Sections".
- D-11: Live preview — clicking a swatch or font updates preview via CSS vars (client-side). Save persists to DB.
- D-12: Per-section background override in each section's settings panel. Stores as `section.settings.backgroundColor: string | undefined`.

**CSS Isolation (VISUAL-01)**

- D-13: All public site styles under `.site-root` CSS scope. Class added to `src/app/[subdomain]/layout.tsx`.
- D-14: Theme CSS vars injected inline by Server Component on `.site-root` element. No FOUC.

### Claude's Discretion

None documented — all Phase 2 decisions are locked.

### Deferred Ideas (OUT OF SCOPE)

- Custom hex color input (free-form beyond the 8 presets)
- Light-background theme variant
- Anchor links in nav (auto-generated section IDs for smooth scrolling)
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID        | Description                                                                                    | Research Support                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| VISUAL-01 | Server website pages render inside a `.site-root` scope that overrides dashboard CSS variables | CSS var scoping pattern verified; `.site-root` class on layout wrapper is the isolation mechanism          |
| VISUAL-02 | Server website has its own gaming-styled base layout (dark nav, vivid accent, bold typography) | Dark palette values locked in D-01; SiteNav component pattern defined in UI-SPEC                           |
| THEME-01  | User can choose a site-wide color palette from curated presets                                 | 8 presets defined in D-05; `ThemePresetMap` lookup pattern identified                                      |
| THEME-02  | User can choose a site-wide display font from a curated set via next/font/google               | Static font declaration pattern verified via Context7; all 5 fonts must be declared with `variable` option |
| THEME-03  | User can override the background color of any individual section                               | Per-section `backgroundColor` in `section.settings` pattern; HTML `<input type="color">` in settings panel |
| THEME-04  | Theme applied server-side via `data-theme` attribute — no FOUC                                 | Inline `style` prop on Server Component wrapper; CSS vars in initial HTML                                  |

</phase_requirements>

---

## Summary

Phase 2 delivers two parallel concerns that must never interfere: (1) a visually distinct gaming-styled public site isolated from the dashboard by the `.site-root` CSS class, and (2) a theme editor UI in the existing dashboard sidebar that lets server owners configure the public site's appearance with live preview.

The architecture is clear and the decisions are fully locked. The public site gets its theme from CSS custom properties injected inline by a Server Component in `src/app/[subdomain]/layout.tsx` — this eliminates flash of unstyled content without any client-side hydration tricks. The dashboard remains completely unchanged at the `:root` level; dashboard styles never see `.site-root`, and site styles never appear outside it.

The primary implementation challenge is the editor "Appearance" tab: it needs to update live preview CSS vars client-side (instant feedback) while also persisting to the database on Save, without the god-component (`page.tsx`) growing in line count. The pattern is identical to how the existing navbar settings work — a state variable (`themeSettings`) loaded from `data.theme` on mount, updated via the new `AppearanceTab` component, and sent in the `PUT` body alongside `sections` and `navbar`.

**Primary recommendation:** Use CSS custom property injection on `.site-root` (server-side inline style) for FOUC-free theme application. Use the `variable` option in `next/font/google` declarations so all 5 font CSS class names are available simultaneously — then toggle the active font by setting `--site-font-display` to the correct font-family value.

---

## Architectural Responsibility Map

| Capability                         | Primary Tier            | Secondary Tier                 | Rationale                                                                                  |
| ---------------------------------- | ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ |
| CSS isolation (`.site-root` scope) | Frontend Server (SSR)   | —                              | Must be in the HTML response to prevent FOUC; layout.tsx Server Component owns the wrapper |
| Theme CSS var injection            | Frontend Server (SSR)   | —                              | Inline `style` on Server Component ensures vars are in initial HTML, no hydration needed   |
| Google Font loading                | Frontend Server (SSR)   | —                              | `next/font/google` must be called at module level in a Server Component layout             |
| Live preview theme update          | Browser / Client        | —                              | CSS var mutation on `.site-root` in preview panel; no server round-trip                    |
| Theme persistence (save)           | API / Backend           | —                              | `PUT /api/servers/[serverId]` already accepts and stores `theme` field                     |
| SiteNav (public)                   | Frontend Server (SSR)   | Browser (IP copy)              | Nav renders server-side; copy button is the only interactive element                       |
| AppearanceTab (editor)             | Browser / Client        | —                              | Editor is already `"use client"`; Appearance tab is a child component                      |
| Per-section background override    | Browser / Client (edit) | Frontend Server (SSR) (render) | Stored in section.settings; applied at render time on public site                          |
| `ThemePresetMap` (lookup)          | Shared (both tiers)     | —                              | Pure static data; imported by Server Component and client editor                           |

---

## Standard Stack

### Core

| Library          | Version            | Purpose                                          | Why Standard                                                                     |
| ---------------- | ------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------ |
| next/font/google | 16.1.6 (bundled)   | Static Google Font loading with CSS variables    | Eliminates FOUT, zero runtime network requests, required for static declarations | [VERIFIED: Context7 /vercel/next.js] |
| Tailwind CSS v4  | 4.x (package.json) | Utility classes + `@theme inline` CSS var bridge | Already in stack; `.site-root` scoping via class prefix                          | [VERIFIED: package.json]             |
| framer-motion    | 12.29.2            | Swatch animations, tab transitions               | Already in stack; `whileHover`/`whileTap` used throughout editor                 | [VERIFIED: package.json]             |
| Zustand          | 5.0.10             | Active tab state (Sections vs Appearance)        | Already in stack; `useSidebarStore` pattern mentioned in CONTEXT.md              | [VERIFIED: package.json]             |
| lucide-react     | 0.563.0            | Copy/Check icons for IP copy button              | Already in stack; Copy + Check already imported in editor                        | [VERIFIED: package.json]             |

### No New Dependencies Needed

All required capabilities are covered by the existing stack. This phase adds zero new npm packages.

---

## Architecture Patterns

### System Architecture Diagram

```
[Editor page.tsx]
    │
    ├── useEffect (load) ──────────────────── GET /api/servers/[serverId]
    │       └── data.theme → themeSettings state
    │
    ├── AppearanceTab (new file)
    │       ├── ColorSwatchPicker ─────────── onClick: setThemeSettings({ palette: key })
    │       │                                          + mutate .site-root CSS var in preview
    │       └── FontPicker ────────────────── onClick: setThemeSettings({ font: name })
    │                                                  + mutate .site-root CSS var in preview
    │
    ├── saveServer() ──────────────────────── PUT /api/servers/[serverId]
    │       └── body includes theme: themeSettings  (already passes through to Prisma)
    │
    └── Preview panel <div class="site-root" data-theme={theme.palette}>
            └── CSS vars set via inline style={{ '--site-accent': '#...', ... }}

[src/app/[subdomain]/layout.tsx]  (Server Component)
    │
    ├── db.server.findUnique() ─── self-fetches server.theme, name, serverIp via params.subdomain
    │       └── wrapped in React.cache() to deduplicate with page.tsx's server row fetch
    │
    └── .site-root wrapper with inline style (CSS vars)
            └── <SiteNav serverName serverIp />
            └── {children} (sections rendered by page.tsx)
```

### Recommended Project Structure

New files this phase adds:

```
src/
├── lib/
│   └── theme-presets.ts         # ThemePresetMap: palette key → hex value (pure data)
├── types/
│   └── site-theme.ts            # UPDATE: replace stub with { palette, font } shape
├── components/
│   ├── site/
│   │   └── nav.tsx              # SiteNav — sticky public site nav (NEW)
│   └── editor/
│       ├── appearance-tab.tsx   # AppearanceTab — color + font pickers (NEW)
│       ├── color-swatch-picker.tsx  # ColorSwatchPicker with 44px tap zone (NEW)
│       └── font-picker.tsx      # FontPicker with font-preview labels (NEW)
└── app/
    └── [subdomain]/
        ├── layout.tsx           # MODIFY: add .site-root, fonts, CSS var injection, self-fetch
        └── page.tsx             # MODIFY: minor — themeSettings state + preview wrapper
```

Per-section background override is added inside each existing section's settings panel file (no new files — modification only).

### Pattern 1: CSS Variable Injection (Server-Side, No FOUC)

**What:** Server Component renders the `.site-root` wrapper with inline CSS vars derived from `server.theme` lookup.

**When to use:** Any theme value that must be present in the initial HTML response (palette, font, bg, text).

```tsx
// Source: CONTEXT.md D-14; Next.js Server Component pattern
// src/app/[subdomain]/layout.tsx

import { THEME_PRESETS } from '@/lib/theme-presets';
import type { SiteTheme } from '@/types/site-theme';

export default function SubdomainLayout({
	children,
	theme,
}: {
	children: React.ReactNode;
	theme?: SiteTheme;
}) {
	const palette = theme?.palette ?? 'cyan';
	const font = theme?.font ?? 'rajdhani';
	const accent = THEME_PRESETS[palette] ?? THEME_PRESETS.cyan;

	const cssVars: React.CSSProperties = {
		'--site-accent': accent,
		'--site-bg': '#0e0e10',
		'--site-card': '#1a1a1f',
		'--site-text': '#f4f4f5',
		'--site-text-muted': '#a1a1aa',
		'--site-font-display': FONT_FAMILY_MAP[font] ?? 'Rajdhani, sans-serif',
	} as React.CSSProperties;

	return (
		<div className="site-root" data-theme={palette} style={cssVars}>
			{children}
		</div>
	);
}
```

### Pattern 2: Next.js Font — Multiple Fonts with CSS Variables

**What:** All 5 fonts declared at module level in the layout file using the `variable` option. Each font's CSS class is applied to the wrapper, making the font-family CSS var available under `.site-root`. The active font is selected by setting `--site-font-display`.

**Critical constraint:** `next/font/google` declarations must be at module scope (top-level `const`). They cannot be inside functions, loops, or conditionals. This is a Next.js build-time requirement. [VERIFIED: Context7 /vercel/next.js]

```tsx
// Source: Context7 /vercel/next.js — multiple fonts with CSS variables
// src/app/[subdomain]/layout.tsx

import { Bebas_Neue, Cinzel, Exo_2, Orbitron, Rajdhani } from 'next/font/google';

// Non-variable fonts require weight array. Exo_2 is variable (no weight needed).
// Bebas Neue only ships weight 400 — declared as-is (no bold variant).
const rajdhani = Rajdhani({
	weight: ['400', '700'],
	subsets: ['latin'],
	variable: '--font-rajdhani',
	display: 'swap',
});

const orbitron = Orbitron({
	weight: ['400', '700'],
	subsets: ['latin'],
	variable: '--font-orbitron',
	display: 'swap',
});

const cinzel = Cinzel({
	weight: ['400', '700'],
	subsets: ['latin'],
	variable: '--font-cinzel',
	display: 'swap',
});

const exo2 = Exo_2({
	subsets: ['latin'], // variable font — no weight param needed
	variable: '--font-exo2',
	display: 'swap',
});

const bebasNeue = Bebas_Neue({
	weight: '400', // Only weight available for this font
	subsets: ['latin'],
	variable: '--font-bebas',
	display: 'swap',
});

// Apply all font className variables so CSS vars are available on the element.
// The active font is switched by --site-font-display, not by removing a class.
export default function SubdomainLayout({ children, theme }) {
	const fontClasses = [
		rajdhani.variable,
		orbitron.variable,
		cinzel.variable,
		exo2.variable,
		bebasNeue.variable,
	].join(' ');

	return (
		<div
			className={`site-root ${fontClasses}`}
			data-theme={theme?.palette ?? 'cyan'}
			style={cssVars}
		>
			{children}
		</div>
	);
}
```

**Font family values for `--site-font-display`:**

```ts
// src/lib/theme-presets.ts
export const FONT_FAMILY_MAP: Record<string, string> = {
	rajdhani: 'var(--font-rajdhani), sans-serif',
	orbitron: 'var(--font-orbitron), sans-serif',
	cinzel: 'var(--font-cinzel), serif',
	exo2: 'var(--font-exo2), sans-serif',
	bebas: 'var(--font-bebas), sans-serif',
};
```

### Pattern 3: Live Preview CSS Var Update (Client-Side)

**What:** When the user clicks a swatch or font option in the Appearance tab, immediately update CSS vars on the `.site-root` element inside the preview panel — no save required. This gives instant visual feedback without a server round-trip.

**When to use:** Every swatch click and font selection in the AppearanceTab.

```ts
// Source: CONTEXT.md D-11; DOM CSS property mutation pattern [ASSUMED pattern name]
// Called from AppearanceTab onClick handlers

function applyThemePreview(previewRoot: HTMLElement | null, palette: string, font: string) {
	if (!previewRoot) return;
	const accent = THEME_PRESETS[palette] ?? THEME_PRESETS.cyan;
	const fontFamily = FONT_FAMILY_MAP[font] ?? FONT_FAMILY_MAP.rajdhani;
	previewRoot.style.setProperty('--site-accent', accent);
	previewRoot.style.setProperty('--site-font-display', fontFamily);
	previewRoot.setAttribute('data-theme', palette);
}
```

The preview panel in the editor already renders section components via `SectionPreview`. The `.site-root` wrapper wraps this panel so CSS vars cascade down.

### Pattern 4: ThemePresetMap (Static Lookup)

```ts
// Source: CONTEXT.md D-05
// src/lib/theme-presets.ts

export type PaletteKey =
	| 'cyan'
	| 'emerald'
	| 'violet'
	| 'orange'
	| 'red'
	| 'gold'
	| 'pink'
	| 'white';

export const THEME_PRESETS: Record<PaletteKey, string> = {
	cyan: '#06b6d4',
	emerald: '#10b981',
	violet: '#8b5cf6',
	orange: '#f97316',
	red: '#ef4444',
	gold: '#eab308',
	pink: '#ec4899',
	white: '#f4f4f5',
};
```

### Pattern 5: Appearance Tab Wired to Editor Save

The existing `saveServer()` in `page.tsx` already sends `theme` in the PUT body and the API route already passes it through to Prisma. The only required change is:

1. Add `themeSettings` state to `ServerEditorPage` (alongside `navbarSettings`).
2. Populate it from `data.theme` in the existing `loadServerData` `useEffect`.
3. Include it in the `savedStateRef` tracking and `saveServer()` PUT body.
4. Pass `themeSettings` and `setThemeSettings` as props to `AppearanceTab`.

No other changes to `page.tsx` are needed beyond these 4 targeted additions.

### Pattern 6: SiteTheme Type Update

The current stub in `src/types/site-theme.ts` has 5 optional generic fields. Phase 2 replaces it with the exact schema from D-06:

```ts
// src/types/site-theme.ts
export type PaletteKey =
	| 'cyan'
	| 'emerald'
	| 'violet'
	| 'orange'
	| 'red'
	| 'gold'
	| 'pink'
	| 'white';

export type FontKey = 'rajdhani' | 'orbitron' | 'cinzel' | 'exo2' | 'bebas';

export interface SiteTheme {
	palette: PaletteKey;
	font: FontKey;
}

export const DEFAULT_THEME: SiteTheme = {
	palette: 'cyan',
	font: 'rajdhani',
};
```

### Anti-Patterns to Avoid

- **Dynamic font declarations:** Never call `Rajdhani({ ... })` inside a React component function or `useEffect`. Next.js performs font optimization at build time and requires top-level module declarations. [VERIFIED: Context7 /vercel/next.js]
- **Modifying `:root` in globals.css for site styles:** The `:root` block is dashboard-only. Any `.site-root` scoped vars must be in a separate CSS block or inline style — never in `:root`.
- **Applying `--site-font-display` to body text:** Body text must use `system-ui` or Inter regardless of theme font selection (D-09). Only apply `font-family: var(--site-font-display)` to heading and display elements inside `.site-root`.
- **Growing the god-component:** All Appearance tab logic goes in `src/components/editor/appearance-tab.tsx`. The only change to `page.tsx` is adding the `themeSettings` state variable and wiring it — no new JSX blocks inline.
- **Client-side font switching:** Do not attempt to load or swap fonts at runtime. All 5 font CSS variables are available immediately because all 5 fonts are declared in the layout.

---

## Don't Hand-Roll

| Problem                           | Don't Build                       | Use Instead                                                                | Why                                                                                                        |
| --------------------------------- | --------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Font loading with FOUT prevention | Custom font preloading logic      | `next/font/google` with `variable` + `display: 'swap'`                     | Next.js handles preload link injection, font size adjustment, zero runtime cost                            |
| CSS variable theming              | JS theme context / class toggling | Inline `style` prop + CSS vars cascade                                     | CSS vars cascade through the DOM; Server Component injection means zero client JS for initial render       |
| Color swatch circles              | Custom slider / color wheel       | Plain `<button>` with Framer Motion `whileHover`/`whileTap`                | CSS circle + motion library already in stack; no new dependency needed                                     |
| Per-section color picker          | Full colorpicker widget           | `<input type="color">` + hex text field (existing `.color-picker` pattern) | Already implemented in `BackgroundSettingsPanel` in the god-component — extract and reuse the same pattern |

**Key insight:** The BackgroundSettingsPanel component already implements the color picker + hex text field pattern used for section backgrounds. The per-section background override for Phase 2 (`section.settings.backgroundColor`) is a simpler single-field version of this existing pattern.

---

## Common Pitfalls

### Pitfall 1: Font Import Name Mismatch

**What goes wrong:** Using `Exo2` instead of `Exo_2`, or `BebasNeue` instead of `Bebas_Neue` in the import statement. The Next.js font loader uses underscores to represent spaces.

**Why it happens:** Developer types the font name as it appears visually; Next.js requires snake_case with underscores for multi-word names.

**How to avoid:** Always use underscores for spaces: `Exo_2`, `Bebas_Neue`. [VERIFIED: Context7 /vercel/next.js — font import naming convention]

**Warning signs:** Build error "Module not found: Can't resolve 'next/font/google'" or a TypeScript error saying the named export doesn't exist.

### Pitfall 2: Bebas Neue Weight Declaration

**What goes wrong:** Declaring `weight: ["400", "700"]` for Bebas Neue. The font only ships weight 400.

**Why it happens:** Copying the weight pattern from other fonts without checking what Bebas Neue actually ships.

**How to avoid:** Declare `weight: "400"` (string, not array) for Bebas Neue. The all-caps design reads visually bold regardless. [ASSUMED — based on Google Fonts metadata knowledge, not verified in this session]

**Warning signs:** Build warning or failed font download.

### Pitfall 3: CSS Var Specificity Conflict with Dashboard

**What goes wrong:** A `.site-root` CSS var happens to share a name with a dashboard `:root` var (e.g., `--accent`), causing one to override the other.

**Why it happens:** The dashboard uses `--accent` in `globals.css`. If site code accidentally uses `--accent` instead of `--site-accent`, it collides.

**How to avoid:** All public site vars MUST use the `--site-` prefix. Never use bare `--accent`, `--background`, etc. inside `.site-root`. The existing `globals.css` vars are dashboard-only.

**Warning signs:** Dashboard accent color changing when theme is applied; or site accent not applying.

### Pitfall 4: Preview Panel Missing .site-root Wrapper

**What goes wrong:** The editor's preview panel renders section components but the `.site-root` class and CSS vars are not on the preview wrapper — so live preview theme changes have no visible effect.

**Why it happens:** The preview panel in `page.tsx` is currently a plain white `<div>` (class `bg-white rounded-lg shadow-xl`). It does not have `.site-root` applied.

**How to avoid:** Wrap the preview panel sections container with a `.site-root` element that has inline CSS vars driven by `themeSettings` state. Apply this wrapper specifically inside the preview area in `page.tsx`, not globally.

**Warning signs:** Swatch clicks update state but the preview background stays white/light.

### Pitfall 5: Font Variable Not Applied to Preview

**What goes wrong:** All 5 fonts are declared in `[subdomain]/layout.tsx` (server-side) but the editor preview panel is in the dashboard — those font CSS variables are NOT available in the dashboard context.

**Why it happens:** The font `className` variables (`--font-rajdhani`, etc.) are injected by the `[subdomain]/layout.tsx` Server Component. The dashboard layout does not import these fonts.

**How to avoid:** The AppearanceTab / preview panel must include the 5 font CSS variable classes on its `.site-root` preview wrapper. The simplest approach: inline the font CSS var fallback values directly (`font-family: 'Rajdhani', sans-serif`) rather than relying on `var(--font-rajdhani)` in the editor preview. The `--font-*` CSS vars only exist on the public subdomain; in the editor, use literal font-family strings from `FONT_FAMILY_MAP` with the literal family name.

**Warning signs:** Font appears to change in the public site but not in the editor live preview.

### Pitfall 6: Theme Not Passed Through page.tsx → layout.tsx

**What goes wrong:** `src/app/[subdomain]/page.tsx` fetches `server.theme` but does not pass it to the layout, so the layout renders with the default cyan palette even if a different one is saved.

**Why it happens:** The current layout.tsx is a simple passthrough (`export default function SubdomainLayout({ children }) { return <>{children}</>; }`). It receives no theme prop today.

**How to avoid:** `page.tsx` must parse `server.theme as SiteTheme` and pass it as a prop to the layout, OR the layout can fetch its own theme data. The cleanest pattern (no extra DB call) is to pass theme from `page.tsx` to `layout.tsx` via a Server Component prop or a React Context.

**Warning signs:** Public site always shows cyan accent regardless of theme setting.

---

## Code Examples

### SiteNav Component

```tsx
// Source: UI-SPEC.md component inventory; CONTEXT.md D-02, D-03
// src/components/site/nav.tsx
'use client';

import { Check, Copy } from 'lucide-react';

import { useState } from 'react';

interface SiteNavProps {
	serverName: string;
	serverIp: string;
}

export function SiteNav({ serverName, serverIp }: SiteNavProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(serverIp);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<nav
			className="sticky top-0 z-50 flex h-14 items-center justify-between px-6"
			style={{ backgroundColor: 'var(--site-card)' }}
		>
			<span
				className="text-lg font-bold"
				style={{ fontFamily: 'var(--site-font-display)', color: 'var(--site-text)' }}
			>
				{serverName}
			</span>
			<button
				onClick={handleCopy}
				className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
				style={{
					backgroundColor: 'var(--site-accent)',
					color: '#ffffff',
				}}
				aria-label="Copy server IP"
			>
				{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
				{copied ? 'Copied!' : 'Copy IP'}
			</button>
		</nav>
	);
}
```

### ColorSwatchPicker (WCAG-compliant tap zone)

```tsx
// Source: UI-SPEC.md — 44px tap zone (WCAG 2.5.5), 28px visual circle
// src/components/editor/color-swatch-picker.tsx
'use client';

import { motion } from 'framer-motion';

import { THEME_PRESETS, type PaletteKey } from '@/lib/theme-presets';

const PALETTE_NAMES: Record<PaletteKey, string> = {
	cyan: 'Cyan',
	emerald: 'Emerald',
	violet: 'Violet',
	orange: 'Orange',
	red: 'Red',
	gold: 'Gold',
	pink: 'Pink',
	white: 'White',
};

interface ColorSwatchPickerProps {
	selected: PaletteKey;
	onChange: (key: PaletteKey) => void;
}

export function ColorSwatchPicker({ selected, onChange }: ColorSwatchPickerProps) {
	const keys = Object.keys(THEME_PRESETS) as PaletteKey[];

	return (
		<div className="grid grid-cols-4 gap-1">
			{keys.map((key) => (
				// 44px interactive target; 28px visual circle centered inside
				<button
					key={key}
					onClick={() => onChange(key)}
					aria-label={PALETTE_NAMES[key]}
					className="flex h-11 w-11 items-center justify-center"
				>
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						animate={selected === key ? { scale: 1.1 } : { scale: 1.0 }}
						transition={{ duration: 0.15, ease: 'easeOut' }}
						style={{
							width: 28,
							height: 28,
							borderRadius: '50%',
							backgroundColor: THEME_PRESETS[key],
							outline: selected === key ? `2px solid ${THEME_PRESETS[key]}` : 'none',
							outlineOffset: '2px',
						}}
					/>
				</button>
			))}
		</div>
	);
}
```

### Per-Section Background Override Control

```tsx
// Source: CONTEXT.md D-12; existing BackgroundSettingsPanel pattern in page.tsx
// Added to each section's settings panel file

interface SectionBgOverrideProps {
	value: string | undefined;
	onChange: (value: string | undefined) => void;
}

export function SectionBgOverride({ value, onChange }: SectionBgOverrideProps) {
	return (
		<div className="space-y-3 rounded-lg bg-zinc-50/50 p-3">
			<h3 className="text-xs font-semibold tracking-wider text-zinc-700 uppercase">
				Section Background
			</h3>
			<div className="flex items-center gap-2">
				<div className="color-picker" style={{ backgroundColor: value ?? '#0e0e10' }}>
					<input
						type="color"
						value={value ?? '#0e0e10'}
						onChange={(e) => onChange(e.target.value)}
						className="absolute inset-0 -top-1/2 -left-1/2 h-[200%] w-[200%] cursor-pointer opacity-0"
					/>
				</div>
				<input
					type="text"
					placeholder="#0e0e10"
					value={value ?? ''}
					onChange={(e) => onChange(e.target.value || undefined)}
					className="input-field min-w-0 flex-1 font-mono text-xs"
				/>
				{value && (
					<button
						onClick={() => onChange(undefined)}
						className="text-xs whitespace-nowrap text-zinc-400 transition-colors hover:text-zinc-600"
					>
						Reset
					</button>
				)}
			</div>
		</div>
	);
}
```

---

## State of the Art

| Old Approach                                                   | Current Approach                                          | When Changed          | Impact                                                                |
| -------------------------------------------------------------- | --------------------------------------------------------- | --------------------- | --------------------------------------------------------------------- |
| CSS class toggling for themes (e.g., `dark` class on `<html>`) | CSS custom properties injected inline by Server Component | Widespread since 2022 | Eliminates FOUC; theme is in initial HTML without client JS           |
| Loading all fonts globally in `_document.js`                   | `next/font/google` with `variable` option per font        | Next.js 13+           | Automatic font preloading, zero layout shift, build-time optimization |
| Runtime font injection (Google Fonts `<link>`)                 | Static build-time font loading                            | Next.js 13+           | No FOUT; fonts self-hosted by Next.js, no Google network dependency   |

**Deprecated/outdated:**

- Loading Google Fonts via `<link>` in `<head>`: replaced by `next/font/google` in Next.js 13+. The old approach has FOUT and external network dependency.
- Using `document.body.classList.toggle()` for themes: replaced by CSS var injection. Class toggling creates flash.

---

## Assumptions Log

| #   | Claim                                                                                             | Section                 | Risk if Wrong                                                                  |
| --- | ------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------ |
| A1  | Bebas Neue only ships weight 400 on Google Fonts                                                  | Pitfall 2, Font pattern | If it ships 700, declaring `weight: "400"` still works but misses bold variant |
| A2  | Editor preview panel does not currently have `.site-root` wrapper                                 | Pitfall 4, Architecture | If it does, no action needed; but code inspection confirms it does not         |
| A3  | `--font-rajdhani` CSS var from `[subdomain]/layout.tsx` is NOT available in the dashboard context | Pitfall 5               | If wrong, literal font-family fallback still works — just slightly redundant   |

---

## Open Questions (RESOLVED)

1. **How should `theme` data flow from `page.tsx` to `layout.tsx` in the subdomain route?**
    - What we know: Next.js App Router layouts receive children but not arbitrary props from child pages.
    - What's unclear: The standard pattern for passing data from a page to its parent layout. Options: (a) fetch theme again in layout.tsx (extra DB call), (b) use a React context via a shared client Provider, (c) restructure so the layout itself fetches theme using the `params` it receives.
    - Recommendation: **Option (c)** — the `[subdomain]/layout.tsx` already receives `{ params: { subdomain } }` which it can use to fetch the theme directly. This avoids double fetching and keeps layout fully server-side. The page still does its own full fetch for sections.
    - RESOLVED: layout.tsx self-fetches via `db.server.findUnique({ where: { subdomain } })` wrapped in `React.cache()` to deduplicate with page.tsx's own server row fetch. No theme prop threading from page → layout.

2. **Should the editor preview panel's `.site-root` wrapper also apply the font CSS class variables?**
    - What we know: The 5 font CSS vars (`--font-rajdhani`, etc.) are defined by `next/font/google` in the subdomain layout — not in the dashboard.
    - What's unclear: Whether the font `className` from `next/font/google` can be applied outside its host layout.
    - Recommendation: Use literal font-family strings in the editor preview (e.g., `'Rajdhani, sans-serif'`) rather than `var(--font-rajdhani)`. This avoids cross-layout font var dependencies and works the same visually in the preview panel.
    - RESOLVED: Use literal font-family strings from `FONT_FAMILY_MAP` (e.g., `"'Rajdhani', sans-serif"`) in the editor preview's `--site-font-display` CSS var. The `--font-*` vars from `next/font/google` are not available in the dashboard context.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is purely code/config changes. No external tools, services, CLIs, or databases beyond the existing project stack are introduced. The existing PostgreSQL database connection and Prisma client are already confirmed working (Phase 1 completed successfully).

---

## Validation Architecture

**nyquist_validation is explicitly set to false in .planning/config.json — this section is omitted.**

---

## Security Domain

**No new security surface.** The `PUT /api/servers/[serverId]` endpoint already performs ownership checks (session auth + `server.userId === session.user.id`) before updating. The `theme` field is stored as `Json?` in Prisma and treated as an opaque object — no SQL injection vector. The only new user input paths are:

- Palette key selection (validated against enum — no free text)
- Font key selection (validated against enum — no free text)
- Per-section `backgroundColor` (hex string — stored as section `settings.backgroundColor`, rendered via inline `style` on the public site, not in a CSS `<style>` block, so no CSS injection risk)

No new authentication, session, or access control concerns.

---

## Sources

### Primary (HIGH confidence)

- Context7 `/vercel/next.js` — `next/font/google` static declarations, CSS variable pattern, multiple fonts, non-variable weight requirements
- Codebase direct inspection — `src/app/globals.css`, `src/app/(dashboard)/dashboard/[serverId]/page.tsx`, `src/app/[subdomain]/layout.tsx`, `src/app/api/servers/[serverId]/route.ts`, `prisma/schema.prisma`, `package.json`
- `.planning/phases/02-theme-system/02-CONTEXT.md` — all locked decisions
- `.planning/phases/02-theme-system/02-UI-SPEC.md` — component inventory, spacing, animation contracts

### Secondary (MEDIUM confidence)

- Google Fonts general knowledge — font variability status for Rajdhani, Orbitron, Cinzel, Exo 2, Bebas Neue (weight requirements)

### Tertiary (LOW confidence)

- None

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all libraries already in package.json; Next.js font API verified via Context7
- Architecture: HIGH — all decisions locked in CONTEXT.md; code inspection confirms current state of modified files
- Pitfalls: HIGH (identified from direct code reading) / MEDIUM for font-specific pitfalls (Bebas weight is ASSUMED)

**Research date:** 2026-05-07
**Valid until:** 2026-06-07 (stable stack; Next.js 16 font API is stable)
