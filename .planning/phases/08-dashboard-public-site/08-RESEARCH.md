# Phase 8: Dashboard & Public Site - Research

**Researched:** 2026-05-12
**Domain:** Next.js 16 App Router dashboard UI + modal-based CRUD against Phase 7 REST endpoints + route directory rename
**Confidence:** HIGH

## Summary

Phase 8 is a focused UI completion phase on top of the v1.1 data and API model that Phases 6–7 already shipped. The dashboard already lists websites and the create-website dialog already creates them; the public `[subdomain]/page.tsx` already routes by `Website.subdomain`. The actual remaining work is a small set of crisp deliverables: (a) extract a shared `WebsiteCard`, (b) add `_count.sections` to `GET /api/websites` and surface it on the card, (c) build a `ConnectionsModal` opened from the editor top-bar that performs per-record CRUD against the Phase 7 `/api/websites/[id]/servers[/serverId]` endpoints, (d) terminology sweep (`[serverId]` -> `[websiteId]`, `CreateServerDialog` -> `CreateWebsiteDialog`, drop legacy `serverIp` props), and (e) verify the public path still works after the prop drop.

The codebase has high-quality existing patterns to reuse — `Modal`/`ModalHeader`/`ModalTitle`/`ModalContent`/`ModalFooter` chrome, `useForm + zodResolver + Modal` template from `create-server-dialog.tsx`, `useToast()` already mounted at root, `formatRelativeTime` helper, `framer-motion` entrance pattern. Phase 7 also already created the per-record CRUD endpoints with full ownership/validation/error-shape contracts; the modal is a thin client over those.

**Primary recommendation:** Plan five plans in three waves. Wave 0/1 covers the foundational, non-blocking work (route rename + `_count` API shape + dialog rename + legacy `serverIp` purge); Wave 2 builds the new shared `WebsiteCard` and `ConnectionsModal` against the now-stable foundation; Wave 3 is the public-path verification + Phase-7 carry-forward smoke test. Keep the route directory rename in its own commit so a bisect cleanly attributes any regression.

## Architectural Responsibility Map

| Capability                                                  | Primary Tier                                     | Secondary Tier                                  | Rationale                                                                                                                                                                   |
| ----------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Website list rendering (`/dashboard`, `/dashboard/servers`) | Frontend client (Next.js client component)       | API (`GET /api/websites`)                       | Lists are interactive (search, view-mode toggle); fetched via `useEffect` + `fetch` per existing pattern. Server Component would force a hard reload on every state change. |
| Section count surfacing                                     | API (extend Prisma `_count`)                     | Frontend (render)                               | Aggregation belongs in the DB query so cards render in one round-trip. No client-side counting.                                                                             |
| Create-website dialog                                       | Frontend client                                  | Server Action (`createWebsite` in `actions.ts`) | Existing pattern; Server Action handles persistence + `redirect()`. No API rewrite.                                                                                         |
| Manage Servers modal (CRUD)                                 | Frontend client                                  | API (existing `/api/websites/[id]/servers`)     | Modal commits each row independently against per-record endpoints; no Server Action needed since the editor stays on the page (no redirect).                                |
| Subdomain rewrite                                           | Middleware (edge runtime)                        | —                                               | Already correct in `src/middleware.ts`; phase only verifies.                                                                                                                |
| Public site render                                          | Frontend server (RSC at `[subdomain]/page.tsx`)  | Database (Prisma `db.website.findUnique`)       | Already correct; phase only drops legacy `serverIp` prop.                                                                                                                   |
| Subdomain uniqueness enforcement                            | API + Server Action (P2002 catch)                | Database (`@unique`)                            | Already in place from Phase 6 CR-01 / WR-05; phase preserves.                                                                                                               |
| Freemium section limit                                      | API (PUT `/api/websites/[id]`)                   | Database                                        | Already in place from Phase 6 CR-03; phase preserves. NOT touched by `ConnectionsModal` — modal uses per-record server endpoints which do not gate on section count.        |
| Route directory rename                                      | Filesystem + frontend client (`useParams` types) | —                                               | Pure refactor; URL pattern unchanged.                                                                                                                                       |

## Standard Stack

### Core (already installed — verified via `package.json`)

| Library               | Version  | Purpose                                                                                      | Why Standard                                                                                                                |
| --------------------- | -------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `next`                | 16.1.6   | App Router, route groups, middleware, `useParams`                                            | [VERIFIED: package.json] Project framework.                                                                                 |
| `react`               | 19.2.3   | UI primitives                                                                                | [VERIFIED: package.json] Phase code uses React 19's stable hooks.                                                           |
| `framer-motion`       | ^12.29.2 | Card entrance, hover lift, modal scale, `AnimatePresence`                                    | [VERIFIED: package.json + codebase grep] Already used in every dashboard surface; modal chrome relies on `AnimatePresence`. |
| `lucide-react`        | ^0.563.0 | All icons (`Server`, `Plus`, `ArrowUpRight`, `Layers`, `Loader2`, `Edit`, `Trash2`, etc.)    | [VERIFIED: package.json + codebase grep] Project standard; UI-SPEC mandates lucide.                                         |
| `react-hook-form`     | ^7.71.1  | Add/edit form inside `ConnectionsModal` (per-row form follows `CreateServerDialog` template) | [VERIFIED: package.json] Project standard for all forms.                                                                    |
| `@hookform/resolvers` | ^5.2.2   | Zod adapter for react-hook-form                                                              | [VERIFIED: package.json]                                                                                                    |
| `zod`                 | ^4.3.6   | `createMcserverSchema` / `updateMcserverSchema` already exist                                | [VERIFIED: package.json + `src/lib/validations/mcserver.ts`]                                                                |
| `tailwindcss`         | ^4       | Styling                                                                                      | [VERIFIED: package.json] Tailwind v4 via PostCSS; project uses utility classes throughout.                                  |

### Supporting (project-local — reuse, do not fork)

| Module                                                              | Path                              | Purpose                                                                                                                        |
| ------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------- | --------- |
| `Modal`, `ModalHeader`, `ModalTitle`, `ModalContent`, `ModalFooter` | `src/components/ui/modal.tsx`     | Modal chrome; accepts `className` to override default `max-w-md` (planner needs `max-w-lg` for connections modal per UI-SPEC). |
| `Button`, `Input`, `Textarea`, `Card`, `Badge`                      | `src/components/ui/`              | UI primitives; `Card` is the right outer shell for `WebsiteCard`.                                                              |
| `ToastProvider` / `useToast`                                        | `src/components/ui/toast.tsx`     | Already mounted at root layout; signature is `toast(message: string, type?: "success"                                          | "error" | "info")`. |
| `formatRelativeTime`                                                | `src/lib/utils.ts`                | Shared timestamp helper (WR-09); used by `dashboard/servers/page.tsx`. The card extraction can choose to surface it or not.    |
| `createMcserverSchema`, `updateMcserverSchema`                      | `src/lib/validations/mcserver.ts` | Phase 7 D-07..D-09 schemas; partial-update via `.partial()`.                                                                   |
| `createWebsiteSchema`                                               | `src/lib/validations/website.ts`  | Used by the dialog rename.                                                                                                     |

### Alternatives Considered

| Instead of                                  | Could Use                | Tradeoff                                                                                                                                              |
| ------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Modal-based connections manager (D-01)      | Sidebar tab in editor    | Decision is **locked**: modal. Sidebar tab would require teaching the existing "Sections                                                              | Appearance" toggle a third state and would entangle modal lifecycle with the section save state. |
| Inline add row in modal (D-04)              | Stacked secondary modal  | Decision is **locked**: list + inline add row. Avoids modal-on-modal focus traps.                                                                     |
| Per-card fetch for section count (rejected) | Prisma `_count` (D-09)   | Decision is **locked**: `_count.sections`. Per-card fetch was rejected as N+1; single query is canonical Prisma pattern.                              |
| Server Action for MinecraftServer CRUD      | REST endpoints (Phase 7) | Decision is **locked**: REST. Endpoints already exist (D-04 of Phase 7) with full ownership/validation. A Server Action would duplicate that surface. |

**No new installs required.** All packages exist.

**Version verification:** Skipped npm registry probe — every library used by this phase is already installed and pinned in `package.json`. No version bumps are required for Phase 8 (verified against `package.json` 2026-05-12). [VERIFIED: filesystem + package.json]

## Architecture Patterns

### System Architecture Diagram

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                          Browser / User                                    │
└──────────────┬─────────────────────────────────────────────────────────────┘
               │
               ├──► /dashboard (client component, useEffect fetch)
               │       │
               │       └──► GET /api/websites  ──►  Prisma findMany
               │                  + _count.sections (NEW in Phase 8)
               │       │
               │       └──► WebsiteCard (shared, NEW)
               │              ├── click body ──► /dashboard/[websiteId] (rename)
               │              └── click visit btn / URL anchor ──► [subdomain].minesites.net
               │                                                       │
               │                                                       ▼
               │                                          Middleware rewrites
               │                                       myserver.minesites.net → /myserver
               │                                                       │
               │                                                       ▼
               │                                          [subdomain]/page.tsx (RSC)
               │                                          db.website.findUnique({ subdomain })
               │                                          published || isPreviewMode ? render : notFound()
               │
               ├──► /dashboard/servers (client component, useEffect fetch — same GET)
               │       └──► WebsiteCard (same shared component) + search/filter/list-view
               │
               └──► /dashboard/[websiteId] (the editor; god-component, 3187 lines)
                       ├── top-bar: [Manage Servers (NEW)] [Preview] [Publish]
                       │       │
                       │       └──► ConnectionsModal (NEW)
                       │              ├── open → GET /api/websites/[id]/servers (D-02)
                       │              ├── add → POST /api/websites/[id]/servers
                       │              ├── edit → PUT /api/websites/[id]/servers/[serverId]
                       │              ├── delete (inline confirm) → DELETE same
                       │              └── each commits independently of editor Save (D-03)
                       │
                       └── sidebar (Sections | Appearance) + canvas — UNCHANGED
                              │
                              └──► PUT /api/websites/[id] (the bulk save) — UNCHANGED
                                         (carry-forward: subdomain 409, freemium gate, P2002)
```

### Recommended Project Structure

```
src/
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           ├── page.tsx                        # consumes WebsiteCard (CHANGED)
│           ├── servers/page.tsx                # consumes WebsiteCard (CHANGED)
│           ├── create-website-dialog.tsx       # RENAMED from create-server-dialog.tsx
│           ├── actions.ts                      # UNCHANGED (already createWebsite/updateWebsite/deleteWebsite)
│           └── [websiteId]/                    # RENAMED from [serverId]/
│               ├── page.tsx                    # renders <ConnectionsModal /> from top-bar (CHANGED)
│               ├── server-actions.tsx          # rename param locally (optional file rename D-16)
│               └── server-settings.tsx         # drop serverIp/serverPort from local Server iface (CHANGED)
├── app/
│   └── [subdomain]/
│       ├── page.tsx                            # drop `serverIp: null` from serverData (CHANGED)
│       ├── preview-client.tsx                  # `server` prop type narrowed (CHANGED, small)
│       └── layout.tsx                          # drop `serverIp = ""` + SiteNav prop (CHANGED)
├── components/
│   ├── dashboard/                              # NEW directory
│   │   ├── website-card.tsx                    # NEW shared card
│   │   └── connections-modal.tsx               # NEW modal
│   ├── preview/types.ts                        # drop `serverIp` from WebsiteData (CHANGED)
│   └── site/nav.tsx                            # drop `serverIp` prop + Copy IP button (CHANGED)
```

### Pattern 1: Local-fetch client component (the dashboard list pattern)

**What:** Client component with `useState` + `useEffect(fetch)` for read data; loading + error states; redirect on action.
**When to use:** Any dashboard list/grid page that doesn't need RSC streaming.
**Example (verified in `src/app/(dashboard)/dashboard/page.tsx` lines 28-50):**

```typescript
const [servers, setServers] = useState<WebsiteData[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
	async function loadServers() {
		try {
			const response = await fetch('/api/websites');
			if (!response.ok) throw new Error('Failed to load servers');
			const data = await response.json();
			setServers(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load servers');
		} finally {
			setIsLoading(false);
		}
	}
	loadServers();
}, []);
```

The `ConnectionsModal` follows the same pattern, scoped to its own `isOpen` lifecycle:

```typescript
// On modal open → fetch the list
useEffect(() => {
	if (!isOpen) return;
	let cancelled = false;
	async function load() {
		setIsLoading(true);
		try {
			const res = await fetch(`/api/websites/${websiteId}/servers`);
			if (!res.ok) throw new Error('Failed to load servers');
			if (!cancelled) setServers(await res.json());
		} catch (err) {
			if (!cancelled) setError(err instanceof Error ? err.message : 'Error');
		} finally {
			if (!cancelled) setIsLoading(false);
		}
	}
	load();
	return () => {
		cancelled = true;
	};
}, [isOpen, websiteId]);
```

The `cancelled` cleanup matters because the user can close + reopen the modal rapidly during a slow connection. [VERIFIED: codebase pattern + standard React 19 effect cleanup]

### Pattern 2: Modal + react-hook-form + zodResolver (the dialog template)

**What:** `Modal` chrome wraps a `<form onSubmit={handleSubmit(onSubmit)}>` with Zod-validated fields; success closes; errors render inline.
**When to use:** Any create/edit form inside a modal.
**Example (verified in `src/app/(dashboard)/dashboard/create-server-dialog.tsx` lines 35-58):**

```typescript
const {
	register,
	handleSubmit,
	formState: { errors, isSubmitting },
	reset,
} = useForm<CreateWebsiteInput>({ resolver: zodResolver(createWebsiteSchema) });

const onSubmit = async (data: CreateWebsiteInput) => {
	setError(null);
	try {
		// For Server Actions only: FormData wrapper + isRedirectError re-throw
		// For REST endpoints (ConnectionsModal): just fetch + JSON
		const res = await fetch(url, { method, headers, body: JSON.stringify(data) });
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.error ?? 'Request failed');
		}
		// success: refresh local list, close form, toast
	} catch (err) {
		setError(err instanceof Error ? err.message : 'Something went wrong');
	}
};
```

**Important:** `ConnectionsModal` row forms call REST (`fetch`), not a Server Action. Therefore:

- Do NOT import `isRedirectError` from `next/dist/client/components/redirect-error` (the dialog file does, but only because Server Actions can throw redirects).
- Use the API's JSON error response shape: `{ error: string, details?: unknown }`. Map `error` to the inline message or toast.

### Pattern 3: Inline mode-swap rows (instead of nested modals)

**What:** A list row swaps its rendered subtree between three modes (`read`, `edit`, `confirm-delete`) controlled by a per-row state machine.
**When to use:** When the user might delete/edit multiple rows in sequence and a global `editingId | confirmingId | null` reads cleaner than scattering booleans.
**Example shape:**

```typescript
type RowMode = 'read' | 'edit' | 'confirm-delete';
const [rowMode, setRowMode] = useState<Record<string, RowMode>>({});
const modeOf = (id: string): RowMode => rowMode[id] ?? 'read';

// Rule (from UI-SPEC §Interaction Contracts): clicking edit on row B while
// row A is in edit mode closes A's edit form (discarding draft) and opens B.
const enterEdit = (id: string) =>
	setRowMode((m) => ({
		// close all other edit/confirm states; keep this row's only
		[id]: 'edit',
	}));
```

### Pattern 4: Card-link + nested anchor (avoiding event bubbling on visit button)

**What:** The card body is `<Link href="/dashboard/${websiteId}">`; the live URL is `<a href="https://..." target="_blank" onClick={stopPropagation}>` nested inside.
**Why:** Without `stopPropagation`, clicking the visit link both navigates the tab to the public site AND routes the dashboard tab to the editor.
**Verified pattern (from D-10 + UI-SPEC §Interaction Contracts):**

```tsx
<Link href={`/dashboard/${website.id}`}>
	<motion.div whileHover={{ y: -4 }}>
		...
		<a
			href={`https://${website.subdomain}.minesites.net`}
			target="_blank"
			rel="noreferrer noopener"
			onClick={(e) => e.stopPropagation()}
			aria-label={`Visit live site for ${website.name}`}
		>
			<ArrowUpRight className="h-3.5 w-3.5" />
		</a>
	</motion.div>
</Link>
```

The existing `MoreHorizontal` button already uses `onClick={(e) => e.preventDefault()}` (verified line 180 of dashboard/page.tsx) — the visit anchor needs `stopPropagation()` instead because `preventDefault` would also block the new-tab navigation.

### Anti-Patterns to Avoid

- **Don't add `ConnectionsModal` state to the editor's `serverData` state.** Phase 7 D-03 says CRUD commits independently. Keep the modal's `servers[]` in a local `useState` inside the modal component (or a thin parent state in `[websiteId]/page.tsx` if it needs to persist across modal opens — but D-02 says fetch-on-open, so local is fine).
- **Don't grow the god-component.** Per CLAUDE.md rule 1, the new "Manage Servers" button slots into the existing top-bar action cluster (~line 2573-2603), the modal component lives in `src/components/dashboard/connections-modal.tsx`, and only the trigger button + the `<ConnectionsModal ... />` mount points are added inside the god-component. The line-count delta should be ≤ 15 lines in `page.tsx`.
- **Don't add `[serverId]` route reads.** After D-12, `useParams<{ websiteId }>()` is the only correct signature; using `params.serverId` throws a silent `undefined` at runtime.
- **Don't fork the `Modal` component to add a width prop.** It already accepts `className` (verified line 14 of `modal.tsx`); pass `className="max-w-lg"` per the UI-SPEC.
- **Don't introduce a third sidebar tab.** D-01 explicitly rejected this; the Sections / Appearance toggle is owned by the editor and is not for connection management.
- **Don't run `_count` on `GET /api/websites/[websiteId]`.** That route already returns full sections + servers arrays (verified line 25-29 of `[websiteId]/route.ts`); adding `_count` there is redundant. Only extend the LIST route.

## Don't Hand-Roll

| Problem                                      | Don't Build                                                                          | Use Instead                                                                                  | Why                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Section count aggregation                    | A loop that re-fetches `/api/websites/[id]` for each card to count `sections.length` | Prisma `include: { _count: { select: { sections: true } } }` on the list route               | Single SQL query vs. N+1 round-trips. Standard Prisma pattern.                                        |
| Subdomain uniqueness                         | A debounced client-side `/api/websites?subdomain=...` lookup                         | Server-side P2002 catch (already implemented Phase 6 CR-01 + WR-05 + BL-02)                  | Race-free; deferred-list explicitly rejects live-as-you-type per D-19 carry-forward + deferred ideas. |
| Modal focus trap, escape key, backdrop click | Custom keyboard handler + ref-based focus management                                 | `Modal` from `src/components/ui/modal.tsx` (verified: handles Escape, backdrop, scroll lock) | Already correct; extending introduces drift.                                                          |
| Toast queue + dismiss timer                  | Custom toast list with `setTimeout` reapers                                          | `useToast()` from `src/components/ui/toast.tsx` (4-second auto-dismiss, 3 type variants)     | Verified mounted at root layout.                                                                      |
| Form validation messages                     | Manual `<p className="text-red-500">` after every field                              | `react-hook-form` + `zodResolver(createMcserverSchema)` + `errors.fieldName?.message`        | Schemas exist (`src/lib/validations/mcserver.ts`); error messages baked into Zod field strings.       |
| Relative timestamp formatting                | New "X min ago" helper                                                               | `formatRelativeTime` from `src/lib/utils.ts` (WR-09 dedupe)                                  | Already shared.                                                                                       |
| Modal width override                         | Patching the `Modal` component                                                       | Pass `className="max-w-lg"` (Modal already merges via `cn()`)                                | Verified line 50-53 of modal.tsx.                                                                     |
| Ownership / 403 logic                        | Adding ownership checks in the modal                                                 | Phase 7 endpoints already enforce ownership server-side (D-05 + WR-02)                       | Trust the backend. The modal only needs to handle 403 errors as "unauthorized" toast text.            |

**Key insight:** Phase 8's surface area is ~70% reuse of patterns already proven in the codebase. The single risky thing is the route directory rename, which touches `[serverId]/` (containing the 3187-line god-component). The mechanical move + token sweep (`params.serverId` → `params.websiteId`, plus all 5 `serverId` variable references) is well-bounded — only 5 grep hits inside the god-component, plus the directory rename itself.

## Runtime State Inventory

This phase has a route directory rename and several token renames. Below is the exhaustive runtime-state audit per the canonical research question.

| Category                       | Items Found                                                                                                                                                                                                                                                                                                                                                                                                                                     | Action Required                                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Stored data                    | **None** — no DB record stores the literal string `serverId` as a key, column name, or value. The model field is `id` (on `Website`/`MinecraftServer`/`Section`); URL param name is purely a routing concern. Section `settings.minecraftServerId` is a foreign-key reference, not a renamed token.                                                                                                                                             | None                                                                                                    |
| Live service config            | **None** — no Datadog/n8n/Tailscale/Cloudflare integration in this codebase (verified by grep + `package.json`). No external service references the route param name.                                                                                                                                                                                                                                                                           | None                                                                                                    |
| OS-registered state            | **None** — no Windows Task Scheduler entries, systemd units, or pm2 processes reference the rename targets. Project runs `next dev` directly via npm scripts.                                                                                                                                                                                                                                                                                   | None                                                                                                    |
| Secrets/env vars               | **None** — no env var name contains `serverId`. Verified by `grep -r "serverId" .env*` semantics (no .env files reference param names; only DB connection strings).                                                                                                                                                                                                                                                                             | None                                                                                                    |
| Build artifacts                | `.next/` build cache may hold stale routes for `(dashboard)/dashboard/[serverId]/page.tsx`. After the directory rename, **`rm -rf .next/` then re-run `next dev` / `next build`** to clear cached route manifests.                                                                                                                                                                                                                              | Run `rm -rf .next/` after the rename commit (the planner should include this in the verification step). |
| Browser tabs (active sessions) | A user with `/dashboard/<cuid>` open in another tab will keep working post-rename because the URL pattern is the same — only the param name changes. `<Link href="/dashboard/${id}">` callers (8 hits across the codebase) all pass `id` as a value, not via the param name.                                                                                                                                                                    | None — verified safe.                                                                                   |
| Phase 7 prior route renames    | The route `src/app/api/servers/` was already deleted in Phase 7 (verified: grep finds zero matches for `/api/servers` in src/). The new `/api/websites/[websiteId]/servers/[serverId]/` keeps `[serverId]` as the param name for the **nested MinecraftServer record id** — DO NOT rename this to `[mcserverId]` or similar. That's a different `serverId` (the MinecraftServer id, not the Website id), and Phase 7 D-04 locked the URL shape. | None — confirmed Phase 7 contract.                                                                      |

**The canonical question:** _After every file in the repo is updated, what runtime systems still have the old string cached, stored, or registered?_

**Answer:** Only the Next.js build cache (`.next/`). The phase has no live external state, no stored database data referencing the param name, and no OS-level registrations. The rename is purely a code refactor + dev cache reset.

## Common Pitfalls

### Pitfall 1: Forgetting to update `useParams<{ serverId }>()` type generics after the directory rename

**What goes wrong:** `useParams<{ serverId: string }>()` continues to compile (TypeScript can't check route param names against the directory structure), but `params.serverId` is `undefined` at runtime. The editor renders blank because `serverId` is `undefined`, the `fetch` URL becomes `/api/websites/undefined`, and the 404 lands in `loadError` state.
**Why it happens:** The TS generic on `useParams` is purely a hint to autocomplete; Next.js gives the actual param name from the directory.
**How to avoid:** Update the generic to `<{ websiteId: string }>` AND rename the local destructure (`const serverId = params.serverId` → `const websiteId = params.websiteId`) in the same commit. Verified hit: `[serverId]/page.tsx` line 2242-2243.
**Warning signs:** Editor stuck on "Loading..." or 404 in dev console after the rename.

### Pitfall 2: Modal `useEffect` fetch fires when modal is closed

**What goes wrong:** If the modal's mount-time `useEffect` doesn't guard on `isOpen`, every editor page load fires `GET /api/websites/[id]/servers` even when the user never opens the modal. Wastes a request and pre-warms data that may be stale by the time the modal opens.
**Why it happens:** Common to bind the effect to `[websiteId]` thinking the parent mount is the right trigger.
**How to avoid:** Gate the effect with `if (!isOpen) return;` at the top of the effect body, and include `isOpen` in the dependency array. Per D-02 the fetch happens on every open.
**Warning signs:** Network tab shows the servers fetch on editor mount instead of modal open.

### Pitfall 3: `<a>` inside `<Link>` triggering double navigation

**What goes wrong:** The visit-link anchor (live URL on the card) navigates to the public site AND fires the parent `<Link>` to the editor — user lands on two destinations at once.
**Why it happens:** Click event bubbles from `<a>` up to the parent `<Link>`'s click handler.
**How to avoid:** `onClick={(e) => e.stopPropagation()}` on the visit anchor (D-10 + UI-SPEC §Interaction Contracts). Note: do not use `preventDefault()` here — that would block the new-tab navigation.
**Warning signs:** Manual testing shows the dashboard navigating after a visit-link click.

### Pitfall 4: Modal `max-w-md` shadowing the override

**What goes wrong:** Passing `className="max-w-lg"` to the connections modal still renders at `max-w-md` (448px) because Tailwind's class precedence is source-order-based and both classes are written.
**Why it happens:** The `Modal` component composes `"max-w-md w-full ..."` with the passed `className` via `cn()` (which uses `tailwind-merge`). Verify the merge actually wins.
**How to avoid:** `tailwind-merge` handles `max-w-*` conflicts correctly (verified per the library's conflict groups), so this should Just Work. But if the merged class string has both, the LATER one wins. The `Modal` component's `cn("max-w-md w-full ...", className)` places the override second, so `max-w-lg` does win. Plan to manually verify in dev.
**Warning signs:** Modal renders at 448px width instead of 512px width (`max-w-lg`).

### Pitfall 5: Phase 7 carry-forward regressions during refactor

**What goes wrong:** Edits in `actions.ts` or `[subdomain]/page.tsx` accidentally drop one of: D-19 P2002 catch, D-20 user existence check, BL-05 race-free subdomain (no pre-check), or BL-06 description null round-trip. Subdomain duplicates now silently 500 instead of 409, or descriptions can't be cleared.
**Why it happens:** Refactor PRs touch adjacent lines; reviewer assumes "small change" doesn't need full carry-forward verification.
**How to avoid:** Plan-check phase must verify each of Phase 7's 21 D-decisions + 15 review fixes is still intact after the changes. Specifically watch: `actions.ts` (D-19, D-20, BL-05, BL-06), `/api/websites/route.ts` (D-19 + BL-02), `/api/websites/[websiteId]/route.ts` (everything).
**Warning signs:** Manual test: create a website with subdomain "test", try to create another with same subdomain — should get 409 with the message "Subdomain is already taken". Submitting empty description in settings form — should clear (set to null), not be silently dropped.

### Pitfall 6: Visit-link without `noreferrer noopener`

**What goes wrong:** Opening user-controlled subdomains in `target="_blank"` without `rel="noreferrer noopener"` exposes the dashboard's `window.opener` to the popup — a reverse-tabnabbing vector. The public site is the user's own content, but the principle still applies.
**Why it happens:** Easy to forget; `target="_blank"` is muscle-memory.
**How to avoid:** Always include `rel="noreferrer noopener"` (UI-SPEC already specifies this).
**Warning signs:** Lighthouse / accessibility audit flags it.

### Pitfall 7: The dashboard `WebsiteData` type vs. the preview `WebsiteData` type drift

**What goes wrong:** `src/components/preview/types.ts` defines `WebsiteData` (with `name`, `subdomain`, `serverIp`, etc.) consumed by the public renderer. The dashboard list pages ALSO define a local `interface WebsiteData` (with `id`, `name`, `subdomain`, `description`, `published`, timestamps) — different shape. If a future refactor "consolidates" these, the public renderer's prop contract breaks.
**Why it happens:** Same name, different scope.
**How to avoid:** Either rename the dashboard-local interface (e.g., `DashboardWebsite`) or leave both as-is. For Phase 8, leave both; the local one needs to gain an optional `_count: { sections: number }` field. The preview-side `WebsiteData` will drop `serverIp` (D-14).
**Warning signs:** TypeScript error in `preview-client.tsx` after the dashboard type changes.

### Pitfall 8: Build cache after route directory rename

**What goes wrong:** After renaming `[serverId]/` to `[websiteId]/`, the dev server's hot-reload shows a stale 404 or routes both old and new params. `next build` may also cache the old route group.
**Why it happens:** Next.js `.next/` build artifacts are keyed off the directory structure that existed when the route manifest was generated.
**How to avoid:** Delete `.next/` after the rename. The planner should include `rm -rf .next/` as a step in the rename plan's verification command.
**Warning signs:** Dev server "404" with the route in `.next/server/app-paths-manifest.json` referencing the old name.

## Code Examples

### `WebsiteCard` extraction skeleton (consumed by both list pages)

```tsx
// src/components/dashboard/website-card.tsx
'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Layers, MoreHorizontal, Server } from 'lucide-react';

import Link from 'next/link';

import { Badge } from '@/components/ui';

export interface WebsiteCardData {
	id: string;
	name: string;
	subdomain: string;
	description: string | null;
	published: boolean;
	updatedAt: string;
	_count: { sections: number }; // D-09 — added in Phase 8
}

interface WebsiteCardProps {
	website: WebsiteCardData;
	index: number; // for staggered framer-motion delay
}

export function WebsiteCard({ website, index }: WebsiteCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 + index * 0.1 }}
		>
			<Link href={`/dashboard/${website.id}`}>
				<motion.div
					whileHover={{ y: -4, transition: { duration: 0.15 } }}
					className="group cursor-pointer rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:border-cyan-200/50 hover:shadow-lg"
				>
					{/* Header */}
					<div className="mb-4 flex items-start justify-between">
						<div className="flex items-center gap-3">
							<div
								className={`flex h-10 w-10 items-center justify-center rounded-xl ${
									website.published
										? 'bg-gradient-to-br from-cyan-500 to-emerald-500'
										: 'bg-zinc-200'
								}`}
							>
								<Server className="h-5 w-5 text-white" />
							</div>
							<div>
								<h3 className="font-semibold text-zinc-900 transition-colors group-hover:text-cyan-600">
									{website.name}
								</h3>
								<p className="text-xs text-zinc-400">
									{website.subdomain}.minesites.net
								</p>
							</div>
						</div>
						<motion.button
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							onClick={(e) => e.preventDefault()}
							className="rounded-lg p-1.5 transition-colors hover:bg-zinc-100"
						>
							<MoreHorizontal className="h-4 w-4 text-zinc-400" />
						</motion.button>
					</div>

					{/* Description */}
					{website.description && (
						<p className="mb-4 line-clamp-2 text-sm text-zinc-500">
							{website.description}
						</p>
					)}

					{/* Info row (D-09: section count) */}
					<div className="mb-4 flex items-center gap-4">
						<Badge
							variant="default"
							aria-label={`${website._count.sections} sections in this website`}
						>
							<Layers className="mr-1 inline h-3.5 w-3.5" />
							{website._count.sections} sections
						</Badge>
					</div>

					{/* Footer (D-10: live status pill + visit link) */}
					<div className="flex items-center justify-between border-t border-zinc-100 pt-4">
						<span
							className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
								website.published
									? 'bg-emerald-50 text-emerald-600'
									: 'bg-zinc-100 text-zinc-500'
							}`}
						>
							<span
								className={`h-1.5 w-1.5 rounded-full ${
									website.published ? 'bg-emerald-500' : 'bg-zinc-400'
								}`}
							/>
							{website.published ? 'Live' : 'Draft'}
						</span>
						<a
							href={`https://${website.subdomain}.minesites.net`}
							target="_blank"
							rel="noreferrer noopener"
							onClick={(e) => e.stopPropagation()}
							aria-label={`Visit live site for ${website.name}`}
							className="flex items-center gap-1 text-xs text-cyan-600 opacity-0 transition-opacity group-hover:opacity-100"
						>
							Visit <ArrowUpRight className="h-3 w-3" />
						</a>
					</div>
				</motion.div>
			</Link>
		</motion.div>
	);
}
```

Source: extracted from `src/app/(dashboard)/dashboard/page.tsx` lines 147-217 and `src/app/(dashboard)/dashboard/servers/page.tsx` lines 170-240 (the two near-identical JSX trees).

### `_count.sections` server-side change (single line)

```diff
// src/app/api/websites/route.ts (GET handler, line ~16-28)
const websites = await db.website.findMany({
  where: { userId: session.user.id },
  orderBy: { updatedAt: "desc" },
  select: {
    id: true,
    name: true,
    subdomain: true,
    description: true,
    published: true,
    createdAt: true,
    updatedAt: true,
+   _count: { select: { sections: true } },
  },
});
```

Prisma's `select` and `_count` compose without conflict. Response shape gains `_count: { sections: number }` on every record. [VERIFIED: Prisma v7 docs convention — `_count` is a special select key.]

### `ConnectionsModal` skeleton

```tsx
// src/components/dashboard/connections-modal.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil, Server, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useEffect, useState } from 'react';

import {
	Button,
	Input,
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
	Textarea,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { createMcserverSchema, type CreateMcserverInput } from '@/lib/validations/mcserver';

interface McServer {
	id: string;
	name: string;
	ip: string;
	port: number;
	description: string | null;
}

type RowMode = 'read' | 'edit' | 'confirm-delete';

interface ConnectionsModalProps {
	websiteId: string;
	isOpen: boolean;
	onClose: () => void;
}

export function ConnectionsModal({ websiteId, isOpen, onClose }: ConnectionsModalProps) {
	const [servers, setServers] = useState<McServer[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [rowMode, setRowMode] = useState<Record<string, RowMode>>({});
	const [showAddForm, setShowAddForm] = useState(false);
	const { toast } = useToast();

	// D-02: fetch on every open
	useEffect(() => {
		if (!isOpen) return;
		let cancelled = false;
		async function load() {
			setIsLoading(true);
			try {
				const res = await fetch(`/api/websites/${websiteId}/servers`);
				if (!res.ok) throw new Error('Failed to load servers');
				const data = await res.json();
				if (!cancelled) setServers(data);
			} catch (err) {
				if (!cancelled)
					toast(err instanceof Error ? err.message : 'Failed to load', 'error');
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [isOpen, websiteId, toast]);

	// D-03: independent commits
	const addServer = async (data: CreateMcserverInput) => {
		const res = await fetch(`/api/websites/${websiteId}/servers`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.error ?? 'Failed to add server');
		}
		const created: McServer = await res.json();
		setServers((s) => [...s, created]);
		setShowAddForm(false);
		toast('Server added', 'success');
	};

	const updateServer = async (id: string, data: Partial<CreateMcserverInput>) => {
		/* PUT */
	};
	const deleteServer = async (id: string) => {
		const res = await fetch(`/api/websites/${websiteId}/servers/${id}`, { method: 'DELETE' });
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.error ?? 'Failed to delete');
		}
		setServers((s) => s.filter((srv) => srv.id !== id));
		setRowMode((m) => {
			const { [id]: _, ...rest } = m;
			return rest;
		});
		toast('Server removed', 'success');
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
			<ModalHeader>
				<ModalTitle>Connected Minecraft Servers</ModalTitle>
			</ModalHeader>
			<ModalContent className="scrollbar-thin max-h-[60vh] overflow-y-auto">
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
						<span className="ml-2 text-sm text-zinc-500">Loading servers...</span>
					</div>
				) : servers.length === 0 ? (
					<EmptyState onAdd={() => setShowAddForm(true)} />
				) : (
					<ServerList
						servers={servers}
						rowMode={rowMode}
						setRowMode={setRowMode}
						onUpdate={updateServer}
						onDelete={deleteServer}
					/>
				)}
				{showAddForm && (
					<AddServerForm onSubmit={addServer} onCancel={() => setShowAddForm(false)} />
				)}
				{!showAddForm && servers.length > 0 && (
					<Button variant="ghost" onClick={() => setShowAddForm(true)} className="mt-4">
						+ Add Server
					</Button>
				)}
			</ModalContent>
		</Modal>
	);
}
```

### Editor top-bar integration (~15-line delta in god-component)

```tsx
// src/app/(dashboard)/dashboard/[websiteId]/page.tsx, ~line 2573 (top of the action cluster)
import { ConnectionsModal } from "@/components/dashboard/connections-modal";

// Inside the component body, near the other useState calls:
const [connectionsOpen, setConnectionsOpen] = useState(false);

// Inside the action cluster (between the unsaved-changes pill and Preview button):
<motion.button
  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
  onClick={() => setConnectionsOpen(true)}
  className="flex items-center gap-2 px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl text-sm font-medium transition-colors"
>
  <Server className="w-4 h-4" />
  Manage Servers
</motion.button>

// At the bottom of the component's return tree:
<ConnectionsModal
  websiteId={websiteId}
  isOpen={connectionsOpen}
  onClose={() => setConnectionsOpen(false)}
/>
```

The `Server` icon is already imported in the god-component (verified line 48 of page.tsx) — no new import needed for the icon, only for `ConnectionsModal`.

### Public-site cleanup (D-14)

```diff
// src/app/[subdomain]/page.tsx, line ~32-36
const serverData = {
  name: server.name,
  subdomain: server.subdomain,
- serverIp: null as string | null,
};
```

```diff
// src/components/preview/types.ts, line ~3-10
export interface WebsiteData {
  name: string;
  subdomain: string;
- serverIp: string | null;
  players?: number;
  maxPlayers?: number;
  version?: string;
}
```

```diff
// src/app/[subdomain]/layout.tsx, line ~76-77, 106
const serverName = server?.name ?? subdomain;
- const serverIp = "";   // Phase 6 placeholder; Phase 7 adds MinecraftServer lookup
...
- <SiteNav serverName={serverName} serverIp={serverIp} />
+ <SiteNav serverName={serverName} />
```

```diff
// src/components/site/nav.tsx
- interface SiteNavProps { serverName: string; serverIp: string; }
+ interface SiteNavProps { serverName: string; }
- export function SiteNav({ serverName, serverIp }: SiteNavProps) {
+ export function SiteNav({ serverName }: SiteNavProps) {
- // ... copy-IP state + button (~25 lines) — REMOVE
+ // (Copy IP button removed; future SECT-02/SECT-03 will re-add via a section type)
```

Note: `src/components/sections/hero-section.tsx` also has a `serverIp?: string | null` prop (line 10) — verify whether it's still consumed. Per Phase 1 D-04 the Hero is the only extracted section; the `serverIp` block at lines 58-78 is dead code given that no caller passes it (PreviewClient now passes the new `WebsiteData` shape without `serverIp`). This may or may not be in Phase 8 scope depending on planner discretion — flag as a question.

## State of the Art

| Old Approach                                              | Current Approach                                                      | When Changed            | Impact                                          |
| --------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------- | ----------------------------------------------- |
| `Server`/`serverId` (Phase 6 pre-rename)                  | `Website`/`websiteId`                                                 | Phase 6 (schema rename) | Done; Phase 8 finishes the cleanup.             |
| `/api/servers/[serverId]`                                 | `/api/websites/[websiteId]` + `/api/websites/[id]/servers[/serverId]` | Phase 7                 | API endpoints done; Phase 8 is the UI consumer. |
| Inline ~80-line card JSX duplicated across two list pages | Shared `WebsiteCard` component                                        | Phase 8 (this phase)    | Extraction blocks future drift.                 |
| Card without section count                                | Card with `_count.sections` badge                                     | Phase 8 (this phase)    | New visibility.                                 |
| Editor without connection management                      | Editor with "Manage Servers" modal                                    | Phase 8 (this phase)    | Closes DASH-03.                                 |
| `useParams<{ serverId }>()`                               | `useParams<{ websiteId }>()` after directory rename                   | Phase 8 (this phase)    | Terminology consistency.                        |

**Deprecated/outdated:**

- `serverIp`/`serverPort` fields on `server-settings.tsx`'s local `Server` interface — drop per D-14. The form does not render them. [VERIFIED: file inspection, lines 10-17]
- `serverIp` prop on `SiteNav` — drop per D-14. [VERIFIED: lines 6-11 of `src/components/site/nav.tsx`]
- `serverIp` field on `WebsiteData` in `src/components/preview/types.ts` — drop. [VERIFIED: lines 3-10]
- `serverIp = ""` placeholder in `[subdomain]/layout.tsx` line 77 — drop. [VERIFIED]
- The `Copy IP` button + clipboard logic in `SiteNav` — drop (re-introduced by future SECT-02/SECT-03). [VERIFIED]
- **Note on dead code already present:** `ServerActions` (`src/app/(dashboard)/dashboard/[serverId]/server-actions.tsx`) and `ServerSettings` (`server-settings.tsx`) are both EXPORTED but NEVER IMPORTED anywhere (verified by grep across all .ts/.tsx files in src/). They're orphaned from a pre-Phase-1 layout. Phase 8 does not need to delete them, but the local-type rename (D-15) should still touch them to keep type names consistent — OR the planner can decide to delete them since they're unused. Recommend keeping them and renaming (D-15/D-16), since deletion expands scope and may surprise reviewers.

## Project Constraints (from CLAUDE.md)

These directives are extracted from `./CLAUDE.md` and have the same authority as locked decisions:

1. **Never grow the god-component** (`src/app/(dashboard)/dashboard/[serverId]/page.tsx`, ~3187 lines per actual count) — new sections go in `src/components/sections/render/` and `src/components/sections/settings/`. **Phase 8 application:** The "Manage Servers" button + `<ConnectionsModal />` mount in the god-component must add ≤ 15 lines net. The modal component itself lives in `src/components/dashboard/connections-modal.tsx`. The shared `WebsiteCard` lives in `src/components/dashboard/website-card.tsx`. Plans MUST NOT inline the modal body or card JSX in the god-component.
2. **CSS isolation is mandatory** — server website styles live under `.site-root`. Dashboard styles must never bleed into public pages. **Phase 8 application:** All new components (`WebsiteCard`, `ConnectionsModal`) render inside the dashboard layout, NOT inside `.site-root`. The public-path changes (D-14) only DROP a prop; no new styling is added in `.site-root`. The `SiteNav` cleanup keeps the existing CSS-var-driven styling intact.
3. **Freemium enforcement is server-side** — the `PUT /api/servers/[serverId]` handler validates section count against `user.plan`. **Phase 8 application:** The CLAUDE.md reference to `/api/servers` is stale (Phase 7 moved to `/api/websites`); the guard now lives in `PUT /api/websites/[websiteId]/route.ts` (verified). The `ConnectionsModal` does NOT touch this endpoint — MinecraftServer CRUD has its own per-record endpoints with no freemium gate. Plans MUST NOT add a section limit to the MinecraftServer endpoints.
4. **Player count is non-blocking** — Suspense + cached Route Handler. **Phase 8 application:** Player count is NOT in scope. Cards show section count (`_count.sections`) only, not player count. (D-09 + Deferred Ideas.)
5. **Visual effects are `ssr: false`** — particles and parallax use `next/dynamic({ ssr: false })`. **Phase 8 application:** No effects added. The card entrance + modal animations use `framer-motion`'s standard `motion.div` (client component only, no SSR concern).

## Validation Architecture

> Project config `.planning/config.json` sets `workflow.nyquist_validation: false`. Per the research protocol, this section is **SKIPPED**.

No automated test framework is configured in this project (verified: `package.json` has no `test` script, no `jest.config`, `vitest.config`, or `__tests__/` directory). The CONVENTIONS.md TESTING.md doc indicates testing has not been adopted.

Verification for Phase 8 is therefore manual + TypeScript-compile gate:

- `npx tsc --noEmit` must pass after all phases
- `next build` must succeed (catches route directory issues)
- Manual smoke test: create website → add MinecraftServer via modal → edit it → delete it → visit live URL → confirm public page renders → confirm Phase 7 carry-forwards (subdomain 409 on conflict, section count limit, description clear)

## Security Domain

### Applicable ASVS Categories

| ASVS Category         | Applies | Standard Control                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V2 Authentication     | yes     | NextAuth v5 session via `auth()` helper; verified in all endpoints. No change in Phase 8.                                                                                                                                                                                                                                                                                                                                              |
| V3 Session Management | yes     | JWT strategy; `requireUser()` helper for write paths (added Phase 7 WR-02). No change in Phase 8.                                                                                                                                                                                                                                                                                                                                      |
| V4 Access Control     | yes     | Per-record ownership check on `MinecraftServer` endpoints via parent Website's `userId` (Phase 7 D-05). No change in Phase 8 — modal trusts the backend.                                                                                                                                                                                                                                                                               |
| V5 Input Validation   | yes     | `createMcserverSchema` / `updateMcserverSchema` (Phase 7 D-07..D-09); IP regex hardened in WR-08. The `WebsiteCard` renders user-controlled `name`, `description`, `subdomain`. Risk: stored XSS via `name`/`description` if rendered as HTML. **All renders use React's default text interpolation (`{website.name}`) which is HTML-encoded — verified across both list pages.** No `dangerouslySetInnerHTML` is added in this phase. |
| V6 Cryptography       | no      | No new crypto in this phase.                                                                                                                                                                                                                                                                                                                                                                                                           |
| V14 Configuration     | yes     | Subdomain rewrite logic in `middleware.ts` is unchanged. Phase 8 does not modify middleware.                                                                                                                                                                                                                                                                                                                                           |

### Known Threat Patterns for the Phase 8 surface

| Pattern                                                           | STRIDE                 | Standard Mitigation                                                                                                                                                                             |
| ----------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Stored XSS via `Website.name` rendered in card                    | Tampering (XSS)        | React text-interpolation auto-encodes; no `dangerouslySetInnerHTML`. **Verified safe.**                                                                                                         |
| Stored XSS via `MinecraftServer.ip` rendered in connections modal | Tampering              | Zod regex on `ip` rejects HTML/JS chars (Phase 7 WR-08 regex `/^(?:\[[0-9a-fA-F:]+\]                                                                                                            | [a-zA-Z0-9][a-zA-Z0-9.-]\*)(?::[0-9]{1,5})?$/`). React encoding is the second line. **Verified safe.** |
| Reverse tab-nabbing via visit link                                | Spoofing               | `rel="noreferrer noopener"` on `<a target="_blank">` (D-10 + UI-SPEC).                                                                                                                          |
| Cross-website MinecraftServer edit                                | Elevation of privilege | Phase 7 D-05 ownership chain: endpoint verifies `MinecraftServer.websiteId === requested websiteId` AND `Website.userId === session.user.id` before any mutation. The modal cannot bypass this. |
| Cross-user data leak via stale FK (deleted User row)              | Information disclosure | Phase 7 WR-02 `requireUser()` returns 401 when the User row is deleted. The modal handles this as "Session expired — please re-login".                                                          |
| Subdomain takeover via P2002 race                                 | Elevation of privilege | Phase 6 CR-01 + Phase 7 BL-02 target-specific P2002 catch + BL-05 (drop TOCTOU pre-check). Modal/dialog do not change this.                                                                     |

**Phase 8 introduces no new attack surface** — every endpoint it consumes is from Phase 7 and is already hardened. The modal's only new code is client-side state + fetch + render, all going through React's auto-encoding.

## Assumptions Log

> List of claims tagged `[ASSUMED]` that need confirmation. Most claims in this research are `[VERIFIED]` against the codebase or `[CITED]` from CONTEXT.md / UI-SPEC.

| #   | Claim                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Section                                 | Risk if Wrong                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Prisma `_count` works alongside `select` in v7 — `select: { id: true, ..., _count: { select: { sections: true } } }` is valid syntax.                                                                                                                                                                                                                                                                                                                                                                                                                                     | Architecture / `_count.sections` change | LOW. Standard Prisma pattern documented across v3-v7. If Prisma v7 changed the API (unlikely — `_count` is stable), the planner falls back to `include` + restructure. Verification: try the query in a smoke test before declaring DASH-01 done.                                                                                                                                                                                       |
| A2  | `tailwind-merge` correctly resolves the `max-w-md` vs. `max-w-lg` conflict when the Modal composes `cn("...max-w-md ...", className)` and `className="max-w-lg"` is passed.                                                                                                                                                                                                                                                                                                                                                                                               | Pitfall 4                               | LOW. `tailwind-merge` is designed for exactly this. If wrong, plan-checker manual test catches it.                                                                                                                                                                                                                                                                                                                                      |
| A3  | The dev server picks up the route directory rename without `next dev` restart on Linux/macOS. (Windows users sometimes need a restart due to fs-watch.)                                                                                                                                                                                                                                                                                                                                                                                                                   | Pitfall 8 / Runtime State Inventory     | LOW. Worst case: a single dev restart + `rm -rf .next/`. Planner should include both as verification steps.                                                                                                                                                                                                                                                                                                                             |
| A4  | The `MoreHorizontal` dropdown button in the existing card body has no functional handler today (just `e.preventDefault()`) — Phase 8 preserves that behavior, not adding a real menu.                                                                                                                                                                                                                                                                                                                                                                                     | Code Examples (`WebsiteCard`)           | LOW. UI-SPEC does not mention a dropdown menu for this iteration. If the planner wants to wire one, it's discretion territory but adds scope.                                                                                                                                                                                                                                                                                           |
| A5  | The existing `Badge` UI primitive has a `variant="default"` (or equivalent) producing the `bg-zinc-100 text-zinc-700` neutral style the UI-SPEC mandates for the section count. Did not verify Badge variants source.                                                                                                                                                                                                                                                                                                                                                     | Code Examples / UI-SPEC                 | LOW-MEDIUM. Plan should inspect `src/components/ui/badge.tsx` to confirm variant API; if it differs, adjust the className.                                                                                                                                                                                                                                                                                                              |
| A6  | `framer-motion`'s `whileHover={{ y: -4 }}` works correctly inside a `<Link>` anchor — Next.js `<Link>` renders an `<a>` tag, and `<motion.div>` as child is fine.                                                                                                                                                                                                                                                                                                                                                                                                         | Code Examples                           | LOW. This is the existing pattern in the codebase (verified at lines 155-158 of dashboard/page.tsx).                                                                                                                                                                                                                                                                                                                                    |
| A7  | `src/components/sections/hero-section.tsx`'s `serverIp` prop (line 10) is dead code given that PreviewClient no longer passes the field — confirmed by inspecting PreviewClient (line 760 `<entry.render section={section} serverData={server} />` where `server` will no longer have `serverIp` after D-14). The Hero render at line 760 is dispatched via the SECTION_REGISTRY and the registry's render fn takes `serverData: WebsiteData` (which loses `serverIp`). Therefore the Hero render's references to `serverData.serverIp` (lines 58-78) become `undefined`. | State of the Art / Deprecated           | MEDIUM. **Action recommended:** Plan should include a pass over `src/components/sections/hero-section.tsx` AND `src/components/sections/render/hero-render.tsx` to drop their `serverIp` consumers, OR confirm those files are also unused (the Hero rendering goes through `hero-render.tsx` per the section registry, not `hero-section.tsx`). Quick grep confirms `hero-section.tsx` may be orphaned — recommend the planner verify. |
| A8  | Phase 7 `GET /api/websites` returns websites ordered by `updatedAt: "desc"` — confirmed [VERIFIED line 18 of route.ts]. The card render order will follow this ordering naturally without sort logic in the client.                                                                                                                                                                                                                                                                                                                                                       | Architecture                            | LOW. Verified.                                                                                                                                                                                                                                                                                                                                                                                                                          |

## Open Questions

1. **Should the `ConnectionsModal` show port `25565` as default in the form, or only as placeholder, or omit when 25565 (default)?**
    - What we know: Zod schema makes `port` optional with `@default(25565)` at the Prisma layer. UI-SPEC says "port placeholder `25565`".
    - What's unclear: When DISPLAYING an existing server's row, should `:25565` show or be hidden? UI-SPEC D-05 just says "`IP:port`" in the read row.
    - Recommendation: Always show `IP:port` literally (so users know what port the server is on, including default). Planner picks the formatter (`${ip}:${port}`).

2. **Should the planner delete the orphaned `ServerActions` and `ServerSettings` files, or keep them and rename per D-15/D-16?**
    - What we know: Both are exported but never imported anywhere (grep-verified).
    - What's unclear: D-15 says rename local types; D-16 says optionally rename filenames. Neither explicitly says delete.
    - Recommendation: Keep both files, apply D-15 type renames, and skip D-16 filename renames for now (smaller diff). Add a TODO comment noting they're orphaned. A future cleanup phase can delete them when the editor's "delete website" flow is actually wired up.

3. **Should the connections modal's "Add Server" affordance be a button-that-expands or an always-visible empty form row?**
    - What we know: D-04 says planner picks; UI-SPEC §`ConnectionsModal` shows a ghost `[+ Add Server]` button that expands into an inline form card.
    - What's unclear: For the empty state (0 servers), the UI-SPEC shows an empty-state CTA button — meaning two different "add" affordances for empty vs. populated state.
    - Recommendation: Use the empty-state CTA when `servers.length === 0`, switch to the bottom-of-list ghost button when `servers.length > 0`. This is consistent with the UI-SPEC and reads well in both states.

4. **Does `hero-section.tsx` need to be touched in Phase 8?**
    - What we know: It has a `serverIp` prop reference at lines 10, 13, 58, 70, 75.
    - What's unclear: Whether it's even imported in the active render path. `hero-render.tsx` is the registry-dispatched render fn per Phase 1 D-04.
    - Recommendation: Plan should grep `from.*hero-section` to confirm usage. If unused, leave alone (out of phase scope); if used, drop `serverIp` consumer.

5. **Should the `WebsiteData` interface in the dashboard list pages add `_count.sections` before or after the API change?**
    - What we know: Both interfaces need updating; the API change is one line.
    - What's unclear: Order matters if the changes are split across plans.
    - Recommendation: Single plan, single commit for the API + both list pages + shared card type. They're tightly coupled.

## Environment Availability

This phase has no external service dependencies beyond what Phase 7 already requires.

| Dependency   | Required By        | Available               | Version                         | Fallback                  |
| ------------ | ------------------ | ----------------------- | ------------------------------- | ------------------------- |
| PostgreSQL   | Prisma queries     | yes (Phase 6 verified)  | 15+                             | none — schema established |
| `next` 16.x  | App Router runtime | yes                     | 16.1.6 [VERIFIED: package.json] | —                         |
| Node 20+     | Build              | assumed (Phase 1-7 ran) | —                               | —                         |
| `npm`/`pnpm` | Install/build      | assumed                 | —                               | —                         |

**No missing dependencies.** All packages exist in `package.json` (verified).

## Sources

### Primary (HIGH confidence)

- `package.json` — exact versions of next, react, framer-motion, lucide-react, react-hook-form, zod, tailwindcss
- `prisma/schema.prisma` — Website, MinecraftServer, Section, User models (lines 61-109)
- `src/components/ui/modal.tsx` — Modal API + `cn()` merge behavior (lines 14, 49-58)
- `src/components/ui/toast.tsx` — `useToast()` signature (lines 13-15, 25-34)
- `src/lib/validations/mcserver.ts` — Zod schemas with hardened IP regex (lines 17-24, 25-34)
- `src/lib/validations/website.ts` — Zod schemas + BL-06 nullable description (lines 16-20)
- `src/app/api/websites/route.ts` — current GET list shape; site of the `_count` extension (lines 16-28)
- `src/app/api/websites/[websiteId]/servers/route.ts` — POST endpoint shape (full file)
- `src/app/api/websites/[websiteId]/servers/[serverId]/route.ts` — PUT + DELETE endpoints (full file)
- `src/app/(dashboard)/dashboard/page.tsx` — current card duplication (lines 147-217)
- `src/app/(dashboard)/dashboard/servers/page.tsx` — current card duplication (lines 170-240)
- `src/app/(dashboard)/dashboard/[serverId]/page.tsx` — `useParams` + serverId hits (lines 4, 2242-2243, 2279, 2331, 2377, 2425) + top-bar action cluster (lines 2548-2603) + ServerDataState (lines 2245-2254) + SectionPreview call site with serverIp:null (line 2920)
- `src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx` — local Server interface with serverIp/serverPort (lines 10-17)
- `src/app/(dashboard)/dashboard/[serverId]/server-actions.tsx` — orphaned (lines 18-22)
- `src/app/(dashboard)/dashboard/create-server-dialog.tsx` — dialog rename target (lines 20-25)
- `src/app/[subdomain]/page.tsx` — serverData with serverIp:null (line 35)
- `src/app/[subdomain]/layout.tsx` — serverIp placeholder + SiteNav prop (lines 77, 106)
- `src/app/[subdomain]/preview-client.tsx` — WebsiteData import + prop (lines 22, 733)
- `src/components/preview/types.ts` — WebsiteData with serverIp (lines 3-10)
- `src/components/site/nav.tsx` — full file; serverIp prop + Copy IP button
- `src/components/sections/hero-section.tsx` — possibly orphaned; serverIp prop (lines 10, 13)
- `src/middleware.ts` — subdomain rewrite (full file; no changes needed)
- `src/lib/api-auth.ts` + `src/lib/api-error.ts` — Phase 7 review fix helpers (reused by all endpoints)
- `src/lib/utils.ts` — `formatRelativeTime` (lines 17-34)
- `.planning/phases/08-dashboard-public-site/08-CONTEXT.md` — user decisions D-01..D-20
- `.planning/phases/08-dashboard-public-site/08-UI-SPEC.md` — visual contract
- `.planning/phases/07-api-layer/07-CONTEXT.md` — D-01..D-21 Phase 7 contract
- `.planning/phases/07-api-layer/07-REVIEW-FIX.md` — BL-01..BL-06, WR-01..WR-09 fixes
- `.planning/phases/06-schema-reset/06-CONTEXT.md` — schema decisions D-01..D-08
- `.planning/REQUIREMENTS.md` — DASH-01..DASH-04
- `./CLAUDE.md` — project rules 1-5

### Secondary (MEDIUM confidence)

- `.planning/codebase/ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md` — overall patterns (Date: 2026-05-07; refreshed pre-Phase-6 — some content may reflect old model names, but architecture patterns are intact)

### Tertiary (LOW confidence)

- None. All claims in this research are either VERIFIED against the live codebase (today, 2026-05-12) or CITED from CONTEXT.md / UI-SPEC / Phase 6-7 documents.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all packages verified in `package.json`; all patterns verified in existing codebase.
- Architecture: HIGH — every file path verified; every line number checked; every prop/type signature inspected.
- Pitfalls: HIGH — based on observed Phase 7 review fixes (BL-01..BL-06) and known Next.js / React behaviors; the rename-cache-bust pitfall is generic Next.js knowledge.
- Code examples: HIGH — extracted directly from existing files and adapted; type signatures match the Phase 7 API surface.
- Security: HIGH — endpoint hardening is Phase 7's work; Phase 8 adds zero new attack surface.
- Open questions: ENUMERATED — five known gaps flagged for planner discretion.

**Research date:** 2026-05-12
**Valid until:** 2026-06-11 (30 days — codebase is stable, no upstream library churn expected; if Next.js 16 minor bumps appear, recheck the `useParams` typing API)
