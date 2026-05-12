---
phase: 08
fixed_at: 2026-05-12T00:00:00Z
review_path: .planning/phases/08-dashboard-public-site/08-REVIEW.md
iteration: 1
findings_in_scope: 8
fixed: 7
skipped: 1
status: partial
---

# Phase 8: Code Review Fix Report

**Fixed at:** 2026-05-12
**Source review:** .planning/phases/08-dashboard-public-site/08-REVIEW.md
**Iteration:** 1

**Summary:**

- Findings in scope: 8 (1 Critical + 7 Warning)
- Fixed: 7
- Skipped: 1

All fixes verified with `npx tsc --noEmit` exiting 0 in isolation (per
fix) and a final cumulative pass exiting 0 across the full project. The
MineSites project has no test suite — typecheck is the only automated
gate.

## Fixed Issues

### CR-01: Nested interactive elements in WebsiteCard — invalid HTML, hydration warning

**Files modified:** `src/components/dashboard/website-card.tsx`
**Commit:** `90185dc`
**Applied fix:** Replaced the outer `<Link href={...}>` wrapper with a
`motion.div` carrying `role="link"`, `tabIndex={0}`, `aria-label`,
`onClick={navigate}`, and `onKeyDown` (Enter/Space → `navigate()`).
`useRouter().push(/dashboard/${id})` drives navigation programmatically.
The inner "Visit live site" `<a>` and the `MoreHorizontal`
`<motion.button>` are now valid first-class children — no more
validateDOMNesting warnings, no more parser-level reparenting, no more
hydration mismatch risk. Pre-existing `e.stopPropagation()` on the
Visit anchor and `MoreHorizontal` button were preserved; a
`focus:ring-2 focus:ring-cyan-500` outline style was added to the
`motion.div` so keyboard focus has a visible indicator.

### WR-01: Form `<label>` elements have no association with their inputs (a11y)

**Files modified:**

- `src/components/dashboard/connections-modal.tsx`
- `src/app/(dashboard)/dashboard/create-website-dialog.tsx`
- `src/app/(dashboard)/dashboard/[websiteId]/server-settings.tsx`

**Commit:** `c7b0fa5`
**Applied fix:** Each `<label>` now has `htmlFor=...` paired with an
explicit `id=...` on the corresponding `<Input>` / `<Textarea>`. The
`Input` and `Textarea` primitives forward `id` via prop spread (verified
in `src/components/ui/input.tsx` and `textarea.tsx`), so the `id`
attribute lands on the underlying DOM element rather than being eaten
by `{...register(...)}`. Connections-modal field ids are namespaced
per `ServerForm` instance via `mcserver-${initial?.id ?? "new"}-<field>`
so multiple forms in the modal (read rows in edit mode + the persistent
add row) cannot collide on DOM ids. Also dropped the dead
`valueAsNumber: true` on the port `register(...)` call (covers IN-02
opportunistically — react-hook-form ignores `valueAsNumber` when
`setValueAs` is also supplied).

### WR-03: Type definitions for `WebsiteData` are triplicated (dashboard list shape)

**Files modified:**

- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/dashboard/servers/page.tsx`

**Commit:** `7b7965c`
**Applied fix:** Both pages now import `WebsiteCardData` (the single
canonical export from `@/components/dashboard`) and bind their
`useState<WebsiteCardData[]>` to it. The duplicated local `WebsiteData`
interface declarations are removed. Per guardrail: the
similarly-named `WebsiteData` in `src/components/preview/types.ts` is a
DIFFERENT shape (public-site render data with `players?, maxPlayers?,
version?`) and is intentionally untouched. Future additions to
`GET /api/websites` response shape now require a single edit in
`website-card.tsx`.

### WR-04: Two list pages duplicate `loadServers` + error UI verbatim

**Files modified:**

- `src/components/dashboard/use-websites.ts` (new, 64 lines)
- `src/components/dashboard/index.ts` (+1 export line)
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/dashboard/servers/page.tsx`

**Commit:** `d183f9a` (combined with WR-05)
**Applied fix:** Extracted the fetch loop into `useWebsites()` at
`src/components/dashboard/use-websites.ts` (per the guardrail — the
hook lives in the established dashboard barrel rather than spawning a
new `src/lib/hooks/` directory). The hook returns
`{ websites, isLoading, error, refetch }`. The implementation:

- Wraps the fetch in `useCallback` with an `AbortController` so
  unmount + rapid re-mount cannot race a stale response into state.
- Swallows `AbortError` (DOMException with `name === "AbortError"`)
  explicitly so a cancelled fetch never paints a user-visible error.
- Exposes `refetch()` as a stable callback (no signal — manual refetch
  always overwrites the visible state).

Both list pages collapse from ~22 lines of fetch plumbing each down to
a single hook call. Net delta: -50 lines across the two pages, +64 in
the new hook = +14 (most of which is doc comment + AbortController
hardening that wasn't in the original).

### WR-05: `Retry` button uses `window.location.reload()` instead of refetching

**Files modified:**

- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/dashboard/servers/page.tsx`

**Commit:** `d183f9a` (folded into WR-04's commit since WR-05 trivially
falls out of `useWebsites`'s `refetch`)
**Applied fix:** `onClick={() => window.location.reload()}` becomes
`onClick={refetch}` on both pages. The sidebar `useSidebarStore` state,
the `createDialogOpen` flag, and any other surrounding client state now
survive a failure-and-retry. A full HTML round-trip is no longer paid
to recover from a single failed API call.

### WR-06: Orphaned `hero-section.tsx` still contains a CSS-injection vector

**Files modified:** `src/components/sections/hero-section.tsx`
**Commit:** `be415ca`
**Applied fix:** Per the guardrail (orphan slated for SECT-04 hero
migration; do NOT delete), inlined the same `safeBackgroundUrl(url)`
protocol guard that the live `HeroRender` already uses. Any value that
does not parse as an absolute URL or carries a non-http(s) protocol
returns `undefined`, falling back to the no-image gradient branch. A
settings value like `img.png"); background-image: url("evil` no longer
breaks out of the CSS context. A future contributor who wires this
module back up inherits the protection by default. Implementation
mirrors `src/components/sections/render/hero-render.tsx` lines 10-18
verbatim so the two paths cannot drift.

### WR-07: Connections modal "Manage Servers" trigger does not match UI-SPEC variant

**Files modified:** `src/app/(dashboard)/dashboard/[websiteId]/page.tsx`
**Commit:** `ad2f694`
**Applied fix:** Per guardrail, did NOT introduce a `Button` primitive
dependency in the editor god-component — the surrounding Preview/Publish
cluster buttons are raw `motion.button` carry-forwards, and the
established pattern is to match their styling tokens directly rather
than pull in a new component dependency. Added the missing chip styling
tokens — `bg-white`, `border border-zinc-200`, `shadow-sm`,
`hover:bg-zinc-50`, `hover:border-zinc-300`, `hover:text-zinc-900` — to
match the `Button` `variant="secondary"` look defined in
`src/components/ui/button.tsx` (white bg + zinc border + zinc-50 hover
fill + zinc-300 hover border). `font-normal` (Phase 8 NEW-component
typography rule per UI-SPEC §Typography) is preserved; the adjacent
Preview/Publish carry-forward buttons keep `font-medium` as documented
in 08-04-SUMMARY.md. Inline comment explains the rationale so the
pattern is not unwound by a future contributor pulling in `Button`.

## Skipped Issues

### WR-02: Dead modules `server-actions.tsx` and `server-settings.tsx` — never imported

**Files:**

- `src/app/(dashboard)/dashboard/[websiteId]/server-actions.tsx`
- `src/app/(dashboard)/dashboard/[websiteId]/server-settings.tsx`

**Reason:** `skipped: locked by CONTEXT D-15 (intentional orphans,
follow-up wiring)`. The phase guardrail (see fixer prompt) makes this
explicit: both modules are intentionally kept orphaned in this phase
because they will be wired in a follow-up. Deleting them would
contradict the locked phase decision. WR-01's label/htmlFor fix WAS
applied to `server-settings.tsx` regardless — that addresses an
accessibility regression inside the file without touching its
orphaned-vs-mounted status, and the file is already on the fix path
for the WR-01 commit.

**Original issue:** Repository-wide grep finds zero importers of these
two modules. They contain real action calls (`deleteWebsite`,
`togglePublished`, `updateWebsite`) and references to a stale
`WebsiteActionsProps` interface. They will rot silently because nothing
exercises them in CI. The reviewer's "delete or mount" decision is
deferred to the SECT-04 follow-up phase per CONTEXT D-15.

---

_Fixed: 2026-05-12_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
