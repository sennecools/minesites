---
phase: 01-foundation-extraction
verified: 2026-05-07T16:32:55Z
status: gaps_found
score: 3/4 must-haves verified
overrides_applied: 0
gaps:
  - truth: "Adding a new section type requires only two new files and one registry entry — no edits to page.tsx"
    status: failed
    reason: "SectionPreview in page.tsx uses a switch statement with individual cases; new section types fall to a text-only default placeholder, not a registry dispatch. SettingsPanel in page.tsx uses individual section.type === conditionals with no registry dispatch; new types would have zero settings controls. Only the hero case uses SECTION_REGISTRY; all 13 other types use inline Preview* functions and inline settings blocks. sectionTypeConfig in page.tsx (line 543) also requires manual additions for new types to appear in the editor's section picker."
    artifacts:
      - path: "src/app/(dashboard)/dashboard/[serverId]/page.tsx"
        issue: "SectionPreview at line 2322 uses explicit switch cases per type, not SECTION_REGISTRY[section.type].render for dispatch. SettingsPanel at line 2351 uses section.type === conditionals, not SECTION_REGISTRY[section.type].settings. sectionTypeConfig at line 543 has all 14 types hardcoded."
      - path: "src/app/[subdomain]/preview-client.tsx"
        issue: "Switch dispatcher at line 749 only routes 'hero' through SECTION_REGISTRY; the other 7 cases use inline PreviewX functions."
    missing:
      - "SectionPreview switch in page.tsx must use SECTION_REGISTRY[section.type].render (or a generic lookup) for ALL types so new types render without page.tsx edits"
      - "SettingsPanel in page.tsx must use SECTION_REGISTRY[section.type].settings for dispatch so new types get settings controls without page.tsx edits"
      - "sectionTypeConfig in page.tsx should be replaced or augmented by the registry's displayName/icon fields so new registry entries auto-appear in the section picker"
      - "preview-client.tsx switch dispatcher should use SECTION_REGISTRY[section.type].render generically for non-null entries"
---

# Phase 1: Foundation & Extraction Verification Report

**Phase Goal:** The codebase is restructured so that every future section type lands as two files plus one registry entry — never as lines added to the god-component.
**Verified:** 2026-05-07T16:32:55Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC1 | `src/lib/section-registry.ts` exists and exports a typed registry; Hero is registered there and renders identically to before | ✓ VERIFIED | `src/lib/section-registry.tsx` exists (211 lines), exports `SECTION_REGISTRY: Record<SectionType, RegistryEntry>` with hero entry wired to real `HeroRender` + `HeroSettings`. Both `page.tsx` and `preview-client.tsx` dispatch hero through `SECTION_REGISTRY["hero"].render`. `HeroRender` was extracted byte-for-byte from `PreviewHero`. |
| SC2 | The editor page (`page.tsx`) has not grown in line count; existing Hero renderer and settings panel live in their own files under `src/components/sections/` | ✓ VERIFIED | `page.tsx`: 5171 → 4680 lines (-491). `src/components/sections/render/hero-render.tsx` (160 lines) and `src/components/sections/settings/hero-settings.tsx` (297 lines) exist as standalone files. |
| SC3 | `src/types/site-theme.ts` defines the `SiteTheme` interface and `src/lib/plan.ts` defines `getPlanLimits()` | ✓ VERIFIED | `SiteTheme` exported with 5 optional string fields (primaryColor, accentColor, backgroundColor, textColor, fontFamily). `getPlanLimits('free')` returns `{ maxSections: 5 }`, `getPlanLimits('paid')` returns `{ maxSections: 15 }`. |
| SC4 | Adding a new section type requires only two new files and one registry entry — no edits to `page.tsx` | ✗ FAILED | `SectionPreview` switch in `page.tsx` has per-type cases; new types fall to a text-only default, not registry dispatch. `SettingsPanel` in `page.tsx` has per-type conditionals; new types get zero settings controls. `sectionTypeConfig` requires manual page.tsx edits for new types to appear in the section picker. Only the hero case uses `SECTION_REGISTRY`. |

**Score:** 3/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/types/sections.ts` | SectionType union, *Settings interfaces, SectionRenderProps, SectionSettingsProps | ✓ VERIFIED | 14-member SectionType union, HeroSettings (14 fields), 7 stub settings interfaces, SectionSettings wrapper, SectionRenderProps, SectionSettingsProps. All imports from `@/components/preview/types` (no circular dependency). |
| `src/types/site-theme.ts` | SiteTheme interface stub | ✓ VERIFIED | Exports SiteTheme with 5 optional string fields. |
| `src/lib/plan.ts` | getPlanLimits() helper | ✓ VERIFIED | Exports PlanLimits interface and `getPlanLimits('free' \| 'paid')`. Returns { maxSections: 5 } and { maxSections: 15 } respectively. |
| `src/components/sections/render/hero-render.tsx` | HeroRender component, min 130 lines | ✓ VERIFIED | 160 lines. `"use client"`. Exports `HeroRender`. Imports from `@/types/sections`. Uses `serverData.players ?? 0`. Zero `mockData`/`mockServer` references. All 4 badge styles present. No circular import to registry. |
| `src/components/sections/settings/hero-settings.tsx` | HeroSettings component, min 180 lines | ✓ VERIFIED | 297 lines. `"use client"`. Exports `HeroSettings`. Imports from `@/types/sections`. All 14 hero fields controllable. `updateHero()` nested spread pattern. `BackgroundSettingsPanel` inlined (not imported). No circular import to registry. |
| `src/lib/section-registry.tsx` | SECTION_REGISTRY Record<SectionType, RegistryEntry>, min 80 lines | ✓ VERIFIED | 211 lines. `.tsx` extension. `"use client"`. RegistryEntry interface with 6 required + 1 optional field. All 14 SectionType keys present. Hero entry uses HeroRender + HeroSettings. 13 entries use PlaceholderRender/PlaceholderSettings. `maxCount: 1` on stats only. |
| `src/components/sections/index.ts` | Barrel exports for HeroRender, HeroSettings | ✓ VERIFIED | Exports HeroSection, HeroRender, HeroSettings. 3 named exports. |
| `src/app/(dashboard)/dashboard/[serverId]/page.tsx` | mockServer/initialSections/PreviewHero removed; registry wired for hero | ✓ VERIFIED | Zero `mockServer`, `initialSections`, `function PreviewHero`, `PlayerBadge` references. Hero case uses `SECTION_REGISTRY["hero"]`. `<HeroSettings section={section} onUpdate={onUpdate} />` in SettingsPanel. `crypto.randomUUID()` for IDs. Null initial state. |
| `src/app/[subdomain]/preview-client.tsx` | PreviewHero/mockData/local interfaces removed; registry wired for hero | ✓ VERIFIED | 947 → 780 lines (-167). Zero local Section/ServerData/StatsServer/FeatureItem/GalleryImage interface declarations. Zero local isColorDark/isLightColor functions. Zero mockData references. Hero case uses `SECTION_REGISTRY["hero"]`. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/section-registry.tsx` | `src/components/sections/render/hero-render.tsx` | named import | ✓ WIRED | `import { HeroRender } from "@/components/sections/render/hero-render"` (line 27) |
| `src/lib/section-registry.tsx` | `src/components/sections/settings/hero-settings.tsx` | named import | ✓ WIRED | `import { HeroSettings } from "@/components/sections/settings/hero-settings"` (line 28) |
| `src/lib/section-registry.tsx` | `src/types/sections.ts` | type import | ✓ WIRED | Imports SectionRenderProps, SectionSettings, SectionSettingsProps, SectionType |
| `src/components/sections/render/hero-render.tsx` | `src/types/sections.ts` | type import | ✓ WIRED | `import type { HeroSettings, SectionRenderProps } from '@/types/sections'` |
| `src/components/sections/settings/hero-settings.tsx` | `src/types/sections.ts` | type import | ✓ WIRED | `import type { HeroSettings as HeroSettingsType, SectionSettingsProps } from '@/types/sections'` |
| `src/app/(dashboard)/dashboard/[serverId]/page.tsx` | `src/lib/section-registry` | named import | ✓ WIRED | `import { SECTION_REGISTRY } from '@/lib/section-registry'` (line 56) |
| `src/app/(dashboard)/dashboard/[serverId]/page.tsx` | `src/components/sections/settings/hero-settings` | named import (component) | ✓ WIRED | `import { HeroSettings } from '@/components/sections/settings/hero-settings'` (line 57) |
| `page.tsx SectionPreview hero case` | `SECTION_REGISTRY['hero'].render` | registry lookup | ✓ WIRED | `const Entry = SECTION_REGISTRY["hero"]; return <Entry.render section={section} serverData={serverData} />` |
| `page.tsx SettingsPanel hero block` | `HeroSettings component` | JSX invocation | ✓ WIRED | `{section.type === "hero" && <HeroSettings section={section} onUpdate={onUpdate} />}` |
| `src/app/[subdomain]/preview-client.tsx` | `src/lib/section-registry` | named import | ✓ WIRED | `import { SECTION_REGISTRY } from "@/lib/section-registry"` (line 29) |
| `preview-client.tsx hero case` | `SECTION_REGISTRY['hero'].render` | registry lookup | ✓ WIRED | `const Entry = SECTION_REGISTRY["hero"]; return <Entry.render key={section.id} section={section} serverData={server} />` |
| **SC4 gap: page.tsx SectionPreview** | **SECTION_REGISTRY[type].render** | **generic dispatch** | ✗ NOT_WIRED | SectionPreview uses per-type switch cases. New types fall to `default: return <div>{section.type} section preview</div>` — NOT registry dispatch. |
| **SC4 gap: page.tsx SettingsPanel** | **SECTION_REGISTRY[type].settings** | **generic dispatch** | ✗ NOT_WIRED | SettingsPanel uses per-type `section.type === "X"` conditionals. New types get zero settings controls. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `hero-render.tsx` | `serverData.players` | `SectionRenderProps.serverData` (passed from page.tsx/preview-client.tsx which load from API) | Yes — `serverData` is loaded from `/api/servers/[serverId]` GET, not mock | ✓ FLOWING |
| `hero-render.tsx` | `hero` (settings) | `section.settings.hero` (persisted in DB, loaded via API) | Yes — `section.settings` comes from DB via API | ✓ FLOWING |
| `hero-settings.tsx` | `hero` (settings) | `section.settings.hero` | Yes — read from section prop, updates propagated via `onUpdate` | ✓ FLOWING |
| `getPlanLimits()` | Return value | Hardcoded literal (free=5, paid=15) | Yes — synchronous pure function, correct values | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Check | Result | Status |
|----------|-------|--------|--------|
| TypeScript: no new errors from phase 1 files | `npx tsc --noEmit` — 6 errors (all pre-existing Prisma/implicit-any) | 6 errors, identical to baseline | ✓ PASS |
| SECTION_REGISTRY has all 14 SectionType keys | `grep -cE "^  SectionType: \{" registry` | 14/14 present | ✓ PASS |
| page.tsx line count reduced | 5171 → 4680 (-491) | Reduced by 491 lines (target: ≥381) | ✓ PASS |
| preview-client.tsx line count reduced | 947 → 780 (-167) | Reduced by 167 lines (target: ≥130) | ✓ PASS |
| No circular imports in hero components | `grep -c "section-registry" hero-render.tsx hero-settings.tsx` | 0 each | ✓ PASS |
| mockServer/initialSections fully removed | grep on page.tsx | 0 references | ✓ PASS |
| Hero registry dispatch in both consumers | SECTION_REGISTRY["hero"] in page.tsx + preview-client | 2 usages each | ✓ PASS |
| SC4: new types use registry dispatch in SectionPreview | page.tsx uses SECTION_REGISTRY[type] generically | Only hero case uses registry; others use inline Preview* functions | ✗ FAIL |
| SC4: new types get settings via registry in SettingsPanel | page.tsx uses SECTION_REGISTRY[type].settings generically | No generic dispatch; section.type === conditionals only | ✗ FAIL |

### Requirements Coverage

No requirement IDs assigned to this phase (preparatory phase per ROADMAP: "none — this phase is preparatory").

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `src/components/sections/render/hero-render.tsx` lines 77+83 | `PlayerBadge` component defined inside render function (`const PlayerBadge = () => {...}`) | ⚠️ Warning | `react-hooks/static-components` lint error (2 errors). Same pattern existed in original `PreviewHero` — not new regression. Functionally correct but React warns. |
| `src/app/(dashboard)/dashboard/[serverId]/page.tsx:543` | `sectionTypeConfig` hardcodes all 14 section types with separate icon/label/category — duplicates registry's `displayName`/`icon` fields | ⚠️ Warning | Requires manual page.tsx edit to add new section types to the editor picker; contributes to SC4 failure. |
| `src/app/(dashboard)/dashboard/[serverId]/page.tsx:2322` | `SectionPreview` switch has 14 per-type cases + default text fallback; not registry-driven for non-hero types | ⚠️ Warning (SC4 blocker) | New section types do not render through registry; defeating SC4. |
| `src/app/(dashboard)/dashboard/[serverId]/page.tsx:2351` | `SettingsPanel` has per-type `section.type === "X"` conditionals; only hero uses imported component | ⚠️ Warning (SC4 blocker) | New section types get zero settings controls; defeating SC4. |

Note: The REVIEW document (`01-REVIEW.md`) identified CR-01 (unsanitized backgroundImage URL), CR-02 (unsanitized guild icon URLs), CR-03 (local Section type mismatch with registry), CR-04 (missing freemium guard in addSection). These are code quality issues but are separate from Phase 1 structural goal achievement. They are documented in the review and should be addressed but do not block the core architectural assessment.

### Human Verification Required

None for automated checks. Visual rendering equivalence (SC1 "renders identically to before") was not verifiable without a running dev server — the structural evidence (byte-identical JSX extraction, same prop interfaces, same import of `isLightColor`) strongly supports rendering equivalence.

## Gaps Summary

SC4 fails because the dispatch mechanisms in `page.tsx` are NOT registry-driven for new section types:

1. **SectionPreview** (`page.tsx:2322`) uses a `switch (section.type)` with individual cases for all 14 existing types. New types would fall to a `default` case showing `{section.type} section preview` text — NOT the component registered under `SECTION_REGISTRY[type].render`. To make SC4 true, this switch must be replaced with a generic `SECTION_REGISTRY[section.type]?.render` lookup.

2. **SettingsPanel** (`page.tsx:2351`) uses individual `{section.type === "X" && (...)}` conditional blocks. New types get zero settings controls. To make SC4 true, this must dispatch via `SECTION_REGISTRY[section.type]?.settings`.

3. **sectionTypeConfig** (`page.tsx:543`) hardcodes all 14 section types for the editor section picker. A new type would be invisible to the picker without editing page.tsx. The registry's `displayName` and `icon` fields already carry this data but are not consulted.

4. **preview-client.tsx** (`src/app/[subdomain]/preview-client.tsx:749`) has the same switch-case issue: new types would fall to a plain text default, not `SECTION_REGISTRY[type].render`.

**Root cause:** Only the hero case was converted to registry dispatch in plans 04 and 05. The plan design (decision D-04: "Hero section only") intentionally limited extraction to hero, but this means the dispatch mechanism was not generalized. Phase 3 (which adds 8 new section types) will require page.tsx edits per type unless this gap is addressed first.

**Fix required:** Replace per-type dispatch in both `SectionPreview` and `SettingsPanel` with generic registry lookups. Replace `sectionTypeConfig` with registry-derived data (or augment the registry entries with the editor metadata fields it currently duplicates).

---

_Verified: 2026-05-07T16:32:55Z_
_Verifier: Claude (gsd-verifier)_
