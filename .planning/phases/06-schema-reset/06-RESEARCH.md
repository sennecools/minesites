# Phase 6: Schema Reset - Research

**Researched:** 2026-05-08
**Domain:** Prisma schema migration + TypeScript rename cascade
**Confidence:** HIGH

## Summary

Phase 6 is a bounded rename-and-replace: the `Server` Prisma model is dropped and replaced with two new models (`Website`, `MinecraftServer`), the `Section` foreign key is renamed from `serverId` to `websiteId`, and every TypeScript file that references the old names is updated enough to compile. Runtime correctness of the dashboard and API is explicitly deferred to Phases 7-8.

The codebase scan found 17 files that need changes. Most changes are mechanical renames. The deepest blast radius is `src/components/preview/types.ts` (defines `ServerData`) because it is imported by `src/types/sections.ts`, `src/app/[subdomain]/preview-client.tsx`, and `src/app/(dashboard)/dashboard/[serverId]/page.tsx` — updating that one interface propagates type fixes broadly.

The migration approach is straightforward: no existing migration history exists, so the planner needs only write a fresh schema, run `npx prisma migrate dev --name schema-reset`, and run `npx prisma generate`. The project's `DATABASE_URL` env var already points to the direct Postgres connection (not the Accelerate URL), which is what `prisma migrate dev` requires.

**Primary recommendation:** Update `prisma/schema.prisma` first, then `src/components/preview/types.ts` (rename `ServerData` → `WebsiteData`, update `serverIp` field), then `src/lib/validations/server.ts` (create website equivalent), then all Prisma client call sites (14 `db.server.*` calls across 5 files), then the remaining TypeScript surface. Doing it in this order minimises mid-task compile errors that could confuse an autonomous executor.

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `Website` fields: `id`, `name`, `subdomain` (unique), `description`, `logo`, `banner`, `navbar: Json`, `theme: Json`, `published`, `userId`, `createdAt`, `updatedAt` + relations `sections Section[]` and `servers MinecraftServer[]`. The `description`, `logo`, `banner`, and `navbar` fields are carried over from the old `Server` model.
- **D-02:** `User` relation: `servers Server[]` is renamed to `websites Website[]` on the `User` model.
- **D-03:** `MinecraftServer` fields: `id`, `name` (display name), `ip`, `port` (default 25565), `description`, `websiteId`, `createdAt`, `updatedAt`.
- **D-04:** `MinecraftServer` relation: `website Website` via `websiteId` with `onDelete: Cascade`.
- **D-05:** `Section.serverId` is renamed to `Section.websiteId`. Index updated from `@@index([serverId])` to `@@index([websiteId])`.
- **D-06:** Phase 6 TypeScript goal is zero compile errors — not semantic correctness. Dashboard/editor files that will be fully rewritten in Phase 8 need only minimal renames to compile.
- **D-07:** `src/app/api/servers/` routes reference `prisma.server`. Update to `prisma.website` for compile; runtime correctness deferred to Phase 7.
- **D-08:** Fresh database migration only — no data preservation. The migration file stands alone with no data migration steps.

### Claude's Discretion

(None recorded — all key decisions are locked)

### Deferred Ideas (OUT OF SCOPE)

- Section.title / Section.subtitle column cleanup
- Semantic correctness of dashboard files (Phase 8 rewrites them)
- Semantic correctness of API routes (Phase 7 rebuilds them)
  </user_constraints>

---

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                                  | Research Support                                                                                                                                               |
| ------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WEB-01  | User can create a Website with a name and unique custom subdomain                            | Schema defines `Website` with `subdomain @unique`; `@@index([userId])` pattern preserved. Zod schema in `src/lib/validations/website.ts` replaces `server.ts`. |
| CONN-01 | User can add a Minecraft server connection to their Website (display name, IP address, port) | Schema defines `MinecraftServer` with `ip`, `port`, `name`, `websiteId`; `onDelete: Cascade` mirrors existing pattern.                                         |

</phase_requirements>

---

## Architectural Responsibility Map

| Capability               | Primary Tier           | Secondary Tier | Rationale                                                                                                    |
| ------------------------ | ---------------------- | -------------- | ------------------------------------------------------------------------------------------------------------ |
| Schema definition        | Database/ORM           | —              | Prisma schema is the single source of truth; TS types derive from it via `prisma generate`                   |
| Type rename cascade      | API/Backend + Frontend | —              | `ServerData` in `preview/types.ts` is used in both public site and dashboard; single edit propagates to both |
| Validation schema        | API/Backend            | —              | `src/lib/validations/server.ts` is consumed by server actions and API routes                                 |
| Prisma client call sites | API/Backend            | Server actions | All `db.server.*` calls live in server-side files only                                                       |
| Public site (subdomain)  | Frontend Server (SSR)  | —              | `layout.tsx` and `page.tsx` under `[subdomain]/` are server components fetching from DB                      |

---

## Standard Stack

### Core

| Library        | Version    | Purpose                              | Why Standard                                                       |
| -------------- | ---------- | ------------------------------------ | ------------------------------------------------------------------ |
| prisma         | 7.8.0      | ORM + schema management + migrations | Already installed; schema lives in `prisma/schema.prisma`          |
| @prisma/client | 7.8.0      | Type-safe query builder              | Generated from schema; `db.website.*` calls replace `db.server.*`  |
| typescript     | ^5         | Type checking                        | `tsc --noEmit` is the compile-check command                        |
| zod            | (existing) | Input validation                     | `src/lib/validations/server.ts` → `src/lib/validations/website.ts` |

[VERIFIED: package.json + npm registry — prisma 7.8.0 is the version installed]

### Migration Command

```bash
# Step 1 — apply new schema to database (creates migration file + runs it)
npx prisma migrate dev --name schema-reset

# Step 2 — regenerate TypeScript client after schema change
npx prisma generate

# Step 3 — verify TypeScript compiles with zero errors
npx tsc --noEmit
```

The `--name schema-reset` flag prevents the interactive "enter migration name" prompt. [VERIFIED: Context7 /prisma/web — `--name` flag documented in `migrate dev` CLI reference]

---

## Architecture Patterns

### System Architecture Diagram

```
prisma/schema.prisma  (ground truth)
        |
        v
npx prisma migrate dev --name schema-reset
        |
        |--- creates prisma/migrations/TIMESTAMP_schema-reset/migration.sql
        |--- applies SQL to DATABASE_URL (direct Postgres)
        |
        v
npx prisma generate
        |--- regenerates node_modules/.prisma/client/
        |--- Prisma Client now exposes db.website.* and db.minecraftServer.*
        |
        v
TypeScript file updates (17 files)
        |
        |--- src/components/preview/types.ts  [ServerData → WebsiteData]
        |--- src/lib/validations/server.ts → src/lib/validations/website.ts
        |--- 5 files with db.server.* calls
        |--- 11 files with Server/ServerData type references
        |
        v
npx tsc --noEmit  (must exit 0)
```

### Recommended Schema Structure

```prisma
model Website {
  id          String          @id @default(cuid())
  name        String
  subdomain   String          @unique
  description String?
  logo        String?
  banner      String?
  navbar      Json?           @default("{}")
  theme       Json?           @default("{}")
  published   Boolean         @default(false)
  userId      String
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  sections    Section[]
  servers     MinecraftServer[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([userId])
}

model MinecraftServer {
  id          String   @id @default(cuid())
  name        String
  ip          String
  port        Int      @default(25565)
  description String?
  websiteId   String
  website     Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Section {
  id        String   @id @default(cuid())
  type      String
  title     String?
  subtitle  String?
  settings  Json     @default("{}")
  order     Int      @default(0)
  visible   Boolean  @default(true)
  websiteId String
  website   Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([websiteId])
}
```

[VERIFIED: derived directly from current `prisma/schema.prisma` + locked decisions D-01 through D-05]

### Pattern: Minimal Compile-Only Renames (D-06/D-07)

For files that will be fully rewritten in Phase 7-8, the minimum viable rename is:

1. Replace `db.server.` with `db.website.`
2. Replace `prisma.server` with `prisma.website` (in transaction lambdas)
3. Replace `serverId` parameter/variable with `websiteId` where it appears as a Prisma query field
4. Update `select`/`include` clauses that reference old field names (`serverIp`, `serverPort`)

The dashboard/API files do NOT need to produce correct runtime behavior from this phase.

---

## Complete File Inventory

### Verified — All 17 files that need changes

[VERIFIED: codebase grep across entire `src/` tree]

#### Group 1: Schema + Generated Types (2 files)

| File                            | Change                                                                                                                                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prisma/schema.prisma`          | Remove `Server` model, add `Website` + `MinecraftServer`, rename `Section.serverId` → `Section.websiteId`                                                                                            |
| `src/lib/validations/server.ts` | Replace entirely — create `src/lib/validations/website.ts` with `createWebsiteSchema` (fields: `name`, `subdomain`, `description`; `serverIp`/`serverPort` move to MinecraftServer, not this schema) |

#### Group 2: Core Types — high fan-out (2 files)

| File                              | Change                                                                                                                                           | Cascade Impact                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/preview/types.ts` | Rename `ServerData` → `WebsiteData`; rename field `serverIp: string \| null` — keep or rename depending on what callers need for Phase 6 compile | Imported by `src/types/sections.ts`, `src/app/[subdomain]/preview-client.tsx`, `src/app/(dashboard)/dashboard/[serverId]/page.tsx` |
| `src/types/sections.ts`           | Update import of `ServerData` → `WebsiteData`; update `SectionRenderProps.serverData: WebsiteData`                                               | Imported by section render/settings components                                                                                     |

**Design decision for `serverIp` in `WebsiteData`:** The field must remain in `WebsiteData` for Phase 6 compile because the public layout (`[subdomain]/layout.tsx`) still passes `server.serverIp` to `<SiteNav>`, and `preview-client.tsx` passes `serverIp` to section renders. In Phase 6, `serverIp` should be kept in `WebsiteData` (the Website model still has no `ip` field — MinecraftServer does). The `SiteNav` and `HeroSection` use `serverIp` from `WebsiteData`; those are Phase 7-8 concerns. For now: keep `serverIp: string | null` in `WebsiteData`, sourced from... nothing (the new `Website` model has no `ip` field). The compile fix is: in `[subdomain]/layout.tsx`, pass `serverIp: null` or `serverIp: ""` since the field no longer exists on `Website`. [ASSUMED: this is the lowest-work path to compile; alternatives include removing `serverIp` from `WebsiteData` and fixing every caller]

#### Group 3: Prisma Client Call Sites (5 files, 14 call sites)

| File                                       | db.server.\* Calls                                                                                                                                                                                | Change                                                                                                                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/app/(dashboard)/dashboard/actions.ts` | `db.server.findUnique` ×2, `db.server.create` ×1, `db.server.findFirst` ×3, `db.server.update` ×2, `db.server.delete` ×1 (9 calls)                                                                | Rename to `db.website.*`; rename function params `serverId` → variable names can stay (they are local vars); update `select`/`data` field names (`serverIp`, `serverPort` removed since Website has neither) |
| `src/app/api/servers/route.ts`             | `db.server.findMany` ×1                                                                                                                                                                           | Rename to `db.website.findMany`; remove `serverIp` from `select` (field gone from Website)                                                                                                                   |
| `src/app/api/servers/[serverId]/route.ts`  | `db.server.findUnique` ×2, `db.server.update` ×1 (via `tx.server.*` ×2, `tx.section.*`), plus `tx.section.deleteMany({ where: { serverId } })` and `tx.section.createMany` with `serverId:` field | Rename `db.server.*` → `db.website.*`, `tx.server.*` → `tx.website.*`, `serverId:` in section createMany → `websiteId:`, `where: { serverId }` in deleteMany → `where: { websiteId }`                        |
| `src/app/[subdomain]/layout.tsx`           | `db.server.findUnique` ×1 (inside `getServerData` cache function)                                                                                                                                 | Rename to `db.website.findUnique`; `serverIp` field gone — update select to omit it or pass `serverIp: null` to `<SiteNav>`                                                                                  |
| `src/app/[subdomain]/page.tsx`             | `db.server.findUnique` ×1                                                                                                                                                                         | Rename to `db.website.findUnique`; the result shape no longer has `serverIp` — update the `serverData` construction to set `serverIp: null`                                                                  |

#### Group 4: TypeScript Type References (10 files)

| File                                                           | Server/ServerData Reference                                                                                                                                      | Minimum Change                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/(dashboard)/dashboard/page.tsx`                       | `interface ServerData { serverIp: string \| null; ... }` (local interface, not from preview/types)                                                               | Rename local `ServerData` interface to `WebsiteData`; remove `serverIp` field (column gone from Website); update `useState<ServerData[]>` → `useState<WebsiteData[]>`                                                                                                                                                       |
| `src/app/(dashboard)/dashboard/servers/page.tsx`               | Same pattern as `dashboard/page.tsx` — local `interface ServerData` with `serverIp`                                                                              | Same treatment                                                                                                                                                                                                                                                                                                              |
| `src/app/(dashboard)/dashboard/create-server-dialog.tsx`       | Imports `createServerSchema, CreateServerInput` from `@/lib/validations/server`                                                                                  | Update import to `createWebsiteSchema, CreateWebsiteInput` from `@/lib/validations/website`                                                                                                                                                                                                                                 |
| `src/app/(dashboard)/dashboard/actions.ts`                     | Imports `createServerSchema, updateServerSchema` from `@/lib/validations/server`                                                                                 | Update import to website equivalents                                                                                                                                                                                                                                                                                        |
| `src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx` | Imports `updateServerSchema, UpdateServerInput` from `@/lib/validations/server`; local `interface Server { serverIp, serverPort }`                               | Update import; local interface stays (will be fully rewritten in Phase 8; for Phase 6 compile it is fine as-is since the component is not typed against Prisma directly)                                                                                                                                                    |
| `src/app/(dashboard)/dashboard/[serverId]/server-actions.tsx`  | No direct Server type; uses `togglePublished(serverId)`, `deleteServer(serverId)` from `../actions` — these are function calls with string params, no type issue | No change needed                                                                                                                                                                                                                                                                                                            |
| `src/app/(dashboard)/dashboard/[serverId]/page.tsx`            | Imports `ServerData` from `@/components/preview/types`; local `ServerDataState` type includes `serverIp: string`                                                 | Update import to `WebsiteData`; update `ServerDataState` to match new `WebsiteData` shape; update `fetch('/api/servers/${serverId}')` calls (these are string URLs — they compile fine even if the route is renamed later); update `serverData.serverIp` references (either remove or keep if field stays in `WebsiteData`) |
| `src/app/[subdomain]/preview-client.tsx`                       | Imports `ServerData` from `@/components/preview/types`; `PreviewClientProps.server: ServerData`                                                                  | Update import to `WebsiteData`; update prop type                                                                                                                                                                                                                                                                            |
| `src/components/sections/hero-section.tsx`                     | `serverIp?: string \| null` prop — not imported from preview/types, it is a standalone prop                                                                      | No Prisma type dependency; field name stays as-is in Phase 6 (component is not broken, Phase 7+ will clean up)                                                                                                                                                                                                              |
| `src/components/site/nav.tsx`                                  | `serverIp: string` prop — standalone prop                                                                                                                        | No Prisma type dependency; stays as-is                                                                                                                                                                                                                                                                                      |

**File NOT in CONTEXT.md but found in scan:**

- `src/app/(dashboard)/dashboard/servers/page.tsx` — has a local `interface ServerData` with `serverIp`; needs the same local-interface treatment as `dashboard/page.tsx`. [VERIFIED: codebase grep]

---

## Prisma Migration: Technical Details

### `prisma migrate dev` Requirements

[VERIFIED: Context7 /prisma/web — prisma-cli-reference.mdx, shadow-database.mdx]

1. **Requires DATABASE_URL** — must be a direct Postgres connection, not an Accelerate (`prisma+postgres://`) URL. The project has `DATABASE_URL` in `.env` pointing to `db.prisma.io` directly. The `prisma.config.ts` reads `process.env.DATABASE_URL`. This is correct for migrations.

2. **Requires a shadow database** — `migrate dev` internally creates a temporary shadow DB to detect drift. For cloud-hosted Postgres where CREATE DATABASE is restricted, a `shadowDatabaseUrl` must be configured. The project's Postgres is hosted on `db.prisma.io`. [ASSUMED: whether this cloud Postgres allows `CREATE DATABASE` for the shadow DB is not confirmed; if not, a `SHADOW_DATABASE_URL` must be added to `.env` and `prisma.config.ts`]

3. **`--name` flag prevents interactive prompt** — pass `--name schema-reset` so the command can run non-interactively. Without it, Prisma prompts for a migration name at the terminal. [VERIFIED: Context7 docs — "The CLI will prompt for a name if not provided"]

4. **No existing migration history** — `prisma/migrations/` directory does not exist. `prisma migrate dev` will create it and generate the first migration. This is the clean-slate case described in D-08.

5. **`prisma generate` must run after schema change** — the Prisma Client is generated to `node_modules/.prisma/client` (as specified in the generator block). All `db.website.*` and `db.minecraftServer.*` calls will be type errors until `generate` runs.

### `prisma db push` vs `prisma migrate dev`

| Aspect                       | `db push`                                                     | `migrate dev`       |
| ---------------------------- | ------------------------------------------------------------- | ------------------- |
| Creates migration file       | No                                                            | Yes                 |
| Migration history tracking   | No                                                            | Yes                 |
| Shadow DB required           | No                                                            | Yes                 |
| Non-interactive              | Yes                                                           | Yes (with `--name`) |
| Phase 6 success criterion    | Fails — SC-3 says "npx prisma migrate dev runs to completion" | Required            |
| Data loss on schema conflict | Yes (resets if needed)                                        | Yes (resets dev DB) |

Use `migrate dev` because SC-3 explicitly requires it.

### Environment Variables for Migrations

```
# Already in .env (direct connection — used by migrate dev)
DATABASE_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require"

# Already in .env.local (Accelerate URL — used by runtime/PrismaClient)
PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/..."
```

The `src/lib/db.ts` reads `process.env.DATABASE_URL` at runtime. The `prisma.config.ts` also reads `process.env.DATABASE_URL`. Both currently point to the same direct URL. This is correct for Phase 6: migrations run against the direct URL, and the runtime client also uses the direct URL (Accelerate is configured but the runtime client uses the adapter-pg path, not Accelerate, based on `db.ts`).

---

## Don't Hand-Roll

| Problem                          | Don't Build                  | Use Instead                                                                           | Why                                                                                                |
| -------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Schema change tracking           | Custom SQL migration scripts | `npx prisma migrate dev`                                                              | Prisma generates the migration SQL from the schema diff automatically                              |
| TypeScript type generation       | Manual `Website` interface   | `npx prisma generate`                                                                 | Prisma Client generates fully typed `WebsiteCreateInput`, `WebsiteUpdateInput`, etc. automatically |
| Subdomain uniqueness enforcement | Application-level check only | `subdomain @unique` in schema + `prisma.website.findUnique({ where: { subdomain } })` | The `@unique` constraint is enforced at the DB level; the application check is defense-in-depth    |

---

## Runtime State Inventory

> This is a schema-replace phase. The user explicitly stated "fresh database migration only — no data preservation" (D-08).

| Category            | Items Found                                                                                                     | Action Required                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Stored data         | Dev database has `Server` and `Section` rows                                                                    | None — data is throwaway per D-08. `prisma migrate dev` will reset/drop the old schema |
| Live service config | None — no n8n workflows, no external services read the DB model names                                           | None                                                                                   |
| OS-registered state | None                                                                                                            | None                                                                                   |
| Secrets/env vars    | `DATABASE_URL` in `.env` — name unchanged; Prisma schema model names are internal to the ORM, not env var names | None                                                                                   |
| Build artifacts     | `node_modules/.prisma/client/` — stale after schema change                                                      | `npx prisma generate` recreates it                                                     |

---

## Common Pitfalls

### Pitfall 1: Running `migrate dev` with the Accelerate URL

**What goes wrong:** `npx prisma migrate dev` errors with "cannot create database" or a connection error if `DATABASE_URL` is the `prisma+postgres://accelerate.prisma-data.net` URL instead of the direct Postgres URL.
**Why it happens:** Prisma Accelerate is a proxy/cache layer; migrate commands need a direct database connection.
**How to avoid:** Confirm `DATABASE_URL` in `.env` is the direct connection (`postgres://...@db.prisma.io:5432/postgres`). The project's `.env` already has this; `.env.local` overrides with the Accelerate URL but only for runtime (`.env.local` is loaded by Next.js, not by the Prisma CLI which loads `.env` directly).
**Warning signs:** Error message mentions "accelerate", "proxy", or "connection refused on port 443".

### Pitfall 2: Shadow Database Requirement for Cloud Postgres

**What goes wrong:** `prisma migrate dev` fails with "Error: unable to create shadow database" if the cloud Postgres instance does not allow `CREATE DATABASE`.
**Why it happens:** `migrate dev` requires a shadow database to detect drift between migration history and the actual DB schema.
**How to avoid:** If the error occurs, add a second PostgreSQL database URL as `SHADOW_DATABASE_URL` in `.env` and configure it in `prisma.config.ts`:

```typescript
datasource: {
  url: env("DATABASE_URL"),
  shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
}
```

**Warning signs:** Error message: "P3014 Prisma Migrate could not create the shadow database."

### Pitfall 3: Forgetting `prisma generate` After Schema Change

**What goes wrong:** TypeScript sees compile errors on `db.website.*` calls even after the schema is updated, because the generated client in `node_modules/.prisma/client` still reflects the old `Server` model.
**Why it happens:** The Prisma Client is code-generated; it does not auto-regenerate when the schema file changes.
**How to avoid:** Always run `npx prisma generate` immediately after `npx prisma migrate dev`. In practice, `migrate dev` triggers generation automatically — but if `migrate dev` is skipped and only `db push` is used, generation must be run manually.
**Warning signs:** `db.website` is `undefined` at runtime; TypeScript error "Property 'website' does not exist on type 'PrismaClient'".

### Pitfall 4: `serverIp` / `serverPort` References After Website Has Neither

**What goes wrong:** After the schema change, `db.website` has no `serverIp` or `serverPort` fields. Any `select: { serverIp: true }` or `data: { serverIp }` in TypeScript code causes a compile error.
**Why it happens:** The old `Server` model had `serverIp` and `serverPort`; `Website` does not.
**How to avoid:** For every Prisma `select`, `data`, and `include` clause, remove `serverIp` and `serverPort`. For callers that need `serverIp` at render time (e.g., `SiteNav`, `HeroSection`), pass a fallback (`null` or `""`) in Phase 6; Phase 7 will add proper MinecraftServer lookup.
**Warning signs:** TypeScript error "Object literal may only specify known properties, and 'serverIp' does not exist in type 'WebsiteSelect'".

### Pitfall 5: `Section.serverId` in Transaction createMany

**What goes wrong:** In `src/app/api/servers/[serverId]/route.ts`, the PUT handler uses `tx.section.createMany({ data: sections.map(s => ({ ..., serverId })) })`. After the rename, `serverId` in the createMany data object causes a TypeScript error.
**Why it happens:** The `Section` model's field is now `websiteId`, not `serverId`.
**How to avoid:** In the createMany map, replace `serverId` with `websiteId`. Also update the `tx.section.deleteMany({ where: { serverId } })` to `{ where: { websiteId } }`.

### Pitfall 6: Missing `servers/page.tsx` from Change List

**What goes wrong:** `src/app/(dashboard)/dashboard/servers/page.tsx` was not listed in CONTEXT.md's file inventory but was found in the codebase scan. It defines a local `interface ServerData { serverIp: string | null; ... }` and fetches from `/api/servers`.
**Why it happens:** The CONTEXT.md file list was created before a full codebase grep.
**How to avoid:** Treat this file the same as `dashboard/page.tsx` — rename the local interface, remove `serverIp` from it, update state types.

---

## Code Examples

### New `WebsiteData` type (replacing `ServerData`)

```typescript
// src/components/preview/types.ts
// Source: derived from D-01 (locked decisions) + current file structure

export interface WebsiteData {
	name: string;
	subdomain: string;
	// serverIp kept here for Phase 6 compile-only; Phase 7 will remove it.
	// Website has no ip field; callers should pass null until Phase 7 adds MinecraftServer lookup.
	serverIp: string | null;
	players?: number;
	maxPlayers?: number;
	version?: string;
}
```

### New validation schema (replacing `server.ts`)

```typescript
// src/lib/validations/website.ts
// Source: derived from D-01 fields (name, subdomain, description)
import { z } from 'zod';

export const createWebsiteSchema = z.object({
	name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
	subdomain: z
		.string()
		.min(3, 'Subdomain must be at least 3 characters')
		.max(30, 'Subdomain must be less than 30 characters')
		.regex(
			/^[a-z0-9-]+$/,
			'Subdomain can only contain lowercase letters, numbers, and hyphens',
		),
	description: z.string().max(500).optional(),
});

export const updateWebsiteSchema = createWebsiteSchema.partial();

export type CreateWebsiteInput = z.infer<typeof createWebsiteSchema>;
export type UpdateWebsiteInput = z.infer<typeof updateWebsiteSchema>;
```

### Minimum-viable API route rename (`/api/servers/route.ts`)

```typescript
// Source: current file, minimum rename to compile
const websites = await db.website.findMany({
	where: { userId: session.user.id },
	orderBy: { updatedAt: 'desc' },
	select: {
		id: true,
		name: true,
		subdomain: true,
		description: true,
		// serverIp removed — field does not exist on Website
		published: true,
		createdAt: true,
		updatedAt: true,
	},
});
```

### Section createMany after foreign key rename

```typescript
// Source: current src/app/api/servers/[serverId]/route.ts lines 92-116
// Only the serverId → websiteId field rename is needed for compile
await tx.section.createMany({
	data: sections.map((section, index) => ({
		id: section.id,
		type: section.type,
		title: section.title || null,
		subtitle: section.subtitle || null,
		settings: (section.settings || {}) as Prisma.InputJsonValue,
		order: index,
		visible: section.visible ?? true,
		websiteId, // was: serverId
	})),
});
```

---

## State of the Art

| Old Approach                                | Current Approach                                                      | When Changed                  | Impact                                                                           |
| ------------------------------------------- | --------------------------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------- |
| `prisma db push` for all schema changes     | `prisma migrate dev` + migration files for tracked history            | Prisma best practice (always) | Phase 6 must use `migrate dev` per SC-3                                          |
| Schema-first with manual SQL                | Prisma declarative schema → generated migrations                      | Prisma v2+                    | The planner never writes raw SQL; Prisma generates the DROP TABLE / CREATE TABLE |
| `@prisma/client` generating to default path | Generator explicitly sets `output = "../node_modules/.prisma/client"` | Project setup                 | `npx prisma generate` target is explicit; no surprises                           |

---

## Assumptions Log

| #   | Claim                                                                                                                                                                                                               | Section                              | Risk if Wrong                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | `serverIp` kept in `WebsiteData` (pointing to null) is the lowest-work compile fix for Phase 6                                                                                                                      | File Inventory Group 4               | If wrong: callers that use `serverIp` could be updated to remove it instead; more files change but the type system is cleaner                                                           |
| A2  | The cloud Postgres at `db.prisma.io` allows shadow database creation (no extra `shadowDatabaseUrl` needed)                                                                                                          | Prisma Migration Details — Shadow DB | If wrong: `migrate dev` fails; planner must add `SHADOW_DATABASE_URL` env var and `prisma.config.ts` `shadowDatabaseUrl` entry                                                          |
| A3  | `src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx` local `interface Server { serverIp, serverPort }` does not cause a compile error in Phase 6 because it is a local interface not tied to Prisma types | File Inventory Group 4               | If wrong: TypeScript may still flag it if the form submits to an action that now rejects those fields; minimal fix is to remove `serverIp`/`serverPort` from the interface and the form |

**If this table is empty:** N/A — three assumptions are logged above.

---

## Open Questions

1. **Shadow database availability**
    - What we know: `migrate dev` requires a shadow database; cloud Postgres sometimes blocks `CREATE DATABASE`
    - What's unclear: Whether `db.prisma.io` permits the shadow DB creation step
    - Recommendation: Plan for the happy path; include a fallback task that adds `SHADOW_DATABASE_URL` to `.env` if `migrate dev` reports P3014

2. **`serverIp` in `WebsiteData` — keep or drop?**
    - What we know: `SiteNav` and `HeroSection` accept `serverIp` as a prop; `[subdomain]/layout.tsx` passes `server.serverIp` to `SiteNav`; the new `Website` model has no `ip` field
    - What's unclear: Whether the planner prefers (a) keep `serverIp: string | null` in `WebsiteData` and pass `null` from layout.tsx, or (b) remove `serverIp` from `WebsiteData` and cascade the removal through `SiteNav`, `HeroSection`, and all callers
    - Recommendation: Keep `serverIp: string | null` in `WebsiteData` for Phase 6 (fewer files touched); the field becomes semantically wrong but compiles clean. Phase 7 will introduce MinecraftServer lookup and fix this properly.

---

## Environment Availability

| Dependency             | Required By                               | Available                      | Version                | Fallback |
| ---------------------- | ----------------------------------------- | ------------------------------ | ---------------------- | -------- |
| Node.js                | Prisma CLI                                | Yes                            | v25.9.0                | —        |
| prisma CLI             | `migrate dev`, `generate`                 | Yes                            | 7.8.0                  | —        |
| PostgreSQL (direct)    | `migrate dev` shadow DB + migration apply | Yes (via DATABASE_URL in .env) | Hosted on db.prisma.io | —        |
| `DATABASE_URL` env var | `prisma.config.ts`                        | Yes (in `.env`)                | Direct postgres:// URL | —        |
| TypeScript compiler    | `tsc --noEmit`                            | Yes (via project devDeps)      | ^5                     | —        |

**Missing dependencies with no fallback:** None detected.

**Missing dependencies with fallback:**

- Shadow database URL: Not explicitly configured; `migrate dev` attempts to create one automatically. If that fails (P3014), add `SHADOW_DATABASE_URL` to `.env`.

---

## Security Domain

> `security_enforcement` is not set to false in `.planning/config.json`. However, Phase 6 is a pure schema + type rename with no new endpoints, no auth changes, and no user-facing surface. The security concerns are minimal.

### Applicable ASVS Categories

| ASVS Category         | Applies                 | Standard Control                                                                |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------- |
| V2 Authentication     | No                      | No auth changes in Phase 6                                                      |
| V3 Session Management | No                      | No session changes                                                              |
| V4 Access Control     | No                      | Ownership checks are present in existing API code; Phase 6 is type-only renames |
| V5 Input Validation   | Yes (schema layer only) | Zod schema in `src/lib/validations/website.ts` — `subdomain` regex validated    |
| V6 Cryptography       | No                      | No cryptographic operations                                                     |

### Known Threat Patterns

| Pattern                                              | STRIDE    | Standard Mitigation                                                                                                                      |
| ---------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Subdomain collision (two users claim same subdomain) | Tampering | `subdomain @unique` DB constraint + application-level `findUnique` pre-check in `createServer` action — carry forward to `createWebsite` |

---

## Sources

### Primary (HIGH confidence)

- Context7 `/prisma/web` — migrate dev CLI options, shadow database requirements, `--name` flag behavior, migrate vs db push comparison
- `prisma/schema.prisma` — current model structure verified by direct read
- `src/**/*.ts(x)` — all 17 changed files verified by direct read + grep

### Secondary (MEDIUM confidence)

- `package.json` + npm registry — Prisma 7.8.0 version confirmed
- `.env` / `.env.local` — `DATABASE_URL` (direct) vs `PRISMA_DATABASE_URL` (Accelerate) distinction confirmed

### Tertiary (LOW confidence / Assumed)

- A2: Shadow DB permissibility for `db.prisma.io` — not verified; marked ASSUMED

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — versions verified from package.json + registry
- Architecture: HIGH — all files read directly, all call sites enumerated by grep
- Pitfalls: HIGH — derived from direct code reading; A2 shadow DB assumption is the only significant unknown
- Migration approach: HIGH for `migrate dev` mechanics; MEDIUM for shadow DB behavior on this specific host

**Research date:** 2026-05-08
**Valid until:** 2026-06-07 (stable Prisma APIs; shadow DB concern resolved on first migration run)
