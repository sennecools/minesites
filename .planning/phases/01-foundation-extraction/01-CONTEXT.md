# Phase 1: Foundation & Extraction - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Restructure the codebase so every section type is a self-contained unit: 2 files (render + settings component) plus 1 registry entry. No user-visible features are delivered. The phase produces the scaffolding that all subsequent phases build on.

**In scope:**
- `src/lib/section-registry.ts` — typed registry, Hero entry registered
- `src/components/sections/render/hero-render.tsx` + `src/components/sections/settings/hero-settings.tsx` — extracted Hero files
- `src/types/sections.ts` — canonical home for all section settings types (full Hero definition + stubs for remaining ~13 types)
- `src/types/site-theme.ts` — `SiteTheme` interface stub
- `src/lib/plan.ts` — `getPlanLimits()` stub
- Fix `mockServer` / `initialSections` in the editor: wire real API load on mount

**Out of scope:**
- Extracting any section type other than Hero
- Implementing new section types (Phase 3)
- Theme CSS variables or visual identity (Phase 2)
- Freemium enforcement logic (Phase 4)
- Visual effects (Phase 5)

</domain>

<decisions>
## Implementation Decisions

### Registry Design
- **D-01:** Registry entry shape is **rich from day one**: `{ type: SectionType, render: ComponentType<SectionRenderProps>, settings: ComponentType<SectionSettingsProps>, defaultSettings(): SectionSettings, displayName: string, icon: ReactNode, maxCount?: number }`. Every field is required except `maxCount` (optional, for singleton section types like Live Player Count).
- **D-02:** Registry is a **plain typed object** — `const SECTION_REGISTRY: Record<SectionType, RegistryEntry>`. No Map, no class. Zero runtime cost, fully type-inferred.
- **D-03:** `maxCount` enforced by the editor add-section logic: if `SECTION_REGISTRY[type].maxCount` is set and current sections already hit that count, the add action is blocked in the UI. Phase 3 wires this up; Phase 1 just defines the field.

### Extraction Scope
- **D-04:** **Hero section only** is extracted in Phase 1. One section is sufficient to prove the 2-files pattern works and passes the success criteria. Other sections are extracted in Phase 3 when they are built out.
- **D-05:** **Fix mock data in Phase 1.** Remove `mockServer` and `initialSections` from `page.tsx`. Wire up a real `fetch('/api/servers/[serverId]')` call on mount (the endpoint already exists at `src/app/api/servers/[serverId]/route.ts`). Use `null` as initial state with a skeleton loader until data arrives.

### Type Organization
- **D-06:** New file **`src/types/sections.ts`** is the canonical home for all section settings types. Both the editor (`page.tsx`) and the public renderer (`preview-client.tsx`) import from there.
- **D-07:** Phase 1 defines **all section type stubs** in `sections.ts` — even for sections not yet extracted. Hero gets a full definition; others are minimal stubs (`interface FeaturesSettings { items: { title: string; description: string }[] }` etc., matching current inline shapes). This prevents type drift when Phase 3 extracts them.
- **D-08:** `src/components/preview/types.ts` retains `ServerData`, `Section`, `FeatureItem`, `GalleryImage` — the runtime data types. Settings types (the `*Settings` interfaces) move to `src/types/sections.ts`. The two files have distinct responsibilities and are not merged.

### Plan Limits
- **D-09:** `getPlanLimits(plan: 'free' | 'paid'): PlanLimits` — accepts a plan string. Call sites use `getPlanLimits(user.plan)` pattern. The `User` model's `plan` field (added in Phase 4) will be `'free' | 'paid'`.
- **D-10:** Return type in Phase 1 stub: `{ maxSections: number }`. Phase 4 adds real enforcement logic; Phase 5 may extend the return type to include `effectsEnabled: boolean`. Values: free → 5, paid → 15.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Definition
- `.planning/ROADMAP.md` §Phase 1 — Success criteria (4 numbered items), goal, requirements note
- `.planning/codebase/CONCERNS.md` §Technical Debt — Mock data concerns (HIGH severity), type duplication, `Date.now()` ID issue

### Files to Extract From
- `src/app/(dashboard)/dashboard/[serverId]/page.tsx` — god-component (5171 lines); source of Hero renderer, Hero settings panel, all `*Settings` types, `mockServer`, `initialSections`
- `src/app/[subdomain]/preview-client.tsx` — switch-case section dispatch (~950 lines); where registry lookup replaces the switch

### Existing Scaffolding
- `src/components/sections/hero-section.tsx` — partial Hero render scaffold (already exists; determine what's reusable)
- `src/components/sections/index.ts` — barrel export to update
- `src/components/preview/types.ts` — existing shared types (`ServerData`, `Section`, etc.) — keep here, don't move

### Architecture Reference
- `.planning/codebase/ARCHITECTURE.md` §Anti-Patterns — Settings type duplication pattern
- `.planning/codebase/STRUCTURE.md` §Where to Add New Code — Current convention for new section types

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/sections/hero-section.tsx`: partial Hero render scaffold — inspect what's already correct before extracting from god-component
- `src/components/preview/types.ts`: `Section`, `ServerData`, `FeatureItem`, `GalleryImage` — these stay here; only settings interfaces move to `src/types/sections.ts`
- `src/components/ui/`: Button, Input, Textarea, Select, Card — available for settings panels
- `src/app/api/servers/[serverId]/route.ts`: GET endpoint already exists and returns `{ server, sections }` — use for real API load

### Established Patterns
- Barrel exports via `index.ts` in component directories (`ui/`, `layout/`, `sections/`)
- `kebab-case.tsx` for component files, `kebab-case.ts` for utilities
- Named exports for components, default exports for Next.js pages/layouts
- TypeScript `@/` path alias resolves to `src/`
- Section IDs currently use `Date.now().toString()` — change to `crypto.randomUUID()` when touching ID generation

### Integration Points
- `src/app/[subdomain]/preview-client.tsx`: replace `switch (section.type)` dispatch with `SECTION_REGISTRY[section.type]?.render` lookup
- `src/app/(dashboard)/dashboard/[serverId]/page.tsx`: extract Hero render/settings components, remove `mockServer`/`initialSections`, wire real API load
- `src/lib/auth.ts` / `src/app/api/servers/[serverId]/route.ts`: no changes needed in Phase 1 — API already works

</code_context>

<specifics>
## Specific Ideas

- **Rich registry** — the user specifically wants the registry to include `displayName` and `icon` from day one so that the add-section UI in Phase 3 can be entirely registry-driven (no hardcoded labels elsewhere).
- **All type stubs now** — even sections not extracted in Phase 1 get their settings type defined in `sections.ts`. This is a deliberate choice to eliminate the type-drift problem early. Stubs can be minimal but must exist.
- **Real data fix in Phase 1** — removing `mockServer` is explicitly in scope, not deferred. The editor should show a skeleton while loading and an empty state if no sections exist.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Foundation & Extraction*
*Context gathered: 2026-05-07*
