# Phase 1: Foundation & Extraction - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-07
**Phase:** 1-Foundation & Extraction
**Areas discussed:** Registry entry shape, Extraction breadth, Type consolidation, getPlanLimits() shape

---

## Registry Entry Shape

| Option            | Description                                          | Selected |
| ----------------- | ---------------------------------------------------- | -------- |
| Minimal           | type + render + settings only. Simpler contract.     |          |
| Rich from day one | Adds defaultSettings(), displayName, icon, maxCount. | ✓        |
| You decide        | Claude picks based on Phase 3 section types.         |          |

**User's choice:** Rich from day one

---

| Option             | Description                                          | Selected |
| ------------------ | ---------------------------------------------------- | -------- |
| No — handle ad-hoc | Don't bake per-section limits into registry for v1.  |          |
| Yes — add maxCount | Optional maxCount field; editor enforces singletons. | ✓        |
| You decide         | Claude uses judgment from Phase 3 needs.             |          |

**User's choice:** Yes — add maxCount

---

| Option       | Description                                                         | Selected |
| ------------ | ------------------------------------------------------------------- | -------- |
| Plain object | `const SECTION_REGISTRY: Record<SectionType, RegistryEntry>`        | ✓        |
| Map          | `new Map<SectionType, RegistryEntry>()` — more ergonomic iteration. |          |
| You decide   | Claude picks based on codebase conventions.                         |          |

**User's choice:** Plain object (recommended)

---

## Extraction Breadth

| Option                      | Description                                                            | Selected |
| --------------------------- | ---------------------------------------------------------------------- | -------- |
| Hero only                   | Prove the 2-files pattern with one section; Phase 3 extracts the rest. | ✓        |
| All existing sections       | Full refactor now; Phase 3 only adds new types.                        |          |
| Hero + structurally similar | Extract Hero and any sections needing minimal rework.                  |          |

**User's choice:** Hero only (recommended)

---

| Option                  | Description                                                     | Selected |
| ----------------------- | --------------------------------------------------------------- | -------- |
| Leave it — out of scope | Mock data fix deferred to Phase 3.                              |          |
| Fix it in Phase 1       | Remove mockServer/initialSections; wire real API load on mount. | ✓        |

**User's choice:** Fix it in Phase 1

---

## Type Consolidation

| Option                          | Description                                                            | Selected |
| ------------------------------- | ---------------------------------------------------------------------- | -------- |
| src/types/sections.ts           | New file, clean separation, both editor and preview import from there. | ✓        |
| src/components/preview/types.ts | Extend existing file in place.                                         |          |
| Co-located per section          | Each section's type lives with its own files.                          |          |

**User's choice:** src/types/sections.ts (recommended)

---

| Option               | Description                                                    | Selected |
| -------------------- | -------------------------------------------------------------- | -------- |
| Hero types only      | Consistent with Hero-only extraction; others added in Phase 3. |          |
| Define all types now | Full stubs for all ~14 section types, even if minimal.         | ✓        |

**User's choice:** Define all types now

---

## getPlanLimits() Shape

| Option                   | Description                                                                   | Selected |
| ------------------------ | ----------------------------------------------------------------------------- | -------- |
| Section count only       | `{ maxSections: number }` — exactly what Phase 4 needs.                       | ✓        |
| Full capabilities object | `{ maxSections, effectsEnabled, analyticsEnabled }` — anticipates Phases 4+5. |          |
| You decide               | Claude picks minimal but extensible shape.                                    |          |

**User's choice:** Section count only (recommended)

---

| Option                    | Description                                                        | Selected |
| ------------------------- | ------------------------------------------------------------------ | -------- |
| 'free' \| 'paid' string   | Simple two-tier input.                                             |          |
| User object or plan field | `getPlanLimits(user.plan)` pattern — more ergonomic at call sites. | ✓        |
| You decide                | Claude picks based on Phase 4 integration.                         |          |

**User's choice:** User object or plan field

---

## Claude's Discretion

None — all areas had clear user selections.

## Deferred Ideas

None — discussion stayed within phase scope.
