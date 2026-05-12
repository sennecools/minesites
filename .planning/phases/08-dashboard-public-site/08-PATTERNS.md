# Phase 8: Dashboard & Public Site - Pattern Map

**Mapped:** 2026-05-12
**Files analyzed:** 12 (2 new + 10 modified)
**Analogs found:** 12 / 12

## File Classification

| New/Modified File                                                     | Role               | Data Flow                         | Closest Analog                                                                           | Match Quality                         |
| --------------------------------------------------------------------- | ------------------ | --------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------- |
| `src/components/dashboard/website-card.tsx` (NEW)                     | component          | render-prop (display)             | `src/app/(dashboard)/dashboard/page.tsx` lines 148-217 (inline card JSX)                 | exact (extraction target)             |
| `src/components/dashboard/connections-modal.tsx` (NEW)                | component          | request-response (CRUD over REST) | `src/app/(dashboard)/dashboard/create-server-dialog.tsx` + `src/components/ui/modal.tsx` | role-match (modal + RHF + Zod)        |
| `src/app/(dashboard)/dashboard/page.tsx` (MOD)                        | page               | request-response                  | itself (consume new `WebsiteCard`; drop inline JSX)                                      | self                                  |
| `src/app/(dashboard)/dashboard/servers/page.tsx` (MOD)                | page               | request-response                  | itself (consume new `WebsiteCard`; drop inline JSX)                                      | self                                  |
| `src/app/(dashboard)/dashboard/create-website-dialog.tsx` (RENAME)    | component          | server-action (FormData)          | `src/app/(dashboard)/dashboard/create-server-dialog.tsx` (current)                       | self (rename only)                    |
| `src/app/(dashboard)/dashboard/[websiteId]/page.tsx` (RENAME+MOD)     | page               | request-response + bulk save      | itself (current `[serverId]/page.tsx`)                                                   | self (param-name sweep + modal mount) |
| `src/app/(dashboard)/dashboard/[websiteId]/server-settings.tsx` (MOD) | component          | server-action (FormData)          | itself (drop legacy fields from local `Server` interface)                                | self                                  |
| `src/app/(dashboard)/dashboard/[websiteId]/server-actions.tsx` (MOD)  | component          | server-action                     | itself (orphaned but type-rename only)                                                   | self                                  |
| `src/app/[subdomain]/page.tsx` (MOD)                                  | page (RSC)         | request-response                  | itself (drop `serverIp: null`)                                                           | self                                  |
| `src/app/[subdomain]/preview-client.tsx` (MOD)                        | component          | display                           | itself (prop type narrow)                                                                | self                                  |
| `src/app/[subdomain]/layout.tsx` (MOD)                                | layout (RSC)       | display                           | itself (drop `serverIp` placeholder + prop)                                              | self                                  |
| `src/components/site/nav.tsx` (MOD)                                   | component          | display                           | itself (drop `serverIp` prop + Copy IP button)                                           | self                                  |
| `src/components/preview/types.ts` (MOD)                               | utility (types)    | n/a                               | itself (drop `serverIp` from `WebsiteData`)                                              | self                                  |
| `src/app/api/websites/route.ts` (MOD)                                 | controller (route) | request-response                  | itself (extend `select` with `_count.sections`)                                          | self                                  |

## Pattern Assignments

### `src/components/dashboard/website-card.tsx` (NEW; component, display)

**Analog:** `src/app/(dashboard)/dashboard/page.tsx` lines 148-217 + `src/app/(dashboard)/dashboard/servers/page.tsx` lines 171-240

**Imports pattern** (from `dashboard/page.tsx` lines 1-15):

```typescript
'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Layers, MoreHorizontal, Server } from 'lucide-react';

import Link from 'next/link';

import { Badge } from '@/components/ui';
```

**Core display pattern** (from `dashboard/page.tsx` lines 149-217 — this is the exact JSX block to lift):

```tsx
<motion.div
	key={server.id}
	initial={{ opacity: 0, y: 20 }}
	animate={{ opacity: 1, y: 0 }}
	transition={{ delay: 0.2 + i * 0.1 }}
>
	<Link href={`/dashboard/${server.id}`}>
		<motion.div
			whileHover={{ y: -4, transition: { duration: 0.15 } }}
			className="group cursor-pointer rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover:border-cyan-200/50 hover:shadow-lg"
		>
			{/* Header */}
			<div className="mb-4 flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div
						className={`flex h-10 w-10 items-center justify-center rounded-xl ${
							server.published
								? 'bg-gradient-to-br from-cyan-500 to-emerald-500'
								: 'bg-zinc-200'
						}`}
					>
						<Server className="h-5 w-5 text-white" />
					</div>
					<div>
						<h3 className="font-semibold text-zinc-900 transition-colors group-hover:text-cyan-600">
							{server.name}
						</h3>
						<p className="text-xs text-zinc-400">{server.subdomain}.minesites.net</p>
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
			{server.description && (
				<p className="mb-4 line-clamp-2 text-sm text-zinc-500">{server.description}</p>
			)}

			{/* Info — currently empty; DASH-04 section-count Badge slots here */}
			<div className="mb-4 flex items-center gap-4"></div>

			{/* Footer */}
			<div className="flex items-center justify-between border-t border-zinc-100 pt-4">
				<span
					className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
						server.published
							? 'bg-emerald-50 text-emerald-600'
							: 'bg-zinc-100 text-zinc-500'
					}`}
				>
					<span
						className={`h-1.5 w-1.5 rounded-full ${
							server.published ? 'bg-emerald-500' : 'bg-zinc-400'
						}`}
					/>
					{server.published ? 'Live' : 'Draft'}
				</span>
				<span className="flex items-center gap-1 text-xs text-cyan-600 opacity-0 transition-opacity group-hover:opacity-100">
					Edit <ArrowUpRight className="h-3 w-3" />
				</span>
			</div>
		</motion.div>
	</Link>
</motion.div>
```

**Modifications to apply when extracting:**

1. **Section count Badge** in the `Info` row (replaces the currently empty `<div>` on line 195-196):

    ```tsx
    <Badge variant="default" aria-label={`${website._count.sections} sections in this website`}>
    	<Layers className="mr-1 inline h-3.5 w-3.5" />
    	{website._count.sections} sections
    </Badge>
    ```

    `Badge variant="default"` produces `bg-zinc-100 text-zinc-800` per `src/components/ui/badge.tsx` line 14 — matches UI-SPEC neutral pill.

2. **Visit link** (D-10) replaces the hover-only `"Edit ↗"` span (line 210-212):

    ```tsx
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
    ```

    **Critical:** `onClick={(e) => e.stopPropagation()}` — NOT `preventDefault` (would block the new-tab open).

3. **Props interface:**

    ```typescript
    export interface WebsiteCardData {
    	id: string;
    	name: string;
    	subdomain: string;
    	description: string | null;
    	published: boolean;
    	createdAt: string;
    	updatedAt: string;
    	_count: { sections: number }; // D-09 — added in Phase 8
    }

    interface WebsiteCardProps {
    	website: WebsiteCardData;
    	index: number; // for staggered framer-motion delay
    }
    ```

---

### `src/components/dashboard/connections-modal.tsx` (NEW; component, request-response CRUD)

**Analog primary:** `src/app/(dashboard)/dashboard/create-server-dialog.tsx` (Modal + RHF + Zod template)
**Analog secondary:** `src/components/ui/modal.tsx` (chrome contract)
**Analog tertiary:** `src/app/(dashboard)/dashboard/page.tsx` lines 28-50 (local-fetch pattern)

**Imports pattern** (adapted from `create-server-dialog.tsx` lines 1-18):

```typescript
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil, Plus, Server, Trash2, X } from 'lucide-react';
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
import {
	createMcserverSchema,
	updateMcserverSchema,
	type CreateMcserverInput,
} from '@/lib/validations/mcserver';
```

**Important diff vs `create-server-dialog.tsx`:**

- Do NOT import `isRedirectError from "next/dist/client/components/redirect-error"` (line 6 of dialog) — that's for Server Actions. ConnectionsModal calls REST endpoints with `fetch`, which never throw redirects.

**Modal open + className override** (from `modal.tsx` lines 49-53 — `cn()` merges with override winning):

```tsx
<Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
	<ModalHeader>
		<ModalTitle>Connected Minecraft Servers</ModalTitle>
	</ModalHeader>
	<ModalContent className="scrollbar-thin max-h-[60vh] overflow-y-auto">
		{/* body */}
	</ModalContent>
</Modal>
```

`tailwind-merge` (via `cn()`) resolves `max-w-md` (default) vs `max-w-lg` (override) correctly because the override is composed second.

**Fetch-on-open pattern** (adapted from `dashboard/page.tsx` lines 34-50, gated on `isOpen` per Pitfall 2):

```typescript
const [servers, setServers] = useState<McServer[]>([]);
const [isLoading, setIsLoading] = useState(false);
const { toast } = useToast();

useEffect(() => {
	if (!isOpen) return; // D-02 + Pitfall 2: only fetch on open
	let cancelled = false;
	async function load() {
		setIsLoading(true);
		try {
			const res = await fetch(`/api/websites/${websiteId}/servers`);
			if (!res.ok) throw new Error('Failed to load servers');
			const data = await res.json();
			if (!cancelled) setServers(data);
		} catch (err) {
			if (!cancelled) toast(err instanceof Error ? err.message : 'Failed to load', 'error');
		} finally {
			if (!cancelled) setIsLoading(false);
		}
	}
	load();
	return () => {
		cancelled = true;
	};
}, [isOpen, websiteId, toast]);
```

**Form pattern (per-row add/edit)** (adapted from `create-server-dialog.tsx` lines 35-58 — drop the FormData wrapper because this is REST not Server Action):

```typescript
const {
	register,
	handleSubmit,
	formState: { errors, isSubmitting },
	reset,
} = useForm<CreateMcserverInput>({
	resolver: zodResolver(createMcserverSchema),
});

const onAdd = async (data: CreateMcserverInput) => {
	try {
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
		reset();
		setShowAddForm(false);
		toast('Server added', 'success');
	} catch (err) {
		toast(err instanceof Error ? err.message : 'Failed to add server', 'error');
	}
};
```

**Error envelope contract** (Phase 7 WR-04 + `src/app/api/websites/route.ts` line 62-65):

- REST endpoints return `{ error: string, details?: unknown }` for 400/403/404/409/500.
- Read `body.error` and surface via `useToast()`; do NOT collapse to a generic message.

**Field label markup** (from `create-server-dialog.tsx` lines 89-101):

```tsx
<div>
	<label className="mb-1.5 block text-sm font-medium text-zinc-700">Name</label>
	<Input {...register('name')} placeholder="My SMP Server" error={!!errors.name} />
	{errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
</div>
```

**UI-SPEC note:** label weight is `font-normal` (400) per UI-SPEC; the analog uses `font-medium` (500). Override the analog with `font-normal` to comply with UI-SPEC §Typography (only 400/600 in use). Use `text-sm font-normal text-zinc-700 mb-1.5`.

**Port field special handling** (from `mcserver.ts` lines 25-30 — port is `z.number().optional()`):

- Schema expects `number | undefined`, not string. Use `register("port", { valueAsNumber: true })` or coerce manually. Placeholder `25565`. If user leaves blank, send the field stripped (server applies Prisma `@default(25565)` per `/api/websites/[websiteId]/servers/route.ts` line 52).

**Row mode state machine** (D-07 inline delete confirm):

```typescript
type RowMode = 'read' | 'edit' | 'confirm-delete';
const [rowMode, setRowMode] = useState<Record<string, RowMode>>({});
const modeOf = (id: string): RowMode => rowMode[id] ?? 'read';

// UI-SPEC §Interaction Contracts: clicking edit on a row closes any other open
// edit/confirm state for other rows. Clicking delete while in edit cancels edit.
const enterEdit = (id: string) => setRowMode({ [id]: 'edit' });
const enterConfirmDelete = (id: string) => setRowMode({ [id]: 'confirm-delete' });
const exitRowMode = (id: string) =>
	setRowMode((m) => {
		const { [id]: _, ...rest } = m;
		return rest;
	});
```

**Delete handler** (REST `DELETE` returns 204):

```typescript
const onDelete = async (id: string) => {
	try {
		const res = await fetch(`/api/websites/${websiteId}/servers/${id}`, {
			method: 'DELETE',
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.error ?? 'Failed to delete');
		}
		setServers((s) => s.filter((srv) => srv.id !== id));
		exitRowMode(id);
		toast('Server removed', 'success');
	} catch (err) {
		toast(err instanceof Error ? err.message : 'Failed to delete', 'error');
	}
};
```

---

### `src/app/(dashboard)/dashboard/page.tsx` (MOD; page, request-response)

**Self-analog.** Extract lines 147-217 into `<WebsiteCard />`; keep lines 28-50 fetch pattern as-is; extend local `WebsiteData` interface (lines 18-26) to include `_count: { sections: number }`. Update the `<CreateServerDialog>` import + usage to `<CreateWebsiteDialog>` (line 16, 143).

**Diff shape:**

```diff
-import { CreateServerDialog } from "./create-server-dialog";
+import { CreateWebsiteDialog } from "./create-website-dialog";
+import { WebsiteCard } from "@/components/dashboard/website-card";

 interface WebsiteData {
   id: string;
   name: string;
   subdomain: string;
   description: string | null;
   published: boolean;
   createdAt: string;
   updatedAt: string;
+  _count: { sections: number };
 }
```

Inside the grid (lines 148-217 currently), replace the inline `motion.div + Link + ...` with:

```tsx
{
	servers.map((website, i) => <WebsiteCard key={website.id} website={website} index={i} />);
}
```

---

### `src/app/(dashboard)/dashboard/servers/page.tsx` (MOD; page, request-response)

**Self-analog.** Same pattern as `dashboard/page.tsx` MOD. Extract lines 170-240 (grid view) into `<WebsiteCard />`. The list view (lines 263-329) is NOT extracted in this phase — different visual shape, would balloon scope.

**Important:** The local `WebsiteData` interface (lines 21-29) also gains `_count: { sections: number }`. The list-view table doesn't render section count (left as future polish), but the type extension is required for `<WebsiteCard>` consumption above.

**Same dialog rename diff** (line 18, 355): `CreateServerDialog` → `CreateWebsiteDialog`.

---

### `src/app/(dashboard)/dashboard/create-website-dialog.tsx` (RENAME from `create-server-dialog.tsx`)

**Self-analog.** Pure file + component name rename. No body changes. Update:

- `interface CreateServerDialogProps` → `interface CreateWebsiteDialogProps` (line 20).
- `export function CreateServerDialog(...)` → `export function CreateWebsiteDialog(...)` (line 25).

The two import sites (above) need matching updates.

---

### `src/app/(dashboard)/dashboard/[websiteId]/page.tsx` (RENAME from `[serverId]/page.tsx`; MOD)

**Self-analog.** Three changes:

1. **Directory rename** (D-12): `[serverId]/` → `[websiteId]/`. The 3 sibling files (`page.tsx`, `server-actions.tsx`, `server-settings.tsx`) move together. After rename, `rm -rf .next/` is required (Pitfall 8 + Runtime State Inventory).

2. **`useParams` + local destructure** (lines 4, 2242-2243, 2279, 2331, 2377, 2425):

    ```diff
    -import { useParams } from "next/navigation";
    +import { useParams } from "next/navigation";

    -  const params = useParams();
    -  const serverId = params.serverId as string;
    +  const params = useParams();
    +  const websiteId = params.websiteId as string;
    ```

    Then every `serverId` reference (5 hits) becomes `websiteId`.

3. **"Manage Servers" button + modal mount** in the action cluster (currently lines 2573-2603, between `hasUnsavedChanges` pill and `Preview` button — UI-SPEC §Interaction Contracts):

    ```tsx
    // Add to imports (top of file)
    import { ConnectionsModal } from "@/components/dashboard/connections-modal";

    // Add to component state (near line 2271)
    const [connectionsOpen, setConnectionsOpen] = useState(false);

    // Insert in the action cluster (between hasUnsavedChanges pill and Preview button at line 2579)
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setConnectionsOpen(true)}
      className="flex items-center gap-2 px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl text-sm font-medium transition-colors"
    >
      <Server className="w-4 h-4" />
      Manage Servers
    </motion.button>

    // At the bottom of the return tree
    <ConnectionsModal
      websiteId={websiteId}
      isOpen={connectionsOpen}
      onClose={() => setConnectionsOpen(false)}
    />
    ```

    `Server` icon already imported (line 48). Net delta ≤ 15 lines per CLAUDE.md rule 1.

4. **Local type rename** (D-15): the `type ServerDataState` block at lines 2245-2254 — rename to `WebsiteDataState`. Any other `Server*` local types follow.

---

### `src/app/(dashboard)/dashboard/[websiteId]/server-settings.tsx` (MOD)

**Self-analog.** Drop `serverIp` and `serverPort` from the local `Server` interface (lines 10-17) and rename to `Website`:

```diff
-interface Server {
+interface Website {
   id: string;
   name: string;
   subdomain: string;
   description: string | null;
-  serverIp: string | null;
-  serverPort: number | null;
 }

-interface ServerSettingsProps {
-  server: Server;
+interface ServerSettingsProps {
+  server: Website;
 }
```

The form body (lines 84-126) does NOT render `serverIp`/`serverPort` already, so no JSX changes.

**Carry-forward preserved:** BL-06 description round-trip (lines 49-57) — keep the `key === "description"` branch that sends `""` for explicit clear. Do not touch this block.

---

### `src/app/[subdomain]/page.tsx` (MOD; RSC page)

**Self-analog.** Drop `serverIp: null` from the `serverData` object (line 32-36):

```diff
   const serverData = {
     name: server.name,
     subdomain: server.subdomain,
-    serverIp: null as string | null,
   };
```

No other changes. The `db.website.findUnique` query (lines 15-24) and `notFound()` gate (line 27) are untouched — D-17 verification.

---

### `src/app/[subdomain]/preview-client.tsx` (MOD)

**Self-analog.** The `server` prop typing flows from `WebsiteData` in `src/components/preview/types.ts` (imported line 22). Dropping `serverIp` from that interface auto-propagates here. No code change required in this file IF `WebsiteData.serverIp` is the only entry point. Verify by grep that line 366 `PreviewDiscord({ section, serverData })` and line 733 `server: WebsiteData` do not destructure `serverData.serverIp` anywhere — if they do, drop those references.

---

### `src/app/[subdomain]/layout.tsx` (MOD; RSC layout)

**Self-analog.** Per D-14 option (a): drop the placeholder var (line 77) AND drop the `serverIp` prop on `<SiteNav />` (line 106):

```diff
   const serverName = server?.name ?? subdomain;
-  const serverIp = "";   // Phase 6 placeholder; Phase 7 adds MinecraftServer lookup
```

```diff
-      <SiteNav serverName={serverName} serverIp={serverIp} />
+      <SiteNav serverName={serverName} />
```

The deferred SECT-02/SECT-03 phase will re-add the prop when a "default server" concept lands.

---

### `src/components/site/nav.tsx` (MOD; component)

**Self-analog.** Drop the `serverIp` prop and the entire Copy IP button block:

```diff
 "use client";

-import { useState } from "react";
-import { Copy, Check } from "lucide-react";
-
-interface SiteNavProps {
-  serverName: string;
-  serverIp: string;
-}
+interface SiteNavProps {
+  serverName: string;
+}

-export function SiteNav({ serverName, serverIp }: SiteNavProps) {
-  const [copied, setCopied] = useState(false);
-
-  const handleCopy = async () => {
-    if (!serverIp) return;
-    try {
-      await navigator.clipboard.writeText(serverIp);
-      setCopied(true);
-      setTimeout(() => setCopied(false), 2000);
-    } catch {
-      // Clipboard unavailable — fail silently
-    }
-  };
-
+export function SiteNav({ serverName }: SiteNavProps) {
   return (
     <nav className="sticky top-0 z-50 h-14 flex items-center justify-between px-6"
          style={{ backgroundColor: "var(--site-card)" }}>
       <span className="font-bold text-lg"
             style={{ fontFamily: "var(--site-font-display)", color: "var(--site-text)" }}>
         {serverName}
       </span>
-      <button onClick={handleCopy} ... aria-label="Copy server IP">
-        {copied ? <Check ... /> : <Copy ... />}
-        {copied ? "Copied!" : "Copy IP"}
-      </button>
     </nav>
   );
 }
```

The nav becomes a simple branded header. CSS scope (`.site-root` parent) is preserved — no styling changes touch dashboard scope.

---

### `src/components/preview/types.ts` (MOD; types)

**Self-analog.** Drop `serverIp` from `WebsiteData` (lines 3-10):

```diff
 export interface WebsiteData {
   name: string;
   subdomain: string;
-  serverIp: string | null;
   players?: number;
   maxPlayers?: number;
   version?: string;
 }
```

**Knock-on:** `src/components/sections/hero-section.tsx` lines 10, 13, 58, 70, 75 still reference `serverIp`. Per RESEARCH Open Question 4 + Assumption A7: verify whether `hero-section.tsx` is in the active render path (it's likely orphaned; `hero-render.tsx` is the registry-dispatched component). If it's dead code, leave alone (out of phase scope); if any caller passes `serverIp`, drop the prop consumer there.

---

### `src/app/api/websites/route.ts` (MOD; controller, request-response)

**Self-analog.** Extend the `select` block inside `findMany` (lines 16-28) to include `_count.sections` per D-09:

```diff
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
+    _count: { select: { sections: true } },
   },
 });
```

Prisma supports `_count` inside `select` directly. The response shape gains `_count: { sections: number }` on every record. The `POST` handler below it (lines 40-111) is UNCHANGED — preserve every Phase 7 carry-forward (D-19 P2002, D-20 user check, BL-02 target-specific 409).

**Anti-pattern reminder** (from Anti-Patterns to Avoid): do NOT add `_count` to `GET /api/websites/[websiteId]/route.ts` — that route already returns full `sections` arrays.

---

## Shared Patterns

### Local-fetch client component (Pattern 1)

**Source:** `src/app/(dashboard)/dashboard/page.tsx` lines 28-50
**Apply to:** `ConnectionsModal` (gated on `isOpen`)

```typescript
const [data, setData] = useState<T[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
	async function load() {
		try {
			const response = await fetch(URL);
			if (!response.ok) throw new Error('Failed to load');
			setData(await response.json());
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load');
		} finally {
			setIsLoading(false);
		}
	}
	load();
}, []);
```

For `ConnectionsModal`, gate with `if (!isOpen) return;` at the top of the effect AND include `[isOpen, websiteId]` in deps + cancellation cleanup.

### Modal + react-hook-form + Zod (Pattern 2)

**Source:** `src/app/(dashboard)/dashboard/create-server-dialog.tsx` lines 35-58 + 77-148
**Apply to:** `ConnectionsModal` inline forms (add row + edit row)

```typescript
const {
	register,
	handleSubmit,
	formState: { errors, isSubmitting },
	reset,
} = useForm<Input>({ resolver: zodResolver(schema) });

const onSubmit = async (data: Input) => {
	setError(null);
	try {
		// REST: fetch + JSON
		const res = await fetch(url, { method, headers, body: JSON.stringify(data) });
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.error ?? 'Request failed');
		}
		// success path
	} catch (err) {
		setError(err instanceof Error ? err.message : 'Something went wrong');
	}
};
```

**Diff vs analog:** `ConnectionsModal` uses REST (`fetch` + JSON body), NOT `FormData` + Server Action. Therefore drop the `isRedirectError` import + re-throw branch (lines 6, 55 of the dialog). The dialog catches redirects because `createWebsite` calls `redirect()` on success.

### Error envelope unwrap (WR-04 carry-forward)

**Source:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` lines 2395-2411
**Apply to:** Every REST call in `ConnectionsModal` (POST/PUT/DELETE)

```typescript
let serverMessage = 'Failed to save';
try {
	const errorBody = await response.json();
	if (errorBody && typeof errorBody.error === 'string') {
		serverMessage = errorBody.error;
	}
} catch {
	// Body wasn't JSON — keep the default message.
}
throw new Error(serverMessage);
```

Surface `serverMessage` via `useToast(msg, "error")` for server errors; inline `<p className="text-sm text-red-500 mt-1">` for Zod field-level errors.

### Toast feedback

**Source:** `src/components/ui/toast.tsx` lines 19-23 (the `useToast` hook); root layout wires `ToastProvider`
**Apply to:** `ConnectionsModal` for CRUD success/error feedback (UI-SPEC §Copywriting)

```typescript
const { toast } = useToast();

toast('Server added', 'success');
toast('Server updated', 'success');
toast('Server removed', 'success');
toast(error.message, 'error'); // surface API error verbatim
```

Signature: `toast(message: string, type?: "success" | "error" | "info")`. Auto-dismisses after 4 seconds.

### Card-link with nested action anchors (Pattern 4)

**Source:** UI-SPEC §Interaction Contracts + `dashboard/page.tsx` line 180 (`MoreHorizontal` uses `preventDefault`)
**Apply to:** `WebsiteCard` visit link

```tsx
<Link href={`/dashboard/${website.id}`}>
	<motion.div whileHover={{ y: -4 }}>
		...
		<a
			href={`https://${website.subdomain}.minesites.net`}
			target="_blank"
			rel="noreferrer noopener"
			onClick={(e) => e.stopPropagation()} // NOT preventDefault — preserve new-tab open
			aria-label={`Visit live site for ${website.name}`}
		>
			Visit <ArrowUpRight />
		</a>
	</motion.div>
</Link>
```

**Critical distinction:** `MoreHorizontal` uses `preventDefault` (blocks parent navigation; no own destination). The visit anchor uses `stopPropagation` (lets the new-tab destination fire; blocks bubbling).

### Auth + Ownership (verify, don't reimplement)

**Source:** `src/app/api/websites/[websiteId]/servers/route.ts` lines 14-34 + `[serverId]/route.ts` lines 14-43
**Apply to:** Trust the Phase 7 endpoints. Modal makes no client-side auth check.

```typescript
// Phase 7 pattern (do not modify in Phase 8):
const authCtx = await requireUser();
if ('response' in authCtx) return authCtx.response;

const website = await db.website.findUnique({
	where: { id: websiteId },
	select: { userId: true },
});
if (!website) return NextResponse.json({ error: 'Website not found' }, { status: 404 });
if (website.userId !== authCtx.userId)
	return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

// Then verify MinecraftServer belongs to this Website
const existing = await db.minecraftServer.findUnique({
	where: { id: serverId },
	select: { id: true, websiteId: true },
});
if (!existing || existing.websiteId !== websiteId) {
	return NextResponse.json({ error: 'Server not found' }, { status: 404 });
}
```

Modal handles `401` → "Session expired" toast; `403` → "Unauthorized" toast; `404` → "Server not found" toast (already in the body's `error` field).

## No Analog Found

All files in this phase have direct analogs (most are self-modifications of existing files). The two truly new files (`website-card.tsx`, `connections-modal.tsx`) compose existing UI primitives (`Modal`, `Badge`, `Button`, `Input`, `Textarea`, `useToast`) with existing patterns (RHF + Zod, local-fetch, motion entrance). Zero analog-gap.

## Metadata

**Analog search scope:**

- `/home/senne/git/minesites/src/app/(dashboard)/dashboard/` (list pages, create dialog, editor)
- `/home/senne/git/minesites/src/components/ui/` (Modal, Toast, Badge, Button, Input, Textarea)
- `/home/senne/git/minesites/src/components/site/` (SiteNav)
- `/home/senne/git/minesites/src/components/preview/` (types)
- `/home/senne/git/minesites/src/app/api/websites/` (route handlers — read-only patterns)
- `/home/senne/git/minesites/src/lib/validations/` (mcserver, website schemas)
- `/home/senne/git/minesites/src/app/[subdomain]/` (layout, page, preview-client)

**Files scanned:** 14 (full Read) + 6 (targeted Grep)
**Pattern extraction date:** 2026-05-12
