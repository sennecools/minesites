# Domain Pitfalls

**Domain:** Minecraft server website builder (freemium, Next.js App Router)
**Researched:** 2026-05-07

---

## Critical Pitfalls

### Pitfall 1: Minecraft Status API — Blocking the Page Render

**What goes wrong:** The Minecraft server status fetch (to mcsrvstat.us or equivalent) is placed in the critical render path of the public server page. If the target server is offline, slow, or the API itself is down, the entire page hangs until the request times out. Timeouts on cold serverless functions can reach 30 seconds with no user feedback.

**Why it happens:** The player count feels like "core" data so it gets awaited before rendering. It isn't — it is supplementary data that can fail gracefully.

**Consequences:** Published server pages that intermittently return blank screens or long spinner states. The server's website is broken whenever their Minecraft server goes offline, which is the exact moment visitors most need to see _something_.

**Prevention:**

- Implement the status poll as a Next.js Route Handler (`/api/server-status?ip=...`) with a hard `AbortController` timeout of 3–4 seconds.
- Cache the result in Redis or Next.js `unstable_cache` / `revalidate` for at least 60 seconds (mcsrvstat.us already caches for 5 minutes on their end, so hitting them faster than that is pointless and wasteful).
- On the public page, render the live player count section as a client component that fetches via SWR with a stale fallback — the rest of the page renders immediately from SSR.
- Display "Server offline" or "Status unavailable" explicitly when the API returns a 404 (mcsrvstat.us returns 404, not 200, for offline servers) or when the request times out.

**Detection:** Watch for p99 response times on the public page spiking when test servers go offline. Any page latency above ~500ms that originates from an external fetch is a symptom.

**Relevant phase:** Live player count section implementation (Phase: Minecraft-native sections).

---

### Pitfall 2: Freemium Gating Enforced Only on the Client

**What goes wrong:** The 5-section limit is enforced in the editor UI — the "Add section" button is disabled or a paywall modal is shown — but the underlying API (`PUT /api/servers/[serverId]`) accepts any number of sections without checking the user's plan tier. A user can bypass the limit by sending a direct API request with 10 or 20 sections and the server will persist them.

**Why it happens:** This is the single most commonly reported freemium bypass in security audits. The UI feels like enforcement but it is only presentation. Backend ownership of plan limits is easy to forget when the UI check is working during development.

**Consequences:** Free users accumulate unlimited sections. Revenue is undermined. Existing tenant data violates the invariant you thought you were enforcing, making plan upgrades (and downgrades) unreliable.

**Prevention:**

- The section count limit MUST be re-checked in the `PUT /api/servers/[serverId]` route handler, server-side, before persisting sections.
- Store the user's plan tier on the `User` model in Prisma (a simple `plan: "free" | "pro"` enum is sufficient for v1).
- The check is: if `user.plan === "free" && sections.length > 5`, return `400` with a descriptive error message.
- The UI gate is still correct UX — it just cannot be the only gate.
- Apply the same server-side check to visual effects: if `user.plan === "free"` and any section carries `effectEnabled: true`, strip that flag before saving.

**Detection:** Write a unit test that sends a PUT with 6 sections as a free user and asserts a 400 response. If no test infrastructure exists yet, curl the endpoint directly after signing up with a free account.

**Relevant phase:** Freemium gating (all phases that involve saving sections or effects settings).

---

### Pitfall 3: God-Component Growth — New Sections Worsen the Existing Problem

**What goes wrong:** Each new Minecraft-native section type (player count, server info, staff list, etc.) gets added directly to `src/app/(dashboard)/dashboard/[serverId]/page.tsx`. The file grows from 5,171 lines to 6,000+, then 7,000+. New settings panels, preview helpers, and type definitions are all inlined. Cognitive overhead compounds with every addition.

**Why it happens:** The path of least resistance is to copy-paste an existing section block within the same file. It appears to "work" immediately and skips the question of where extracted components should live.

**Consequences:** Any future developer (or future self) cannot locate code quickly, TypeScript compile times increase, the file exceeds editor rendering limits on some machines, and targeted fixes become high-risk changes. The existing `Date.now()` IDs, mock data, and legacy `colorScheme` field already show how undetected bugs accumulate in files of this size.

**Prevention:**

- Before adding the first new section, extract the existing settings panels into `src/components/sections/settings/[SectionType]Settings.tsx` — one file per section type. The editor page imports them.
- Extract preview renderers into `src/components/sections/preview/[SectionType]Preview.tsx`.
- Define section type interfaces in `src/types/sections.ts` (or `src/components/preview/types.ts`, which already partially exists) rather than locally in the page component.
- Establish this structure as a rule before new sections begin: "adding a section type means creating two new files, not editing the god file."
- The page.tsx orchestration logic (undo/redo, save, drag-and-drop) stays in the page; business logic and rendering move out.

**Detection:** `wc -l src/app/(dashboard)/dashboard/[serverId]/page.tsx` in CI as an informal check. Any PR that increases the line count of that file when it is adding a new section type should be flagged for review.

**Relevant phase:** Every phase that adds section types.

---

## Moderate Pitfalls

### Pitfall 4: Theme System — Runtime CSS Variable Scoping with Tailwind v4

**What goes wrong:** The theme system uses Tailwind v4 CSS custom properties. A developer defines theme tokens using `@theme` (without the `inline` keyword) and then tries to override them per-server by toggling a class on a wrapper element. The tokens resolve to their `:root` values regardless of the class override — the per-server theme has no effect.

**Why it happens:** Tailwind v4's `@theme` directive eagerly resolves variable references at build time unless `@theme inline` is used. The distinction is documented but not obvious. Confirmed by Tailwind maintainers in their own GitHub discussions.

**Consequences:** All server websites look identical regardless of the owner's chosen palette. The theme settings panel appears to work in the editor (where a class toggle updates CSS variables correctly via React state), but the published subdomain page renders with wrong colors.

**Prevention:**

- Use `@theme inline` for any token that needs to be overridden at runtime by a server-specific class or data attribute.
- Structure themes as: a `[data-theme="..."]` or `.theme-[slug]` selector on the page root sets primitive CSS variables (e.g. `--accent`, `--bg`), and `@theme inline` maps those to Tailwind utility classes.
- Test the theme system on the subdomain rendering path (`src/app/[subdomain]/page.tsx`), not only in the dashboard editor, since they render differently.

**Detection:** After implementing, publish two servers with different accent colors and verify the rendered HTML has distinct CSS variable values in the page source.

**Relevant phase:** Theme system implementation.

---

### Pitfall 5: Theme System — Dashboard Styles Bleeding Into Server Pages

**What goes wrong:** The dashboard and the public server page share a global CSS import. Dashboard-specific utility overrides, base resets, or component styles apply on the subdomain route even though they shouldn't. A server website inheriting `zinc-*` neutrals and `cyan-*` accents from the admin dashboard makes it look like a dashboard, not a gaming site.

**Why it happens:** Next.js App Router applies root layout styles to all routes. If the dashboard layout's CSS is imported at the root layout level rather than at the `(dashboard)` route group layout, it leaks.

**Consequences:** The core stated problem of MineSites — "websites feel like dashboards" — is never resolved even after building a theme system.

**Prevention:**

- Isolate dashboard styles strictly to `src/app/(dashboard)/layout.tsx` and its CSS scope.
- The public subdomain layout (`src/app/[subdomain]/layout.tsx`) should have its own minimal base CSS reset — no shared component styles from the dashboard.
- Consider wrapping the subdomain page root element with a reset class (e.g. `not-dashboard`) and writing explicit resets for any global styles that would otherwise inherit.
- Verify by loading the published site as a logged-out user in an incognito window after any CSS change in the dashboard.

**Detection:** Open a published server website in devtools. If Tailwind utilities from `zinc-*` or `cy-*` brand tokens appear on public-facing elements that the theme system should control, isolation has failed.

**Relevant phase:** Theme system and gaming-styled output work.

---

### Pitfall 6: Visual Effects — Hydration Mismatches on Particle/Animation Components

**What goes wrong:** A particle background or parallax animation component references `window`, `canvas`, or generates random values at render time. During SSR, these do not exist or produce different output than on the client, causing a React hydration mismatch. The page either throws a console error (suppressed but still present) or, in strict mode, crashes to an error boundary.

**Why it happens:** `canvas` is a browser API. Random seed values differ between server and client renders. `window.innerWidth` does not exist on the server.

**Consequences:** The visual effect section either fails silently (blank area where particles should be) or triggers a full component tree remount, causing a flash of content. On lower-end devices, the layout shift from a remount is jarring.

**Prevention:**

- Always load particle/canvas components via `dynamic(() => import(...), { ssr: false })`. This is the correct pattern for browser-API-dependent components in Next.js App Router.
- Do not use `Math.random()` or `Date.now()` in render paths of components that are SSR'd — defer these to `useEffect` or to components wrapped in `dynamic(..., { ssr: false })`.
- Wrap particle components in a client boundary (`"use client"`) AND use `dynamic` import — the two are complementary, not interchangeable.
- Show a styled placeholder (matching background color from the theme) as the `loading` prop on the dynamic import so the layout does not shift.

**Detection:** Run the Next.js dev server and look for red "Hydration" warnings in the browser console. Enable React strict mode during development to surface double-render issues early.

**Relevant phase:** Visual effects implementation (particles, parallax — paid tier).

---

### Pitfall 7: Visual Effects — Performance on the Published Page, Not the Editor

**What goes wrong:** Particle animations pass performance testing in the editor because the editor is a small preview pane. On the full-width published subdomain page, the same canvas animation runs on every device that visits the page, including mobile phones with limited GPU and CPU. 60fps particles on a 1920px canvas is expensive.

**Why it happens:** Development and testing happen on developer hardware. The published output is a public page that needs to work on Minecraft players' gaming rigs — but also on their phones.

**Consequences:** Published server pages with active particle effects drop frames on mid-range mobile, drain battery, and feel laggy. The very thing meant to make the site look premium makes it feel broken.

**Prevention:**

- Cap particle count by viewport size: detect `window.innerWidth < 768` and halve the particle count or disable effects entirely.
- Use `requestAnimationFrame` budgeting or tsparticles' built-in FPS limiter (`fpsLimit: 60`) to prevent runaway renders.
- Provide an effect intensity setting in the section panel (Low / Medium / High) rather than a single "on/off" toggle.
- Test the published page on a real Android mid-range device before shipping the paid tier.

**Detection:** Chrome DevTools Performance panel on the subdomain page with particles active. Any frame above 16ms (60fps budget) is a regression.

**Relevant phase:** Visual effects implementation.

---

### Pitfall 8: next-auth Beta — Session Callback Behavior Changed from v4

**What goes wrong:** Code written assuming v4 NextAuth session callback behavior silently fails in v5 beta. Specifically: in v5, `auth()` ignores the `session()` callback — it returns whatever the `jwt()` callback provides. Custom fields added in `session()` (e.g. `user.plan`, `user.id`) do not appear in the server-side session object.

**Why it happens:** This is a documented but counterintuitive breaking change in NextAuth v5. The API surface looks identical but the execution model changed. Developers copying v4 patterns into v5 code miss this.

**Consequences:** `session.user.id` is undefined in server components and route handlers that call `auth()`. Ownership checks that depend on session user ID silently pass (or fail) incorrectly. Freemium plan gating that reads `session.user.plan` always reads `undefined`.

**Prevention:**

- Extend user data through the `jwt()` callback, not `session()`, when using v5.
- Add TypeScript module augmentation for `Session` and `JWT` types to get compile-time errors when expected fields are missing.
- After any `next-auth` version bump, immediately verify that `session.user.id` is present in a server component by logging it and asserting it is non-null.
- Pin to a specific beta version in `package.json` and update deliberately with a checklist, not via `npm update`.

**Detection:** Add a startup assertion: if `AUTH_SECRET` is set but `auth()` returns a session where `user.id` is undefined for a logged-in user, throw with a clear message.

**Relevant phase:** Any phase that adds per-user authorization (freemium gating reads session plan, server ownership checks read session user ID).

---

## Minor Pitfalls

### Pitfall 9: Minecraft Status API — Arbitrary IP Polling Abuse

**What goes wrong:** The `/api/server-status` endpoint accepts any IP the client provides and proxies it to mcsrvstat.us. A malicious actor uses MineSites as a free Minecraft server scanner by making thousands of requests with different IPs.

**Why it happens:** The endpoint is unauthenticated (or at least unrestricted) to support preview mode for the public page. Adding SSRF protection is not top of mind during initial implementation.

**Consequences:** MineSites' IP gets rate-limited or banned by mcsrvstat.us. All users lose player count functionality. mcsrvstat.us has a documented rate limit.

**Prevention:**

- Require that the IP provided matches a `Server` record owned by a real user — only poll IPs that are registered in the database.
- Rate-limit the endpoint itself (e.g., 1 request per server per 60 seconds, using the server's database ID as the key, not the IP).
- Always set a `User-Agent` header identifying MineSites when calling mcsrvstat.us (required by their API; missing it returns 403).

**Detection:** Monitor the response status from mcsrvstat.us — any 429 or 403 rate limit response should trigger an alert.

**Relevant phase:** Live player count section implementation.

---

### Pitfall 10: Mock Data Surviving Into Production Sections

**What goes wrong:** The `mockServer` object and `initialSections` placeholder content (existing debt documented in CONCERNS.md) are still present when new Minecraft-native section types are added. New section types reference `mockServer.players` or `mockServer.version` for their preview rendering in the editor, hard-coding values that are always wrong.

**Why it happens:** The easiest way to render a preview of a new "Live Player Count" section in the editor is to grab `mockServer.players`. It shows the right shape of data immediately.

**Consequences:** The editor always shows "247 players" regardless of what the server actually reports. Server owners see demo data in their own editor and report it as a bug. This is already documented as a HIGH severity concern.

**Prevention:**

- Remove `mockServer` before building any new section that displays live data. Initialize `serverData` from the API response only, using `null` until loaded.
- For the editor preview of live-data sections, show a skeleton / placeholder widget ("-- / -- players") rather than a static number. The live data is only available on the published page.

**Detection:** Search the codebase for `mockServer` references before merging any PR that adds a player-count section. Zero references should be the target.

**Relevant phase:** Minecraft-native sections (specifically live player count).

---

### Pitfall 11: Section Settings Zod Validation Gap at Save Time

**What goes wrong:** New section types add settings fields to the JSON blob saved in `Section.settings`. No Zod schema validates the shape before it is persisted. A UI bug (wrong type, missing required field, undefined coerced to string) silently writes malformed data to the database. On reload, the section renders with `undefined` values and the editor shows blank inputs.

**Why it happens:** The current pattern casts settings with `as unknown as ConcreteType` rather than validating. Adding a new field to a section panel without updating a validation schema means the gap widens silently.

**Consequences:** Data corruption in section settings is invisible until the page is reloaded. Debugging requires inspecting raw database JSON. Without test coverage, regressions go undetected across deploys.

**Prevention:**

- Define a Zod schema for each section type's settings in `src/lib/validations/sections/`. Export the inferred type from the same file.
- Validate incoming section settings in the `PUT /api/servers/[serverId]` route handler before calling `db.section.createMany`. Return a 400 with the Zod error if validation fails.
- Parse settings on the read path too: when transforming DB data for the client, parse through the schema and log (or throw) on unexpected shapes.

**Detection:** Intentionally submit a settings object with a missing required field via the API and observe whether the server accepts it. If it does, validation is missing.

**Relevant phase:** Every phase that introduces a new section type with new settings fields.

---

## Phase-Specific Warnings

| Phase Topic               | Likely Pitfall                                             | Mitigation                                                                    |
| ------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Live player count section | API blocks page render; offline servers cause blank page   | Server-side Route Handler with timeout + client-side SWR with stale fallback  |
| Live player count section | Endpoint used as arbitrary IP scanner                      | Validate IP against DB; per-server rate limit                                 |
| Live player count section | mockServer.players used in editor preview                  | Remove mockServer first; show skeleton in editor                              |
| Freemium section limit    | Client-only gate trivially bypassed                        | Re-check section count server-side in PUT handler                             |
| Freemium effects gate     | Effects flag bypassed via direct API call                  | Strip effectEnabled on server-side if user.plan === "free"                    |
| Theme system              | Tailwind v4 @theme without inline breaks runtime overrides | Use @theme inline for all per-server overrideable tokens                      |
| Theme system              | Dashboard styles leak into server pages                    | Isolate dashboard CSS to (dashboard) route group layout                       |
| Theme system              | FOUC on first load when theme is user-specific             | Inject theme CSS variables server-side from DB; do not rely on JS to set them |
| Visual effects            | Hydration mismatch on canvas/particle components           | dynamic(..., { ssr: false }) for all canvas components                        |
| Visual effects            | Frame drops on mobile devices                              | Cap particle count by viewport; FPS limiter; test on real Android device      |
| God-component growth      | Every new section type added inline to 5,171-line file     | Extract settings panels before adding new section types                       |
| God-component growth      | Local type definitions drift from preview types            | Consolidate types into src/types/sections.ts before adding types              |
| next-auth beta            | session() callback silently ignored; user.id undefined     | Extend session via jwt() callback; assert user.id non-null on startup         |
| Section settings          | New fields written as malformed JSON                       | Zod schema per section type; validate at API layer on write and read          |

---

## Sources

- mcsrvstat.us API behavior (caching, 404 for offline, User-Agent requirement): https://api.mcsrvstat.us/ and https://mcsrvstat.us/faq
- mcstatus.io rate limiting documentation: https://mcstatus.io/docs
- Tailwind v4 @theme inline requirement for runtime variable overrides: https://github.com/tailwindlabs/tailwindcss/discussions/15600
- Tailwind v4 theming best practices discussion: https://github.com/tailwindlabs/tailwindcss/discussions/18471
- Next.js hydration error documentation: https://nextjs.org/docs/messages/react-hydration-error
- Next.js dynamic import with ssr:false: https://nextjs.org/docs/pages/guides/lazy-loading
- Freemium client-side bypass case study: https://www.onsecurity.io/blog/pentest-findings-bypassing-freemium-through-client-side-security-controls/
- NextAuth v5 session callback change: https://authjs.dev/getting-started/migrating-to-v5
- NextAuth v5 session extension issues: https://github.com/nextauthjs/next-auth/issues/12714
- next-themes FOUC prevention: https://github.com/pacocoursey/next-themes
- Existing codebase concerns: /home/senne/git/minesites/.planning/codebase/CONCERNS.md
