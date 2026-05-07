# Phase 1: Foundation & Extraction - Research

**Researched:** 2026-05-07
**Domain:** TypeScript registry pattern, React component extraction, Next.js App Router client components
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Registry entry shape is rich from day one: `{ type: SectionType, render: ComponentType<SectionRenderProps>, settings: ComponentType<SectionSettingsProps>, defaultSettings(): SectionSettings, displayName: string, icon: ReactNode, maxCount?: number }`. Every field is required except `maxCount`.
- **D-02:** Registry is a plain typed object — `const SECTION_REGISTRY: Record<SectionType, RegistryEntry>`. No Map, no class. Zero runtime cost, fully type-inferred.
- **D-03:** `maxCount` enforced by editor add-section logic in Phase 3. Phase 1 just defines the field.
- **D-04:** Hero section only is extracted in Phase 1.
- **D-05:** Remove `mockServer` and `initialSections` from `page.tsx`. Wire real `fetch('/api/servers/[serverId]')` on mount. Use `null` as initial state with a skeleton loader.
- **D-06:** New file `src/types/sections.ts` is the canonical home for all section settings types.
- **D-07:** Phase 1 defines all section type stubs in `sections.ts`, even for sections not yet extracted. Hero gets full definition; others are minimal stubs matching current inline shapes.
- **D-08:** `src/components/preview/types.ts` retains `ServerData`, `Section`, `FeatureItem`, `GalleryImage`. Settings types (`*Settings` interfaces) move to `src/types/sections.ts`.
- **D-09:** `getPlanLimits(plan: 'free' | 'paid'): PlanLimits` — call sites use `getPlanLimits(user.plan)`.
- **D-10:** Phase 1 stub return type: `{ maxSections: number }`. Free → 5, paid → 15.

### Claude's Discretion

None specified.

### Deferred Ideas (OUT OF SCOPE)

- Extracting any section type other than Hero
- Implementing new section types (Phase 3)
- Theme CSS variables or visual identity (Phase 2)
- Freemium enforcement logic (Phase 4)
- Visual effects (Phase 5)

</user_constraints>

---

## Summary

Phase 1 is a pure codebase restructure with no user-visible output. The deliverables are: a typed section registry, extracted Hero render and settings components, canonical type files, and the elimination of hard-coded mock data from the editor. No new UI is built; no database changes are needed.

The existing codebase has a clear god-component problem (`src/app/(dashboard)/dashboard/[serverId]/page.tsx`, 5171 lines). All section type definitions, preview renderers, settings panels, undo/redo logic, save/load logic, and mock data live in this single file. The public renderer (`src/app/[subdomain]/preview-client.tsx`, 947 lines) duplicates types and preview component logic independently. The partial Hero scaffold at `src/components/sections/hero-section.tsx` exists but uses a different props shape than either the god-component or preview-client, making it non-reusable as-is.

**Primary recommendation:** Extract in this sequence — types first (`src/types/sections.ts`), then registry shell (`src/lib/section-registry.ts`), then Hero render and settings components into `src/components/sections/render/hero-render.tsx` and `src/components/sections/settings/hero-settings.tsx`, then wire the registry into `preview-client.tsx` for the Hero case, then fix mock data. Never touch `page.tsx` in a way that grows its line count.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Section registry definition | Shared lib (`src/lib/`) | — | Pure data structure, no framework dependency; usable by both editor and public renderer |
| Hero render component | UI/Component | — | Presentational; should be a standalone React component imported where needed |
| Hero settings panel | UI/Component | — | Editor-only presentational component; belongs in `src/components/sections/settings/` |
| Section settings types | Shared types (`src/types/`) | — | Consumed by editor, public renderer, and registry — must be framework-agnostic |
| `SiteTheme` interface | Shared types (`src/types/`) | — | Stub for Phase 2; shared across CSS layer and API |
| `getPlanLimits()` | Shared lib (`src/lib/`) | — | Business logic stub; will be called by API and editor in later phases |
| Mock data removal / real API load | Frontend (editor page) | API layer | `fetch('/api/servers/[serverId]')` exists; editor page wires it on mount |
| Registry dispatch in `preview-client.tsx` | Frontend (public renderer) | — | Replace switch-case with registry lookup; keeps public renderer thin |

---

## Standard Stack

No new dependencies are introduced in Phase 1. The work uses only what is already installed.

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ^5 | All type definitions | Already in use; `strict: true` enforced |
| React 19 | 19.2.3 | Component extraction | Already in use |
| Next.js | 16.1.6 | App Router, dynamic imports | Already in use |
| lucide-react | ^0.563.0 | Icons for registry `icon` field | Already in use for all existing icons |

**No installation step needed for Phase 1.**

[VERIFIED: codebase grep of package.json and src/]

---

## Architecture Patterns

### System Architecture Diagram

```
Editor page (client component)
  useEffect on mount
    ↓ fetch GET /api/servers/[serverId]
  API route handler
    ↓ Prisma → PostgreSQL
  Response: { server, sections[] }
    ↓ setServerData() / setSections()
  Section editor UI
    ↓ selectedSection
  SettingsPanel({ section, onUpdate })
    ↓ import
  HeroSettings component ← src/components/sections/settings/hero-settings.tsx
    ↓ onUpdate callback
  sections state
    ↓ save / PUT /api/servers/[serverId]

Public renderer (preview-client.tsx)
  sections.map(section => {
    if (!section.visible) return null
    const Entry = SECTION_REGISTRY[section.type]  ← registry lookup
    return <Entry.render section={section} serverData={server} />
  })

SECTION_REGISTRY (src/lib/section-registry.ts)
  hero: {
    type: 'hero',
    render: HeroRender,       ← src/components/sections/render/hero-render.tsx
    settings: HeroSettings,   ← src/components/sections/settings/hero-settings.tsx
    defaultSettings: () => HeroSettings defaults,
    displayName: 'Hero Section',
    icon: <Layout />,
  }
  [other types]: stub entries (render: PlaceholderRender, settings: PlaceholderSettings)
```

### Recommended Project Structure After Phase 1

```
src/
├── types/
│   ├── next-auth.d.ts              (existing)
│   ├── sections.ts                 (NEW — all *Settings interfaces + SectionType union)
│   └── site-theme.ts               (NEW — SiteTheme interface stub)
├── lib/
│   ├── section-registry.ts         (NEW — SECTION_REGISTRY constant)
│   └── plan.ts                     (NEW — getPlanLimits())
├── components/
│   ├── sections/
│   │   ├── index.ts                (update to export from render/ and settings/)
│   │   ├── hero-section.tsx        (existing partial scaffold — superseded by render/hero-render.tsx)
│   │   ├── render/
│   │   │   └── hero-render.tsx     (NEW — extracted PreviewHero from god-component)
│   │   └── settings/
│   │       └── hero-settings.tsx   (NEW — extracted Hero settings panel from god-component)
│   └── preview/
│       └── types.ts                (existing — keep ServerData, Section, FeatureItem, GalleryImage here)
├── app/
│   ├── (dashboard)/dashboard/[serverId]/page.tsx   (shrink: remove mockServer, initialSections, PreviewHero, HeroSettings panel inlines)
│   └── [subdomain]/preview-client.tsx              (update Hero case to use SECTION_REGISTRY)
```

### Pattern 1: Plain Object Registry

**What:** A `Record<SectionType, RegistryEntry>` constant where each entry is a fully-typed object.

**When to use:** When you need O(1) lookup by section type with full TypeScript inference and zero runtime overhead. No factory functions, no class instances.

**Why not a Map or class:** `Record<K, V>` is statically analyzable by TypeScript — missing keys are caught at compile time. Maps require runtime initialization and lose static key exhaustiveness. Classes add unnecessary coupling.

**Example:**

```typescript
// Source: D-01, D-02 (CONTEXT.md locked decisions)
// src/lib/section-registry.ts
import type { ComponentType, ReactNode } from 'react';
import type { SectionSettings, SectionType } from '@/types/sections';
import type { Section, ServerData } from '@/components/preview/types';
import { HeroRender } from '@/components/sections/render/hero-render';
import { HeroSettings } from '@/components/sections/settings/hero-settings';
import { Layout } from 'lucide-react';

export interface SectionRenderProps {
  section: Section;
  serverData: ServerData;
}

export interface SectionSettingsProps {
  section: Section;
  onUpdate: (updates: Partial<Section>) => void;
}

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
    defaultSettings: () => ({ hero: { alignment: 'center', backgroundType: 'gradient', /* ... */ } }),
    displayName: 'Hero Section',
    icon: <Layout className="w-4 h-4" />,
  },
  // ... other types as stubs
};
```

### Pattern 2: Stub Registry Entry

**What:** For section types not yet extracted (Phase 3), use a placeholder render and settings component in the registry.

**Why:** The registry must be complete (`Record<SectionType, RegistryEntry>`) or TypeScript will error on missing keys. Stubs satisfy the type, let the switch-case in `preview-client.tsx` be removed immediately, and clearly signal "not yet implemented" at runtime.

**Example:**

```typescript
// Source: D-07 (CONTEXT.md locked decisions)
// Stub render — renders the existing inline Preview* logic delegated from god-component
// until Phase 3 extracts the real component
function PlaceholderRender({ section }: SectionRenderProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-2xl font-bold mb-2">{section.title || section.type}</h2>
      </div>
    </section>
  );
}
```

**Decision:** For Phase 1, only Hero needs real render/settings components. All other section types in the registry get placeholder implementations that are still valid `ComponentType<SectionRenderProps>` components. The preview-client.tsx switch-case for non-Hero types can continue to use inline Preview* functions until Phase 3 — OR the switch can be replaced entirely with the registry pattern where non-Hero types fall back to the existing inline functions re-exported as stubs. Both are valid; the cleanest approach for Phase 1 is to keep the switch-case for non-Hero types inside the stub components (import them from preview-client.tsx or inline them in the stub). [ASSUMED] The simplest correct approach: update only the Hero case in preview-client.tsx to use the registry; leave the other cases as-is in the switch for now.

### Pattern 3: API Load with Null Initial State

**What:** Replace `useState(mockServer)` / `useState(initialSections)` with `useState<ServerType | null>(null)` and show a skeleton while loading.

**Why:** Mock data in state means users always see "EpicCraft Network" while data loads, and any save with failed API load corrupts real data. [VERIFIED: CONCERNS.md HIGH severity item]

**Example:**

```typescript
// Source: D-05 (CONTEXT.md locked decisions)
// In page.tsx:
const [serverData, setServerData] = useState<ServerType | null>(null);
const [sections, setSections] = useState<Section[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const load = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}`);
      if (!res.ok) throw new Error('Failed to load server');
      const data = await res.json();
      setServerData({ id: data.id, name: data.name, subdomain: data.subdomain,
                      description: data.description || '', serverIp: data.serverIp || '',
                      published: data.published || false });
      if (data.navbar) setNavbarSettings(data.navbar);
      setSections(data.sections?.map(mapApiSectionToEditorSection) ?? []);
      setSelectedSection(data.sections?.[0]?.id ?? null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };
  load();
}, [serverId]);
```

### Pattern 4: Section ID Generation

**What:** Replace `Date.now().toString()` with `crypto.randomUUID()` when creating new sections in the editor.

**Why:** `crypto.randomUUID()` is available in all modern browsers and Node.js 19+. The project runs Node.js 25.9.0. [VERIFIED: STACK.md runtime, CONCERNS.md fix approach]

```typescript
// When adding a new section in the editor
const newSection: Section = {
  id: crypto.randomUUID(),
  type,
  title: config.defaultTitle ?? '',
  subtitle: '',
  visible: true,
  settings: SECTION_REGISTRY[type].defaultSettings(),
};
```

### Anti-Patterns to Avoid

- **Import `SectionSettings` from `@/components/preview/types`:** These are RUNTIME data types, not settings interfaces. Settings types go to `@/types/sections.ts`. Importing from the wrong source defeats the type organization goal.
- **Defining settings type locally in a component file:** Even if a component only uses `HeroSettings`, the type must be imported from `@/types/sections.ts`, never redefined inline.
- **Growing `page.tsx` during extraction:** Extraction means moving code OUT. If `page.tsx` grows in line count, the extraction failed. Each block of code removed from `page.tsx` must be deleted, not just copy-pasted with the original left in place.
- **`<Layout />` as a JSX element in a non-JSX file:** The registry file (`section-registry.ts`) stores `icon: ReactNode`. This requires the file to be `.tsx` not `.ts` if icons are specified as JSX literals — use `section-registry.tsx` or pass the icon as `React.createElement(Layout, { className: 'w-4 h-4' })`.
- **Importing `SECTION_REGISTRY` in a file that SECTION_REGISTRY also imports:** Would cause a circular import. `SECTION_REGISTRY` imports render/settings components; render/settings components must NOT import `SECTION_REGISTRY`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TypeScript exhaustive union check | Custom `assertNever()` or runtime type guard | TypeScript `Record<SectionType, RegistryEntry>` with literal type | Compile-time exhaustiveness for free |
| Skeleton loader UI | Custom animated divs | Tailwind `animate-pulse` utility classes | Already in use in the project |
| UUID generation | Custom ID utility | `crypto.randomUUID()` | Browser/Node built-in, no dependency |
| Icon JSX in `.ts` file | String literals or complex workarounds | Make the registry file `.tsx` | Trivial fix |

**Key insight:** This phase is pure TypeScript plumbing. Every "clever" custom solution adds complexity; the standard TypeScript type system handles registry exhaustiveness for free.

---

## Common Pitfalls

### Pitfall 1: The existing `hero-section.tsx` scaffold is NOT the extraction target

**What goes wrong:** A developer sees `src/components/sections/hero-section.tsx` and tries to reuse it as `hero-render.tsx`, but the props shape is completely different from what the god-component's `PreviewHero` and `SettingsPanel` expect.

**Why it happens:** `hero-section.tsx` uses `settings: Record<string, unknown>` and reads `settings.hero.backgroundImage` — a different nesting than the god-component's `PreviewHero` which receives `section: Section` and reads `section.settings.hero`.

**How to avoid:** The extraction target is the `PreviewHero` function at line 689 in `page.tsx` (183 lines) — NOT `hero-section.tsx`. The existing scaffold can be deleted or repurposed once the real extraction is complete.

**Warning signs:** If `hero-render.tsx` is shorter than ~150 lines or doesn't accept `section: Section` as a prop, something went wrong.

### Pitfall 2: Circular imports between registry, render components, and types

**What goes wrong:** `section-registry.tsx` imports `HeroRender`; `hero-render.tsx` imports `SectionRenderProps` from the registry; this creates a circular dependency that causes a build error or `undefined` at runtime.

**Why it happens:** Registry, types, and components are tightly related. It's tempting to put `SectionRenderProps` and `SectionSettingsProps` in the registry file itself.

**How to avoid:** Put shared prop types (`SectionRenderProps`, `SectionSettingsProps`) in `src/types/sections.ts`, not in `section-registry.tsx`. Both the registry and the components import from `src/types/sections.ts`. The registry imports components; components NEVER import from the registry.

**Import chain (safe):**
```
src/types/sections.ts          ← no internal imports
src/components/preview/types.ts ← no internal imports
hero-render.tsx                 ← imports from types/sections.ts + preview/types.ts
hero-settings.tsx               ← imports from types/sections.ts + preview/types.ts
section-registry.tsx            ← imports hero-render.tsx, hero-settings.tsx, types/sections.ts
page.tsx                        ← imports section-registry, types/sections.ts
preview-client.tsx              ← imports section-registry, preview/types.ts
```

### Pitfall 3: Type mismatch between editor `Section` and preview `Section`

**What goes wrong:** The editor's `Section` type (in `page.tsx`) has `title: string` (non-null), while `preview/types.ts` has `title: string | null`. Extracting Hero settings without resolving this mismatch causes TypeScript errors in the settings component.

**Why it happens:** The editor page uses local type definitions that differ from the shared types in `preview/types.ts`.

**How to avoid:** `src/types/sections.ts` must define `SectionType` and settings interfaces. The shared `Section` interface in `preview/types.ts` (`title: string | null`) is the canonical one — the editor should cast or normalize on load. When extracting `HeroSettings` component, use the `preview/types.ts` `Section` shape as the `section` prop type.

**Concrete action:** When `loadServerData` maps API response to editor state, set `title: s.title ?? ''` to normalize nulls to empty strings within the editor. The `HeroSettings` component prop type should use `string | null` to match the database reality.

### Pitfall 4: `mockServer.players` still referenced inside `PreviewHero` after extraction

**What goes wrong:** After extracting `hero-render.tsx`, the player badge badges (`mockServer.players`) remain hard-coded because `mockServer` is module-scoped in `page.tsx`. The extracted component compiles but shows `247` everywhere.

**Why it happens:** `PreviewHero` in the god-component uses `mockServer.players` directly (lines 741, 755, 773, 788 confirmed by grep). These references must be replaced with a prop or removed.

**How to avoid:** The extracted `HeroRender` component should accept `serverData: ServerData` as a prop (matching `preview-client.tsx`'s calling convention) and use `serverData.players ?? 0`. The `ServerData` interface in `preview/types.ts` already has `players?: number`.

**Warning signs:** Any reference to `mockServer` or `mockData` inside the extracted component files — these should be zero after extraction.

### Pitfall 5: The `section.settings.hero` nested shape vs. flat shape confusion

**What goes wrong:** The god-component's `SettingsPanel` updates settings via `onUpdate({ settings: { ...section.settings, hero: { ...section.settings.hero, alignment: value } } })`. If `HeroSettings` component uses `section.settings.alignment` (flat) instead of `section.settings.hero.alignment` (nested), the update path is wrong.

**Why it happens:** The `SectionSettings` wrapper type uses `hero?: HeroSettings` as a sub-object. The nested shape is load-bearing — it's what gets saved to the DB and read back by `preview-client.tsx` (`section.settings.hero`).

**How to avoid:** `HeroSettings` component must use the same nested `section.settings.hero` accessor pattern as both the god-component settings panel and `preview-client.tsx`. Confirm before extraction: `(section.settings.hero as HeroSettings | undefined)?.alignment`.

### Pitfall 6: `initialSections` removal cascades to `selectedSection` initialization

**What goes wrong:** `selectedSection` state is initialized to `"1"` (the id of the first mock section). After removing `initialSections`, there is no section with id `"1"`, so the settings panel renders nothing on load.

**Why it happens:** Multiple pieces of state depend on the mock data being present at initialization.

**How to avoid:** When removing `initialSections`, also change `selectedSection` initial state to `null`. After load, set `setSelectedSection(loadedSections[0]?.id ?? null)`. The settings panel must handle `selectedSection === null` gracefully (show empty state or "select a section").

---

## Code Examples

### sections.ts — Type definitions

```typescript
// Source: D-06, D-07, D-08 (CONTEXT.md locked decisions)
// src/types/sections.ts

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

// Full definition — extracted from page.tsx lines 70-85
export interface HeroSettings {
  alignment?: 'left' | 'center' | 'right';
  backgroundType?: 'solid' | 'gradient' | 'image';
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
  playerBadge?: 'top' | 'bottom' | 'hidden';
  badgeStyle?: 'pill' | 'minimal' | 'card' | 'glow';
  showDiscordButton?: boolean;
  discordButtonText?: string;
  showCopyIpButton?: boolean;
  copyIpButtonText?: string;
}

// Minimal stubs for non-extracted types — enough to satisfy the registry
export interface GamemodesSettings {
  layout?: 'single' | 'grid-2x2' | 'grid-4' | 'list';
  cardStyle?: 'default' | 'compact' | 'minimal';
  alignment?: 'left' | 'center' | 'right';
  headerAlignment?: 'left' | 'center' | 'right';
  backgroundType?: 'solid' | 'gradient' | 'image';
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
  showPlayerCount?: boolean;
  showModpack?: boolean;
  showDescription?: boolean;
  showBadge?: boolean;
  showViewAllButton?: boolean;
}

// ... (remaining stubs match existing inline shapes from page.tsx lines 87-264)

export interface SectionSettings {
  alignment?: 'left' | 'center' | 'right';
  layout?: 'grid' | 'list' | 'cards';
  colorScheme?: 'default' | 'dark' | 'accent'; // Legacy — retained for stub compatibility
  showBackground?: boolean;
  content?: {
    features?: Array<{ title: string; description: string; icon: string }>;
    modes?: string[];
    [key: string]: unknown;
  };
  hero?: HeroSettings;
  gamemodes?: GamemodesSettings;
  features?: FeaturesSettings;
  discord?: DiscordSettings;
  stats?: StatsSettings;
  gallery?: GallerySettings;
  staff?: StaffSettings;
  text?: TextSettings;
}
```

### plan.ts — Stub

```typescript
// Source: D-09, D-10 (CONTEXT.md locked decisions)
// src/lib/plan.ts

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

### site-theme.ts — Stub

```typescript
// Source: Phase success criterion 3
// src/types/site-theme.ts

export interface SiteTheme {
  // Stub — fully defined in Phase 2
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
}
```

### registry dispatch in preview-client.tsx

```typescript
// Source: D-02 (CONTEXT.md), preview-client.tsx line 914-944 (current switch)
// Replace only the hero case for Phase 1:
{sections.map((section) => {
  if (!section.visible) return null;

  // Hero uses registry
  if (section.type === 'hero') {
    const Entry = SECTION_REGISTRY['hero'];
    return <Entry.render key={section.id} section={section} serverData={server} />;
  }

  // Other types keep existing switch-case until Phase 3
  switch (section.type) {
    case 'stats': return <PreviewStats key={section.id} section={section} />;
    // ...existing cases...
  }
})}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `switch (section.type)` dispatch | Registry lookup `SECTION_REGISTRY[type]` | Phase 1 (this phase) | Adding a new section type requires 0 edits to dispatch logic |
| Types defined inline in page components | Shared `src/types/sections.ts` | Phase 1 (this phase) | Single source of truth for all settings shapes |
| `Date.now().toString()` as section ID | `crypto.randomUUID()` | Phase 1 (this phase) | Collision-safe, format-consistent with DB cuid()s |
| `mockServer` + `initialSections` | Real API fetch on mount | Phase 1 (this phase) | Editor shows real data; save/load cycle is correct |

**What already exists and is correct:**
- `GET /api/servers/[serverId]` — works, authenticated, returns `{ ...server, sections: Section[] }` ordered by `order` asc
- `PUT /api/servers/[serverId]` — works, delete-all-then-recreate, handles sections array
- Partial `useEffect` in `page.tsx` (lines 4315-4371) — the API call is already wired; `initialSections` is only used as fallback when `data.sections.length === 0`. The fix is to remove `initialSections` and `mockServer` entirely and handle empty-section state explicitly.

---

## Extraction Specifics

### What to Extract from `page.tsx`

| Block | Location in page.tsx | Destination |
|-------|---------------------|-------------|
| `type HeroSettings` | lines 70-85 | `src/types/sections.ts` (as `interface HeroSettings`) |
| `type GamemodesSettings` | lines 87-105 | `src/types/sections.ts` stub |
| `type FeaturesSettings` | lines 106-117 | `src/types/sections.ts` stub |
| `type DiscordSettings` | lines 121-140 | `src/types/sections.ts` stub |
| `type GallerySettings` | lines 157-170 | `src/types/sections.ts` stub |
| `type StatsSettings` | lines 172-190 | `src/types/sections.ts` stub |
| `type StaffSettings` | lines 197-210 | `src/types/sections.ts` stub |
| `type TextSettings` | lines 212-223 | `src/types/sections.ts` stub |
| `type SectionSettings` | lines 236-255 | `src/types/sections.ts` |
| `function PreviewHero` | lines 689-871 (183 lines) | `src/components/sections/render/hero-render.tsx` |
| Hero settings block in `SettingsPanel` | lines 2676-2883 (208 lines) | `src/components/sections/settings/hero-settings.tsx` |
| `const mockServer` | lines 58-68 | DELETE — replace with null initial state |
| `const initialSections` | lines 554-740 | DELETE — replace with `useState<Section[]>([])` |

### What to Keep in `page.tsx`

| Block | Reason |
|-------|--------|
| `type NavbarSettings` | Editor-only type; not needed by registry or public renderer |
| `function BackgroundSettingsPanel` | Shared UI primitive within the editor; could be extracted later but out of Phase 1 scope |
| `function HeaderSettingsPanel` | Same as above |
| `function SectionBackground` | Same as above |
| `function isColorDark` | Utility used across many inline preview functions within page.tsx |
| `function isLightColor` | Same |
| `function SectionPreview` (switch) | Keeps all non-Hero cases; Hero case points to registry |
| `function SettingsPanel` | Keeps all non-Hero cases; Hero case renders `<HeroSettings .../>` from registry |
| All other `Preview*` functions | Not in Phase 1 scope |

### What to Update (not extract)

| File | Change |
|------|--------|
| `preview-client.tsx` | Replace Hero case in switch with `SECTION_REGISTRY['hero'].render`; import `SECTION_REGISTRY` |
| `src/components/sections/index.ts` | Add barrel exports for `render/` and `settings/` subdirectories |
| `page.tsx` `SettingsPanel` | Replace `{section.type === "hero" && (<> ... </>)}` with `<HeroSettings section={section} onUpdate={onUpdate} />` imported from settings/ |
| `page.tsx` `SectionPreview` | Replace `case "hero": return <PreviewHero ...>` with `case "hero": const Entry = SECTION_REGISTRY['hero']; return <Entry.render ...>` |

---

## API Response Shape

`GET /api/servers/[serverId]` returns:

```typescript
// Verified from src/app/api/servers/[serverId]/route.ts lines 19-37
{
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  serverIp: string | null;
  serverPort: number | null;
  logo: string | null;
  banner: string | null;
  navbar: JsonValue | null;    // NavbarSettings shape
  theme: JsonValue | null;     // SiteTheme shape (stub in Phase 1)
  published: boolean;
  userId: string;
  sections: Array<{
    id: string;              // cuid() from DB
    type: string;            // SectionType value
    title: string | null;
    subtitle: string | null;
    settings: JsonValue;     // SectionSettings shape
    order: number;
    visible: boolean;
    serverId: string;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

[VERIFIED: route.ts source code direct read]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | For Phase 1, only the Hero case in `preview-client.tsx` needs to use the registry; other types can stay in the existing switch | Architecture Patterns (registry dispatch example) | Minor: if all cases must use registry, stub PlaceholderRender components needed for each type — adds ~30 lines of boilerplate |
| A2 | `hero-section.tsx` (the existing partial scaffold) should be superseded by `render/hero-render.tsx`; the old file can be deleted or left | Project Structure | Minor: if kept, both files export a hero component and the barrel may export two different hero renders |
| A3 | The `SectionType` literal union should include all types currently in `sectionTypeConfig` in page.tsx (including `navbar`, `video`, `store`, `reviews`, `faq`) | sections.ts type | If some types are excluded, the registry `Record<SectionType, RegistryEntry>` won't cover them and the type check may pass incorrectly |

---

## Open Questions

1. **Should `SectionType` include `navbar`?**
   - What we know: `sectionTypeConfig` in `page.tsx` lists `navbar` as a type, but it's marked `locked: true`. The preview-client switch has no `navbar` case. It appears navbar is special-cased and not a section in the traditional sense.
   - What's unclear: Whether `navbar` should be in `SectionType` union or handled separately.
   - Recommendation: Exclude `navbar` from `SectionType`. It's a server-level config (stored in `Server.navbar Json`), not a `Section` record. The registry should cover only Section types.

2. **The existing `preview-client.tsx` has its own duplicate `Section`, `ServerData`, `StatsServer`, `FeatureItem`, `GalleryImage` interface definitions (lines 22-55). Should these be replaced with imports from `preview/types.ts` in Phase 1?**
   - What we know: `src/components/preview/types.ts` already exports these same shapes. The decision D-08 says to keep them in `preview/types.ts`.
   - What's unclear: Whether Phase 1 scope includes cleaning up the duplicates inside `preview-client.tsx`.
   - Recommendation: Yes, remove the local duplicates in `preview-client.tsx` and import from `@/components/preview/types`. This is a straightforward cleanup that prevents future drift and is implied by D-08. The types are identical so there are no compatibility issues.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 1 is purely code and config changes with no external dependencies beyond what is already running in the development environment.

---

## Validation Architecture

`nyquist_validation` is explicitly `false` in `.planning/config.json`. This section is omitted.

---

## Security Domain

Phase 1 makes no API changes, no authentication changes, and no data flow changes. The security surface is unchanged. The mock data removal (D-05) does not affect the API route's auth/ownership checks, which already exist and are correct.

No ASVS categories are newly applicable to this phase.

---

## Project Constraints (from CLAUDE.md)

| Directive | How it Applies to Phase 1 |
|-----------|--------------------------|
| Never grow the god-component (`page.tsx`, ~5171 lines) | Phase 1 MUST reduce line count; success criterion 2 says "has not grown" |
| New section types go in `src/components/sections/render/` and `src/components/sections/settings/` | Hero render → `render/hero-render.tsx`, Hero settings → `settings/hero-settings.tsx` |
| CSS isolation is mandatory — server website styles under `.site-root` | N/A — Phase 1 delivers no public-facing CSS; no risk |
| Freemium enforcement is server-side | N/A — Phase 1 only creates the `getPlanLimits()` stub; no enforcement logic yet |
| Player count is non-blocking — never await Minecraft status API in SSR critical path | N/A — Phase 1 does not touch player count APIs |
| Visual effects are `ssr: false` | N/A — Phase 1 introduces no new visual effects |

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `src/app/(dashboard)/dashboard/[serverId]/page.tsx` (all grep and line reads)
- Direct codebase inspection — `src/app/[subdomain]/preview-client.tsx` (all grep and line reads)
- Direct codebase inspection — `src/components/sections/hero-section.tsx`, `src/components/preview/types.ts`
- Direct codebase inspection — `src/app/api/servers/[serverId]/route.ts`
- Direct codebase inspection — `prisma/schema.prisma`
- `.planning/phases/01-foundation-extraction/01-CONTEXT.md` — locked decisions D-01 through D-10

### Secondary (MEDIUM confidence)
- `.planning/codebase/ARCHITECTURE.md`, `CONCERNS.md`, `CONVENTIONS.md`, `STRUCTURE.md`, `STACK.md` — project analysis documents dated 2026-05-07

---

## Metadata

**Confidence breakdown:**
- Extraction targets (which code to move): HIGH — verified by direct source file reads with line numbers
- Registry pattern design: HIGH — locked by CONTEXT.md decisions D-01/D-02
- API response shape: HIGH — verified from route.ts source
- Pitfall identification: HIGH — verified from multiple source files showing the exact issues
- Stub type completeness: MEDIUM — all 8 settings types are listed but stubs for 7 non-Hero types are minimal; may need additional fields visible only in section-specific Preview* functions

**Research date:** 2026-05-07
**Valid until:** 2026-06-07 (stable codebase, no external moving parts)
