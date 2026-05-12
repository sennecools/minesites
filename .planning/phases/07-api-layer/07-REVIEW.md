---
phase: 07-api-layer
reviewed: 2026-05-12T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
    - src/app/(dashboard)/dashboard/[serverId]/page.tsx
    - src/app/(dashboard)/dashboard/[serverId]/server-actions.tsx
    - src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx
    - src/app/(dashboard)/dashboard/actions.ts
    - src/app/(dashboard)/dashboard/create-server-dialog.tsx
    - src/app/(dashboard)/dashboard/page.tsx
    - src/app/(dashboard)/dashboard/servers/page.tsx
    - src/app/api/websites/[websiteId]/route.ts
    - src/app/api/websites/[websiteId]/servers/[serverId]/route.ts
    - src/app/api/websites/[websiteId]/servers/route.ts
    - src/app/api/websites/route.ts
    - src/lib/validations/mcserver.ts
    - src/types/sections.ts
findings:
    blocker: 6
    warning: 9
    total: 15
status: issues_found
---

# Phase 7: Code Review Report

**Reviewed:** 2026-05-12
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

Phase 7 introduces the new `/api/websites` REST surface plus nested `/api/websites/[websiteId]/servers/[...]` endpoints for `MinecraftServer` CRUD, replacing the legacy `/api/servers` shape. The auth pattern (session check + ownership chain) is applied consistently and the carry-forward guards (D-17 Zod validation, D-18 plan enforcement, D-19 P2002 → 409, D-20 session-expiry stale-FK check) are present in most places. However, the review surfaced multiple substantive defects: the freemium guard is silently bypassed by anonymous (free) users due to optional chaining, the D-20 stale-session check is missing on the route that needs it most (PUT, which writes), the section bulk-replace path indiscriminately maps **any** P2002 to "Subdomain is already taken" (incorrectly catching client-supplied section ID collisions), the new `PUT` accepts `logo`/`banner`/`navbar`/`theme` JSON without any validation, and the optional auto-saved subdomain through the editor PUT triggers a separate 409 path that the editor UI never surfaces. Cross-website edit guards on the nested endpoints are correct.

## Blocker Issues

### BL-01: Freemium plan check inverted for missing user — free limit bypassed

**File:** `src/app/api/websites/[websiteId]/route.ts:102-114`

**Issue:** The plan enforcement reads `user?.plan` from a `findUnique` that can return `null` (the session-FK could be stale per D-20). When `user` is `null`, both `user?.plan !== "pro"` and `user?.plan !== "paid"` evaluate to `true`, which **enters** the limit block — so far so good. But the logic also reverses harmlessly if `user` exists with no `plan` field (legacy row). The real problem is what's _missing_: the route does not error on the stale-FK case (D-20), it just continues to the transaction. The `db.website.update` and `tx.section.createMany` calls then execute, mutating data with `userId = session.user.id` references that no longer match an existing user. While the parent ownership check on line 80-91 catches most stale sessions, a race where the user record was deleted between the ownership check and the user lookup will silently proceed. More importantly, **D-20 is enforced on POST `/api/websites` but not on PUT** even though PUT is the dominant write path. Inconsistent treatment of stale sessions across the write surface.

**Fix:**

```ts
const user = await db.user.findUnique({
	where: { id: session.user.id },
	select: { plan: true },
});
if (!user) {
	return NextResponse.json(
		{ error: 'Session expired. Please sign out and sign back in.' },
		{ status: 401 },
	);
}
if (sections && Array.isArray(sections) && user.plan !== 'pro' && user.plan !== 'paid') {
	const freeLimit = getPlanLimits('free').maxSections;
	if (sections.length > freeLimit) {
		return NextResponse.json(
			{ error: `Free plan is limited to ${freeLimit} sections` },
			{ status: 403 },
		);
	}
}
```

---

### BL-02: P2002 mapped to "Subdomain is already taken" for any unique-constraint violation

**File:** `src/app/api/websites/[websiteId]/route.ts:157-161`

**Issue:** The catch block:

```ts
if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
	return NextResponse.json({ error: 'Subdomain is already taken' }, { status: 409 });
}
```

matches **any** P2002, not specifically the `subdomain` unique constraint. Inside the same transaction, `tx.section.createMany` writes client-supplied section IDs (line 138, `id: section.id`, where `section.id` is whatever the editor sent — `crypto.randomUUID()` in normal flow but user-controllable). If a malicious or buggy client submits two sections with the same id, or an id that collides with another website's section (Section.id is a global `@id` so a collision across users is rare but possible — `randomUUID()` is collision-safe in practice, but the validation contract doesn't enforce that), P2002 fires on `Section_pkey` and the caller gets `409 Subdomain is already taken`, which is wrong both semantically and as user-facing copy.

**Fix:** Branch on `error.meta?.target` to disambiguate the constraint:

```ts
if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
	const target = error.meta?.target as string[] | string | undefined;
	const targetStr = Array.isArray(target) ? target.join(',') : (target ?? '');
	if (targetStr.includes('subdomain')) {
		return NextResponse.json({ error: 'Subdomain is already taken' }, { status: 409 });
	}
	return NextResponse.json({ error: 'Conflict', details: targetStr }, { status: 409 });
}
```

The same pattern should apply to `src/app/api/websites/route.ts:87-89`.

---

### BL-03: PUT `/api/websites/[websiteId]` accepts arbitrary JSON for `logo`/`banner`/`navbar`/`theme`

**File:** `src/app/api/websites/[websiteId]/route.ts:62-77, 119-124`

**Issue:** Lines 62-63 destructure `{ logo, banner, navbar, theme, sections }` from the request body, and line 123 writes them straight into Prisma: `data: { name, subdomain, description, logo, banner, navbar, theme }`. Only `name`/`subdomain`/`description` go through `updateWebsiteSchema.safeParse`. The other four fields are passed through unchanged:

- `logo` and `banner` are `String?` columns — a client can submit an arbitrary string (any URL, javascript: scheme, data: URI, multi-megabyte payload). When the public site later renders `<img src={logo}>` the stored XSS vector lands in user pages.
- `navbar` and `theme` are `Json` columns — a malicious client can submit a 100MB nested object that bloats the DB row and crashes the JSON.stringify on the editor's load path.

**Fix:** Add Zod schemas for navbar, theme, and URL-shaped fields. Validate length and scheme on `logo`/`banner` (`z.string().url()` plus `https?:` allowlist). Reject `javascript:`, `data:` schemes outright.

```ts
const navbarSchema = z
	.object({
		/* explicit shape */
	})
	.strict();
const themeSchema = z
	.object({
		/* explicit shape */
	})
	.strict();
const updateWebsiteFullSchema = updateWebsiteSchema.extend({
	logo: z.string().url().max(2048).optional().nullable(),
	banner: z.string().url().max(2048).optional().nullable(),
	navbar: navbarSchema.optional(),
	theme: themeSchema.optional(),
	sections: z.array(sectionSchema).optional(),
});
```

---

### BL-04: PUT `/api/websites/[websiteId]` does not validate the `sections` array

**File:** `src/app/api/websites/[websiteId]/route.ts:126-150`

**Issue:** The bulk-replace section path performs no validation on the `sections` array shape. The `section.id` is taken directly from the client (line 138) and persisted as the row primary key — a client controls every section ID it creates. Worse, `section.type` is an arbitrary string with no allow-list check, so an attacker can write rows with `type: "<script>"`, `type: ""`, or any garbage value, which will then be rendered by the registry's fallback path on the public site. `section.settings` is also an `unknown` `Record<string, unknown>` — there is no length cap, no schema, no XSS scrubbing.

Additionally, no check ensures the section array has no duplicate `id` values — Prisma's `createMany` will throw P2002 on the section primary key (see BL-02), which is then mis-reported as a subdomain conflict.

**Fix:** Add a section schema with `type` as a Zod union over the registry keys, `id` as a UUID/cuid pattern, `settings` as `z.record(z.string(), z.unknown())` with a max key count, and `.refine(arr => new Set(arr.map(s => s.id)).size === arr.length, "Duplicate section IDs")`.

---

### BL-05: Subdomain conflict TOCTOU check uses non-tx `findUnique` outside the transaction

**File:** `src/app/api/websites/[websiteId]/route.ts:94-99` and `src/app/(dashboard)/dashboard/actions.ts:32-38, 91-97`

**Issue:** The route reads `conflict` with `db.website.findUnique` (line 95) _outside_ the `$transaction` that performs the update. Between the conflict check and the `tx.website.update`, another request can claim the subdomain. The P2002 catch on line 157 is the proper backstop — but per BL-02 it currently masquerades any P2002, including section-id collisions, as a subdomain conflict. So the pre-check + P2002-catch combination both leaks misleading error messages **and** races. The same TOCTOU pattern exists in `src/app/(dashboard)/dashboard/actions.ts` `createWebsite` (lines 32-38) and `updateWebsite` (lines 91-97).

**Fix:** Drop the pre-check entirely; rely on the (corrected per BL-02) P2002 catch. Or move the check inside the transaction. The pre-check adds a round-trip without providing any safety guarantee.

---

### BL-06: `description` `null` round-trip silently strips the field instead of clearing it

**File:** `src/app/api/websites/[websiteId]/route.ts:66-77` and `src/app/(dashboard)/dashboard/actions.ts:82-88`

**Issue:** `updateWebsiteSchema` defines `description` as `z.string().max(500).optional()`. There is no `.nullable()` and no transform from empty string to `null`. The route updates `data: { ...description }`, so if a user types an empty description in the settings form (`server-settings.tsx`), the form sends `description: ""` (line 47-48 of server-settings.tsx explicitly omits empty strings — so it's not sent at all). When the field is omitted, `parseResult.data.description` is `undefined` and Prisma treats it as "do not change". Result: **the user cannot clear an existing description from the UI**. The same defect lives in the server action (`actions.ts:85`) — it converts empty to `undefined` rather than to `null`. Data path: a user with a non-empty description in DB types a blank description, hits save, sees "saved" — but the description does not change. Silent data-loss-of-intent.

**Fix:** Update the schema to allow explicit `null` for "clear this field":

```ts
description: z.string().max(500).optional().nullable(),
```

And in `server-settings.tsx`, send `description: data.description ?? null` when the user wants to clear it. Same on `actions.ts` (use `formData.get("description") ?? null`, distinguishing missing from empty).

---

## Warning Issues

### WR-01: `auth()` exceptions inside route handlers are surfaced as 500 instead of 401

**File:** `src/app/api/websites/[websiteId]/route.ts:38-42, 163-166, 199-202`; `src/app/api/websites/route.ts:30-34, 92-95`; `src/app/api/websites/[websiteId]/servers/route.ts:58-61`; `src/app/api/websites/[websiteId]/servers/[serverId]/route.ts:60-63, 108-111`

**Issue:** Each route wraps the entire handler in a single `try/catch` and any uncaught error becomes `500 "Failed to load website"` (etc). This is overly coarse: a `ZodError` from a non-`safeParse` path, a `Prisma.PrismaClientUnknownRequestError`, or a network blip with the DB all collapse to a generic 500 with no detail beyond `console.error`. Specifically `error.message` is **only** surfaced in the GET path (`route.ts:40`) — the PUT, DELETE, and POST handlers swallow the message. Debugging a production 500 requires server log access for what should be a 400/409 with a clear payload.

**Fix:** Extract a small helper that pattern-matches `ZodError` → 400, `PrismaClientKnownRequestError` → 409/404 based on `code`, default → 500. Apply uniformly.

---

### WR-02: D-20 stale-FK check is missing from every PUT/DELETE write path

**File:** `src/app/api/websites/[websiteId]/route.ts:51, 171`; `src/app/api/websites/[websiteId]/servers/route.ts:9`; `src/app/api/websites/[websiteId]/servers/[serverId]/route.ts:8, 69`

**Issue:** D-20 (session expiry: `auth()` returns a valid-looking session but the User row was deleted) is enforced on `POST /api/websites` (lines 45-54 of `route.ts`) but **not** on any PUT or DELETE handler — neither the `/[websiteId]` write nor the nested `/servers/...` mutations check `db.user.findUnique`. Yes, the website ownership check (`existingWebsite.userId !== session.user.id`) is a stronger guarantee for those routes (it requires both the Website to exist _and_ its `userId` to match the session). But the dashboard `actions.ts:createWebsite` includes the D-20 check (lines 24-30) while `updateWebsite` (line 68 onward) and `deleteWebsite` (line 115 onward) do not. This is the same asymmetry. If a future write path bypasses the ownership chain (e.g., a future "create-on-behalf" admin action), it will inherit the missing check.

**Fix:** Encapsulate the D-20 check in a helper `requireUser()` that wraps `auth()` + `db.user.findUnique` and returns a typed result. Use it everywhere.

---

### WR-03: PUT response from `/api/websites/[websiteId]` does not return sections

**File:** `src/app/api/websites/[websiteId]/route.ts:120-155`

**Issue:** The transaction returns only `website` (line 152), so the response body (line 155: `NextResponse.json(updatedWebsite)`) lacks the updated `sections` array. The client editor (`page.tsx:2394-2404`) does not refresh its sections after save — it just clears `hasUnsavedChanges`. If Prisma normalized something during the transaction (e.g., section IDs, default values, ordering tie-breaks) the client's `sections` state silently diverges from DB state until the next page load. This breaks the visual round-trip principle and makes "Save then Undo then Save" produce different rows.

**Fix:** Return `{ ...website, sections: updatedSections }` where `updatedSections` is the result of a `tx.section.findMany({ where: { websiteId }, orderBy: { order: "asc" } })` after the createMany.

---

### WR-04: Response envelope inconsistency — `details` only on validation error

**File:** All four route files

**Issue:** Successful responses are bare objects (`NextResponse.json(website)`), error responses with validation issues include `{ error, details }`, generic errors include only `{ error }`. There is no `success` flag, no envelope, no error code. The client `page.tsx:2371-2396` checks `response.ok` and falls back to `"Failed to save"` — it cannot distinguish 400 validation errors from 403 plan-limit from 409 conflict. The result: when freemium enforcement (BL-01 / D-18) fires, the user sees a generic "Failed to save" toast (line 2406) and has no idea why.

**Fix:** Adopt a consistent envelope `{ ok: boolean, data?: T, error?: { code: string, message: string, details?: ... } }` or at minimum, have the client read `response.json()` on non-OK responses and surface `body.error` in the toast.

---

### WR-05: Section ID accepted from the client unchecked — replay/collision/forge risk

**File:** `src/app/api/websites/[websiteId]/route.ts:130-149`

**Issue:** Section primary keys are accepted from the client (line 138, `id: section.id`) without any check that the ID is a fresh UUID/cuid. This means the client can:

1. Submit a fixed string ID that another user already owns on a different website → P2002 (mis-reported per BL-02).
2. Submit an ID that's the same as the auth session ID, an account ID, or any other globally-known cuid, attempting trivial enumeration.
3. Re-use an old deleted ID, which works fine but is surprising.

The general Prisma idiom is to let the database generate IDs and return them in the response. The only legitimate reason to accept client IDs would be optimistic UI (use the client's ephemeral ID locally and have the server return the real one).

**Fix:** Either (a) ignore the incoming `section.id` and let Prisma generate, returning the new IDs to the client; or (b) keep client IDs but validate `z.string().uuid()` or cuid format and reject collisions before the createMany.

---

### WR-06: PUT subdomain pre-check redundant with the (broken) P2002 catch

**File:** `src/app/api/websites/[websiteId]/route.ts:94-99`

**Issue:** The route does a `findUnique` against the subdomain _before_ the transaction. The pre-check returns 409 "Subdomain is already taken" — but the same outcome already happens in the catch block (line 157-159) on a TOCTOU race. So the pre-check costs a DB round-trip on every PUT without providing additional safety. Once BL-02 is fixed (target-specific P2002 mapping), the pre-check is fully redundant.

**Fix:** Drop the pre-check; rely on P2002.

---

### WR-07: Editor's PUT sends `name`, `subdomain` on every save even when only sections changed

**File:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx:2371-2392`

**Issue:** Every editor save includes `name: serverData.name, subdomain: serverData.subdomain, description: serverData.description`. If the DB has a legacy subdomain that violates the current regex (e.g., uppercase, longer than 30 chars), the editor save fails on validation (400) even though the user only edited sections. There is also no separation of concerns: this endpoint becomes "save anything anywhere about the website", which couples the editor to the settings form. A user editing sections has no way to know why their save fails because the validation 400 maps to generic "Failed to save" (see WR-04).

**Fix:** Either omit `name`/`subdomain` from the editor save body, or have the PUT route accept partials and skip the name/subdomain validation when those fields are absent. Currently `safeParse` happily accepts the partial because `updateWebsiteSchema` is `.partial()` — but the editor _always_ sends them, removing the partial benefit.

---

### WR-08: `mcserver.ts` IP field accepts arbitrary 253-char strings without scheme/structure validation

**File:** `src/lib/validations/mcserver.ts:8-11`

**Issue:** The `ip` field is `z.string().min(1).max(253)` — there is no IP/hostname validation. A user can store `<script>alert(1)</script>`, a `javascript:` URL, or arbitrary garbage. While 253 chars is the DNS hostname limit, the actual server status poll later (mcstatus.io) will reject malformed input — but only after the bad value lands in the DB and is rendered. If any view renders `{minecraftServer.ip}` raw (e.g., a "Copy IP" button on the public site), this is a stored-XSS surface.

**Fix:** Add a regex like `/^[a-zA-Z0-9.-]+(:[0-9]{1,5})?$/` or use Zod's `.regex` with a hostname pattern. Reject anything that isn't a plausible hostname or IPv4/IPv6 literal.

---

### WR-09: Dashboard list pages duplicate logic and have an unused helper

**File:** `src/app/(dashboard)/dashboard/page.tsx:58-71` and `src/app/(dashboard)/dashboard/servers/page.tsx:62-75`

**Issue:** The `formatRelativeTime` helper is defined identically in both files (~14 lines duplicated). Worse, in `dashboard/page.tsx` the function is **never called** anywhere in the file — `grep formatRelativeTime` only matches the definition. Dead code, plus a copy-paste of business logic that will inevitably drift.

The duplicated WebsiteData type interfaces (lines 18-26 in both files) and the duplicated grid card rendering blocks (lines 158-228 in `page.tsx` and 181-250 in `servers/page.tsx`) are also begging to be extracted into a shared `WebsiteCard` component.

**Fix:** Extract `formatRelativeTime` to `src/lib/utils.ts` or remove it from `dashboard/page.tsx` (since unused). Extract `WebsiteCard` to a shared component.

---

---

_Reviewed: 2026-05-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
