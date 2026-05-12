# Phase 2: Theme System - Pattern Map

**Mapped:** 2026-05-07
**Files analyzed:** 11 (5 new + 6 modified)
**Analogs found:** 10 / 11

---

## File Classification

| New/Modified File                                   | Role          | Data Flow                    | Closest Analog                                                                                  | Match Quality |
| --------------------------------------------------- | ------------- | ---------------------------- | ----------------------------------------------------------------------------------------------- | ------------- |
| `src/lib/theme-presets.ts`                          | utility       | transform                    | `src/lib/plan.ts`                                                                               | role-match    |
| `src/components/site/nav.tsx`                       | component     | request-response             | `src/components/layout/header.tsx`                                                              | role-match    |
| `src/components/editor/appearance-tab.tsx`          | component     | event-driven                 | Navbar settings block in `src/app/(dashboard)/dashboard/[serverId]/page.tsx` lines 3052–3136    | role-match    |
| `src/components/editor/color-swatch-picker.tsx`     | component     | event-driven                 | Background type button grid in `src/components/sections/settings/hero-settings.tsx` lines 72–87 | role-match    |
| `src/components/editor/font-picker.tsx`             | component     | event-driven                 | Alignment button group in `src/components/sections/settings/hero-settings.tsx` lines 43–65      | role-match    |
| `src/app/[subdomain]/layout.tsx`                    | config/layout | request-response             | `src/app/(dashboard)/layout.tsx`                                                                | role-match    |
| `src/app/[subdomain]/page.tsx`                      | page          | request-response (CRUD read) | existing file itself (modify)                                                                   | self          |
| `src/app/[subdomain]/preview-client.tsx`            | component     | event-driven                 | existing file itself (modify)                                                                   | self          |
| `src/types/site-theme.ts`                           | model/type    | —                            | `src/types/sections.ts`                                                                         | role-match    |
| `src/app/(dashboard)/dashboard/[serverId]/page.tsx` | page          | event-driven                 | existing file itself (modify)                                                                   | self          |
| `src/app/api/servers/[serverId]/route.ts`           | route         | CRUD                         | existing file itself (verify-only)                                                              | self          |

---

## Pattern Assignments

### `src/lib/theme-presets.ts` (utility, transform)

**Analog:** `src/lib/plan.ts`

**Pattern:** Named exports from a module-level pure data/function file. No `"use client"` — imported by both Server Components and client components.

**Imports pattern** (`src/lib/plan.ts` lines 1–3):

```typescript
// No imports needed for pure data files — just TypeScript types + plain exports
// plan.ts exports a typed interface and a pure function
export interface PlanLimits { ... }
export function getPlanLimits(plan: 'free' | 'paid'): PlanLimits { ... }
```

**Core pattern to copy** (`src/lib/plan.ts` lines 1–17):

```typescript
// Pure static data file — no "use client", no imports
// Named exports only; no default export
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

export const FONT_FAMILY_MAP: Record<FontKey, string> = {
	rajdhani: 'var(--font-rajdhani), sans-serif',
	orbitron: 'var(--font-orbitron), sans-serif',
	cinzel: 'var(--font-cinzel), serif',
	exo2: 'var(--font-exo2), sans-serif',
	bebas: 'var(--font-bebas), sans-serif',
};
```

**No error handling** — pure static data, no I/O, no error surface.

---

### `src/components/site/nav.tsx` (component, request-response)

**Analog:** `src/components/layout/header.tsx`

This is a sticky nav on the public site. It follows the same "sticky top-0 z-N" pattern as the marketing header, but uses CSS vars (`var(--site-card)`, `var(--site-accent)`) instead of Tailwind classes. The copy-to-clipboard interaction follows the existing `Copy`/`Check` icon swap pattern already in `page.tsx`.

**Imports pattern** (`src/components/layout/header.tsx` lines 1–5):

```typescript
'use client';

import { Check, Copy } from 'lucide-react';

import { useState } from 'react';

// No cn() needed — all styles are inline CSS vars (site-root scoped)
```

**Sticky nav structure** (`src/components/layout/header.tsx` lines 88–94):

```typescript
// header.tsx uses: className="fixed top-0 left-0 right-0 z-40 ..."
// SiteNav equivalent — sticky (not fixed), uses CSS vars:
<nav
  className="sticky top-0 z-50 h-14 flex items-center justify-between px-6"
  style={{ backgroundColor: "var(--site-card)" }}
>
```

**Copy-to-clipboard interaction** (`src/app/(dashboard)/dashboard/[serverId]/page.tsx` lines 2852–2860):

```typescript
// Exact icon swap pattern from page.tsx (Copy/Check with state):
{copied ? (
  <Check className="w-3.5 h-3.5 text-emerald-500" />
) : (
  <Copy className="w-3.5 h-3.5 text-zinc-400" />
)}
// setTimeout(() => setCopied(false), 2000) — matches existing 2s reset
```

**CSS var usage for theming** — all colors via `var(--site-*)`, never Tailwind color classes inside `.site-root`:

```typescript
// Server name uses display font var:
style={{ fontFamily: "var(--site-font-display)", color: "var(--site-text)" }}
// Copy button uses accent var:
style={{ backgroundColor: "var(--site-accent)", color: "#ffffff" }}
```

**No auth** — public component, no session or middleware.

---

### `src/components/editor/appearance-tab.tsx` (component, event-driven)

**Analog:** Navbar settings block in `src/app/(dashboard)/dashboard/[serverId]/page.tsx` lines 3052–3136

The Appearance tab follows the exact same prop shape and internal structure as the Navbar settings panel — a panel component that receives state + setter, renders controls, and calls the setter on every interaction. The `onSave` callback triggers `saveServer()` just like clicking "Publish" already does.

**Imports pattern** (copy from `src/components/sections/settings/hero-settings.tsx` lines 1–5):

```typescript
'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { ColorSwatchPicker } from '@/components/editor/color-swatch-picker';
import { FontPicker } from '@/components/editor/font-picker';
import { cn } from '@/lib/utils';
import type { SiteTheme } from '@/types/site-theme';
```

**Props shape** (mirror of NavbarSettings pattern, `page.tsx` lines 2401 + 2511):

```typescript
// Analogous to: navbarSettings / setNavbarSettings / saveServer pattern
interface AppearanceTabProps {
	theme: SiteTheme;
	onChange: (patch: Partial<SiteTheme>) => void;
	onSave: () => void;
	isSaving: boolean;
}
```

**Control group container** (`src/components/sections/settings/hero-settings.tsx` lines 68–70):

```typescript
// All control groups use this wrapper pattern:
<div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
  <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
    Color
  </h3>
  {/* ... controls */}
</div>
```

**Settings label** (`src/app/globals.css` lines 158–166, reused via class):

```typescript
// Use the .settings-label CSS class for section headings (already defined in globals.css)
<label className="settings-label">Color</label>
// .settings-label: 11px, weight 500, uppercase, zinc-500
```

**Save button** — reuse the Framer Motion button pattern from `page.tsx` lines 2702–2715:

```typescript
<motion.button
  whileHover={{ scale: 1.02, y: -1 }}
  whileTap={{ scale: 0.98 }}
  onClick={onSave}
  disabled={isSaving}
  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-200/50 transition-shadow disabled:opacity-50"
>
  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
  {isSaving ? "Saving..." : "Save Appearance"}
</motion.button>
```

**AnimatePresence tab transition** (`page.tsx` lines 3173–3176):

```typescript
// AppearanceTab rendered inside AnimatePresence in page.tsx:
<AnimatePresence mode="wait">
  <motion.div
    key="appearance"
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.15 }}
  >
    <AppearanceTab ... />
  </motion.div>
</AnimatePresence>
```

---

### `src/components/editor/color-swatch-picker.tsx` (component, event-driven)

**Analog:** Background type toggle buttons in `src/components/sections/settings/hero-settings.tsx` lines 72–87

The existing pattern for a row of option buttons (selected = cyan border + cyan bg + cyan text, unselected = zinc-200 border + white bg + zinc-500 text) maps directly to swatch selection. The visual replacement is a filled circle instead of a text button.

**Selected/unselected state pattern** (`src/components/sections/settings/hero-settings.tsx` lines 53–63):

```typescript
// Existing toggle button pattern — active state drives border + bg + text:
className={`flex-1 p-2 rounded-lg border transition-all ${
  (hero.alignment ?? "center") === value
    ? "border-cyan-300 bg-cyan-50 text-cyan-600"
    : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-400"
}`}
```

**For swatches, the selection ring replaces the border pattern:**

```typescript
// 44px tap zone (WCAG 2.5.5) wrapping 28px visual circle:
<button
  key={key}
  onClick={() => onChange(key)}
  aria-label={PALETTE_NAMES[key]}
  className="w-11 h-11 flex items-center justify-center"
  // w-11 = 44px, h-11 = 44px
>
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    animate={selected === key ? { scale: 1.1 } : { scale: 1.0 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    style={{
      width: 28,
      height: 28,
      borderRadius: "50%",
      backgroundColor: THEME_PRESETS[key],
      outline: selected === key ? `2px solid ${THEME_PRESETS[key]}` : "none",
      outlineOffset: "2px",
    }}
  />
</button>
```

**Framer Motion whileHover/whileTap** (`src/components/layout/header.tsx` lines 45–48):

```typescript
// Existing animate pattern throughout the codebase:
whileHover={{ scale: 1.05, y: -1, transition: { duration: 0.15 } }}
whileTap={{ scale: 0.95 }}
```

**Imports pattern:**

```typescript
'use client';

import { motion } from 'framer-motion';

import { THEME_PRESETS, type PaletteKey } from '@/lib/theme-presets';
```

---

### `src/components/editor/font-picker.tsx` (component, event-driven)

**Analog:** Alignment button group in `src/components/sections/settings/hero-settings.tsx` lines 43–65

Font options are a list of clickable labels — each renders its own name in the corresponding font-family. The selected state mirrors the alignment button active style (accent-colored underline instead of border).

**Selected state via bottom border** (new pattern, references existing button active state):

```typescript
// Each font option is a motion.button with:
// - Active: accent-colored bottom border (2px), font-weight 700
// - Inactive: zinc-400 text, no border
// Renders its own name in the corresponding font-family
<motion.button
  key={key}
  onClick={() => onChange(key)}
  whileHover={{ x: 2 }}
  className={cn(
    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all",
    selected === key
      ? "text-zinc-900 font-bold border-l-2 border-l-[var(--editor-accent,#06b6d4)] bg-zinc-50"
      : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
  )}
  style={{ fontFamily: FONT_DISPLAY_NAMES[key] }}
>
  {FONT_LABELS[key]}
  {selected === key && <Check className="w-3.5 h-3.5 text-zinc-400" />}
</motion.button>
```

**Imports pattern:**

```typescript
'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

import { type FontKey } from '@/lib/theme-presets';
import { cn } from '@/lib/utils';
```

**FONT_DISPLAY_NAMES** — literal font-family strings for editor preview (not CSS vars, which don't exist in dashboard context — see RESEARCH.md Pitfall 5):

```typescript
// Use literal font-family strings in the editor preview, NOT var(--font-*)
// The --font-* CSS vars are only available in [subdomain]/layout.tsx context
const FONT_DISPLAY_NAMES: Record<FontKey, string> = {
	rajdhani: "'Rajdhani', sans-serif",
	orbitron: "'Orbitron', sans-serif",
	cinzel: "'Cinzel', serif",
	exo2: "'Exo 2', sans-serif",
	bebas: "'Bebas Neue', sans-serif",
};
```

---

### `src/app/[subdomain]/layout.tsx` (config/layout, request-response)

**Analog:** `src/app/(dashboard)/layout.tsx` (layout shell) + `src/app/layout.tsx` (font declarations)

The current `src/app/[subdomain]/layout.tsx` is a 7-line passthrough. This phase transforms it into a Server Component that fetches theme data, declares 5 fonts, and injects CSS vars.

**Read the dashboard layout** (`src/app/(dashboard)/layout.tsx`) for the shell pattern — but the key changes are:

**Next.js font declaration at module scope** — critical constraint (RESEARCH.md Pattern 2):

```typescript
// MUST be at module top-level, not inside any function.
// next/font/google declarations with variable option:
import { Bebas_Neue, Cinzel, Exo_2, Orbitron, Rajdhani } from 'next/font/google';

const rajdhani = Rajdhani({
	weight: ['400', '700'],
	subsets: ['latin'],
	variable: '--font-rajdhani',
	display: 'swap',
});
// ... (all 5 font declarations at module scope)
```

**Inline CSS var injection** (RESEARCH.md Pattern 1) — server-renders the theme into initial HTML, preventing FOUC:

```typescript
// Server Component (no "use client") — receives params, fetches theme:
export default async function SubdomainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  // Fetch theme from DB using subdomain
  const server = await db.server.findUnique({
    where: { subdomain },
    select: { theme: true },
  });
  const theme = (server?.theme as SiteTheme | null) ?? DEFAULT_THEME;
  const accent = THEME_PRESETS[theme.palette] ?? THEME_PRESETS.cyan;

  const cssVars: React.CSSProperties = {
    "--site-accent": accent,
    "--site-bg": "#0e0e10",
    "--site-card": "#1a1a1f",
    "--site-text": "#f4f4f5",
    "--site-text-muted": "#a1a1aa",
    "--site-font-display": FONT_FAMILY_MAP[theme.font] ?? FONT_FAMILY_MAP.rajdhani,
  } as React.CSSProperties;

  const fontClasses = [rajdhani.variable, orbitron.variable, cinzel.variable, exo2.variable, bebasNeue.variable].join(" ");

  return (
    <div
      className={`site-root ${fontClasses}`}
      data-theme={theme.palette}
      style={cssVars}
    >
      {children}
    </div>
  );
}
```

**DB import pattern** (`src/app/[subdomain]/page.tsx` lines 1–2):

```typescript
import { notFound } from 'next/navigation';

import { db } from '@/lib/db';
```

---

### `src/app/[subdomain]/page.tsx` (page, CRUD read)

**Analog:** existing file itself (lines 1–53)

This file already fetches server data with `db.server.findUnique`. The only change is adding `theme` to the fetched data and passing it to `PreviewClient` (or noting it's now handled by layout.tsx directly).

**Existing fetch pattern** (lines 14–23):

```typescript
const server = await db.server.findUnique({
	where: { subdomain },
	include: {
		sections: {
			where: { visible: true },
			orderBy: { order: 'asc' },
		},
	},
});
```

**Add theme to serverData object** (after line 35):

```typescript
const serverData = {
	name: server.name,
	subdomain: server.subdomain,
	serverIp: server.serverIp,
	// Add: pass theme for preview-client to use when constructing .site-root wrapper
	theme: server.theme as SiteTheme | null,
};
```

**notFound / published guard** (lines 26–28) — keep unchanged:

```typescript
if (!server || (!server.published && !isPreviewMode)) {
	notFound();
}
```

---

### `src/app/[subdomain]/preview-client.tsx` (component, event-driven)

**Analog:** existing file itself (lines 738–764)

The current `PreviewClient` wraps sections in `<div className="min-h-screen bg-zinc-50">`. For Phase 2, this wrapper becomes the `.site-root` element with inline CSS vars so the live editor preview shows theme changes.

**Current wrapper** (lines 738–741):

```typescript
export default function PreviewClient({ server, sections, isPreviewMode }: PreviewClientProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
```

**Modified pattern** — add theme prop + `.site-root` wrapper with inline vars:

```typescript
// Theme props shape matches page.tsx output
interface PreviewClientProps {
  server: ServerData;
  sections: Section[];
  isPreviewMode: boolean;
  theme?: SiteTheme | null;  // ADD: passed from page.tsx
}

export default function PreviewClient({ server, sections, isPreviewMode, theme }: PreviewClientProps) {
  const resolvedTheme = theme ?? DEFAULT_THEME;
  const accent = THEME_PRESETS[resolvedTheme.palette] ?? THEME_PRESETS.cyan;
  const cssVars: React.CSSProperties = {
    "--site-accent": accent,
    "--site-bg": "#0e0e10",
    "--site-card": "#1a1a1f",
    "--site-text": "#f4f4f5",
    "--site-text-muted": "#a1a1aa",
    "--site-font-display": FONT_FAMILY_MAP[resolvedTheme.font] ?? FONT_FAMILY_MAP.rajdhani,
  } as React.CSSProperties;

  return (
    <div
      className="site-root min-h-screen"
      data-theme={resolvedTheme.palette}
      style={{ ...cssVars, backgroundColor: "var(--site-bg)" }}
    >
```

**SECTION_REGISTRY dispatch** (lines 748–760) — keep unchanged.

---

### `src/types/site-theme.ts` (model/type, —)

**Analog:** `src/types/sections.ts` (type file pattern)

This is a type-only file: no `"use client"`, named exports, TypeScript union types + interface.

**Current stub** (lines 3–10) — replace entirely:

```typescript
// Current: 5 optional generic fields
export interface SiteTheme {
	primaryColor?: string; // ... etc.
}
```

**New pattern** (matches sections.ts export structure):

```typescript
// src/types/site-theme.ts — Phase 2 replacement
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

Note: `PaletteKey` and `FontKey` are declared in BOTH `src/lib/theme-presets.ts` (for runtime use) AND `src/types/site-theme.ts` (for type use), or `site-theme.ts` can import them from `theme-presets.ts`. The simplest approach: keep types in `theme-presets.ts` and re-export from `site-theme.ts`, or just import from `theme-presets.ts` at usage sites.

---

### `src/app/(dashboard)/dashboard/[serverId]/page.tsx` (page, event-driven) — MODIFY

**Analog:** existing file itself — adding `themeSettings` state parallel to `navbarSettings` (lines 2401, 2439–2441, 2472, 2511)

**Critical constraint:** This file MUST NOT grow in raw line count. All Appearance tab JSX goes in `src/components/editor/appearance-tab.tsx`. The only changes to `page.tsx` are 4 targeted additions.

**1. Add themeSettings state** (after line 2401, mirror of navbarSettings):

```typescript
// Line 2401: existing
const [navbarSettings, setNavbarSettings] = useState<NavbarSettings>(initialNavbarSettings);
// ADD after:
const [themeSettings, setThemeSettings] = useState<SiteTheme>(DEFAULT_THEME);
```

**2. Populate from data.theme in loadServerData** (after line 2440, mirror of navbar block lines 2439–2441):

```typescript
// Lines 2439–2441: existing navbar load pattern
if (data.navbar && typeof data.navbar === 'object') {
	setNavbarSettings({ ...initialNavbarSettings, ...(data.navbar as Partial<NavbarSettings>) });
}
// ADD after (same pattern):
if (data.theme && typeof data.theme === 'object') {
	setThemeSettings({ ...DEFAULT_THEME, ...(data.theme as Partial<SiteTheme>) });
}
```

**3. Include in savedStateRef tracking** (lines 2472, 2478–2480 + 2487–2491):

```typescript
// Line 2472: extend ref type
const savedStateRef = useRef<{ sections: string; navbar: string; theme: string } | null>(null);
// Line 2479: add theme to saved snapshot
theme: JSON.stringify(themeSettings),
// Line 2488: add theme to change detection
const currentTheme = JSON.stringify(themeSettings);
const hasChanges = ... || currentTheme !== savedStateRef.current.theme;
```

**4. Include in saveServer PUT body** (line 2511, mirror of navbar):

```typescript
// Line 2511: existing
navbar: navbarSettings,
// ADD:
theme: themeSettings,
```

**5. Add Appearance tab toggle to sidebar** — add a tab row above the existing "Sections" header (line 2724) and render `<AppearanceTab>` when active:

```typescript
// New state for sidebar tab:
const [sidebarTab, setSidebarTab] = useState<"sections" | "appearance">("sections");

// Tab switcher row (insert before line 2724 "Sections List" div header):
<div className="flex gap-1 mb-2 p-1 bg-zinc-100 rounded-lg">
  {(["sections", "appearance"] as const).map((tab) => (
    <button
      key={tab}
      onClick={() => setSidebarTab(tab)}
      className={cn(
        "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
        sidebarTab === tab
          ? "bg-white shadow-sm text-zinc-900"
          : "text-zinc-500 hover:text-zinc-700"
      )}
    >
      {tab[0].toUpperCase() + tab.slice(1)}
    </button>
  ))}
</div>
```

**6. Render AppearanceTab in the right Settings panel** (alongside existing selectedSection block, line 3052):

```typescript
// In the Settings Panel (right column), replace/extend the selectedSection conditional:
{sidebarTab === "appearance" ? (
  <AppearanceTab
    theme={themeSettings}
    onChange={(patch) => setThemeSettings((prev) => ({ ...prev, ...patch }))}
    onSave={saveServer}
    isSaving={isSaving}
  />
) : selectedSection === "navbar" ? (
  // ... existing navbar block
) : selectedSectionData ? (
  <SettingsPanel ... />
) : (
  // ... empty state
)}
```

**7. Apply .site-root + theme CSS vars to the preview wrapper** (line 2938–2941 — the preview `<motion.div>`):

```typescript
// Line 2941: currently: className="bg-white rounded-lg shadow-xl overflow-hidden h-fit max-w-full"
// Modify: add site-root class and inline CSS vars driven by themeSettings state
const previewAccent = THEME_PRESETS[themeSettings.palette] ?? THEME_PRESETS.cyan;
const previewCssVars: React.CSSProperties = {
  "--site-accent": previewAccent,
  "--site-bg": "#0e0e10",
  "--site-card": "#1a1a1f",
  "--site-text": "#f4f4f5",
  "--site-text-muted": "#a1a1aa",
  "--site-font-display": themeSettings.font, // literal, since font vars not in dashboard
} as React.CSSProperties;

// Add to the motion.div wrapping the preview content:
className="site-root rounded-lg shadow-xl overflow-hidden h-fit max-w-full"
data-theme={themeSettings.palette}
style={previewCssVars}
```

---

### `src/app/api/servers/[serverId]/route.ts` (route, CRUD) — VERIFY ONLY

**No changes needed.** `theme` is already destructured from `body` (line 58) and passed to `tx.server.update` (line 88). This is a verify-only task: confirm `theme` flows through the transaction without transformation or validation issues.

**Existing pattern** (lines 58 + 88):

```typescript
// Line 58: already destructured
const { name, subdomain, description, serverIp, serverPort, logo, banner, navbar, theme, sections } = body;
// Line 88: already written to Prisma
theme,
```

---

### Section settings panels — `SectionBgOverride` control (component, event-driven)

**Analog:** Color picker block in `src/components/sections/settings/hero-settings.tsx` lines 89–111

The per-section background override is a simplified version of the existing `color-picker` + `input-field` combo already used in hero settings.

**Color picker + hex input pattern** (`src/components/sections/settings/hero-settings.tsx` lines 89–111):

```typescript
// Exact pattern to copy for SectionBgOverride:
<div className="flex gap-2 items-center">
  <div
    className="color-picker"
    style={{ backgroundColor: value ?? "#0e0e10" }}
  >
    <input
      type="color"
      value={value ?? "#0e0e10"}
      onChange={(e) => onChange(e.target.value)}
      className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
    />
  </div>
  <input
    type="text"
    placeholder="#0e0e10"
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value || undefined)}
    className="input-field flex-1 min-w-0 text-xs font-mono"
  />
  {value && (
    <button
      onClick={() => onChange(undefined)}
      className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors whitespace-nowrap"
    >
      Reset Background
    </button>
  )}
</div>
```

**Control group wrapper** (hero-settings.tsx lines 68–70):

```typescript
// Wrap in the standard control group:
<div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
  <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
    Section Background
  </h3>
  {/* color picker + hex input + reset */}
</div>
```

**Integration into settings panel** — each section settings component (`HeroSettings`, and future ones) adds this block at the bottom via `onUpdate`:

```typescript
// In HeroSettings.updateHero equivalent:
const updateBg = (backgroundColor: string | undefined) => {
	onUpdate({
		settings: {
			...section.settings,
			backgroundColor, // top-level in section.settings, not nested
		},
	});
};
```

---

## Shared Patterns

### CSS Variable Injection (Server-Side, FOUC-free)

**Source:** `src/app/globals.css` lines 3–22 (`:root` block) + RESEARCH.md Pattern 1
**Apply to:** `src/app/[subdomain]/layout.tsx`, `src/app/[subdomain]/preview-client.tsx`

All public site theme values are injected as inline `style` props on the `.site-root` wrapper. The pattern is the same as the existing `globals.css` `:root` block, but scoped to the element instead of `:root`. All public-site CSS vars MUST use the `--site-` prefix to avoid collision with dashboard vars (`--accent`, `--background`, etc.).

```typescript
// Pattern: inline style prop with typed React.CSSProperties cast
const cssVars: React.CSSProperties = {
	'--site-accent': '#06b6d4',
	'--site-bg': '#0e0e10',
	'--site-card': '#1a1a1f',
	'--site-text': '#f4f4f5',
	'--site-text-muted': '#a1a1aa',
	'--site-font-display': 'var(--font-rajdhani), sans-serif',
} as React.CSSProperties;
// Applied as: style={cssVars}
```

### Color Picker Pattern

**Source:** `src/components/sections/settings/hero-settings.tsx` lines 89–111
**Apply to:** `SectionBgOverride`, any future settings panel needing a color control

The `.color-picker` CSS class (defined in `globals.css` lines 139–155) + invisible `<input type="color">` overlay + `.input-field` hex text input. The `absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2` class combination is the established way to make a color input fill its parent circle container.

### Settings Control Group

**Source:** `src/components/sections/settings/hero-settings.tsx` lines 68–70
**Apply to:** `AppearanceTab` (Color section, Font section), `SectionBgOverride`

```typescript
<div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
  <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
    {sectionTitle}
  </h3>
  {/* controls */}
</div>
```

### Settings Label

**Source:** `src/app/globals.css` lines 158–166
**Apply to:** All settings controls in `AppearanceTab`, `SectionBgOverride`

```css
.settings-label {
	font-size: 0.6875rem; /* 11px */
	font-weight: 500;
	color: #71717a;
	text-transform: uppercase;
	letter-spacing: 0.05em;
}
/* Usage: <label className="settings-label">Color</label> */
```

### Framer Motion Interaction Pattern

**Source:** `src/components/sections/settings/hero-settings.tsx` + `src/components/layout/header.tsx`
**Apply to:** `ColorSwatchPicker`, `FontPicker`, `AppearanceTab` save button

```typescript
// Standard button interaction:
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
// For save button with lift:
whileHover={{ scale: 1.02, y: -1 }}
whileTap={{ scale: 0.98 }}
```

### Toggle Button Group (Option Selection)

**Source:** `src/components/sections/settings/hero-settings.tsx` lines 43–65 (alignment) and 72–87 (background type)
**Apply to:** Any multi-option selector in editor controls (used as base pattern for FontPicker rows)

```typescript
// Active: border-cyan-300 bg-cyan-50 text-cyan-600
// Inactive: border-zinc-200 bg-white hover:border-zinc-300 text-zinc-400/500
className={`p-2 rounded-lg border transition-all text-xs ${
  isActive ? "border-cyan-300 bg-cyan-50 text-cyan-600"
           : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-500"
}`}
```

### DB Fetch in Server Component

**Source:** `src/app/[subdomain]/page.tsx` lines 1–2, 14–23
**Apply to:** `src/app/[subdomain]/layout.tsx`

```typescript
import { db } from '@/lib/db';

// Pattern:
const server = await db.server.findUnique({
	where: { subdomain },
	select: { theme: true }, // select only needed fields
});
```

### Named Component Export

**Source:** `src/components/sections/render/hero-render.tsx` line 12, `src/components/sections/settings/hero-settings.tsx` line 13
**Apply to:** All new components in `src/components/editor/` and `src/components/site/`

```typescript
// Named export for components; default export only for Next.js pages/layouts
export function SiteNav(...) { ... }
export function AppearanceTab(...) { ... }
export function ColorSwatchPicker(...) { ... }
export function FontPicker(...) { ... }
```

---

## No Analog Found

| File                                                 | Role   | Data Flow | Reason                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------- | ------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/[subdomain]/layout.tsx` (font declarations) | config | —         | No existing file in this project uses `next/font/google` with `variable` option. The marketing/dashboard layouts use Inter/Jakarta but without the `variable` option pattern. The font declaration pattern must follow the RESEARCH.md Pattern 2 code example directly. |

---

## Metadata

**Analog search scope:** `src/components/`, `src/app/`, `src/lib/`, `src/types/`, `src/app/globals.css`
**Files scanned:** 23
**Pattern extraction date:** 2026-05-07
