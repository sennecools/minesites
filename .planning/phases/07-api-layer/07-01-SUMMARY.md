---
phase: 07-api-layer
plan: 01
subsystem: api
tags: [zod, validation, typescript, types, minecraft-server]

# Dependency graph
requires:
  - phase: 06-schema-reset
    provides: "Website + MinecraftServer Prisma models; section.settings as canonical home"
provides:
  - "createMcserverSchema / updateMcserverSchema zod schemas for MinecraftServer payloads"
  - "CreateMcserverInput / UpdateMcserverInput inferred TypeScript types"
  - "ServerScopedSettings interface fragment ({ minecraftServerId?: string }) for shared reuse"
affects: [07-02-website-routes, 07-03-mcserver-routes, deferred-sect-02, deferred-sect-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Validation schemas mirror website.ts style: base create -> .partial() update -> z.infer types"
    - "Shared section-settings type fragments live in src/types/sections.ts"

key-files:
  created:
    - "src/lib/validations/mcserver.ts"
  modified:
    - "src/types/sections.ts"

key-decisions:
  - "Loose IP validation (string min 1, max 253, no regex) — mcstatus.io validates at poll time (D-07)"
  - "Port is integer 1-65535, optional because Prisma schema provides @default(25565) (D-08)"
  - "ServerScopedSettings is a top-level fragment, not nested under per-type key (D-10, D-11)"

patterns-established:
  - "Validation file shape: base create schema -> .partial() update -> z.infer<typeof> types"
  - "Server-scoped section types extend or include ServerScopedSettings rather than redefining minecraftServerId"

requirements-completed: [CONN-01, CONN-03, CONN-04]

# Metrics
duration: ~3min
completed: 2026-05-12
---

# Phase 7 Plan 01: Validation & Types Foundation Summary

**Zod schemas for MinecraftServer CRUD payloads and the shared `ServerScopedSettings` type fragment that unblocks Phase 7 parallel plans 07-02 and 07-03.**

## Performance

- **Duration:** ~3 min
- **Completed:** 2026-05-12
- **Tasks:** 2
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments

- Introduced `src/lib/validations/mcserver.ts` with `createMcserverSchema`, `updateMcserverSchema`, `CreateMcserverInput`, `UpdateMcserverInput` — exact CONTEXT D-07/D-08/D-09 shape (loose IP, integer port, name + optional description).
- Extended `src/types/sections.ts` with the exported `ServerScopedSettings { minecraftServerId?: string }` interface, inserted between the `SectionType` union and the `HeroSettings` interface — no existing types touched.
- `npx tsc --noEmit` exits clean with zero errors after both changes.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create src/lib/validations/mcserver.ts with create + update schemas** — `431a619` (feat)
2. **Task 2: Add ServerScopedSettings interface to src/types/sections.ts** — `4289bb9` (feat)

## Files Created/Modified

- `src/lib/validations/mcserver.ts` (created) — Zod schemas + inferred types for MinecraftServer create/update payloads.
- `src/types/sections.ts` (modified) — Added exported `ServerScopedSettings` interface; existing `SectionType` union and all section settings interfaces (`HeroSettings`, `StatsSettings`, etc.) unchanged.

## Schema Field Shape (final)

`src/lib/validations/mcserver.ts`:

```typescript
import { z } from "zod";

export const createMcserverSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  ip: z
    .string()
    .min(1, "IP is required")
    .max(253, "IP must be less than 253 characters"),
  port: z
    .number()
    .int("Port must be an integer")
    .min(1, "Port must be at least 1")
    .max(65535, "Port must be at most 65535")
    .optional(),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
});

export const updateMcserverSchema = createMcserverSchema.partial();

export type CreateMcserverInput = z.infer<typeof createMcserverSchema>;
export type UpdateMcserverInput = z.infer<typeof updateMcserverSchema>;
```

Notes on field choices:
- `ip` is a loose string (1–253 chars, no regex). Accepts hostnames, IPv4, IPv6, embedded `:port` — per D-07, validation is deferred to mcstatus.io at poll time.
- `port` is `optional()` so the Prisma `@default(25565)` applies when omitted (D-08).
- `name` 1–50 chars, `description` ≤ 200 chars optional (D-09).

## Where ServerScopedSettings Was Inserted

In `src/types/sections.ts`, between line 23 (end of `SectionType` union: `  | 'video';`) and line 25 (former `// ---------- Hero` comment). Block added:

```typescript
// ---------- ServerScopedSettings ----------
// Per Phase 7 D-10, D-11: server-specific section types (Live Player Count, Server Info,
// and any future server-scoped types) reference a connected MinecraftServer record by id
// stored as a top-level key inside `section.settings`. Future section settings interfaces
// extend or include this shape.
export interface ServerScopedSettings {
  minecraftServerId?: string;
}
```

The `SectionType` union and every existing `*Settings` interface (`HeroSettings`, `GamemodesSettings`, `FeaturesSettings`, `DiscordSettings`, `GallerySettings`, `StatsSettings`, `StaffSettings`, `TextSettings`, `SectionSettings`, etc.) are byte-identical to the pre-plan version. Component prop interfaces `SectionRenderProps` and `SectionSettingsProps` are also unchanged.

## TypeScript Check Confirmation

`npx tsc --noEmit` after both commits: **0 errors**, exit code 0. No new diagnostics referencing `mcserver.ts` or `sections.ts`. No premature imports yet — Plan 07-03 will import the schemas; section renderers in deferred SECT-02/03 will reference `ServerScopedSettings`.

## Decisions Made

None new — plan executed exactly as written. All decisions (D-07 loose IP, D-08 integer optional port, D-09 name/description limits, D-10/D-11 ServerScopedSettings shape) come from `07-CONTEXT.md` and were enacted verbatim.

## Deviations from Plan

None — plan executed exactly as written. Both task action blocks were applied literally; verify and acceptance criteria all pass; no auto-fixes (Rules 1-3) required and no architectural reconsideration (Rule 4) needed.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration introduced.

## Next Phase Readiness

- Plan 07-02 (website routes rename + section save accepting `settings.minecraftServerId`) is unblocked: it can rely on the existing `updateWebsiteSchema` in `website.ts` and use `ServerScopedSettings` as a TypeScript reference for the saved settings shape (no runtime change required from this plan for 07-02).
- Plan 07-03 (MinecraftServer CRUD routes) is unblocked: it can `import { createMcserverSchema, updateMcserverSchema } from '@/lib/validations/mcserver'` to validate POST/PUT bodies.
- No blockers. Both downstream plans can proceed in the next wave.

## Self-Check: PASSED

- `src/lib/validations/mcserver.ts` — FOUND
- `src/types/sections.ts` — present and contains `ServerScopedSettings`
- Commit `431a619` (Task 1) — FOUND in git log
- Commit `4289bb9` (Task 2) — FOUND in git log
- `npx tsc --noEmit` — clean (0 errors, exit code 0)

---
*Phase: 07-api-layer*
*Plan: 01*
*Completed: 2026-05-12*
