# Architecture Patterns

**Project:** MineSites — Minecraft-native section system
**Researched:** 2026-05-07
**Confidence:** HIGH — based on direct code inspection

---

## Recommended Architecture

The five problems this milestone solves each have a distinct home in the codebase. They
compose into a layered system that grows the existing App Router structure without
rewriting it.

```
src/
├── components/
│   ├── ui/                         # UNCHANGED — dashboard primitives
│   ├── layout/                     # UNCHANGED — sidebar, header, footer
│   ├── site/                       # NEW — server website design system (isolated)
│   │   ├── index.ts                # barrel
│   │   ├── theme-provider.tsx      # CSS variable injection from SiteTheme
│   │   ├── site-nav.tsx            # Gaming-styled navbar for public sites
│   │   ├── site-footer.tsx         # Gaming-styled footer for public sites
│   │   └── effects/                # NEW — paid-tier visual effects
│   │       ├── particles.tsx
│   │       ├── parallax-wrapper.tsx
│   │       └── animated-bg.tsx
│   ├── sections/                   # GROWS — section components split by concern
│   │   ├── index.ts
│   │   ├── render/                 # NEW — public-facing section renderers (one file each)
│   │   │   ├── hero-section.tsx
│   │   │   ├── player-count-section.tsx
│   │   │   ├── server-info-section.tsx
│   │   │   ├── gallery-section.tsx
│   │   │   ├── rules-section.tsx
│   │   │   ├── discord-widget-section.tsx
│   │   │   ├── features-section.tsx
│   │   │   ├── gamemodes-section.tsx
│   │   │   ├── staff-section.tsx
│   │   │   ├── text-section.tsx
│   │   │   └── [section-type]-section.tsx  # each new type gets its own file
│   │   └── settings/               # NEW — editor settings panels (one file each)
│   │       ├── hero-settings.tsx
│   │       ├── player-count-settings.tsx
│   │       ├── gallery-settings.tsx
│   │       └── [section-type]-settings.tsx
│   └── preview/
│       └── types.ts                # GROWS — single source of truth for all section types
├── lib/
│   └── validations/
│       └── sections/               # NEW — Zod schema per section settings type
│           ├── hero.ts
│           ├── player-count.ts
│           └── index.ts
├── app/
│   ├── [subdomain]/
│   │   ├── layout.tsx              # GROWS — injects SiteTheme CSS vars
│   │   ├── page.tsx                # GROWS — fetches theme + minecraft status
│   │   └── preview-client.tsx      # SHRINKS — thin dispatcher only
│   └── (dashboard)/dashboard/[serverId]/
│       └── page.tsx                # SHRINKS — imports settings panels instead of inlining
└── types/
    └── site-theme.ts               # NEW — SiteTheme type shared across app
```

---

## Component Boundaries

### Problem: Style Bleed from Dashboard into Public Sites

The root layout (`src/app/layout.tsx`) sets `bg-zinc-50 text-zinc-900` on `<body>` and
injects dashboard-targeted CSS variables (neutral background, card colors). Every public
server page inherits these. `globals.css` uses `@theme inline` to wire those variables
into Tailwind, so dashboard tokens bleed everywhere.

**Solution: CSS variable override in `[subdomain]/layout.tsx`**

The subdomain layout is currently a pass-through (`return <>{children}</>`). It should
inject a `<div>` (or a `<style>` tag via the theme provider) that reasserts site-specific
CSS variables over the root ones, scoped to that subtree.

```tsx
// src/app/[subdomain]/layout.tsx
import { SiteThemeProvider } from '@/components/site/theme-provider';

export default function SubdomainLayout({
	children,
	theme,
}: {
	children: React.ReactNode;
	theme: SiteTheme;
}) {
	return (
		<SiteThemeProvider theme={theme}>
			<div className="site-root min-h-screen">{children}</div>
		</SiteThemeProvider>
	);
}
```

`SiteThemeProvider` renders a `<style>` tag that sets CSS variables on `.site-root`:

```css
.site-root {
	--site-primary: #2563eb; /* from SiteTheme.primaryColor */
	--site-accent: #06b6d4; /* from SiteTheme.accentColor */
	--site-bg: #0f172a; /* from SiteTheme.backgroundColor */
	--site-text: #f1f5f9; /* from SiteTheme.textColor */
	--site-font: 'Rajdhani', sans-serif; /* from SiteTheme.fontFamily */
}
```

Section components inside `.site-root` use `var(--site-primary)` and `var(--site-bg)`
instead of Tailwind's global tokens. Dashboard components never use `--site-*` variables,
so there is zero bleed in either direction.

**What NOT to do:** Do not try to scope styles via a CSS module or a second Tailwind
config. The CSS variable override approach works with the existing Tailwind v4 setup,
requires no new tooling, and is predictable to debug.

### Component Boundary Table

| Component                           | Allowed to import from                                                              | Must NOT import from                           |
| ----------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------- |
| `src/components/site/`              | `src/components/preview/types.ts`, `src/lib/`                                       | `src/components/ui/`, `src/components/layout/` |
| `src/components/sections/render/`   | `src/components/site/`, `src/components/preview/types.ts`                           | `src/components/ui/` (dashboard primitives)    |
| `src/components/sections/settings/` | `src/components/ui/`, `src/components/preview/types.ts`                             | `src/components/site/`                         |
| `src/app/[subdomain]/`              | `src/components/site/`, `src/components/sections/render/`                           | `src/components/ui/`, `src/components/layout/` |
| `src/app/(dashboard)/`              | `src/components/ui/`, `src/components/layout/`, `src/components/sections/settings/` | `src/components/site/`                         |

This boundary is enforced by convention (and optionally an ESLint import rule) — not
tooling. It is simple enough for a solo developer to maintain.

---

## Data Model Changes

### Theme System

`Server.theme` already exists in the schema as `Json?`. It is passed through the PUT
route today but never read on the public render path — `page.tsx` does not extract it and
`PreviewClient` has no theme prop.

**No schema migration is needed.** The `theme` column already exists. What is needed:

1. Define a `SiteTheme` TypeScript type in `src/types/site-theme.ts`:

```typescript
export interface SiteTheme {
	primaryColor: string; // hex, e.g. "#2563eb"
	accentColor: string; // hex, e.g. "#06b6d4"
	backgroundColor: string; // hex, e.g. "#0f172a"
	surfaceColor: string; // hex, e.g. "#1e293b" (cards/panels on the site)
	textColor: string; // hex, e.g. "#f1f5f9"
	fontFamily: 'inter' | 'rajdhani' | 'exo2' | 'orbitron' | 'press-start';
}

export const defaultSiteTheme: SiteTheme = {
	primaryColor: '#2563eb',
	accentColor: '#06b6d4',
	backgroundColor: '#0f172a',
	surfaceColor: '#1e293b',
	textColor: '#f1f5f9',
	fontFamily: 'inter',
};
```

2. In `src/app/[subdomain]/page.tsx`, extract `server.theme` and pass it to a theme
   provider (not to `PreviewClient` directly — the layout should own it):

```typescript
const theme = (server.theme || {}) as Partial<SiteTheme>;
const resolvedTheme = { ...defaultSiteTheme, ...theme };
```

3. Pass `resolvedTheme` to `SubdomainLayout`. Because layout and page are both Server
   Components in the same route segment, the cleanest way is to put the theme injection
   into `page.tsx` itself and have the `<div className="site-root">` wrapper sit at the
   page level with an inline `<SiteThemeProvider>`.

### Freemium Gating

No schema migration is needed for v1. The `User` model has no `plan` field, but the
enforcement logic for section count gating is simple enough to add as a constant check:

**Free tier cap (5 sections):** Enforced in TWO places:

- **Editor (client-side):** The "Add Section" button is disabled / shows an upgrade prompt
  when `sections.length >= FREE_TIER_MAX_SECTIONS`. This is UX feedback only.
- **API (server-side):** The PUT handler in `src/app/api/servers/[serverId]/route.ts`
  checks `sections.length` against the limit before writing. This is the authoritative
  enforcement.

```typescript
// src/lib/plan.ts  (new file)
export const FREE_TIER_MAX_SECTIONS = 5;
export const FREE_TIER_EFFECTS_ENABLED = false;

export function isWithinFreeLimit(sectionCount: number): boolean {
	return sectionCount <= FREE_TIER_MAX_SECTIONS;
}
```

When a proper `User.plan` field is needed (for a future billing phase), the Prisma
migration adds one column and this file is the only place to update enforcement logic.

**Visual effects gating:** The `SiteTheme` object can carry an `effectsEnabled: boolean`
flag. On the public render path, `SiteThemeProvider` reads this and conditionally mounts
the effects layer. The editor sets this from the server's plan; the PUT route strips
`effectsEnabled: true` if the user is on the free tier (same constant from `plan.ts`).

### Section Types — No New DB Columns Needed

New section types (live player count, server info, rules, Discord widget, etc.) are added
by:

1. Defining the settings interface in `src/components/preview/types.ts`
2. Adding a Zod schema in `src/lib/validations/sections/[type].ts`
3. Adding a renderer in `src/components/sections/render/[type]-section.tsx`
4. Adding a settings panel in `src/components/sections/settings/[type]-settings.tsx`
5. Registering the type in a central registry (see god-component section below)

The `Section.settings Json` column absorbs any shape — no migration per new type. The
Zod schema validates on write to catch bad data before it reaches the DB.

### Live Player Count — Caching Architecture

Player count must be fetched server-side and cached. Never block page render for it.

**Pattern:** Parallel data fetch with `Promise.allSettled` in `page.tsx`:

```typescript
// src/app/[subdomain]/page.tsx
const [serverRecord, minecraftStatus] = await Promise.allSettled([
	db.server.findUnique({ where: { subdomain }, include: { sections: true } }),
	server?.serverIp ? fetchMinecraftStatus(server.serverIp) : Promise.resolve(null),
]);
```

`fetchMinecraftStatus` lives in `src/lib/minecraft-status.ts` and calls
`api.mcsrvstat.us/v3/{ip}`. The response is cached via Next.js `fetch` cache or an
explicit `unstable_cache` wrapper with a 60-second TTL. If the fetch fails or times out
(use `AbortSignal.timeout(3000)`), the section renders with "status unavailable" rather
than failing.

The live player count is passed as a prop to `PreviewClient` (not fetched client-side).
This keeps the public page fast and avoids a client-side waterfall.

---

## How to Avoid Growing the God-Component

The editor god-component (`src/app/(dashboard)/dashboard/[serverId]/page.tsx`, 5,171
lines) has two kinds of content:

**Kind 1 — Section settings panels:** Each `section.type === "hero"` block, the
`section.type === "gallery"` block, etc. These are large JSX trees that configure
section-specific settings. They have no dependency on each other. Each one should become
a component in `src/components/sections/settings/`.

**Kind 2 — In-editor section previews:** `PreviewHero`, `PreviewStats`, etc. defined
inside the god-component. These are duplicates of (or diverged from) the public renderers
in `preview-client.tsx`. They should be replaced by the shared renderers from
`src/components/sections/render/` — the editor preview and the public page use the
same component.

**Extraction pattern for settings panels:**

```typescript
// src/components/sections/settings/hero-settings.tsx
interface HeroSettingsPanelProps {
	settings: HeroSettings;
	onChange: (updated: HeroSettings) => void;
}

export function HeroSettingsPanel({ settings, onChange }: HeroSettingsPanelProps) {
	// all the JSX that was inside `section.type === "hero"` in the god-component
}
```

The god-component becomes:

```typescript
// src/app/(dashboard)/dashboard/[serverId]/page.tsx (simplified)
import { HeroSettingsPanel } from "@/components/sections/settings/hero-settings";
import { PlayerCountSettingsPanel } from "@/components/sections/settings/player-count-settings";
// ...

function SectionSettingsPanel({ section, onChange }: ...) {
  switch (section.type) {
    case "hero": return <HeroSettingsPanel settings={...} onChange={...} />;
    case "player-count": return <PlayerCountSettingsPanel settings={...} onChange={...} />;
    // one line per section type — the panel components own all the UI
  }
}
```

**Central section type registry (prevents further god-component growth):**

Every new section type requires the same four things (renderer, settings panel, default
settings, display metadata). Centralise this so adding a type is adding one entry, not
editing five files:

```typescript
// src/lib/section-registry.ts
import type { ComponentType } from 'react';

import type { Section } from '@/components/preview/types';

export interface SectionTypeEntry {
	type: string;
	label: string;
	description: string;
	icon: string; // lucide icon name
	category: 'essential' | 'engagement' | 'info' | 'media';
	defaultSettings: Record<string, unknown>;
	defaultTitle: string;
	paidOnly: boolean; // effects-gated or count-gated
	SettingsPanel: ComponentType<{
		settings: Record<string, unknown>;
		onChange: (s: Record<string, unknown>) => void;
	}>;
	Renderer: ComponentType<{ section: Section; theme: SiteTheme; serverStatus?: MinecraftStatus }>;
}

export const SECTION_REGISTRY: SectionTypeEntry[] = [
	{
		type: 'hero',
		label: 'Hero',
		// ...
	},
	// one entry per section type
];

export const SECTION_REGISTRY_MAP = Object.fromEntries(SECTION_REGISTRY.map((e) => [e.type, e]));
```

The god-component imports `SECTION_REGISTRY` for: the "Add Section" picker, the settings
panel switch, the in-editor preview switch, and the section type icon in the sidebar.
Adding a new section type = adding one object to the array.

---

## Suggested Build Order

Dependencies flow downward. Each step unblocks the next.

### Step 1 — Shared foundation (unblocks everything else)

- Create `src/types/site-theme.ts` with `SiteTheme` interface and `defaultSiteTheme`
- Consolidate all section type definitions into `src/components/preview/types.ts`
  (delete the duplicated local types in both `preview-client.tsx` and the god-component)
- Create `src/lib/plan.ts` with `FREE_TIER_MAX_SECTIONS` and `isWithinFreeLimit`

Nothing breaks — this is additive. The existing code still works.

### Step 2 — Extract section renderers into `src/components/sections/render/`

Move each `Preview*` function out of `preview-client.tsx` into its own file. Import it
back in `preview-client.tsx`. Public site rendering is unchanged; the file is smaller.

Do this for existing types BEFORE adding new ones — otherwise new types get inlined again.

### Step 3 — Extract settings panels into `src/components/sections/settings/`

Move each `section.type === "..."` settings block out of the god-component into its own
file. Wire the `SectionSettingsPanel` switch to import them.

Do this for existing panels BEFORE adding new section types — same reason as Step 2.

### Step 4 — Theme system (visual isolation)

- Implement `SiteThemeProvider` in `src/components/site/theme-provider.tsx`
- Update `src/app/[subdomain]/page.tsx` to extract `server.theme` and pass it
- Update `src/app/[subdomain]/layout.tsx` to wrap in `SiteThemeProvider`
- Update section renderers to use `var(--site-primary)` etc. instead of hardcoded colors

This is the step where the public site starts looking visually distinct from the
dashboard. It does not require any settings panel changes.

### Step 5 — New section types

With the registry, renderer directory, and settings panel directory all in place, each
new section type is:

1. `src/components/sections/render/[type]-section.tsx` — the renderer
2. `src/components/sections/settings/[type]-settings.tsx` — the settings panel
3. One entry added to `SECTION_REGISTRY` in `src/lib/section-registry.ts`
4. The public dispatch in `preview-client.tsx` is auto-resolved by the registry

Build order within this step:

- `server-info` (static, no external calls) — simplest, validates the pattern
- `rules` (static content list) — second simplest
- `discord-widget` (one external API call) — tests external fetch pattern
- `player-count` (Minecraft status API + caching) — most complex, build last

### Step 6 — Freemium enforcement

- Add section count check to the PUT handler in `src/app/api/servers/[serverId]/route.ts`
- Add "Add Section" button gating in the editor
- Add effects flag to `SiteTheme`; effects components conditionally mount

This step is fast because the enforcement logic in `src/lib/plan.ts` was defined in
Step 1.

### Step 7 — Visual effects layer (paid tier)

- Build `src/components/site/effects/` components (particles, parallax, animated
  backgrounds) as wrappers that accept `children`
- `SiteThemeProvider` conditionally renders the effects wrapper based on `effectsEnabled`
- Effects components use CSS animations and `framer-motion` — no new dependencies

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Adding new section types directly to `preview-client.tsx`

**What:** Adding another `function PreviewXxx` inline in the 947-line `preview-client.tsx`
**Why bad:** The file already duplicates all section types from the god-component. It is
already a second god-component. Adding to it makes future extraction harder and keeps
the two files in sync manually.
**Instead:** The renderer goes in `src/components/sections/render/`. The dispatch in
`preview-client.tsx` becomes a one-liner import from the registry.

### Anti-Pattern 2: Adding new section type settings directly to the god-component

**What:** Adding another `{section.type === "new-thing" && <div>...1000 lines...</div>}`
block to the 5,171-line editor page
**Why bad:** The god-component grows and the section type logic stays unextractable
**Instead:** Every new type gets its own settings panel file first.

### Anti-Pattern 3: Applying gaming theme styles via global CSS

**What:** Adding `.gaming-hero { ... }` classes to `globals.css`
**Why bad:** `globals.css` already bleeds dashboard tokens everywhere (the current
problem). Adding gaming-site styles to the same file creates the opposite bleed —
gaming tokens on dashboard pages.
**Instead:** All site-specific styles live inside `.site-root` scope, injected by
`SiteThemeProvider`.

### Anti-Pattern 4: Fetching Minecraft status client-side

**What:** A `useEffect` in a section component that calls `api.mcsrvstat.us` from
the browser
**Why bad:** Exposes the external API call to the public; blocks first paint; no caching
means every page view hits the external API; CORS may be an issue.
**Instead:** Fetch server-side in `page.tsx` with `unstable_cache` (60s TTL). Pass the
result as a prop. If the fetch fails, the component renders gracefully without it.

### Anti-Pattern 5: Per-section font loading

**What:** Each section component imports its own gaming font
**Why bad:** Multiple `@font-face` declarations, large font payloads, layout shift
**Instead:** Font families available in the theme system are declared once in the
`SiteThemeProvider` and loaded via Next.js `next/font/google` at the `[subdomain]`
layout level, not inside section components. The `fontFamily` value in `SiteTheme` maps
to a CSS class that Next.js generates.

---

## Scalability Considerations

| Concern                   | At 7 section types (now)           | At 20+ section types (later)               |
| ------------------------- | ---------------------------------- | ------------------------------------------ |
| Adding a new section type | Extract 2 files + 1 registry entry | Same — registry pattern scales linearly    |
| Editor page size          | Import-only, no inline JSX         | Same — god-component stays thin            |
| Public renderer size      | One import per type                | Same — dispatch is generated from registry |
| Theme changes             | One `SiteThemeProvider` update     | Same                                       |
| New plan tiers            | Update `src/lib/plan.ts`           | One constant per limit                     |

---

## Sources

- Direct code inspection: `/home/senne/git/minesites/src/app/(dashboard)/dashboard/[serverId]/page.tsx` (5171 lines)
- Direct code inspection: `/home/senne/git/minesites/src/app/[subdomain]/preview-client.tsx` (947 lines)
- Direct code inspection: `/home/senne/git/minesites/prisma/schema.prisma`
- Direct code inspection: `/home/senne/git/minesites/src/app/layout.tsx` and `globals.css`
- Codebase concern audit: `.planning/codebase/CONCERNS.md`
- Architecture map: `.planning/codebase/ARCHITECTURE.md`
