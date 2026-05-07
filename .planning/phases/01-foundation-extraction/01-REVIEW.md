---
phase: 01-foundation-extraction
reviewed: 2026-05-07T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - src/app/(dashboard)/dashboard/[serverId]/page.tsx
  - src/app/[subdomain]/preview-client.tsx
  - src/components/sections/index.ts
  - src/components/sections/render/hero-render.tsx
  - src/components/sections/settings/hero-settings.tsx
  - src/lib/plan.ts
  - src/lib/section-registry.tsx
  - src/types/sections.ts
  - src/types/site-theme.ts
findings:
  critical: 4
  warning: 5
  info: 3
  total: 12
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-05-07
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Phase 1 extracted the Hero section into the new registry pattern and introduced the foundation types. The structural work is sound — the registry, prop interfaces, and barrel export are all wired together correctly. However, several defects were found: two security vulnerabilities involving unsanitized user-supplied URLs rendered directly into CSS `url()` expressions, a critical type mismatch at the registry call-site in `page.tsx`, a missing freemium section-count guard (required by CLAUDE.md), and duplicate/divergent `isColorDark` implementations that will cause inconsistent dark/light detection between the dashboard preview and the public site preview.

---

## Critical Issues

### CR-01: Unsanitized URL injected into CSS `backgroundImage` style

**File:** `src/components/sections/render/hero-render.tsx:92`
**Issue:** `backgroundImage` is taken directly from user-editable settings and interpolated verbatim into a CSS `url(...)` expression without any sanitization. A value such as `"); background-image: url(javascript:alert(1)` or a path-traversal string can break the CSS rule entirely, and in browsers that still evaluate `url()` with non-http schemes it can escalate. The same pattern is repeated throughout `page.tsx` (lines 290, 621, 685, 864, 984, 1391, 1432, 1496, 1639, 1891) and `preview-client.tsx` (line 712).

**Fix:** Validate that `backgroundImage` is an absolute `http://` or `https://` URL before using it; if invalid, fall back to no background. A minimal guard:
```typescript
const safeImageUrl =
  backgroundImage?.startsWith("http://") ||
  backgroundImage?.startsWith("https://")
    ? backgroundImage
    : "";
const hasImage = backgroundType === "image" && !!safeImageUrl;
```
Apply the same guard in every `url(${...})` interpolation in `page.tsx` and `preview-client.tsx`.

---

### CR-02: Unsanitized `guildIcon` / `guildBanner` URLs rendered in `<img src>`

**File:** `src/app/[subdomain]/preview-client.tsx:388` and `src/app/(dashboard)/dashboard/[serverId]/page.tsx:1354-1358`
**Issue:** `guildIcon` and `guildBanner` are stored values from the Discord invite API response and are rendered directly as `<img src={guildIcon}>`. If an attacker can manipulate the stored settings JSON (e.g., via a compromised API response or direct database manipulation), this becomes an open redirect / SSRF vector on the client and can load arbitrary third-party content with no referrer restriction. More critically, `preview-client.tsx` line 388 passes `guildIcon as string` — if the stored value is not a string, this silently renders `src="[object Object]"` rather than failing safely.

**Fix:** Validate that these URLs begin with `https://` before rendering; otherwise render the fallback initial avatar:
```typescript
const safeIcon = typeof guildIcon === "string" && guildIcon.startsWith("https://")
  ? guildIcon : null;
```
Replace all three `{guildIcon ? <img src={guildIcon}> : ...}` branches with the safe variant.

---

### CR-03: Type mismatch — local `Section` type passed to registry component expecting `preview/types.ts` `Section`

**File:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx:2325-2326`
**Issue:** `page.tsx` declares its own local `Section` type (line 245) where `settings` is typed as `SectionSettings` (a specific interface). `SECTION_REGISTRY["hero"].render` is typed as `ComponentType<SectionRenderProps>` where `SectionRenderProps.section` is the `Section` from `@/components/preview/types`, which has `settings: Record<string, unknown>`. These two `Section` types are structurally incompatible: `SectionSettings` is not assignable to `Record<string, unknown>` in strict TypeScript because interface index signatures are not implicit. The call at line 2326 (`<Entry.render section={section} serverData={serverData} />`) will produce a TypeScript type error at compile time. `preview-client.tsx` (line 751) is correct because it uses the proper `Section` from `preview/types.ts`.

**Fix:** In `page.tsx`, import and use the `Section` from `@/components/preview/types` instead of the locally-declared duplicate, or cast at the call-site:
```typescript
// Option A: use the shared type
import type { Section } from '@/components/preview/types';
// Option B: minimal cast at call-site
<Entry.render section={section as unknown as PreviewSection} serverData={serverData} />
```
Option A is preferred — it eliminates the divergence between local and canonical `Section`.

---

### CR-04: No freemium section-count enforcement on `addSection`

**File:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx:3987-4006`
**Issue:** `addSection` appends a new section unconditionally, with no check against `getPlanLimits().maxSections`. CLAUDE.md explicitly states "Freemium enforcement is server-side — the PUT /api/servers/[serverId] handler must validate section count against user.plan. Client-only gating is not sufficient." However, there is also no client-side guard at all, meaning a free-tier user can add more than 5 sections in the UI, see them in the preview, and the only backstop is the server-side PUT handler (which is not in scope of this review). The `maxCount` field on `RegistryEntry` (e.g., `stats.maxCount = 1`) is also completely unused in `addSection`. This creates a broken UX where users can exceed limits and not discover it until a confusing save failure.

**Fix:** Import `getPlanLimits` and apply the free-tier client-side guard:
```typescript
import { getPlanLimits } from '@/lib/plan';

const addSection = (type: string) => {
  const limits = getPlanLimits('free'); // replace with actual plan once User.plan lands in Phase 4
  if (sections.length >= limits.maxSections) {
    // Show upgrade prompt
    return;
  }
  // Also enforce maxCount per type
  const entry = SECTION_REGISTRY[type as SectionType];
  if (entry?.maxCount) {
    const existing = sections.filter((s) => s.type === type).length;
    if (existing >= entry.maxCount) return;
  }
  // ... rest of addSection
};
```

---

## Warnings

### WR-01: Duplicate `isColorDark` function — divergent brightness thresholds

**File:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx:304-311`
**Issue:** `page.tsx` defines its own private `isColorDark` (threshold: `luminance < 0.5`, using the BT.601 formula scaled to 0–1). `src/components/preview/types.ts` exports `isColorDark` with a different formula and threshold (`brightness < 128`, using integer math). These will produce different results for mid-range colors, meaning the same section can appear with dark styling in the public preview but light styling in the dashboard editor. `hero-render.tsx` uses `isLightColor` from `preview/types.ts` (line 4) while `page.tsx` uses its own private version — the dashboard preview for non-hero sections uses the private variant.

**Fix:** Delete the private `isColorDark` in `page.tsx` (lines 303–311) and import the shared one:
```typescript
import { isColorDark } from '@/components/preview/types';
```
Also remove the local `SectionBackground` component's `isDark` calculation at line 281 and replace with the imported helper.

---

### WR-02: `addSection` ignores `SECTION_REGISTRY.defaultSettings` — new sections get empty settings

**File:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx:3995`
**Issue:** `addSection` always creates a section with `settings: {}`. The registry entry for `hero` defines `defaultSettings()` returning a fully-populated hero settings object. A newly added hero section will render with no `hero` key in `settings`, so `HeroRender` falls back to all defaults via destructuring — functionally correct but means the settings panel starts empty. More seriously, for placeholder section types whose `defaultSettings` is also `() => ({})`, there is no mechanism to seed type-specific defaults when they are extracted in future phases. This also means `SECTION_REGISTRY.defaultSettings` is dead code currently.

**Fix:**
```typescript
const addSection = (type: string) => {
  const entry = SECTION_REGISTRY[type as SectionType];
  const newSection: Section = {
    id: crypto.randomUUID(),
    type,
    title: entry?.displayName ?? sectionTypeConfig[type]?.label ?? `New ${type} section`,
    subtitle: null,
    visible: true,
    settings: entry?.defaultSettings() ?? {},
  };
  // ...
};
```

---

### WR-03: Masonry columns computed via dynamic Tailwind class — will be purged in production

**File:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx:1678`
**Issue:** The masonry layout uses a dynamically constructed Tailwind class: `` `@md:columns-${columns}` `` where `columns` is a runtime value (2, 3, or 4). Tailwind's JIT/purge pass scans for complete static class strings. The class `@md:columns-3` will not appear in the source and will be purged, resulting in the masonry column count having no effect in production. The same issue exists in `preview-client.tsx` line 526, which constructs `colsClass` conditionally (safe because the ternary generates full strings), but the masonry div itself (`line 552`) uses `${colsClass} gap-3 space-y-3` where `colsClass` was computed as a full string — that is safe. Only the interpolated `@md:columns-${columns}` is broken.

**Fix:** Use a lookup object instead:
```typescript
const masonryColsClass: Record<number, string> = {
  2: "@md:columns-2",
  3: "@md:columns-3",
  4: "@md:columns-4",
};
// ...
<div className={`columns-2 ${masonryColsClass[columns] ?? "@md:columns-3"} gap-3 space-y-3`}>
```

---

### WR-04: `HeroSectionSettings` in `page.tsx` is missing `discordButtonText` and `copyIpButtonText`

**File:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx:60-73`
**Issue:** The local `HeroSectionSettings` type (lines 60–73) omits `discordButtonText` and `copyIpButtonText` that are present in `src/types/sections.ts:HeroSettings` (lines 38–40). The `SettingsPanel` renders `<HeroSettings section={section} onUpdate={onUpdate} />` (line 2379), and `hero-settings.tsx` does call `updateHero({ discordButtonText: e.target.value })` (lines 263, 285). This update is passed up through `onUpdate`, which spreads into the section's `settings.hero` object. TypeScript will not catch the type mismatch because `hero-settings.tsx` uses its own imported `HeroSettingsType` from `@/types/sections`. But any code in `page.tsx` that reads `section.settings.hero?.discordButtonText` will see it as `undefined` and TypeScript will flag it. This divergence will silently lose these two fields if `page.tsx` code ever reconstructs the hero settings from the local type.

**Fix:** Delete `HeroSectionSettings` from `page.tsx` and import `HeroSettings` from `@/types/sections` for type usage. Better yet, consolidate toward importing `Section` and its subtypes from the shared modules (see CR-03).

---

### WR-05: `"use client"` on `section-registry.tsx` causes icon JSX to be bundled into the server bundle boundary unnecessarily

**File:** `src/lib/section-registry.tsx:1`
**Issue:** The file is marked `"use client"` solely because it contains JSX (`<Layout className="w-4 h-4" />` etc.) in the `icon` fields of registry entries. This forces the entire registry — including all imported component types for render and settings — to cross into the client bundle. If `SECTION_REGISTRY` is ever imported in a Server Component context (e.g., a future RSC page listing sections), Next.js will error because the registry imports `"use client"` components. The icon field is a `ReactNode` used only in dashboard UI; it should not force the registry itself to be a client module.

**Fix:** Remove JSX from `SECTION_REGISTRY` icon fields. Replace with a string identifier or component reference that can be resolved at the usage site:
```typescript
// In registry:
icon: "Layout", // string key
// At usage site (in dashboard UI, which is already "use client"):
import { Layout } from "lucide-react";
const IconComponent = iconMap[entry.icon];
```
Alternatively, split the registry into a data file (no JSX) and a separate `SECTION_REGISTRY_UI` that augments with icons, used only in client components.

---

## Info

### IN-01: Dead import — `HeroSettings` imported directly in `page.tsx` when registry already holds it

**File:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx:57`
**Issue:** Line 57 imports `HeroSettings` directly from `@/components/sections/settings/hero-settings`. The component is also reachable via `SECTION_REGISTRY["hero"].settings`. The direct import is used at line 2379 in `SettingsPanel`. This redundant import partially defeats the purpose of the registry abstraction (future section types added to the registry would still require direct imports in `SettingsPanel`).

**Fix:** Use the registry entry instead:
```typescript
// In SettingsPanel, replace:
{section.type === "hero" && <HeroSettings section={section} onUpdate={onUpdate} />}
// With:
{(() => {
  const entry = SECTION_REGISTRY[section.type as SectionType];
  if (!entry) return null;
  const SettingsComponent = entry.settings;
  return <SettingsComponent section={section} onUpdate={onUpdate} />;
})()}
```
This makes the settings dispatch registry-driven for all future section types automatically.

---

### IN-02: `console.error` left in production code path

**File:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx:3868`
**Issue:** The server load error handler calls `console.error("Error loading server:", error)`. In production this leaks internal error details to browser devtools. The error is also surfaced via `setLoadError`, so the log is redundant.

**Fix:** Remove the `console.error` call. The error is already captured in state and displayed to the user.

---

### IN-03: `SiteTheme` stub is exported but never imported or used

**File:** `src/types/site-theme.ts`
**Issue:** The `SiteTheme` interface is declared as a Phase 2 stub per the plan, but it is not imported anywhere in the Phase 1 files. The barrel export in `src/components/sections/index.ts` does not re-export it either. While harmless, it is dead code at the current phase boundary.

**Fix:** No action needed in Phase 1. Document in a code comment that this is intentionally unused until Phase 2, or add a `// @ts-nocheck` annotation. The current comment at the top of the file is sufficient; this is a low-priority note for Phase 2 hygiene.

---

_Reviewed: 2026-05-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
