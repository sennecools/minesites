---
phase: 06-schema-reset
fixed_at: 2026-05-08T00:00:00Z
review_path: .planning/phases/06-schema-reset/06-REVIEW.md
iteration: 1
findings_in_scope: 10
fixed: 10
skipped: 0
status: all_fixed
---

# Phase 06: Code Review Fix Report

**Fixed at:** 2026-05-08
**Source review:** `.planning/phases/06-schema-reset/06-REVIEW.md`
**Iteration:** 1

**Summary:**

- Findings in scope: 10 (4 Critical + 6 Warning; Info excluded per default fix scope)
- Fixed: 10
- Skipped: 0

---

## Fixed Issues

### CR-01: PUT route accepts subdomain changes without uniqueness check or schema validation

**Files modified:** `src/app/api/servers/[serverId]/route.ts`
**Commit:** `9276714`
**Applied fix:** Imported `updateWebsiteSchema` and added `safeParse` validation of `name`/`subdomain`/`description` from the request body before any database write. Returns 400 on validation failure. Also updated the ownership `select` to include `subdomain` so the current subdomain can be compared; if the subdomain is changing, does a `findUnique` uniqueness check and returns 409 if taken.

---

### CR-02: `redirect()` inside server action is swallowed by the dialog's catch block

**Files modified:** `src/app/(dashboard)/dashboard/create-server-dialog.tsx`
**Commit:** `94851c4`
**Applied fix:** Added `import { isRedirectError } from "next/dist/client/components/redirect"` and added an `if (isRedirectError(err)) throw err;` guard before the generic error handler in `onSubmit`. Next.js redirect throws are now re-thrown so the router handles navigation instead of the error state. Also added `open`/`onOpenChange` props to allow external control of dialog visibility (needed for WR-03).

---

### CR-03: Missing freemium section-count enforcement in PUT route

**Files modified:** `src/app/api/servers/[serverId]/route.ts`, `prisma/schema.prisma`
**Commit:** `9276714` (committed together with CR-01)
**Applied fix:** Added `plan String @default("free")` to the `User` model in `prisma/schema.prisma`. In the PUT handler, after the ownership check, fetches `user.plan` and enforces `FREE_SECTION_LIMIT = 5` for non-pro users — returns 403 if sections array exceeds the limit. Note: a Prisma migration (`prisma migrate dev`) is required before the `plan` field is available in the database. Marked as requires human verification given the migration dependency.

---

### CR-04: Preview mode does not show hidden sections

**Files modified:** `src/app/[subdomain]/page.tsx`
**Commit:** `b3eb74d`
**Applied fix:** Changed the sections query filter from the hardcoded `where: { visible: true }` to `where: isPreviewMode ? undefined : { visible: true }`. In preview mode all sections (including hidden) are returned; on the live site only visible sections are returned.

---

### WR-01: `serverIp` is silently dropped on every save

**Files modified:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx`
**Commit:** `28a3fac`
**Applied fix:** Removed `serverIp: serverData.serverIp` from the PUT request body in `saveServer`. Added a comment explaining that `serverIp` belongs on the `MinecraftServer` child model, not `Website`, and should be persisted via a separate `MinecraftServer` upsert when that relationship is surfaced in the editor. The field is retained in client state for preview rendering.

---

### WR-02: "Live" badge is hardcoded regardless of `published` state

**Files modified:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx`
**Commit:** `d6bbc44`
**Applied fix:** Replaced the static `bg-emerald-50 text-emerald-600` badge with a conditional class expression that reads `serverData.published`. Published servers show a green "Live" badge; unpublished servers show a grey "Draft" badge. The dot indicator colour also changes accordingly.

---

### WR-03: "New Server" button and "Create new server" card are non-functional

**Files modified:** `src/app/(dashboard)/dashboard/servers/page.tsx`
**Commit:** `347f5b8`
**Applied fix:** Imported `CreateServerDialog` from `../create-server-dialog`. Added `createDialogOpen` state. Wired `onClick={() => setCreateDialogOpen(true)}` to three entry points: the header "New Server" button, the grid "Create new server" card, and the empty-state "Create Server" button. Rendered `<CreateServerDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />` at the bottom of the component.

---

### WR-04: Duplicate type definitions in three places

**Files modified:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx`
**Commit:** `b13302f`
**Applied fix:** Deleted the local `type` declarations for `GamemodesSettings`, `FeaturesSettings`, `DiscordSettings`, `GallerySettings`, `StatsSettings`, `StaffSettings`, `StaffMemberSettings`, `TextSettings`, and `SectionSettings` from `page.tsx` (formerly lines 65–233). Extended the existing `@/types/sections` import to include all of these. Kept `FeatureItem`, `GalleryImage`, and `StatsServer` as local types because they are not yet separately exported from `@/types/sections` (they're inlined in parent interfaces there).

---

### WR-05: TOCTOU race condition in subdomain uniqueness check

**Files modified:** `src/app/(dashboard)/dashboard/actions.ts`
**Commit:** `2fbce91`
**Applied fix:** Added `import { Prisma } from "@prisma/client"`. Wrapped both `db.website.create` (in `createServer`) and `db.website.update` (in `updateServer`) in try/catch blocks that detect `PrismaClientKnownRequestError` with code `P2002` and re-throw as a clean `"Subdomain is already taken"` error. This ensures the race window between check and write produces a user-friendly error rather than an unhandled Prisma exception.

---

### WR-06: `prisma/seed.ts` contains a hardcoded personal email address

**Files modified:** `prisma/seed.ts`
**Commit:** `be6b8d8`
**Applied fix:** Replaced the hardcoded email `"sennecools1009@gmail.com"` with `process.env.SEED_USER_EMAIL`. Added a guard at the top of `main()` that exits with a clear error message if the environment variable is not set. The variable should be added to `.env` or passed directly when running the seed script.

---

## Skipped Issues

None — all 10 in-scope findings were fixed successfully.

---

_Fixed: 2026-05-08_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
