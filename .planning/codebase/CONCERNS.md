# Codebase Concerns

**Analysis Date:** 2026-05-07

---

## Technical Debt

### Massive God-Component: Server Editor Page

- **Severity:** HIGH
- **Location:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` (5171 lines)
- **Description:** The entire server editor — all section type definitions (15+ types), all settings panels, preview rendering helpers, undo/redo logic, save/load logic, and the main page component — lives in one file. This creates extreme cognitive overhead for any change, makes targeted testing impossible, and produces large parse/compile times. Adding a new section type requires editing this single massive file.
- **Fix approach:** Extract each section settings panel into its own component in `src/components/sections/settings/`, extract preview helpers into `src/components/sections/preview/`, and extract the editor shell into a `ServerEditor` component.

### Mock Data Hard-Coded in Production Editor

- **Severity:** HIGH
- **Location:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` lines 57–68, 741, 755, 773, 788, 4307
- **Description:** A `mockServer` object is declared at module scope with static values (`players: 247`, `maxPlayers: 500`, `version: "1.20.4"`, `published: true`). `serverData` state is initialized from `mockServer` and overwritten on load. Several preview renders still reference `mockServer.players` and `mockServer.version` directly, meaning player count and version shown in the editor preview are always wrong hardcoded values, regardless of what the user entered.
- **Fix approach:** Remove `mockServer` entirely. Derive all state from the API response. Use `null` or `undefined` as the initial state and show a skeleton loader until data arrives.

### `initialSections` Placeholder Content in Production

- **Severity:** MEDIUM
- **Location:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` lines 554–740
- **Description:** `initialSections` is a large hardcoded array of demo content ("EpicCraft Network", "All the Mods 10", etc.) used as the initial state. If the API call fails or returns empty sections, users see this demo content as if it's their real data. The actual server data replaces it only on successful load.
- **Fix approach:** Initialize `sections` as an empty array (`[]`). Display an empty state UI when no sections are returned from the API.

### Section IDs Generated with `Date.now()` (Client-Side)

- **Severity:** MEDIUM
- **Location:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` lines 4484, 3022, 3323
- **Description:** New sections added in the editor use `Date.now().toString()` as their ID. Since sections are deleted and recreated on every save (delete-all then createMany in the API), this works today, but IDs are not stable between edits and could collide if two sections are created within the same millisecond. It also makes debugging and external referencing impossible.
- **Fix approach:** Use `crypto.randomUUID()` (available in modern browsers and Node 19+) or a `nanoid` call for client-side IDs.

### "Publish" Button Actually Just Saves

- **Severity:** LOW
- **Location:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` line 4612
- **Description:** The primary action button in the editor is labelled "Publish" but calls `saveServer()`, which is a PUT to the API that updates sections and server settings — it does NOT change the `published` flag. The actual publish/unpublish toggle is hidden in a dropdown menu in `ServerActions`. This is confusing UX but also a latent source of support issues.
- **Fix approach:** Rename the button to "Save" and make publish/unpublish explicitly separate, or wire the button to also set `published: true` on first save.

### `colorScheme` Legacy Field in Section Settings

- **Severity:** LOW
- **Location:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` line 239 (comment: "Legacy - being replaced by per-section background settings")
- **Description:** `SectionSettings.colorScheme` is acknowledged as legacy in a code comment but is still present in type definitions and carried through data transformations. It creates confusion about which field controls appearance.
- **Fix approach:** Remove `colorScheme` from `SectionSettings`, migrate any persisted data during a database migration, and delete its references.

### Multiple Abandoned Marketing Page Versions

- **Severity:** LOW
- **Location:** `src/app/(marketing)/page-v2.tsx`, `page-v3.tsx`, `page-v4.tsx`, `page-v5.tsx`
- **Description:** Four alternate versions of the marketing landing page exist in the codebase alongside the active `page.tsx`. None are routed. They add dead weight to the bundle analysis, create confusion about which is authoritative, and will drift out of sync with design changes.
- **Fix approach:** Delete unused versions. If historical reference is needed, use git history.

---

## Security Concerns

### Preview Mode Bypasses `published` Check with No Auth

- **Severity:** HIGH
- **Location:** `src/app/[subdomain]/page.tsx` lines 13, 26
- **Description:** Any user on the internet can view an unpublished server page by appending `?preview=true` to the URL. There is no check that the requester is the server owner or even an authenticated user. This means all unpublished servers' content is publicly accessible if the subdomain is guessed.
- **Fix approach:** In `src/app/[subdomain]/page.tsx`, when `isPreviewMode` is true, call `auth()` and verify that `session.user.id === server.userId` before serving content.

### File Upload: MIME Type Validated from `Content-Type` Header Only

- **Severity:** MEDIUM
- **Location:** `src/app/api/upload/route.ts` lines 20–25
- **Description:** The upload endpoint validates `file.type`, which is the MIME type sent by the browser — not verified against actual file magic bytes. A malicious actor can rename a file and set a spoofed content type to bypass the allowlist. This could allow upload of SVG files with embedded JS (which are not in the allowlist, but the validation is trivially bypassable for other payloads).
- **Fix approach:** Add server-side magic byte verification using a library like `file-type` after reading the file buffer, in addition to the MIME check.

### File Deletion Ownership Check is URL-String–Based

- **Severity:** MEDIUM
- **Location:** `src/app/api/upload/route.ts` lines 73–76
- **Description:** Ownership of a blob is verified by checking whether the URL string contains `/${session.user.id}/`. This is a fragile check — if Vercel Blob's URL structure changes, or if a user ID appears in another part of the URL path, the check could be bypassed or falsely block a legitimate delete.
- **Fix approach:** Store uploaded blob URLs in the database linked to the owning user. On delete, look up the URL in the database and verify `userId` before calling `del()`.

### No Rate Limiting on Auth or API Endpoints

- **Severity:** HIGH
- **Location:** `src/app/api/auth/register/route.ts`, `src/app/api/servers/route.ts`, `src/app/api/discord/invite/route.ts`
- **Description:** No rate limiting is applied to any API route. The registration endpoint can be spammed to create unlimited accounts. The Discord invite endpoint proxies the Discord API and could be abused to enumerate invite codes or exhaust Discord API quotas. The servers endpoint has no per-user server count limit.
- **Fix approach:** Add rate limiting middleware (e.g., `@upstash/ratelimit` with Redis, or Vercel's built-in edge rate limiting). Apply stricter limits to auth routes (e.g., 5 requests/minute per IP) and proxied external API routes.

### No Email Verification on Registration

- **Severity:** MEDIUM
- **Location:** `src/app/api/auth/register/route.ts`
- **Description:** Users can register with any email address and immediately access the dashboard. No verification flow exists (`emailVerified` is in the schema but never set for credential-based users). This enables account enumeration and spam account creation.
- **Fix approach:** Send a verification email on registration and require `emailVerified !== null` before allowing dashboard access.

### OAuth Provider Secrets Use Non-Null Assertion (`!`)

- **Severity:** LOW
- **Location:** `src/lib/auth.config.ts` lines 8–13
- **Description:** `process.env.DISCORD_CLIENT_ID!` etc. use TypeScript non-null assertions. If env vars are missing at runtime, the value is `undefined` and NextAuth will silently fail or produce cryptic errors rather than a clear startup error.
- **Fix approach:** Validate all required environment variables at startup (e.g., with `zod` schema validation of `process.env`). Throw with a descriptive message if any are missing.

---

## Performance Risks

### Delete-All-Then-Recreate Sections on Every Save

- **Severity:** MEDIUM
- **Location:** `src/app/api/servers/[serverId]/route.ts` lines 93–116
- **Description:** Every save operation deletes all sections for a server and recreates them with `createMany`. For servers with many sections this is inefficient, and more critically it prevents partial saves — if `createMany` fails, all sections are lost (within the transaction, so they'd rollback, but the user gets an unhelpful error). It also resets `section.createdAt` on every save.
- **Fix approach:** Implement upsert logic: compute adds, updates, and deletions from a diff, and apply targeted operations. Prisma supports `upsert` and `deleteMany` with `notIn`.

### No Pagination on Server or Section Queries

- **Severity:** MEDIUM
- **Location:** `src/app/api/servers/route.ts` line 13 (`findMany` with no `take`), `src/app/api/servers/[serverId]/route.ts` line 22 (`include: { sections: ... }`)
- **Description:** `db.server.findMany` returns all servers for a user with no limit. `db.server.findUnique` includes all sections with no limit. For power users with many servers or very large section counts, this will cause slow responses and high memory usage.
- **Fix approach:** Add `take` limits and cursor-based or offset pagination to list endpoints. Limit sections returned per server (a reasonable max is 20–30).

### Framer Motion on Dashboard Page with Many Sections

- **Severity:** LOW
- **Location:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` — Reorder, AnimatePresence used throughout
- **Description:** `framer-motion`'s `Reorder` component is used to handle section drag-and-drop. With many sections and nested AnimatePresence blocks, this creates a high animation layout-effect cost, particularly on lower-end devices.
- **Fix approach:** Audit animation usage and use `layout="position"` instead of the default layout animations where possible. Consider deferring non-critical animations with `lazy: true`.

### External Image Requests to `minotar.net` Without Caching

- **Severity:** LOW
- **Location:** `src/app/[subdomain]/preview-client.tsx` lines 806, 821, 833
- **Description:** Staff member avatars are fetched directly from `https://minotar.net/bust/{username}/64` on every page load. If minotar.net is slow or down, staff sections will fail to render avatars, and each unique username causes a separate uncached request.
- **Fix approach:** Route requests through a Next.js image optimization route (`/api/avatar?username=...`) that caches results, or use Next.js `<Image>` with the `minotar.net` domain in `remotePatterns`.

---

## Missing Infrastructure

### No Error Boundaries

- **Severity:** HIGH
- **Location:** All client components — no `ErrorBoundary` wrappers exist anywhere in `src/`
- **Description:** If any client component throws during render (e.g., bad section settings from the database, failed JSON parse), the entire page crashes to a blank screen. There is no error boundary to catch and display a useful fallback.
- **Fix approach:** Add `ErrorBoundary` components at the layout level (`src/app/(dashboard)/layout.tsx`, `src/app/[subdomain]/layout.tsx`) and around the section renderer in `preview-client.tsx`.

### No Structured Logging or Error Tracking

- **Severity:** HIGH
- **Location:** All API routes use `console.error(...)` — `src/app/api/servers/route.ts`, `src/app/api/servers/[serverId]/route.ts`, `src/app/api/upload/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/discord/invite/route.ts`
- **Description:** All server-side errors are logged only to `console.error`. In a production serverless environment, these logs are ephemeral and difficult to search. There is no error aggregation (Sentry, Datadog, etc.) and no structured log format, making incident diagnosis very difficult.
- **Fix approach:** Integrate Sentry (`@sentry/nextjs`) for automatic error capture on both server and client. Replace scattered `console.error` with a structured logger.

### No Health Check Endpoint

- **Severity:** MEDIUM
- **Location:** `src/app/api/` — no `/health` or `/ping` route
- **Description:** There is no endpoint for uptime monitors or load balancers to probe. Database connectivity is never checked proactively.
- **Fix approach:** Add `src/app/api/health/route.ts` that runs a lightweight `db.$queryRaw('SELECT 1')` and returns `{ status: "ok" }` or a 503.

### No `robots.txt` or `sitemap.xml`

- **Severity:** LOW
- **Location:** `src/app/` — no `robots.txt` or `sitemap.xml` route handlers
- **Description:** Published server sites (e.g., `epiccraft.minesites.net`) have no robots or sitemap directives. This may result in search engines indexing preview or unpublished pages, or failing to index published ones efficiently.
- **Fix approach:** Add `src/app/robots.ts` and `src/app/sitemap.ts` using Next.js metadata file conventions. For the subdomain routing pattern, consider per-subdomain robots directives.

### README Contains Only Default Create-Next-App Content

- **Severity:** LOW
- **Location:** `README.md`
- **Description:** The README has not been updated from the scaffold template. It contains no setup instructions, no list of required environment variables, no deployment guidance, and no project description. A new contributor has no reference for getting started.
- **Fix approach:** Document required env vars (`DATABASE_URL`, `AUTH_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BLOB_READ_WRITE_TOKEN`), local setup steps, and the subdomain routing setup for local development.

---

## Scalability Concerns

### No Per-User Server Count Limit

- **Severity:** MEDIUM
- **Location:** `src/app/(dashboard)/dashboard/actions.ts` `createServer()` function
- **Description:** A user can create an unlimited number of servers. The pricing page (`src/app/(marketing)/pricing/page.tsx`) mentions plan tiers and limits ("Unlimited server sites" on higher tiers), but no enforcement exists in the backend. Any user can create as many servers as they want regardless of plan.
- **Fix approach:** Implement a plan/tier system in the database (`User.plan` field). In `createServer()`, count the user's existing servers and reject creation if the count exceeds the plan limit.

### Subdomain Routing Does Not Work in Local Development

- **Severity:** MEDIUM
- **Location:** `src/middleware.ts` lines 11–22
- **Description:** The middleware explicitly skips subdomain extraction for `localhost`. This means the subdomain preview feature (`[subdomain]/page.tsx`) cannot be tested locally at all without modifying `/etc/hosts`. This creates a gap between development and production behavior and makes it hard to catch subdomain-related bugs early.
- **Fix approach:** Document a local development workaround (e.g., using `localtest.me` or a local DNS entry). Consider supporting a `?subdomain=xxx` query param fallback when on localhost for easier local testing.

### JSON Blob for All Section Settings (No Schema Enforcement at DB Level)

- **Severity:** MEDIUM
- **Location:** `prisma/schema.prisma` — `Section.settings Json`, `Server.navbar Json`, `Server.theme Json`
- **Description:** All section configuration is stored in a single `Json` column with no schema validation at the database level. If the application writes malformed settings (e.g., wrong types from a UI bug), the database accepts it silently. The application then must defensively handle every possible shape of data, which is currently done inconsistently (many places cast with `as unknown`).
- **Fix approach:** While Postgres `jsonb` columns don't enforce schema, add Zod validation on both the write path (before saving) and the read path (when transforming for the client). Define section settings schemas in `src/lib/validations/` per section type.

### Undo/Redo History Stored Entirely in Memory

- **Severity:** LOW
- **Location:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` lines 4297–4298 (`history`, `future` state)
- **Description:** The undo/redo feature stores up to 20 snapshots of the full `sections` array in component state. For servers with many large sections (each with images, settings objects), this means up to 20 full copies of potentially large state objects in memory. On low-memory devices, this can cause degraded performance.
- **Fix approach:** Store diffs (patches) rather than full snapshots. Libraries like `immer` with `enablePatches()` can produce lightweight inverse patches for efficient undo/redo.

---

## Dependency Risks

### `next-auth` Is a Pre-Release Beta

- **Severity:** HIGH
- **Location:** `package.json` — `"next-auth": "5.0.0-beta.30"`
- **Description:** The authentication library is pinned to a beta release. Beta software can have breaking API changes between minor versions, undiscovered security vulnerabilities, and may not receive long-term security patches. Auth code is a high-risk surface.
- **Fix approach:** Monitor the NextAuth v5 stable release timeline. Pin to the latest beta and test on every dependency update. Consider adding automated Dependabot alerts.

### `next` Version 16 Is Non-Standard

- **Severity:** MEDIUM
- **Location:** `package.json` — `"next": "16.1.6"`
- **Description:** As of the analysis date, Next.js stable is in the 14–15 range. Version 16 may be an unreleased or canary build, which carries the same risks as other pre-release software (API instability, unpatched bugs).
- **Fix approach:** Verify this is intentional and track its stability. If it is a canary or internal build, document the rationale.

### No `.env.example` File

- **Severity:** MEDIUM
- **Location:** Project root — no `.env.example` or equivalent
- **Description:** The repository has no documented list of required environment variables. A developer cloning the repo has no reference for what to configure, and missing vars cause cryptic runtime failures rather than clear startup errors.
- **Fix approach:** Add `.env.example` with all required variable names (no values) and update README to reference it.

---

## Code Quality Issues

### `Date.now()` Used as Section ID in Client State

- **Severity:** MEDIUM
- **Location:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` line 4484
- **Description:** New sections created in the editor use `Date.now().toString()` as their client-side ID. While sections are deleted and recreated on save so this does not produce duplicate DB IDs, the ID is unstable across re-opens of the editor and could theoretically collide. It also doesn't match the `cuid()` format the database uses for persisted sections, creating a visual inconsistency when debugging.
- **Fix approach:** Use `crypto.randomUUID()` for consistency with the ID format produced by Prisma.

### Duplicate Type Definitions Across Editor and Preview

- **Severity:** MEDIUM
- **Location:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` (local types) vs `src/app/[subdomain]/preview-client.tsx` (local types) vs `src/components/preview/types.ts`
- **Description:** Section-related types (`Section`, `HeroSettings`, `StatsServer`, `GalleryImage`, etc.) are defined locally in both the editor page and the preview client. `src/components/preview/types.ts` exists but appears underused. This leads to type drift where the editor and preview can have different understandings of the same data shape.
- **Fix approach:** Consolidate all section type definitions into `src/components/preview/types.ts` or a new `src/types/sections.ts` file, and import from there in both the editor and preview client.

### Inconsistent `<img>` vs `next/image` Usage

- **Severity:** LOW
- **Location:** `src/app/[subdomain]/preview-client.tsx` (multiple `<img>` tags), `src/components/ImageUpload.tsx` line 116, `src/components/ui/avatar.tsx` line 31
- **Description:** External images (Discord guild icons, Minotar avatars, user-uploaded images) are rendered with bare `<img>` tags rather than Next.js `<Image>`. This means no automatic optimization, no lazy loading defaults, no size constraints, and potential layout shift.
- **Fix approach:** Configure `remotePatterns` in `next.config.ts` for `cdn.discordapp.com`, `minotar.net`, and the Vercel Blob host. Replace `<img>` with `next/image` `<Image>` for external images.

### No Input Sanitization for User-Defined URLs in Section Settings

- **Severity:** MEDIUM
- **Location:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` — image URL inputs throughout section settings panels
- **Description:** Users can enter arbitrary URLs into image background fields. These are stored and then injected into inline `style={{ backgroundImage: "url(...)" }}`. While Next.js's React rendering prevents direct script injection, there is no validation that the entered URL is a valid HTTP/HTTPS URL, which could lead to unexpected `data:` URL rendering or `javascript:` pseudo-protocol misuse depending on browser handling.
- **Fix approach:** Validate that image URL inputs start with `https://` before saving (server-side validation in the PUT handler in `src/app/api/servers/[serverId]/route.ts`).

### No Tests of Any Kind

- **Severity:** HIGH
- **Location:** Entire `src/` directory — no `.test.ts`, `.spec.ts`, or test infrastructure files
- **Description:** There are no unit tests, integration tests, or end-to-end tests. All business logic (auth, server creation, subdomain routing, section management) is completely untested. Regressions will only be caught by manual testing.
- **Fix approach:** Add Vitest for unit tests. Start with critical path coverage: auth validation (`src/lib/validations/`), server action authorization (`src/app/(dashboard)/dashboard/actions.ts`), and the API route ownership checks (`src/app/api/servers/[serverId]/route.ts`).

---

*Concerns audit: 2026-05-07*
