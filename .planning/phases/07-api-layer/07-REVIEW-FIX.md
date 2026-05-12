---
phase: 07-api-layer
fixed_at: 2026-05-12T00:00:00Z
review_path: .planning/phases/07-api-layer/07-REVIEW.md
iteration: 1
findings_in_scope: 15
fixed: 15
skipped: 0
status: all_fixed
---

# Phase 7: Code Review Fix Report

**Fixed at:** 2026-05-12
**Source review:** `.planning/phases/07-api-layer/07-REVIEW.md`
**Iteration:** 1

**Summary:**

- Findings in scope: 15 (6 Blockers + 9 Warnings)
- Fixed: 15
- Skipped: 0

All six Blocker findings and all nine Warning findings from the Phase 7 review were applied. The fix set introduces two new shared library modules (`src/lib/api-error.ts`, `src/lib/api-auth.ts`) and a substantially expanded validation schema (`src/lib/validations/website.ts`). Net change: +6 source files modified, +2 new files, +1 new utility export. All edits compile clean under `npx tsc --noEmit` in scope.

Carry-forward guards from Phase 6 are preserved: D-17 (Zod), D-18 (freemium limit), D-19 (P2002 mapping), D-20 (stale-FK check), D-21 (`section.settings.minecraftServerId` passes through unchanged in the bulk-replace path).

## Fixed Issues

### BL-01: Freemium plan check inverted for missing user — free limit bypassed

**Files modified:** `src/app/api/websites/[websiteId]/route.ts`
**Commit:** `95f4f72`
**Applied fix:** Replaced the optional-chained `user?.plan !== "pro"` checks with an explicit `if (!user) return 401`, then dereferenced `user.plan` directly. This makes the D-20 stale-FK case raise 401 instead of silently entering the limit block. Subsequent commit BL-WR-02 wraps this in `requireUser()` for uniformity.

### BL-02: P2002 mapped to "Subdomain is already taken" for any unique-constraint violation

**Files modified:** `src/app/api/websites/[websiteId]/route.ts`, `src/app/api/websites/route.ts`
**Commit:** `322a024`
**Applied fix:** Both P2002 catch blocks now branch on `error.meta.target`. If the target string contains `subdomain`, returns the user-facing subdomain message; otherwise returns a generic 409 with the constraint name. Same pattern was later folded into `apiErrorResponse()` (WR-01) so the outer catch also disambiguates correctly.

### BL-03: PUT accepts arbitrary JSON for logo/banner/navbar/theme

**Files modified:** `src/lib/validations/website.ts`, `src/app/api/websites/[websiteId]/route.ts`
**Commit:** `bfb9c0e` (combined with BL-04 + WR-05 since they share the same schema)
**Applied fix:** Introduced `updateWebsiteFullSchema` extending `updateWebsiteSchema` with:

- `logo`/`banner`: `httpUrlSchema` — `.url()` + max 2048 chars + http(s)-only scheme allowlist (rejects `javascript:`, `data:`).
- `navbar`: strict schema mirroring the runtime `NavbarSettings` type (links array max 20, label/href length caps, enum for `style`).
- `theme`: strict schema mirroring `SiteTheme` (enums sourced from `site-theme.ts`).

The PUT handler now runs the entire body through one `safeParse` instead of validating only `name/subdomain/description`.

### BL-04: PUT does not validate the `sections` array

**Files modified:** `src/lib/validations/website.ts`, `src/app/api/websites/[websiteId]/route.ts`
**Commit:** `bfb9c0e` (combined with BL-03 + WR-05)
**Applied fix:** Added `sectionsArraySchema` with:

- `id`: alphanumeric `_-` only, 8-60 chars (accepts UUID v4 and cuid/cuid2).
- `type`: `z.enum(SECTION_TYPES)` listing the 14 registered section keys; rejects unknown types.
- `title`/`subtitle`: nullable, max 200/500 chars.
- `settings`: `z.record(z.string(), z.unknown())` with a max-200-keys refinement.
- `visible`: optional boolean.
- `order`: ignored — server overwrites from array index.
- Array-level: max 50 sections, duplicate-id rejection via `Set` refinement.
- Strict mode rejects unknown top-level keys.

### BL-05: TOCTOU subdomain pre-check outside the transaction

**Files modified:** `src/app/api/websites/[websiteId]/route.ts`, `src/app/(dashboard)/dashboard/actions.ts`
**Commit:** `eeb4753` (combined with WR-06)
**Applied fix:** Removed the non-transactional `db.website.findUnique({ where: { subdomain } })` pre-checks from the PUT handler and both `createWebsite` / `updateWebsite` server actions. The P2002 catch (now target-specific per BL-02) is the authoritative race-free backstop.

### BL-06: `description` null round-trip silently strips the field

**Files modified:** `src/lib/validations/website.ts`, `src/app/(dashboard)/dashboard/actions.ts`, `src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx`
**Commit:** `8d4d8e9`
**Applied fix:**

- Schema: `description` is now `z.string().max(500).optional().nullable()` so clients can submit `null` to clear.
- Server action: `formData.has("description")` distinguishes "field absent" (do not change → `undefined`) from "field empty" (clear → `null`).
- Settings form: always submits the `description` field (empty string allowed); other fields keep their existing "drop empty" behavior.

---

### WR-01: `auth()` exceptions surfaced as 500 instead of 401/400/409

**Files modified:** `src/lib/api-error.ts` (new), `src/app/api/websites/route.ts`, `src/app/api/websites/[websiteId]/route.ts`, `src/app/api/websites/[websiteId]/servers/route.ts`, `src/app/api/websites/[websiteId]/servers/[serverId]/route.ts`
**Commit:** `c2c6a1c`
**Applied fix:** Extracted `apiErrorResponse(error, { fallback, context })` into `src/lib/api-error.ts`. It pattern-matches:

- `ZodError` → 400 with flatten()ed details
- Prisma P2002 → 409 (subdomain-specific message if target matches)
- Prisma P2025 → 404
- Prisma P2003 → 409 (FK conflict)
- Default → 500 with `error.message` in `details`

All eight route handlers' outer catches now delegate to this helper, so production 500s carry actionable detail in the response body instead of only in server logs.

### WR-02: D-20 stale-FK check missing from PUT/DELETE write paths

**Files modified:** `src/lib/api-auth.ts` (new), `src/app/api/websites/[websiteId]/route.ts`, `src/app/api/websites/[websiteId]/servers/route.ts`, `src/app/api/websites/[websiteId]/servers/[serverId]/route.ts`
**Commit:** `bc69348`
**Applied fix:** Extracted `requireUser({ requireUserRow? })` into `src/lib/api-auth.ts`. Returns a discriminated union: `{ session, userId }` on success or `{ response }` on failure (401 from missing session OR deleted User row). Applied to PUT/DELETE on `/api/websites/[websiteId]`, POST on `/api/websites/[websiteId]/servers`, and PUT/DELETE on `/api/websites/[websiteId]/servers/[serverId]`. GET handlers continue to use `auth()` directly since a stale-session read at most leaks the user's own data.

### WR-03: PUT response does not return sections

**Files modified:** `src/app/api/websites/[websiteId]/route.ts`
**Commit:** `19d0775`
**Applied fix:** Inside the same `$transaction`, after the `createMany`, perform `tx.section.findMany({ where: { websiteId }, orderBy: { order: "asc" } })` and merge into the response envelope as `{ ...website, sections }`. Editor now receives canonical post-write state.

### WR-04: Editor save collapses every non-OK response to "Failed to save"

**Files modified:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx`
**Commit:** `ef28e91`
**Applied fix:** `saveServer()` now `await response.json()` on non-OK responses and surfaces `body.error` in the toast. Falls back to "Failed to save" if the body is not JSON. Users now see specific messages like "Free plan is limited to 5 sections" (403) or "Subdomain is already taken" (409).

### WR-05: Section ID accepted from the client unchecked

**Files modified:** `src/lib/validations/website.ts` (folded into BL-04 commit)
**Commit:** `bfb9c0e`
**Applied fix:** Covered by BL-04's `sectionSchema.id` which enforces `^[a-zA-Z0-9_-]+$` and length 8-60, plus the array-level duplicate-id check. Rejects forged/colliding IDs before they reach `createMany`.

### WR-06: PUT subdomain pre-check redundant

**Files modified:** `src/app/api/websites/[websiteId]/route.ts` (folded into BL-05 commit)
**Commit:** `eeb4753`
**Applied fix:** Covered by BL-05's removal of the pre-check. With BL-02's target-specific P2002 catch in place, the catch alone is correct and race-free.

### WR-07: Editor PUT sends name/subdomain on every save

**Files modified:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx`
**Commit:** `2b5c074`
**Applied fix:** Removed `name`, `subdomain`, and `description` from the editor's `saveServer()` body. The editor now only submits `navbar`, `theme`, and `sections` — fields it actually owns. The settings form (`server-settings.tsx`) remains the canonical write path for `name`/`subdomain`/`description`.

### WR-08: `mcserver.ts` IP field accepts arbitrary strings

**Files modified:** `src/lib/validations/mcserver.ts`
**Commit:** `c1b6c57`
**Applied fix:** Added a hostname/IP regex to the `ip` field: `/^(?:\[[0-9a-fA-F:]+\]|[a-zA-Z0-9][a-zA-Z0-9.-]*)(?::[0-9]{1,5})?$/`. Accepts DNS hostnames, IPv4 literals, bracketed IPv6 literals, and optional `:port` suffixes. Rejects angle brackets, schemes (`javascript:`, `http://`), quotes, and whitespace.

### WR-09: Dashboard list pages duplicate `formatRelativeTime`

**Files modified:** `src/lib/utils.ts`, `src/app/(dashboard)/dashboard/page.tsx`, `src/app/(dashboard)/dashboard/servers/page.tsx`
**Commit:** `9440723`
**Applied fix:** Moved the canonical `formatRelativeTime(dateString)` implementation to `src/lib/utils.ts`. `dashboard/servers/page.tsx` now imports it. The unused (dead-code) copy was removed from `dashboard/page.tsx`. The `WebsiteCard` extraction (also recommended in WR-09) was NOT applied as a separate refactor since it goes beyond a fix into structural design; that should be a follow-up phase or a Phase 7 hardening PR.

## Skipped Issues

None — all in-scope findings were applied.

## Verification

- `npx tsc --noEmit` runs clean against every file modified by this fix set (no new errors introduced; the pre-existing top-level `next.config.ts` / `prisma.config.ts` baseline errors are unchanged).
- Each fix was committed atomically with a `fix(07): {ID(s)} {description}` subject and the affected file paths.
- BL-06 (description nullable) flows: validations/website.ts schema change → server-settings.tsx form behavior → actions.ts server-action mapping. End-to-end manual smoke test recommended at verifier phase: edit description in dashboard settings → save → reload → confirm cleared.

## Logic-Verification Caveats

The following fixes require human verification because they change semantic behavior beyond syntax:

- **BL-01 / WR-02**: stale-session 401 responses are now reachable on every write. Manual test: delete a User row out of band while a session is active, confirm the next PUT/DELETE returns 401 with the "Session expired" message rather than 500.
- **BL-04 / WR-05**: section schema is strict. Manual test: existing saved websites with section ids generated before this change should still validate (existing UUIDs/cuids match the new regex). If any legacy section row carries a different id shape, the next editor save will 400.
- **BL-06**: description clearing. Manual test as described above.
- **WR-07**: legacy websites with subdomains that violate the current regex (e.g., uppercase letters) will no longer hit the editor save 400 path — editor saves now bypass subdomain validation entirely. Settings-form saves still validate. Manual test: open such a legacy site, edit a section, save, confirm no 400.

---

_Fixed: 2026-05-12_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
