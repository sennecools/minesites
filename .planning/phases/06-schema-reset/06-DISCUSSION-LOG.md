# Phase 6: Schema Reset - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-08
**Phase:** 06-schema-reset
**Areas discussed:** Website model fields

---

## Website Model Fields

### Q1: Old Server description/logo/banner fields

| Option                             | Description                                                                      | Selected |
| ---------------------------------- | -------------------------------------------------------------------------------- | -------- |
| Keep on Website                    | Website.description, Website.logo, Website.banner — still website-level branding | ✓        |
| Drop all three                     | Simplest schema; Phase 8 can add back if needed                                  |          |
| Keep logo/banner, drop description | Logo/banner are visual assets; description less critical                         |          |

**User's choice:** Keep on Website (Recommended)
**Notes:** description, logo, and banner are all website-level branding — carry them forward to Website model.

---

### Q2: navbar Json field

| Option                 | Description                                                         | Selected |
| ---------------------- | ------------------------------------------------------------------- | -------- |
| Keep navbar on Website | Website.navbar: Json — site-wide navigation config                  | ✓        |
| Merge into theme Json  | Roll navbar settings into Website.theme — fewer fields, fatter blob |          |
| Drop navbar for now    | Not in ROADMAP spec; add back in Phase 8                            |          |

**User's choice:** Keep navbar on Website
**Notes:** Navbar is site-wide configuration; belongs as a dedicated field on Website alongside theme.

---

### Q3: MinecraftServer extra fields

| Option                       | Description                                          | Selected |
| ---------------------------- | ---------------------------------------------------- | -------- |
| Minimal: name, ip, port only | Matches ROADMAP spec exactly                         |          |
| Add description too          | MinecraftServer.description for labeling connections | ✓        |
| You decide                   | Keep minimal, add fields as requirements emerge      |          |

**User's choice:** Add description too
**Notes:** Description helps owners label connections on multi-server websites (e.g., "main survival", "creative hub").

---

## Claude's Discretion

- TypeScript compilation strategy: not discussed by user. Downstream planner should take the least-work path to zero compile errors — minimal type renames for dashboard files that will be rewritten in Phase 8.

## Deferred Ideas

- Section.title / Section.subtitle column cleanup — legacy fields, left for a future cleanup pass
- Semantic correctness of dashboard and API files — Phase 7 (API) and Phase 8 (dashboard) handle this
