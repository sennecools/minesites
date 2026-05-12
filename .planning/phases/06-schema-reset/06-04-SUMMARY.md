---
phase: 06-schema-reset
plan: '04'
subsystem: ui
tags: [typescript, types, rename, refactor, zod, forms]

# Dependency graph
requires:
    - phase: 06-01
      provides: prisma-website-model + website validation schemas (createWebsiteSchema, updateWebsiteSchema)
    - phase: 06-02
      provides: WebsiteData interface in preview/types.ts; SectionRenderProps typed to WebsiteData
    - phase: 06-03
      provides: all Prisma call sites updated in api + action + subdomain files
provides:
    - all-dashboard-files-use-WebsiteData
    - god-component-imports-WebsiteData
    - preview-client-accepts-WebsiteData
    - typescript-compile-zero-errors
affects:
    - Phase 07 (MinecraftServer lookup wiring)
    - Any future dashboard component reading website data

# Tech tracking
tech-stack:
    added: []
    patterns:
        - 'ServerData eliminated from all remaining consumer files — WebsiteData is the canonical type everywhere'
        - 'createWebsiteSchema/updateWebsiteSchema from validations/website.ts used in all form components'
        - 'db.server.* eliminated globally including prisma/seed.ts'

key-files:
    created: []
    modified:
        - src/app/(dashboard)/dashboard/create-server-dialog.tsx
        - src/app/(dashboard)/dashboard/page.tsx
        - src/app/(dashboard)/dashboard/servers/page.tsx
        - src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx
        - src/app/(dashboard)/dashboard/[serverId]/page.tsx
        - src/app/[subdomain]/preview-client.tsx
        - prisma/seed.ts

key-decisions:
    - 'local interface Server { serverIp, serverPort } in server-settings.tsx left unchanged per D-06/A3 — it is a runtime prop type not connected to Prisma, not imported from preview/types'
    - 'local ServerDataState type in god-component left unchanged per D-06 — standalone runtime state type, typed as any from response.json(), no TypeScript error'
    - 'serverIp/serverPort form fields removed from create-server-dialog.tsx and server-settings.tsx — createWebsiteSchema and updateWebsiteSchema have no such fields'
    - "prisma/seed.ts included in this plan's fix scope — it was a missed db.server.* call site causing TS2339 error during the compile gate"
    - 'preview-client.tsx PreviewText.hasImage typed as boolean (!! coercion) — original unknown narrowing caused TS2322 error exposed during compile gate'

patterns-established:
    - 'All form components use validation schemas from @/lib/validations/website.ts — validations/server.ts is dead for UI'
    - 'npx tsc --noEmit exits 0 is the Phase 6 success gate'

requirements-completed:
    - WEB-01
    - CONN-01

# Metrics
duration: ~15min
completed: '2026-05-08'
---

# Phase 06 Plan 04: Final Type Cleanup + TypeScript Compile Gate Summary

**Renamed ServerData to WebsiteData in all 6 remaining consumer files, updated validation imports in form components, and achieved npx tsc --noEmit exit 0 — zero TypeScript errors across the entire project.**

## Performance

- **Duration:** ~15 minutes
- **Started:** 2026-05-08T11:10:00Z
- **Completed:** 2026-05-08T11:25:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- `create-server-dialog.tsx`: switched to `createWebsiteSchema`/`CreateWebsiteInput`; removed Server IP form field
- `dashboard/page.tsx`: `ServerData` → `WebsiteData` interface; `serverIp` field and JSX render removed
- `dashboard/servers/page.tsx`: same interface rename + removal of serverIp in grid view and list view table column
- `server-settings.tsx`: switched to `updateWebsiteSchema`/`UpdateWebsiteInput`; removed Server IP and Server Port form fields + `defaultValues`
- `preview-client.tsx`: `ServerData` → `WebsiteData` in import, `PreviewDiscord`, and `PreviewClientProps`
- `page.tsx` (god-component): `import type { ServerData }` → `import type { WebsiteData }`; `SectionPreview` signature updated
- `prisma/seed.ts`: `db.server.*` → `db.website.*`; `serverIp`/`serverPort` removed from create data
- `npx tsc --noEmit` exits 0 — zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Update validation imports and local interface renames in 5 files** - `ba16073` (refactor)
2. **Task 2: Update god-component import + fix compile errors; npx tsc exits 0** - `92cab32` (refactor)

## Files Created/Modified

- `src/app/(dashboard)/dashboard/create-server-dialog.tsx` — createServerSchema/Input → createWebsiteSchema/Input; removed serverIp form field
- `src/app/(dashboard)/dashboard/page.tsx` — ServerData → WebsiteData interface; serverIp field removed
- `src/app/(dashboard)/dashboard/servers/page.tsx` — ServerData → WebsiteData; serverIp in grid view, list column, table cell removed
- `src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx` — updateServerSchema/Input → updateWebsiteSchema/Input; serverIp/serverPort fields + defaultValues removed
- `src/app/[subdomain]/preview-client.tsx` — ServerData → WebsiteData in import + PreviewDiscord + PreviewClientProps; hasImage boolean fix
- `src/app/(dashboard)/dashboard/[serverId]/page.tsx` — import ServerData → import WebsiteData; SectionPreview param type updated
- `prisma/seed.ts` — db.server.findFirst/create → db.website.findFirst/create; serverIp/serverPort removed

## Decisions Made

- `local interface Server { serverIp, serverPort }` in `server-settings.tsx` left unchanged per D-06/A3 — it describes the prop shape passed from the god-component to `ServerSettings`; it is not imported from `preview/types` and not connected to Prisma directly
- `ServerDataState` local type in god-component left unchanged — it is the runtime state type populated from `response.json()` (typed `any`), with no TypeScript error
- `serverIp`/`serverPort` form fields completely removed from UI — `createWebsiteSchema` and `updateWebsiteSchema` do not have these fields, and TypeScript would error on `register("serverIp")` if the schema type is `CreateWebsiteInput`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript compile errors not listed in plan: prisma/seed.ts and preview-client.tsx**

- **Found during:** Task 2 (TypeScript compile gate)
- **Issue 1:** `prisma/seed.ts` used `db.server.findFirst` and `db.server.create` — Plan 03 covered `src/` files only; seed.ts was missed. TypeScript reported `TS2339: Property 'server' does not exist on type 'PrismaClient'`
- **Issue 2:** `preview-client.tsx:711` — `hasImage` was typed `string | false | unknown` because both `backgroundType` and `backgroundImage` come from `as Record<string, unknown>` destructuring. TypeScript reported `TS2322: Type 'unknown' is not assignable to type 'ReactNode'` when used in JSX conditional `{hasImage && (...)}`. Fixed with `!!backgroundImage` boolean coercion.
- **Fix:** Updated `prisma/seed.ts` to use `db.website.findFirst`/`db.website.create` and removed `serverIp`/`serverPort` from create data. Added `!!` to `hasImage` assignment to ensure boolean type.
- **Files modified:** `prisma/seed.ts`, `src/app/[subdomain]/preview-client.tsx`
- **Verification:** `npx tsc --noEmit` exits 0 with no error output
- **Committed in:** `92cab32` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bugs found during compile gate)
**Impact on plan:** Both fixes necessary for the TypeScript zero-error gate to pass. No scope creep — seed.ts is an expected extension of the db.server.\* cleanup, and the hasImage type narrowing is a correctness fix.

## Issues Encountered

`npx tsc --noEmit` found 3 errors on first run:

1. `prisma/seed.ts(30,35)`: `Property 'server' does not exist on type 'PrismaClient'` — missed seed.ts in plan 03
2. `prisma/seed.ts(41,27)`: same error for `db.server.create`
3. `src/app/[subdomain]/preview-client.tsx(711,7)`: `Type 'unknown' is not assignable to type 'ReactNode'` — unknown→boolean narrowing issue in PreviewText

All three fixed inline in Task 2. Second compile run exits 0.

## TypeScript Compile Output

```
(empty — zero errors)
Exit code: 0
```

## Phase 6 Success Criteria Status

| Criterion                                                             | Status                                              |
| --------------------------------------------------------------------- | --------------------------------------------------- |
| prisma/schema.prisma defines Website + MinecraftServer; Server absent | PASS (Plan 01)                                      |
| Section model has websiteId FK                                        | PASS (Plan 01)                                      |
| npx prisma db push ran to completion                                  | PASS (Plan 01 — db push used; no migration history) |
| TypeScript compiles with zero errors                                  | PASS (this plan)                                    |
| Zero ServerData imports anywhere in src/                              | PASS                                                |
| Zero validations/server imports in non-server-ts files                | PASS                                                |
| Zero db.server._ or tx.server._ calls                                 | PASS                                                |

## Known Stubs

None — this plan closes the type rename cascade. The `serverIp` stubs in subdomain files are documented in Plan 03 summary and are intentional Phase 6 compile bridges for Phase 7.

## Threat Flags

None — no new network endpoints, auth paths, or file access patterns introduced. Only type name changes and form field removals.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 6 schema reset is complete — WebsiteData is the canonical type throughout the codebase
- `npx tsc --noEmit` exits 0; the TypeScript gate is clean
- Phase 7 (MinecraftServer lookup) can now proceed: wire `serverIp` from `MinecraftServer` model, remove the empty-string placeholder from `layout.tsx` and `page.tsx`
- No blockers introduced

---

_Phase: 06-schema-reset_
_Completed: 2026-05-08_

## Self-Check: PASSED

- [x] `src/app/(dashboard)/dashboard/create-server-dialog.tsx` modified and verified
- [x] `src/app/(dashboard)/dashboard/page.tsx` modified and verified
- [x] `src/app/(dashboard)/dashboard/servers/page.tsx` modified and verified
- [x] `src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx` modified and verified
- [x] `src/app/[subdomain]/preview-client.tsx` modified and verified
- [x] `src/app/(dashboard)/dashboard/[serverId]/page.tsx` modified and verified
- [x] `prisma/seed.ts` modified and verified
- [x] Commit ba16073 exists (Task 1)
- [x] Commit 92cab32 exists (Task 2)
- [x] `npx tsc --noEmit` exits 0
- [x] Zero `ServerData` imports in src/
- [x] Zero `validations/server` imports in non-server-ts files
- [x] Zero `db.server.*` calls anywhere
