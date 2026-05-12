# Phase 1: Foundation & Extraction - Pattern Map

**Mapped:** 2026-05-07
**Files analyzed:** 9
**Analogs found:** 9 / 9

---

## File Classification

| New/Modified File                                    | Role      | Data Flow        | Closest Analog                                                                            | Match Quality |
| ---------------------------------------------------- | --------- | ---------------- | ----------------------------------------------------------------------------------------- | ------------- |
| `src/types/sections.ts`                              | types     | transform        | `src/components/preview/types.ts`                                                         | role-match    |
| `src/types/site-theme.ts`                            | types     | transform        | `src/types/next-auth.d.ts`                                                                | role-match    |
| `src/lib/plan.ts`                                    | utility   | transform        | `src/lib/validations/server.ts`                                                           | role-match    |
| `src/lib/section-registry.ts`                        | config    | request-response | `src/components/ui/index.ts` (registry shape) + `src/lib/auth.ts` (named-export lib)      | partial-match |
| `src/components/sections/render/hero-render.tsx`     | component | request-response | `src/app/[subdomain]/preview-client.tsx` `PreviewHero` (lines 109-233)                    | exact         |
| `src/components/sections/settings/hero-settings.tsx` | component | request-response | `src/app/(dashboard)/dashboard/[serverId]/page.tsx` Hero settings block (lines 2676-2883) | exact         |
| `src/components/sections/index.ts`                   | config    | transform        | `src/components/layout/index.ts`                                                          | exact         |
| `src/app/(dashboard)/dashboard/[serverId]/page.tsx`  | component | CRUD             | itself — mock-removal surgery; real-API pattern is lines 4315-4371                        | exact         |
| `src/app/[subdomain]/preview-client.tsx`             | component | request-response | itself — switch-to-registry replacement at lines 914-944                                  | exact         |

---

## Pattern Assignments

### `src/types/sections.ts` (types, transform)

**Analog:** `src/components/preview/types.ts`

**File header pattern** (preview/types.ts lines 1-2):

```typescript
// Shared types for preview components
```

**Core type definition pattern** — named interfaces with `export`, no default export (preview/types.ts lines 3-41):

```typescript
export interface ServerData { ... }
export interface Section { ... }
export interface FeatureItem { ... }
export interface GalleryImage { ... }
```

**Extraction targets from `src/app/(dashboard)/dashboard/[serverId]/page.tsx`:**

| Type                       | Source lines | Notes                                             |
| -------------------------- | ------------ | ------------------------------------------------- |
| `type HeroSettings`        | 70–85        | Convert `type` → `interface`; keep all fields     |
| `type GamemodesSettings`   | 87–104       | Convert to `interface`                            |
| `type FeaturesSettings`    | 106–117      | Convert to `interface`                            |
| `type DiscordSettings`     | 121–140      | Convert to `interface`; omit `StatsServer` re-def |
| `type GallerySettings`     | 157–170      | Convert to `interface`                            |
| `type StatsSettings`       | 172–189      | Convert to `interface`                            |
| `type StaffMemberSettings` | 191–195      | New sub-interface                                 |
| `type StaffSettings`       | 197–210      | Convert to `interface`                            |
| `type TextSettings`        | 212–223      | Convert to `interface`                            |
| `type SectionSettings`     | 236–255      | Convert to `interface`                            |

**SectionType union to add** (not currently in god-component as a standalone type — derive from `sectionTypeConfig` keys, god-component line 660–684):

```typescript
export type SectionType =
	| 'hero'
	| 'stats'
	| 'features'
	| 'gamemodes'
	| 'discord'
	| 'gallery'
	| 'staff'
	| 'text'
	| 'rules'
	| 'voting'
	| 'store'
	| 'reviews'
	| 'faq'
	| 'video';
```

**Shared prop interfaces** (to live here, NOT in section-registry.tsx, per pitfall 2):

```typescript
import type { Section, ServerData } from '@/components/preview/types';

export interface SectionRenderProps {
	section: Section;
	serverData: ServerData;
}

export interface SectionSettingsProps {
	section: Section;
	onUpdate: (updates: Partial<Section>) => void;
}
```

**Anti-pattern:** Do NOT import from `@/components/preview/types` for settings interfaces (`HeroSettings`, etc.). Only `Section` and `ServerData` come from there. Settings interfaces are defined here.

---

### `src/types/site-theme.ts` (types, transform)

**Analog:** `src/types/next-auth.d.ts`

**File pattern** (next-auth.d.ts lines 1-9) — single-purpose type file with no internal imports:

```typescript
// No imports from within the project
export interface SiteTheme {
	// Stub — fully defined in Phase 2
	primaryColor?: string;
	accentColor?: string;
	backgroundColor?: string;
	textColor?: string;
	fontFamily?: string;
}
```

**Rule:** All fields optional (`?`). This is a Phase 1 stub only. Do not add Phase 2 fields speculatively.

---

### `src/lib/plan.ts` (utility, transform)

**Analog:** `src/lib/validations/server.ts`

**File structure pattern** (validations/server.ts lines 1-21):

- Named exports only (no default export)
- Export interface before export function
- No framework-specific imports (no React, no Next.js)

```typescript
// src/lib/validations/server.ts pattern:
export const createServerSchema = z.object({ ... });
export type CreateServerInput = z.infer<typeof createServerSchema>;
```

**Apply pattern as** (src/lib/plan.ts):

```typescript
export interface PlanLimits {
	maxSections: number;
}

export function getPlanLimits(plan: 'free' | 'paid'): PlanLimits {
	switch (plan) {
		case 'paid':
			return { maxSections: 15 };
		case 'free':
		default:
			return { maxSections: 5 };
	}
}
```

---

### `src/lib/section-registry.ts` (config, request-response)

**Note:** Must be `.tsx` extension, not `.ts` — the `icon` field stores JSX (`<Layout className="w-4 h-4" />`). Name the file `section-registry.tsx`.

**Analog for named-export lib pattern:** `src/lib/auth.ts` (lines 1-38)

- Named exports: `export const { ... } = ...`
- Import aliases used: `import { ... } from '@/...'`

**Analog for Record registry shape:** `src/components/ui/index.ts` — a flat object of named exports per slot.

**Import pattern** (modeled on god-component's imports, lines 1-54, adapted):

```typescript
import { Layout } from 'lucide-react';

import type { ComponentType, ReactNode } from 'react';

import { HeroRender } from '@/components/sections/render/hero-render';
import { HeroSettings } from '@/components/sections/settings/hero-settings';
import type {
	SectionRenderProps,
	SectionSettings,
	SectionSettingsProps,
	SectionType,
} from '@/types/sections';
```

**Registry entry interface and constant:**

```typescript
export interface RegistryEntry {
  type: SectionType;
  render: ComponentType<SectionRenderProps>;
  settings: ComponentType<SectionSettingsProps>;
  defaultSettings: () => SectionSettings;
  displayName: string;
  icon: ReactNode;
  maxCount?: number;
}

export const SECTION_REGISTRY: Record<SectionType, RegistryEntry> = {
  hero: {
    type: 'hero',
    render: HeroRender,
    settings: HeroSettings,
    defaultSettings: () => ({ hero: { alignment: 'center', backgroundType: 'gradient', ... } }),
    displayName: 'Hero Section',
    icon: <Layout className="w-4 h-4" />,
  },
  // All other types: stub entries
};
```

**Stub entry pattern for non-extracted types:**

```typescript
function PlaceholderRender({ section }: SectionRenderProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-2xl font-bold mb-2">{section.title || section.type}</h2>
      </div>
    </section>
  );
}

function PlaceholderSettings(_props: SectionSettingsProps) {
  return null;
}
```

**Circular import rule:** `hero-render.tsx` and `hero-settings.tsx` must NEVER import from `section-registry.tsx`. Safe import chain:

```
src/types/sections.ts          ← no internal imports
src/components/preview/types.ts ← no internal imports
hero-render.tsx                 ← imports from types/sections + preview/types
hero-settings.tsx               ← imports from types/sections + preview/types
section-registry.tsx            ← imports hero-render, hero-settings, types/sections
```

---

### `src/components/sections/render/hero-render.tsx` (component, request-response)

**Analog:** `src/app/[subdomain]/preview-client.tsx` `PreviewHero` function (lines 109–233)

**This is the extraction target** — NOT `src/components/sections/hero-section.tsx` (wrong props shape).

**"use client" directive** — required (preview-client.tsx line 1):

```typescript
'use client';
```

**Import pattern** (preview-client.tsx lines 3-19 adapted):

```typescript
'use client';

import type { HeroSettings, SectionRenderProps } from '@/types/sections';
```

**Prop type** — named export component accepting `SectionRenderProps` (preview-client.tsx line 109):

```typescript
export function HeroRender({ section, serverData }: SectionRenderProps) { ... }
```

**Core render pattern** — destructure from `section.settings.hero` with defaults (preview-client.tsx lines 110-126):

```typescript
const hero = (section.settings.hero as HeroSettings) || {};
const {
	alignment = 'center',
	backgroundType = 'gradient',
	backgroundColor = '#ffffff',
	gradientFrom = '#f0f9ff',
	gradientTo = '#ecfdf5',
	backgroundImage = '',
	imageBlur = 0,
	imageDarken = 40,
	playerBadge = 'top',
	badgeStyle = 'pill',
	showDiscordButton = true,
	discordButtonText = 'Join Discord',
	showCopyIpButton = true,
	copyIpButtonText = 'Copy IP',
} = hero;
```

**Player count pattern** — use `serverData.players` prop, NOT `mockServer.players` or `mockData.players` (pitfall 4 in RESEARCH.md). Replace all occurrences of `mockData.players` with `serverData.players ?? 0`.

**Background style helper pattern** (preview-client.tsx lines 132-136):

```typescript
const getBackgroundStyle = () => {
	if (backgroundType === 'solid') return { backgroundColor: backgroundColor as string };
	if (backgroundType === 'gradient')
		return { background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` };
	return {};
};
```

**PlayerBadge inner component pattern** (preview-client.tsx lines 138-177) — define inside the render function body, uses closure over `isDark`, `badgeStyle`, `serverData.players`.

**Return JSX structure** (preview-client.tsx lines 179-233) — `<div className="relative overflow-hidden" style={getBackgroundStyle()}>` wrapping background layers, content div, and badge/button elements.

---

### `src/components/sections/settings/hero-settings.tsx` (component, request-response)

**Analog:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` Hero settings block (lines 2676–2883)

**"use client" directive** — required (god-component line 1).

**Import pattern:**

```typescript
'use client';

import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';

import type { SectionSettingsProps } from '@/types/sections';
```

**Prop type** — named export component accepting `SectionSettingsProps` (modeled on SettingsPanel signature, god-component lines 2650-2656):

```typescript
export function HeroSettings({ section, onUpdate }: SectionSettingsProps) { ... }
```

**Settings update pattern** — nested spread with `section.settings.hero` sub-object (god-component lines 2702-2707):

```typescript
onUpdate({
	settings: {
		...section.settings,
		hero: { ...section.settings.hero, alignment: value as 'left' | 'center' | 'right' },
	},
});
```

**CSS classes pattern** — the god-component uses custom Tailwind CSS class names `settings-label` and `input-field` (god-component lines 2665, 2667). These are project globals defined in the app's CSS. Use these class names directly.

**Toggle button pattern** (god-component lines 2816-2830) — `w-8 h-5 rounded-full` toggle with inner `w-4 h-4 rounded-full bg-white shadow` dot, state-driven `translate-x-3.5` / `translate-x-0.5`.

**Section grouping pattern** (god-component lines 2751-2808) — wrap related controls in `<div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">` with `<h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Group Name</h3>`.

**BackgroundSettingsPanel dependency** — the Hero settings block (god-component line 2721) calls `<BackgroundSettingsPanel ... />` which is defined in `page.tsx` and stays there. For Phase 1, import it from `page.tsx` is not feasible. The planner must decide whether to:

1. Inline the background controls into `hero-settings.tsx` (copies the BackgroundSettingsPanel JSX)
2. Extract `BackgroundSettingsPanel` to a shared utility component (out of Phase 1 scope per CONTEXT.md)

**Recommended for Phase 1:** Inline the background fields directly using the same JSX pattern visible at god-component lines 2720-2748, without the BackgroundSettingsPanel abstraction. This keeps hero-settings.tsx self-contained.

---

### `src/components/sections/index.ts` (config, transform)

**Analog:** `src/components/layout/index.ts` (exact match — same barrel export pattern)

**Pattern** (layout/index.ts lines 1-3):

```typescript
export { Header } from './header';
export { Footer } from './footer';
export { Sidebar, useSidebarStore } from './sidebar';
```

**Apply as** (sections/index.ts):

```typescript
export { HeroSection } from './hero-section'; // keep existing
export { HeroRender } from './render/hero-render';
export { HeroSettings } from './settings/hero-settings';
```

**Rule:** Named exports only. No default re-exports. Path format: `"./subdirectory/filename"` (no extension).

---

### `src/app/(dashboard)/dashboard/[serverId]/page.tsx` (component, CRUD) — MODIFY

**Changes:** Remove `mockServer` (lines 58-68) and `initialSections` (lines 554-740). Fix initial state. The real API load pattern already exists at lines 4315-4371 and is correct.

**Current broken initial state** (god-component lines 4296-4307):

```typescript
const [sections, setSectionsInternal] = useState<Section[]>(initialSections); // DELETE initialSections
const [selectedSection, setSelectedSection] = useState<string | null>('1'); // CHANGE to null
const [serverData, setServerData] = useState(mockServer); // CHANGE to null
```

**Target initial state:**

```typescript
const [sections, setSectionsInternal] = useState<Section[]>([]);
const [selectedSection, setSelectedSection] = useState<string | null>(null);
const [serverData, setServerData] = useState<{
	id: string;
	name: string;
	subdomain: string;
	description: string;
	serverIp: string;
	published: boolean;
	players: number;
	maxPlayers: number;
	version: string;
} | null>(null);
```

**Real load pattern** (god-component lines 4315-4371) — already correct; keep this, just remove the `initialSections` fallback from within it. The current code at line 4341 checks `if (data.sections && data.sections.length > 0)` — after removing `initialSections`, add an `else` that calls `setSectionsInternal([])` explicitly.

**Loading skeleton pattern** (god-component lines 4518-4526):

```typescript
if (isLoading) {
  return (
    <div className="-m-6 h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="text-zinc-500">Loading editor...</p>
      </div>
    </div>
  );
}
```

**Error state pattern** (god-component lines 4530-4543):

```typescript
if (loadError) {
  return (
    <div className="-m-6 h-[calc(100vh-64px)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <X className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-zinc-900 font-medium">Failed to load server</p>
        <p className="text-zinc-500 text-sm">{loadError}</p>
        <Link href="/dashboard" className="mt-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm hover:bg-zinc-800 transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
```

**Section ID generation** — find all `Date.now().toString()` usages; replace with `crypto.randomUUID()`. No import needed (browser/Node built-in).

**Hero wiring in SettingsPanel** (god-component lines 2676-2883) — replace the entire `{section.type === "hero" && (<> ... </>)}` block with:

```typescript
{section.type === 'hero' && (
  <HeroSettings section={section} onUpdate={onUpdate} />
)}
```

**Hero wiring in SectionPreview** — find `case "hero":` in the preview switch and replace with:

```typescript
case 'hero': {
  const Entry = SECTION_REGISTRY['hero'];
  return <Entry.render key={section.id} section={section} serverData={serverData} />;
}
```

---

### `src/app/[subdomain]/preview-client.tsx` (component, request-response) — MODIFY

**Analog:** itself — the switch-case at lines 914-944 and the local type definitions at lines 22-55.

**Change 1 — Remove local type duplicates** (lines 22-55). Replace with imports:

```typescript
import type {
	FeatureItem,
	GalleryImage,
	Section,
	ServerData,
	StatsServer,
} from '@/components/preview/types';
```

These types are identical to `preview/types.ts` exports — zero compatibility risk.

**Change 2 — Import registry:**

```typescript
import { SECTION_REGISTRY } from '@/lib/section-registry';
```

**Change 3 — Replace hero case in switch** (preview-client.tsx lines 918-919):

```typescript
// Before:
case "hero":
  return <PreviewHero key={section.id} section={section} serverData={server} />;

// After:
case "hero": {
  const Entry = SECTION_REGISTRY['hero'];
  return <Entry.render key={section.id} section={section} serverData={server} />;
}
```

**Change 4 — Remove local `PreviewHero` function** (lines 109-233). Once the registry case is wired, the local `PreviewHero` is dead code. Delete it.

**Change 5 — Remove `mockData` constant** (lines 58-62):

```typescript
// DELETE:
const mockData = {
	players: 247,
	maxPlayers: 500,
	version: '1.20.4',
};
```

Player count will come from `serverData.players` in the extracted `HeroRender` component.

---

## Shared Patterns

### "use client" Directive

**Source:** `src/app/[subdomain]/preview-client.tsx` line 1 and `src/app/(dashboard)/dashboard/[serverId]/page.tsx` line 1
**Apply to:** `hero-render.tsx`, `hero-settings.tsx`

```typescript
'use client';
```

Required for all components that use React state, event handlers, or browser APIs. The registry file (`section-registry.tsx`) also needs `"use client"` because it imports client components.

### Named Exports

**Source:** `src/components/layout/index.ts`, `src/components/ui/index.ts`, `src/lib/validations/server.ts`
**Apply to:** All new files except `page.tsx` (default export) and `preview-client.tsx` (default export)

```typescript
export function HeroRender(...) { ... }   // named export
export function HeroSettings(...) { ... } // named export
export const SECTION_REGISTRY = ...;      // named export
export interface RegistryEntry { ... }    // named export
```

### Path Alias

**Source:** All existing imports in the codebase (e.g., `'@/components/ui'`, `'@/lib/auth'`)
**Apply to:** All new files

```typescript
import { something } from '@/lib/something'; // NOT '../../../lib/something'
```

### Tailwind CSS Classes for Settings UI

**Source:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` throughout settings panels
**Apply to:** `hero-settings.tsx`

```typescript
className = 'settings-label'; // label elements
className = 'input-field mt-2'; // input elements
className = 'rounded-lg bg-zinc-50/50 p-3 space-y-3'; // settings group container
className = 'text-xs font-semibold text-zinc-700 uppercase tracking-wider'; // group heading
```

### Lucide Icon Imports

**Source:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` lines 7-54
**Apply to:** `section-registry.tsx`, `hero-settings.tsx`

```typescript
import { AlignCenter, AlignLeft, AlignRight, Layout } from 'lucide-react';
```

Use `className="w-4 h-4"` for inline icon sizing (established pattern throughout the codebase).

---

## No Analog Found

All files have analogs in this codebase. No entries required.

---

## Metadata

**Analog search scope:** `src/lib/`, `src/types/`, `src/components/`, `src/app/`
**Files scanned:** 20 source files
**Pattern extraction date:** 2026-05-07
