---
phase: 01-foundation-extraction
plan: "06"
subsystem: section-registry
tags: [registry, dispatch, refactor, gap-closure]
dependency_graph:
  requires: ["01", "02", "03", "04", "05"]
  provides: [generic-section-dispatch, registry-driven-picker]
  affects: [section-registry.tsx, page.tsx, preview-client.tsx]
tech_stack:
  added: []
  patterns: [registry-driven-dispatch, ElementType-icon, registry-derived-config]
key_files:
  created: []
  modified:
    - src/lib/section-registry.tsx
    - src/app/(dashboard)/dashboard/[serverId]/page.tsx
    - src/app/[subdomain]/preview-client.tsx
decisions:
  - "icon field changed from ReactNode to ElementType (component constructor) — enables callers to render as <Entry.icon className=... /> without JSX in registry definition"
  - "sectionTypeConfig derived from SECTION_REGISTRY via Object.entries() — single source of truth, no manual sync"
  - "Per-type inline settings JSX blocks removed from SettingsPanel (~1400 lines dead code deleted) — Phase 3 will extract these into proper settings components"
metrics:
  duration: "~25 minutes"
  completed: "2026-05-07"
  tasks: 3
  files: 3
---

# Phase 1 Plan 06: Generalize Dispatch — Close SC4 Gap Summary

Generic registry dispatch wired in all three dispatch points so a new section type requires only a registry entry — zero edits to page.tsx or preview-client.tsx.

## What Was Built

**Task 1: RegistryEntry picker metadata (76b4b76)**
- Changed `icon` field from `ReactNode` to `ElementType` (component constructor)
- Added `category: string` and `description: string` fields to `RegistryEntry`
- Updated all 14 SECTION_REGISTRY entries with category/description values matching the existing `sectionTypeConfig`
- Removed `ReactNode` import, added `ElementType`

**Task 2: page.tsx generic dispatch (2b47fd6)**
- Replaced `sectionTypeConfig` hardcoded 15-entry object with `Object.entries(SECTION_REGISTRY)`-derived equivalent
- Replaced `SectionPreview` switch-case (14 cases) with `SECTION_REGISTRY[section.type as SectionType].render`
- Replaced `SettingsPanel` per-type conditional blocks (~1400 lines of inline settings JSX) with single `SECTION_REGISTRY[section.type].settings` dispatch
- Removed `HeroSettings` direct import (now dispatched via registry)
- Added `ElementType` and `SectionType` imports

**Task 3: preview-client.tsx generic dispatch (e49ee86)**
- Replaced `switch(section.type)` (8 cases + default) with `SECTION_REGISTRY[section.type as SectionType].render`
- Added `SectionType` import
- Dead-code `Preview*` inline functions remain for Phase 3 extraction

## Verification Results

| Check | Expected | Actual | Pass |
|-------|----------|--------|------|
| `section.type ===` in page.tsx | 0 | 0 | yes |
| `SECTION_REGISTRY[section.type` in page.tsx | >=2 | 2 | yes |
| `Object.entries(SECTION_REGISTRY)` in page.tsx | >=1 | 1 | yes |
| `switch(section.type)` in preview-client.tsx | 0 | 0 | yes |
| `SECTION_REGISTRY[section.type` in preview-client.tsx | 1 | 1 | yes |
| `ReactNode` in section-registry.tsx | 0 | 0 | yes |
| `category:` entries in registry | 14 | 14 | yes |
| `description:` entries in registry | 14 | 14 | yes |
| TypeScript errors | 6 | 6 | yes |

## Deviations from Plan

None — plan executed exactly as written.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. The `section.type as SectionType` cast is guarded by `if (!entry)` null-guards in both SectionPreview and preview-client.tsx, satisfying T-01-13 mitigation from the plan's threat model.

## Known Stubs

None introduced in this plan. The PlaceholderRender/PlaceholderSettings stubs in section-registry.tsx pre-date this plan and are tracked in the overall Phase 1 architecture (D-04: Phase 1 ships only Hero as real component).

## Self-Check: PASSED

- [x] src/lib/section-registry.tsx modified and committed at 76b4b76
- [x] src/app/(dashboard)/dashboard/[serverId]/page.tsx modified and committed at 2b47fd6
- [x] src/app/[subdomain]/preview-client.tsx modified and committed at e49ee86
- [x] TypeScript error count unchanged at 6
- [x] All SC4 gap items closed
