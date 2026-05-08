---
phase: 06-schema-reset
reviewed: 2026-05-08T00:00:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - prisma/schema.prisma
  - prisma/seed.ts
  - src/app/(dashboard)/dashboard/actions.ts
  - src/app/(dashboard)/dashboard/create-server-dialog.tsx
  - src/app/(dashboard)/dashboard/page.tsx
  - src/app/(dashboard)/dashboard/servers/page.tsx
  - src/app/(dashboard)/dashboard/[serverId]/page.tsx
  - src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx
  - src/app/[subdomain]/layout.tsx
  - src/app/[subdomain]/page.tsx
  - src/app/[subdomain]/preview-client.tsx
  - src/app/api/servers/route.ts
  - src/app/api/servers/[serverId]/route.ts
  - src/components/preview/types.ts
  - src/lib/validations/website.ts
  - src/types/sections.ts
findings:
  critical: 4
  warning: 6
  info: 4
  total: 14
status: issues_found
---

# Phase 06: Code Review Report

**Reviewed:** 2026-05-08
**Depth:** standard
**Files Reviewed:** 16
**Status:** issues_found

## Summary

The schema-reset phase introduces a `Website`/`Section`/`MinecraftServer` model split, server action layer, API routes for CRUD, and a client-side editor. The underlying data model is sound. The critical problems cluster in two areas: (1) the `PUT /api/servers/[serverId]` route accepts and persists arbitrary subdomain changes without any validation or uniqueness check, which allows subdomain squatting and silent data corruption; (2) the `redirect()` inside `createServer` server action is swallowed by the dialog's generic `catch` block, causing a broken UX loop on successful creation. Several secondary issues also require attention: a hardcoded "Live" badge regardless of publish state, hidden sections excluded from the `?preview=true` page even in preview mode, `serverIp` silently dropped on every save, and dead UI buttons in the servers listing.

---

## Critical Issues

### CR-01: PUT route accepts subdomain changes without uniqueness check or schema validation

**File:** `src/app/api/servers/[serverId]/route.ts:58-88`

**Issue:** The `PUT` handler destructures `{ name, subdomain, description, ... }` from the request body and writes them directly to the database without validating the subdomain format, checking whether the new subdomain is already taken by another website, or verifying that the caller even owns the target subdomain entry before writing it. Any authenticated user can change a server's subdomain to any value — including one that another user already owns — as long as they know the `serverId`. This is a data-integrity vulnerability: a server's public URL can be silently overwritten.

The `updateWebsiteSchema` already exists in `src/lib/validations/website.ts` and is used by the `updateServer` server action. The PUT route does not use it.

**Fix:**
```typescript
// src/app/api/servers/[serverId]/route.ts — inside PUT handler, before the transaction
import { updateWebsiteSchema } from "@/lib/validations/website";

const body = await request.json();
const parseResult = updateWebsiteSchema.safeParse({
  name: body.name,
  subdomain: body.subdomain,
  description: body.description,
});
if (!parseResult.success) {
  return NextResponse.json(
    { error: "Invalid input", details: parseResult.error.flatten() },
    { status: 400 }
  );
}
const { name, subdomain, description } = parseResult.data;

// If subdomain is changing, verify it is not taken
if (subdomain && subdomain !== existingWebsite.subdomain) {
  const conflict = await db.website.findUnique({ where: { subdomain } });
  if (conflict) {
    return NextResponse.json({ error: "Subdomain is already taken" }, { status: 409 });
  }
}
```

---

### CR-02: `redirect()` inside server action is swallowed by the dialog's catch block

**File:** `src/app/(dashboard)/dashboard/create-server-dialog.tsx:43-56`

**Issue:** Next.js `redirect()` works by throwing a special `NEXT_REDIRECT` error internally. The `onSubmit` handler wraps `createServer(formData)` in a `try/catch` that catches all errors:

```typescript
try {
  await createServer(formData);
} catch (err) {
  setError(err instanceof Error ? err.message : "Something went wrong");
}
```

When `createServer` succeeds and calls `redirect(...)`, the `NEXT_REDIRECT` throw is caught here, `err instanceof Error` is `false`, and the dialog displays "Something went wrong" while the user stays on the dialog — even though the server was created successfully. The user will see an error message and an unclosed modal; they can confirm the creation only by closing the dialog and refreshing.

**Fix:**
```typescript
import { isRedirectError } from "next/dist/client/components/redirect";

const onSubmit = async (data: CreateWebsiteInput) => {
  setError(null);
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
    await createServer(formData);
  } catch (err) {
    if (isRedirectError(err)) throw err; // let Next.js handle the redirect
    setError(err instanceof Error ? err.message : "Something went wrong");
  }
};
```

---

### CR-03: Missing freemium section-count enforcement in PUT route (architecture requirement)

**File:** `src/app/api/servers/[serverId]/route.ts:91-115`

**Issue:** `CLAUDE.md` architecture rule #3 states: "Freemium enforcement is server-side — the `PUT /api/servers/[serverId]` handler must validate section count against `user.plan`. Client-only gating is not sufficient." The current PUT handler accepts and persists any number of sections sent by the client. There is no section-count check at all, and the `User` model in `prisma/schema.prisma` has no `plan` field. Any user can send 100 sections in a PUT body and they will all be saved. The schema gap means this cannot be enforced until the field is added, but the handler also makes no attempt to cap count.

**Fix:** This requires two coordinated changes:
1. Add a `plan String @default("free")` field to the `User` model in `prisma/schema.prisma`.
2. In the PUT handler, after the ownership check, fetch `user.plan` and enforce the limit:

```typescript
// After ownership check — inside PUT handler
const user = await db.user.findUnique({
  where: { id: session.user.id },
  select: { plan: true },
});
const FREE_SECTION_LIMIT = 5;
if (sections && Array.isArray(sections) && user?.plan !== "pro") {
  if (sections.length > FREE_SECTION_LIMIT) {
    return NextResponse.json(
      { error: `Free plan is limited to ${FREE_SECTION_LIMIT} sections` },
      { status: 403 }
    );
  }
}
```

---

### CR-04: Preview mode does not show hidden sections — intent mismatch with editor UX

**File:** `src/app/[subdomain]/page.tsx:19-23`

**Issue:** The section query always applies `where: { visible: true }`, even when `isPreviewMode` is `true`. In the editor, users can toggle section visibility to hide sections from the live site, but when they click "Preview" (which opens `/{subdomain}?preview=true`) they expect to see the full layout — including hidden sections — as it exists in the editor. Instead they see only published-visible sections, which makes the "Preview" button misleading and useless for checking hidden sections before deciding to show them.

**Fix:**
```typescript
const server = await db.website.findUnique({
  where: { subdomain },
  include: {
    sections: {
      // Show all sections in preview mode; only visible ones on the live site
      where: isPreviewMode ? undefined : { visible: true },
      orderBy: { order: "asc" },
    },
  },
});
```

---

## Warnings

### WR-01: `serverIp` is silently dropped on every save

**File:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx:2510-2513`

**Issue:** The `saveServer` function sends `serverIp: serverData.serverIp` in the PUT body. The `Website` model in `schema.prisma` has no `serverIp` field — that field lives on the `MinecraftServer` child model. The `PUT` handler destructures `serverIp` but the field is not in the destructure list (`{ name, subdomain, description, logo, banner, navbar, theme, sections }`) and is never written. Any server IP stored in client state is silently discarded on save and lost on the next page load. The `server-settings.tsx` interface also declares `serverIp: string | null` and `serverPort: number | null` which do not correspond to `Website` model fields.

**Fix:** Either (a) remove `serverIp` from the client state and PUT body until the `MinecraftServer` relationship is surfaced in the editor, or (b) add a proper `MinecraftServer` upsert inside the transaction that persists the IP. Option (a) is safer for the current phase and avoids silent data loss.

---

### WR-02: "Live" badge is hardcoded — always shown regardless of `published` state

**File:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx:2681-2684`

**Issue:** The editor header always renders a green "Live" badge next to the server name:

```tsx
<span className="inline-flex items-center gap-1.5 ... bg-emerald-50 text-emerald-600">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
  Live
</span>
```

`serverData.published` is loaded but never used to conditionally render this badge. A server that is in "Draft" state (unpublished) incorrectly appears as "Live" to its owner.

**Fix:**
```tsx
<span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
  serverData.published
    ? "bg-emerald-50 text-emerald-600"
    : "bg-zinc-100 text-zinc-500"
}`}>
  <span className={`w-1.5 h-1.5 rounded-full ${
    serverData.published ? "bg-emerald-500" : "bg-zinc-400"
  }`} />
  {serverData.published ? "Live" : "Draft"}
</span>
```

---

### WR-03: "New Server" button and "Create new server" card in `servers/page.tsx` are non-functional

**File:** `src/app/(dashboard)/dashboard/servers/page.tsx:119-127, 255-267`

**Issue:** The "New Server" header button (line 119) and the "Create new server" card inside the grid (line 255) have no `onClick` handler. Both are `<motion.button>` elements that render and animate but do nothing when clicked. The page imports neither `CreateServerDialog` nor any create action. Users who navigate to `/dashboard/servers` have no working way to create a server from that page.

**Fix:** Import `CreateServerDialog` and wire it up:

```tsx
import { CreateServerDialog } from "../create-server-dialog";

// Add state
const [createDialogOpen, setCreateDialogOpen] = useState(false);

// Update header button
<motion.button onClick={() => setCreateDialogOpen(true)} ...>
  <Plus className="w-4 h-4" />
  New Server
</motion.button>

// Add dialog
<CreateServerDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
```

---

### WR-04: Duplicate type definitions — `SectionSettings` and friends defined in three places

**File:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx:65-233`, `src/types/sections.ts`, `src/components/preview/types.ts`

**Issue:** `GamemodesSettings`, `FeaturesSettings`, `DiscordSettings`, `GallerySettings`, `StatsSettings`, `StaffSettings`, `TextSettings`, and `SectionSettings` are each defined as local types inside `page.tsx` (lines 65-233), as exported interfaces in `src/types/sections.ts`, and in part in `src/components/preview/types.ts` (as local non-exported types). Per Phase 1 decisions D-06/D-07/D-08, the canonical location is `src/types/sections.ts`. The local duplicates in `page.tsx` drift silently from the canonical definitions — for example `FeaturesSettings.layout` allows `"2x1" | "2x2"` in both files but this will inevitably diverge.

**Fix:** Delete the local type declarations from `page.tsx` (lines 65-233) and import from `@/types/sections`:

```typescript
import type {
  GamemodesSettings,
  FeaturesSettings,
  DiscordSettings,
  GallerySettings,
  StatsSettings,
  StaffSettings,
  TextSettings,
  SectionSettings,
} from '@/types/sections';
```

---

### WR-05: TOCTOU race condition in subdomain uniqueness check

**File:** `src/app/(dashboard)/dashboard/actions.ts:23-29`, `src/app/(dashboard)/dashboard/actions.ts:73-79`

**Issue:** Both `createServer` and `updateServer` server actions check subdomain uniqueness with a `findUnique` followed by a separate `create`/`update`. Between these two operations another request could claim the same subdomain, and the database `UNIQUE` constraint would fire — but the error would surface as an unhandled Prisma exception (not a user-friendly "Subdomain is already taken" message). At scale this window is small, but the database will throw a `PrismaClientKnownRequestError` with code `P2002` which is not caught.

**Fix:** Add a Prisma error handler to detect the unique constraint violation and re-throw with a clean message:

```typescript
import { Prisma } from "@prisma/client";

try {
  const server = await db.website.create({ ... });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new Error("Subdomain is already taken");
  }
  throw error;
}
```

---

### WR-06: `prisma/seed.ts` contains a hardcoded personal email address

**File:** `prisma/seed.ts:16`

**Issue:** The seed file contains `where: { email: "sennecools1009@gmail.com" }` — a hardcoded personal email address that will be checked into version control and is visible to anyone with repository access. Seed files are typically committed and shared with teams or open source contributors. Beyond the privacy concern, the seed becomes inoperable for any other developer.

**Fix:** Read the seed target email from an environment variable:

```typescript
const seedEmail = process.env.SEED_USER_EMAIL;
if (!seedEmail) {
  console.error("SEED_USER_EMAIL env var is required");
  await pool.end();
  process.exit(1);
}
const user = await db.user.findUnique({ where: { email: seedEmail } });
```

---

## Info

### IN-01: `isColorDark` has two divergent implementations

**File:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx:294-301`, `src/components/preview/types.ts:43-52`

**Issue:** `page.tsx` defines a local `isColorDark` (line 294) using the formula `(0.299*r + 0.587*g + 0.114*b) / 255 < 0.5`. `src/components/preview/types.ts` exports a different implementation using `(r*299 + g*587 + b*114) / 1000 < 128`. Mathematically equivalent, but `types.ts` also adds `if (!hex) return false` and `if (c.length !== 6) return false` guards that the local version lacks. Passing an empty string or a non-6-character hex to the `page.tsx` version will produce `NaN` comparisons, silently defaulting to `false` (not dark). The canonical utility in `types.ts` should be used everywhere.

**Fix:** Remove the local `isColorDark` from `page.tsx` and import from `@/components/preview/types`:

```typescript
import { isColorDark } from '@/components/preview/types';
```

---

### IN-02: Staff section loads user avatars from an unauthenticated third-party service using unsanitised usernames

**File:** `src/app/[subdomain]/preview-client.tsx:638, 653, 665`

**Issue:** Staff member usernames stored in section settings are interpolated directly into Minotar URLs:

```tsx
<img src={`https://minotar.net/bust/${member.username}/64`} ... />
```

A staff member username containing path separators (e.g. `../../malicious`) could cause unexpected requests. While React renders this as a string inside an `<img src>` attribute (not parsed as HTML), the request is still sent to minotar.net with an arbitrary path. There is no server-side validation that `member.username` matches the Minecraft username character set (`[a-zA-Z0-9_]{3,16}`).

**Fix:** Sanitise the username before constructing the URL, or validate it at the point of input in the settings panel:

```typescript
const safeName = encodeURIComponent(member.username.replace(/[^a-zA-Z0-9_]/g, ""));
<img src={`https://minotar.net/bust/${safeName}/64`} ... />
```

---

### IN-03: `updateWebsiteSchema` defined as `createWebsiteSchema.partial()` — `name` and `subdomain` can both be omitted

**File:** `src/lib/validations/website.ts:16`

**Issue:** `updateWebsiteSchema = createWebsiteSchema.partial()` makes all three fields optional. The `updateServer` server action in `actions.ts` only validates with this schema and then calls `db.website.update({ data: validated })`. If `name` is omitted from the form the update silently strips the name, potentially setting it to `undefined` (Prisma ignores `undefined` keys, so this is safe for now). However if the schema is ever used to validate a PUT body that does need to set fields to null, the `undefined`-vs-`null` distinction could cause confusion. This is low severity but worth noting.

**Fix:** This is acceptable for a settings-form schema. No immediate action required, but document that `undefined` fields are intentionally skipped by Prisma.

---

### IN-04: `formatRelativeTime` function duplicated between `dashboard/page.tsx` and `servers/page.tsx`

**File:** `src/app/(dashboard)/dashboard/page.tsx:58-71`, `src/app/(dashboard)/dashboard/servers/page.tsx:60-73`

**Issue:** Identical `formatRelativeTime` function is copy-pasted in two files. Neither `updatedAt` display uses it in the rendered output on `dashboard/page.tsx` (the info div at line 206 is empty), so this is also dead code in `dashboard/page.tsx`.

**Fix:** Extract to a shared utility (e.g. `src/lib/format.ts`) and import in both places. Remove or populate the empty info `<div>` on `dashboard/page.tsx:206-208`.

---

_Reviewed: 2026-05-08_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
