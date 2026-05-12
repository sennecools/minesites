---
phase: 08-dashboard-public-site
reviewed: 2026-05-12T00:00:00Z
depth: standard
files_reviewed: 15
files_reviewed_list:
    - src/app/(dashboard)/dashboard/[websiteId]/page.tsx
    - src/app/(dashboard)/dashboard/[websiteId]/server-actions.tsx
    - src/app/(dashboard)/dashboard/[websiteId]/server-settings.tsx
    - src/app/(dashboard)/dashboard/create-website-dialog.tsx
    - src/app/(dashboard)/dashboard/page.tsx
    - src/app/(dashboard)/dashboard/servers/page.tsx
    - src/app/[subdomain]/layout.tsx
    - src/app/[subdomain]/page.tsx
    - src/app/api/websites/route.ts
    - src/components/dashboard/connections-modal.tsx
    - src/components/dashboard/index.ts
    - src/components/dashboard/website-card.tsx
    - src/components/preview/types.ts
    - src/components/sections/hero-section.tsx
    - src/components/site/nav.tsx
findings:
    critical: 1
    warning: 7
    info: 5
    total: 13
status: issues_found
---

# Phase 8: Code Review Report

**Reviewed:** 2026-05-12
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

Phase 8 delivers the dashboard list refactor (`WebsiteCard` extraction), the
`ConnectionsModal` component, the `[serverId] → [websiteId]` route rename, the
`_count.sections` selection on `GET /api/websites`, and a complete purge of the
`serverIp` prop chain from the public site shell (layout + nav + page +
preview types + orphan `hero-section.tsx`).

Behaviour and security are mostly sound:

- `serverIp` purge is **complete and consistent** across the diff (`grep
serverIp src/` returns zero hits; the editor `SectionPreview` call no longer
  threads it; the public `[subdomain]/page.tsx` `serverData` literal no
  longer carries it).
- `GET /api/websites` query shape is correct — `_count: { select: { sections:
true } }` only includes the relation count Prisma needs and stays scoped to
  `userId: session.user.id`, so the new field cannot leak cross-user data.
- `ConnectionsModal`'s fetch lifecycle correctly cancels in-flight `load` calls
  on close/reopen and on `websiteId` change (the `cancelled` closure flag is
  unique per effect invocation), and unwraps the `{ error }` REST envelope on
  every non-OK response.

The findings below cover one **BLOCKER** (invalid HTML — nested interactive
elements in `WebsiteCard` that violate the spec and produce hydration
warnings), accessibility regressions, dead code that should not have shipped,
and a residual security hazard in an orphaned section component.

---

## Critical Issues

### CR-01: Nested interactive elements in WebsiteCard — invalid HTML, hydration warning

**File:** `src/components/dashboard/website-card.tsx:31-113`
**Severity:** BLOCKER
**Issue:**
The card wraps its entire body in `<Link href={`/dashboard/${website.id}`}>`
(line 31), which renders an `<a>` element. Inside that `<a>`, two more
interactive descendants are rendered:

1. A `<motion.button>` (line 55-63 — the `MoreHorizontal` icon "More options"
   button). A `<button>` nested inside an `<a>` is **interactive content
   inside interactive content**, which the HTML5 spec disallows ("the a
   element's content model … must not have any interactive content
   descendants").
2. An `<a href="https://{subdomain}.minesites.net" target="_blank">` (line
   100-109 — the "Visit live site" link). Nesting `<a>` inside `<a>` is
   **explicitly invalid** per the same content-model rule, and browsers
   resolve it by silently restructuring the DOM during parsing.

The `onClick={(e) => e.preventDefault()}` and `onClick={(e) =>
e.stopPropagation()}` handlers work around the click-event bubbling but do
**not** fix the underlying DOM nesting. In React 19 / Next.js 16 dev mode
this produces:

```
Warning: validateDOMNesting(...): <button> cannot appear as a descendant of <a>.
Warning: validateDOMNesting(...): <a> cannot appear as a descendant of <a>.
```

Worse, browsers reparent the inner anchor at the parser level (it gets
hoisted out of the outer `<a>`), so the rendered DOM does not match the React
tree — this is a documented cause of hydration mismatches and silently
incorrect event delivery (the parent Link's click region effectively
truncates around where the inner `<a>` was meant to be).

**Fix:**
Replace the outer `<Link>` wrapping with programmatic navigation, so only the
inner controls remain interactive:

```tsx
'use client';

import { useRouter } from 'next/navigation';

export function WebsiteCard({ website, index }: WebsiteCardProps) {
	const router = useRouter();
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 + index * 0.1 }}
		>
			<motion.div
				role="link"
				tabIndex={0}
				onClick={() => router.push(`/dashboard/${website.id}`)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						router.push(`/dashboard/${website.id}`);
					}
				}}
				whileHover={{ y: -4, transition: { duration: 0.15 } }}
				className="group cursor-pointer rounded-2xl border bg-white p-6 ..."
			>
				{/* header, More button, description, badge — now legally nestable */}
				{/* Visit link — now legally an <a> at the leaf */}
				<a
					href={`https://${website.subdomain}.minesites.net`}
					target="_blank"
					rel="noreferrer noopener"
					onClick={(e) => e.stopPropagation()}
					aria-label={`Visit live site for ${website.name}`}
					className="..."
				>
					Visit <ArrowUpRight className="h-3 w-3" />
				</a>
			</motion.div>
		</motion.div>
	);
}
```

Alternatively, the inner "Visit" link could be moved **out of** the card body
into a footer sibling, and the "More options" button could be repositioned
as a sibling overlay (`absolute top-3 right-3`) outside the `<Link>` — but
the role/tabIndex approach above is the most direct.

---

## Warnings

### WR-01: Form `<label>` elements have no association with their inputs (a11y)

**File:** `src/components/dashboard/connections-modal.tsx:363, 375, 390, 408`; `src/app/(dashboard)/dashboard/create-website-dialog.tsx:90, 104, 124`; `src/app/(dashboard)/dashboard/[websiteId]/server-settings.tsx:83, 93, 112`
**Severity:** WARNING
**Issue:**
Every `<label>` element in the new dialogs uses neither `htmlFor=...` nor
implicit wrapping (the input is a sibling, not a child). The UI-SPEC
explicitly requires the opposite: _"Form inputs have associated `<label>`
elements (not `placeholder` as label substitute)"_ (08-UI-SPEC.md
§Accessibility). Screen readers will announce these inputs as unlabeled
("edit text, blank"), and clicking the visual label text does not focus the
input.

Example offender (connections-modal.tsx:362-369):

```tsx
<label className="block text-sm font-normal text-zinc-700 mb-1.5">Name</label>
<Input {...register("name")} placeholder="My SMP Server" error={!!errors.name} autoFocus />
```

**Fix:**
Either pass `id`/`htmlFor` through `register` plus a stable id, or wrap the
input inside the label. The cleanest path for `react-hook-form` is the `id`
attribute:

```tsx
<label htmlFor="mcserver-name" className="block text-sm ...">Name</label>
<Input id="mcserver-name" {...register("name")} ... />
```

Apply to every `<label>` in `connections-modal.tsx`, `create-website-dialog.tsx`,
and `server-settings.tsx` (Name, Subdomain, Description, IP, Port).

---

### WR-02: Dead modules `server-actions.tsx` and `server-settings.tsx` — never imported

**File:** `src/app/(dashboard)/dashboard/[websiteId]/server-actions.tsx`, `src/app/(dashboard)/dashboard/[websiteId]/server-settings.tsx`
**Severity:** WARNING
**Issue:**
A repository-wide grep for `ServerActions`, `ServerSettings`, `server-actions`,
and `server-settings` finds **zero importers** of these two modules. They
were touched in phase 8 (commit `36ef653` "rename [serverId] route to
[websiteId]") — i.e. the rename actively included these files in scope, but
their only relationship to the live god-component is one passing comment
reference ("`server-settings.tsx`" at `[websiteId]/page.tsx:2375`).

Shipping orphaned files in a directory that doubles as a Next.js dynamic
route ([websiteId]) has a real downside in this app: any file named `page.tsx`,
`layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`, or
`default.tsx` becomes a route segment automatically. `server-actions.tsx`
and `server-settings.tsx` happen to be safe filenames today, but the pattern
invites future copy-paste of a name that **would** register a phantom route
(e.g. a future `page.tsx` move). More importantly, these files contain
real action calls (`deleteWebsite`, `togglePublished`, `updateWebsite`) and
references to a stale `WebsiteActionsProps` interface — they will rot
silently because nothing exercises them in CI.

**Fix:**
Either:

1. **Delete both files.** The CLAUDE.md constraint says future section types
   live in `src/components/sections/render/` + `settings/` + the registry;
   the dashboard editor (`[websiteId]/page.tsx`) already inlines its own
   delete/publish/save UI, so these helpers are redundant.
2. Or wire them in: mount `<ServerActions websiteId={...} published={...} />`
   in the editor top-bar and replace the inline Settings tab with
   `<ServerSettings server={...} />`. Choose one before merging.

---

### WR-03: Type definitions for `WebsiteData` are triplicated (dashboard list shape)

**File:** `src/app/(dashboard)/dashboard/page.tsx:17-26`, `src/app/(dashboard)/dashboard/servers/page.tsx:20-29`, `src/components/dashboard/website-card.tsx:8-17`
**Severity:** WARNING
**Issue:**
Three identical interface declarations define the same dashboard-list shape:

```ts
// page.tsx — interface WebsiteData { id; name; subdomain; description; published; createdAt; updatedAt; _count: { sections: number } }
// servers/page.tsx — same fields, also called WebsiteData
// website-card.tsx — exported as WebsiteCardData with the same fields
```

The first two collide nominally with `WebsiteData` from
`src/components/preview/types.ts` (which has a different shape:
`name, subdomain, players?, maxPlayers?, version?`). A reader skimming
imports cannot tell which `WebsiteData` they're looking at. If
`/api/websites` ever adds a field (e.g. `theme: SiteTheme | null`), all
three locations must be edited in lockstep. The exported `WebsiteCardData`
is the only one that is already centralised.

**Fix:**
Delete the local `WebsiteData` interfaces in `dashboard/page.tsx` and
`dashboard/servers/page.tsx`; import `WebsiteCardData` from
`@/components/dashboard` and use it:

```tsx
import { WebsiteCard, type WebsiteCardData } from '@/components/dashboard';

const [servers, setServers] = useState<WebsiteCardData[]>([]);
```

Better still: extend `WebsiteCardData` with a `WebsiteListItem` export from
`src/lib/api/websites.ts` (or similar) so the API response shape lives next
to the route handler, not next to a presentation component.

---

### WR-04: Two list pages duplicate `loadServers` + error UI verbatim (`dashboard/page.tsx` + `dashboard/servers/page.tsx`)

**File:** `src/app/(dashboard)/dashboard/page.tsx:34-87`, `src/app/(dashboard)/dashboard/servers/page.tsx:39-92`
**Severity:** WARNING
**Issue:**
The fetch loop (`useEffect → setIsLoading → fetch /api/websites → setServers
| setError`), the loading skeleton, and the error card with a
`window.location.reload()` "Retry" button are duplicated character-for-
character across both list pages. Two list pages today; if a third surface
appears (org dashboard? admin overview?) the divergence-by-copy-paste hazard
compounds.

Note: this is the same `WR-09`-style pattern that was already extracted for
`formatRelativeTime` in `src/lib/utils.ts`. The lesson did not transfer.

**Fix:**
Extract a `useWebsites()` hook into `src/lib/hooks/use-websites.ts`:

```ts
export function useWebsites() {
	const [servers, setServers] = useState<WebsiteCardData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	useEffect(() => {
		/* one source of truth */
	}, []);
	return { servers, isLoading, error };
}
```

Both pages call `useWebsites()` and render their own shells. Bonus: a SWR /
TanStack Query upgrade later becomes a one-file change.

---

### WR-05: `Retry` button uses `window.location.reload()` instead of refetching

**File:** `src/app/(dashboard)/dashboard/page.tsx:79`, `src/app/(dashboard)/dashboard/servers/page.tsx:84`
**Severity:** WARNING
**Issue:**
On fetch failure both list pages render:

```tsx
<button onClick={() => window.location.reload()} ...>Retry</button>
```

A full-page reload throws away the layout shell, sidebar state
(`useSidebarStore`), and any other client state, plus it costs a full HTML
round-trip when only `/api/websites` failed. It also defeats the
React-tree-level recovery that the surrounding error boundary pattern is
designed for.

**Fix:**
Extract `loadServers` from the effect into a callable and reuse it:

```tsx
const loadServers = useCallback(async () => {
	setIsLoading(true);
	setError(null);
	try {
		const response = await fetch('/api/websites');
		if (!response.ok) throw new Error('Failed to load servers');
		setServers(await response.json());
	} catch (err) {
		setError(err instanceof Error ? err.message : 'Failed to load servers');
	} finally {
		setIsLoading(false);
	}
}, []);
useEffect(() => {
	loadServers();
}, [loadServers]);
// ...
<button onClick={loadServers}>Retry</button>;
```

---

### WR-06: Orphaned `hero-section.tsx` still contains a CSS-injection vector

**File:** `src/components/sections/hero-section.tsx:18-23`
**Severity:** WARNING
**Issue:**
`hero-section.tsx` is **no longer used** anywhere — the live renderer is
`HeroRender` from `src/components/sections/render/hero-render.tsx`
(registered in `section-registry.tsx`). The file remains exported from
`src/components/sections/index.ts:1`, however, so it's a tempting "looks
canonical" import target.

It also still embeds user-controlled `backgroundImage` directly into a CSS
`url(...)` context without protocol validation:

```tsx
style={{
  backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
  ...
}}
```

`HeroRender` correctly funnels this through `safeBackgroundUrl()` (rejecting
non-http(s) schemes), but if a future contributor wires this orphan back up
they will reintroduce a CSS-injection path (a settings value of
`"img.png"); background-image: url("evil`) would break out of the CSS
context). The phase 8 diff modified this file (commit `d3cb6a1` —
"refactor(08-02): drop serverIp from public layout, SiteNav, and orphaned
hero-section") — i.e. the diff acknowledged it as orphan but did not delete
it.

**Fix:**
Delete `src/components/sections/hero-section.tsx` and remove its export
from `src/components/sections/index.ts:1`. Nothing else needs to change.

---

### WR-07: Connections modal "Manage Servers" trigger does not match UI-SPEC variant

**File:** `src/app/(dashboard)/dashboard/[websiteId]/page.tsx:2581-2589`
**Severity:** WARNING
**Issue:**
UI-SPEC §Interaction Contracts → "Connections Modal Open/Close" says:

> Button variant: `secondary` (white bg, zinc border) with `Server` icon
> (16px) left of label

The current implementation renders a `motion.button` with a ghost-style class
list (`text-zinc-600 hover:bg-zinc-100 rounded-xl text-sm font-normal`) and
no border — closer to `variant="ghost"`. This drifts from the contract and
also bypasses the shared `Button` primitive, so any future variant change
will not propagate here.

**Fix:**
Replace with the primitive:

```tsx
import { Button } from "@/components/ui";
...
<Button variant="secondary" onClick={() => setConnectionsOpen(true)}>
  <Server className="w-4 h-4 mr-2" />
  Manage Servers
</Button>
```

(`motion.button` wrapping can be reapplied via `as={motion.button}` once a
polymorphic Button lands; in the meantime drop the scale/hover animation —
the variant already has a hover state.)

---

## Info

### IN-01: Manual FormData transcoding in `server-settings.tsx` reinvents nullable handling

**File:** `src/app/(dashboard)/dashboard/[websiteId]/server-settings.tsx:42-55`
**Severity:** INFO
**Issue:**
The client builds a `FormData` from the validated form object by hand,
re-implementing the "send empty for description, strip empty for others"
distinction that the server action `updateWebsite` already encodes
(`actions.ts:84-101`). Two places to keep in lockstep.

**Fix:**
Send JSON via fetch to the existing PUT endpoint (or pass `data` directly to
the server action — Next.js server actions accept any serialisable object,
not just `FormData`). Drop the per-field iteration entirely.

---

### IN-02: `setValueAs` + `valueAsNumber` both set on the port field

**File:** `src/components/dashboard/connections-modal.tsx:392-396`
**Severity:** INFO
**Issue:**

```tsx
{...register("port", {
  valueAsNumber: true,
  setValueAs: (v) => v === "" || v === undefined || v === null ? undefined : Number(v),
})}
```

`react-hook-form` ignores `valueAsNumber` when `setValueAs` is also provided.
The `valueAsNumber: true` line is dead config and misleads the reader into
thinking RHF will coerce — only the `setValueAs` runs.

**Fix:**
Drop the `valueAsNumber: true` line:

```tsx
{...register("port", {
  setValueAs: (v) => v === "" || v == null ? undefined : Number(v),
})}
```

---

### IN-03: `params.websiteId as string` masks the actual `useParams()` return type

**File:** `src/app/(dashboard)/dashboard/[websiteId]/page.tsx:2244`
**Severity:** INFO
**Issue:**
`useParams()` in Next.js 16 returns `Params | null` and each value is
`string | string[] | undefined`. The cast `params.websiteId as string` will
silently succeed if Next.js ever passes `undefined` (e.g. during early
unmount), and the subsequent `fetch(`/api/websites/${websiteId}`)` will hit
`/api/websites/undefined` and 404 — but the error surfaces as a generic
"Failed to load server data" with no diagnostic.

**Fix:**

```tsx
const params = useParams<{ websiteId: string }>();
if (!params?.websiteId) return null; // or throw / redirect
const websiteId = params.websiteId;
```

---

### IN-04: Hard-coded `players: 0`, `maxPlayers: 500`, `version: "1.20.4"` in editor state

**File:** `src/app/(dashboard)/dashboard/[websiteId]/page.tsx:2294-2296`
**Severity:** INFO
**Issue:**
These look like leftover scaffold values from the pre-Phase-7 era when
`serverData` carried IP/player info. With the `MinecraftServer` model now
owning that data and the `Hero` renderer reading `players` from
`serverData.players`, these constants paint a misleading preview (the
editor always shows "0 / 500" no matter what the connected MC server
reports). This is not a phase-8 regression but the diff actively touched
this object (commit `e68ab6a`) without addressing it.

**Fix:**
Drop `players`, `maxPlayers`, `version` from `WebsiteDataState` until Phase
9+ wires in `/api/websites/[websiteId]/servers/[serverId]/status`, or fetch
the first connected server's live status here.

---

### IN-05: Comment in `dashboard/page.tsx` documents a removed-code rationale

**File:** `src/app/(dashboard)/dashboard/page.tsx:58-60`
**Severity:** INFO
**Issue:**

```tsx
// WR-09: formatRelativeTime was previously defined here as dead code (never
// called in this file). The shared implementation lives in src/lib/utils.ts;
// import from there if/when this page needs to render relative timestamps.
```

Inline historical notes like this are review-cycle bookkeeping that doesn't
belong in production source — once the change is in git history, the
comment becomes negative-value clutter. Same applies to the equivalent
comment at `servers/page.tsx:63-66`.

**Fix:**
Delete both comments. The git log + 08-SUMMARY.md files preserve the
rationale.

---

_Reviewed: 2026-05-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
