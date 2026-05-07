<!-- refreshed: 2026-05-07 -->
# Architecture

**Analysis Date:** 2026-05-07

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router (Single App)               │
├─────────────────┬───────────────────────┬───────────────────────────┤
│  (marketing)    │     (auth)            │      (dashboard)          │
│  `/`            │  `/login` `/signup`   │  `/dashboard/**`          │
│  `src/app/(marketing)/` │ `src/app/(auth)/`    │ `src/app/(dashboard)/`    │
└────────┬────────┴──────────┬────────────┴──────────┬────────────────┘
         │                   │                        │
         ▼                   ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│              [subdomain] Public Site Route                          │
│              `src/app/[subdomain]/`                                 │
│  Middleware rewrites `myserver.minesites.net` → `/myserver`         │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API Routes                                   │
│  `src/app/api/auth/`   `src/app/api/servers/`                       │
│  `src/app/api/upload/` `src/app/api/discord/`                       │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Database Layer                                   │
│  Prisma ORM + pg Pool → PostgreSQL                                  │
│  `src/lib/db.ts`                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root Layout | Global fonts, ToastProvider | `src/app/layout.tsx` |
| Middleware | Subdomain routing + auth guard | `src/middleware.ts` |
| Auth Config | JWT strategy, OAuth providers | `src/lib/auth.config.ts` |
| Auth Full | Credentials provider + DB adapter | `src/lib/auth.ts` |
| DB Client | Singleton Prisma+pg pool | `src/lib/db.ts` |
| Dashboard Layout | Sidebar, sticky header shell | `src/app/(dashboard)/layout.tsx` |
| Auth Layout | Animated split-panel auth page shell | `src/app/(auth)/layout.tsx` |
| Server Editor | Full-page drag-and-drop section builder | `src/app/(dashboard)/dashboard/[serverId]/page.tsx` |
| Server Actions | Server-side mutations (create/update/delete/publish) | `src/app/(dashboard)/dashboard/actions.ts` |
| PreviewClient | Public-facing rendered section components | `src/app/[subdomain]/preview-client.tsx` |
| UI Library | Reusable primitive components | `src/components/ui/` |
| Layout Components | Header, Footer, Sidebar | `src/components/layout/` |

## Pattern Overview

**Overall:** Component-based Next.js App Router with route groups, Server Actions for mutations, and REST API for client-side data fetching.

**Key Characteristics:**
- Route groups `(auth)`, `(dashboard)`, `(marketing)` share layouts without affecting URL paths
- Subdomain routing via Next.js middleware rewrite: `myserver.minesites.net` → `/myserver`
- Server Actions (`"use server"`) handle create/update/delete mutations; REST API routes handle reads from client components
- Zustand for client-side UI state (sidebar collapse persisted to localStorage)
- Section-based website model: each server site is composed of ordered `Section` records with JSON `settings`

## Layers

**Routing Layer:**
- Purpose: Map URLs to page components and handle auth guards + subdomain rewrites
- Location: `src/middleware.ts`, `src/app/**/page.tsx`, `src/app/**/layout.tsx`
- Contains: Route group layouts, middleware logic
- Depends on: NextAuth session, Next.js routing
- Used by: All browser requests

**API Layer:**
- Purpose: REST endpoints for client-side data access
- Location: `src/app/api/`
- Contains: Route handlers for servers CRUD, file upload, Discord invite lookup, and auth
- Depends on: `src/lib/auth.ts`, `src/lib/db.ts`
- Used by: Client components making `fetch()` calls, NextAuth internals

**Server Actions Layer:**
- Purpose: Form mutations triggered from client components without a separate API endpoint
- Location: `src/app/(dashboard)/dashboard/actions.ts`
- Contains: `createServer`, `updateServer`, `deleteServer`, `togglePublished`
- Depends on: `src/lib/auth.ts`, `src/lib/db.ts`, `src/lib/validations/server.ts`
- Used by: Dashboard page components

**UI / Component Layer:**
- Purpose: Presentational React components
- Location: `src/components/ui/`, `src/components/layout/`, `src/components/sections/`
- Contains: Primitive UI components, layout chrome, section preview renderers
- Depends on: Tailwind CSS, Framer Motion, lucide-react
- Used by: Page components

**Data / Persistence Layer:**
- Purpose: Database access via Prisma ORM
- Location: `src/lib/db.ts`, `prisma/schema.prisma`
- Contains: Singleton PrismaClient with pg connection pool
- Depends on: `DATABASE_URL` environment variable
- Used by: API routes, Server Actions

## Data Flow

### Dashboard Server Save (primary editor path)

1. User edits sections in `src/app/(dashboard)/dashboard/[serverId]/page.tsx` (client component, local state)
2. User clicks Save — `fetch('PUT /api/servers/[serverId]', { body: sections })` fires
3. `src/app/api/servers/[serverId]/route.ts` validates session, runs Prisma `$transaction` to delete+recreate all sections and update server metadata
4. Client receives updated server object; local state syncs

### Server Creation (Server Action path)

1. User submits create-server form in `src/app/(dashboard)/dashboard/create-server-dialog.tsx`
2. `createServer(formData)` Server Action in `src/app/(dashboard)/dashboard/actions.ts` runs server-side
3. Zod validation, subdomain uniqueness check, `db.server.create` with default hero section
4. `revalidatePath('/dashboard')` + `redirect('/dashboard/[id]')`

### Public Site Render

1. Browser requests `myserver.minesites.net`
2. Middleware (`src/middleware.ts`) rewrites to `/myserver`
3. `src/app/[subdomain]/page.tsx` (Server Component) queries DB: `db.server.findUnique({ where: { subdomain }, include: { sections } })`
4. Sections passed to `PreviewClient` (`src/app/[subdomain]/preview-client.tsx`) which renders section switch-case to appropriate preview component
5. `?preview=true` query param bypasses the `published` check for editor previews

### Auth Flow

1. User visits `/login` or `/signup`
2. NextAuth (`src/lib/auth.ts`) handles credentials (email+bcrypt) or OAuth (Discord, Google)
3. JWT session strategy — `session.user.id` injected via JWT callbacks in `src/lib/auth.config.ts`
4. Middleware reads `req.auth` to protect `/dashboard/**` routes

**State Management:**
- Server site data: local React `useState` in the editor page; synced to DB on explicit Save
- Sidebar collapsed state: Zustand store (`useSidebarStore` in `src/components/layout/sidebar.tsx`), persisted to `localStorage` via `zustand/middleware/persist`
- Toast notifications: React Context provider (`ToastProvider`) wrapped at root layout
- No global client state for server data — fetched fresh from API on page load

## Key Abstractions

**Server + Section model:**
- Purpose: A `Server` record owns many `Section` records. Each section has a `type` string (e.g., `"hero"`, `"stats"`, `"discord"`) and a JSON `settings` blob holding all visual configuration.
- Schema: `prisma/schema.prisma` — `Server`, `Section`
- Pattern: Flexible JSON column (`settings: Json`) avoids migrations for every new section option; trade-off is no DB-level validation on section settings.

**Route Groups:**
- Purpose: Separate layout shells for marketing, auth, and dashboard without adding path segments
- Examples: `src/app/(auth)/`, `src/app/(dashboard)/`, `src/app/(marketing)/`
- Pattern: Next.js App Router parenthetical route groups

**Preview Components:**
- Purpose: Self-contained React components that render a section type from its DB data
- Location: Inline within `src/app/[subdomain]/preview-client.tsx`
- Pattern: Switch-case dispatch on `section.type`, each case renders a `Preview*` function component

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page request
- Responsibilities: Font variables, global CSS, ToastProvider

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: Every non-static request (per `config.matcher`)
- Responsibilities: Subdomain rewrite, `/dashboard` auth guard

**Public Server Page:**
- Location: `src/app/[subdomain]/page.tsx`
- Triggers: Request to a registered subdomain path
- Responsibilities: DB fetch of server+sections, passes to PreviewClient

**Dashboard Editor Page:**
- Location: `src/app/(dashboard)/dashboard/[serverId]/page.tsx`
- Triggers: Authenticated user navigating to `/dashboard/[serverId]`
- Responsibilities: Full section builder UI (client component with heavy local state)

## Architectural Constraints

- **Threading:** Single-threaded Node.js event loop; Prisma uses a connection pool (`pg.Pool`) shared via global singleton to avoid pool exhaustion across hot reloads
- **Global state:** `globalThis.prisma` and `globalThis.pool` singletons in `src/lib/db.ts` — intentional pattern for Next.js dev hot reload
- **Circular imports:** None detected
- **Auth split:** `src/lib/auth.config.ts` (edge-compatible, no DB) vs `src/lib/auth.ts` (full, with PrismaAdapter) — split required because middleware runs on the Edge runtime
- **Mock data in editor:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx` uses a `mockServer` constant and does not yet load real server data from DB on mount; the editor page is mostly client-side with planned API integration

## Anti-Patterns

### Mock data in production editor

**What happens:** The server editor page (`src/app/(dashboard)/dashboard/[serverId]/page.tsx`) defines a `const mockServer = { ... }` at the top and uses it as the initial state instead of fetching the real server record on load.
**Why it's wrong:** Users always see "EpicCraft Network" as the starting data; changes may not persist correctly because the initial state does not match the DB record.
**Do this instead:** On mount, call `fetch('/api/servers/[serverId]')` (which already exists at `src/app/api/servers/[serverId]/route.ts`) and populate state from the response.

### Settings type duplication

**What happens:** `HeroSettings`, `GamemodesSettings`, `FeaturesSettings`, and other section settings types are defined inline in `src/app/(dashboard)/dashboard/[serverId]/page.tsx` but not exported. Equivalent shapes are re-inlined in `src/app/[subdomain]/preview-client.tsx`.
**Why it's wrong:** Any settings key change must be updated in two places.
**Do this instead:** Move all section settings types to `src/components/preview/types.ts` (which already exists) and import them in both the editor and preview files.

## Error Handling

**Strategy:** Try/catch in API route handlers returns JSON error responses with appropriate HTTP status codes. Server Actions throw `Error` objects that client components catch and display inline.

**Patterns:**
- API routes: `try/catch` → `NextResponse.json({ error: "..." }, { status: N })`
- Server Actions: `throw new Error("Unauthorized" | "Subdomain is already taken" | ...)`, caught in client `onSubmit` handlers
- Client pages: `useState<string | null>(null)` for error messages, displayed inline

## Cross-Cutting Concerns

**Logging:** `console.error(...)` in API route catch blocks — no structured logging library
**Validation:** Zod schemas in `src/lib/validations/` used in both Server Actions and client forms via `react-hook-form` + `@hookform/resolvers`
**Authentication:** NextAuth v5 (beta) JWT sessions; session user ID propagated through JWT callbacks and available via `auth()` in both API routes and Server Actions

---

*Architecture analysis: 2026-05-07*
