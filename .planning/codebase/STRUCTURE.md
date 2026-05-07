# Codebase Structure

**Analysis Date:** 2026-05-07

## Directory Layout

```
minesites/
├── prisma/                   # Database schema and seed
│   ├── schema.prisma         # Prisma data model (User, Server, Section, auth tables)
│   ├── prisma.config.ts      # Prisma configuration
│   └── seed.ts               # Database seed script
├── src/
│   ├── app/                  # Next.js App Router — all pages and API routes
│   │   ├── layout.tsx        # Root layout (fonts, ToastProvider)
│   │   ├── globals.css       # Global Tailwind CSS
│   │   ├── favicon.ico
│   │   ├── (auth)/           # Route group: auth pages (no layout path segment)
│   │   │   ├── layout.tsx    # Animated split-panel auth shell
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/      # Route group: authenticated dashboard
│   │   │   ├── layout.tsx    # Dashboard shell: Sidebar + sticky header
│   │   │   ├── sign-out-button.tsx
│   │   │   └── dashboard/
│   │   │       ├── page.tsx               # Server list overview
│   │   │       ├── actions.ts             # Server Actions: createServer, updateServer, deleteServer, togglePublished
│   │   │       ├── create-server-dialog.tsx
│   │   │       ├── servers/page.tsx       # Alternate servers list view
│   │   │       └── [serverId]/
│   │   │           ├── page.tsx           # Full section editor (large client component)
│   │   │           ├── server-actions.tsx # Publish/Delete dropdown UI
│   │   │           └── server-settings.tsx # Basic server metadata form
│   │   ├── (marketing)/      # Route group: public marketing pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx      # Marketing homepage (active)
│   │   │   ├── page-v2.tsx   # Unused homepage iterations
│   │   │   ├── page-v3.tsx
│   │   │   ├── page-v4.tsx
│   │   │   ├── page-v5.tsx
│   │   │   └── pricing/page.tsx
│   │   ├── [subdomain]/      # Dynamic catch-all for public server sites
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx      # Server Component: DB fetch + pass to PreviewClient
│   │   │   └── preview-client.tsx # Client Component: section-type switch renderer
│   │   └── api/              # REST API routes
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │       │   └── register/route.ts       # Email registration endpoint
│   │       ├── servers/
│   │       │   ├── route.ts               # GET /api/servers (list user servers)
│   │       │   └── [serverId]/route.ts    # GET + PUT /api/servers/[id] (load + save with sections)
│   │       ├── upload/route.ts            # POST + DELETE /api/upload (Vercel Blob)
│   │       └── discord/
│   │           └── invite/route.ts        # GET /api/discord/invite?code= (Discord API proxy)
│   ├── components/
│   │   ├── ui/               # Primitive UI components
│   │   │   ├── index.ts      # Barrel export
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── dropdown.tsx
│   │   │   └── toast.tsx     # ToastProvider + useToast hook
│   │   ├── layout/           # Chrome components
│   │   │   ├── index.ts      # Barrel export
│   │   │   ├── header.tsx    # Marketing header
│   │   │   ├── footer.tsx    # Marketing footer
│   │   │   └── sidebar.tsx   # Dashboard sidebar + useSidebarStore (Zustand)
│   │   ├── sections/         # Section render components (partially used)
│   │   │   ├── index.ts
│   │   │   └── hero-section.tsx
│   │   ├── preview/          # Shared types for preview rendering
│   │   │   └── types.ts      # ServerData, Section, FeatureItem, GalleryImage, etc.
│   │   └── ImageUpload.tsx   # Reusable image upload component (Vercel Blob)
│   ├── lib/
│   │   ├── auth.config.ts    # Edge-compatible NextAuth config (OAuth providers, JWT callbacks)
│   │   ├── auth.ts           # Full NextAuth config (PrismaAdapter, Credentials provider)
│   │   ├── db.ts             # Singleton PrismaClient with pg connection pool
│   │   ├── password.ts       # bcryptjs hash/verify helpers
│   │   ├── utils.ts          # cn() (clsx + tailwind-merge)
│   │   └── validations/
│   │       ├── auth.ts       # Zod schemas for login/register forms
│   │       └── server.ts     # Zod schemas: createServerSchema, updateServerSchema
│   ├── middleware.ts          # Subdomain rewrite + dashboard auth guard
│   └── types/
│       └── next-auth.d.ts    # NextAuth type augmentation (session.user.id)
├── .planning/
│   └── codebase/             # Architecture documents (this directory)
├── next.config.ts            # Next.js config (minimal, no special overrides)
├── tsconfig.json             # TypeScript config (@/ path alias → src/)
├── package.json              # Dependencies and scripts
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── eslint.config.mjs
└── postcss.config.mjs        # Tailwind CSS v4 PostCSS plugin
```

## Directory Purposes

**`src/app/`:**
- Purpose: All Next.js pages, layouts, and API routes
- Contains: Route group folders with layouts, page components, Server Actions, API route handlers
- Key files: `layout.tsx` (root), `middleware.ts` (routing logic)

**`src/app/(auth)/`:**
- Purpose: Unauthenticated login and signup flows
- Contains: `login/page.tsx`, `signup/page.tsx`, shared animated layout
- Key files: `src/app/(auth)/layout.tsx`

**`src/app/(dashboard)/`:**
- Purpose: Authenticated area for managing Minecraft server websites
- Contains: Server list, server editor, Server Actions
- Key files: `src/app/(dashboard)/dashboard/actions.ts`, `src/app/(dashboard)/dashboard/[serverId]/page.tsx`

**`src/app/(marketing)/`:**
- Purpose: Public landing pages
- Contains: Multiple homepage iterations (only `page.tsx` is active), pricing page
- Key files: `src/app/(marketing)/page.tsx`

**`src/app/[subdomain]/`:**
- Purpose: Renders the public-facing Minecraft server website for each registered subdomain
- Contains: `page.tsx` (Server Component), `preview-client.tsx` (all section renderers)
- Key files: `src/app/[subdomain]/preview-client.tsx`

**`src/app/api/`:**
- Purpose: REST API endpoints consumed by client components
- Contains: Auth, servers CRUD, file upload, Discord proxy
- Key files: `src/app/api/servers/[serverId]/route.ts`

**`src/components/ui/`:**
- Purpose: Reusable primitive UI components consumed across the app
- Contains: Button, Input, Textarea, Select, Card, Badge, Avatar, Modal, Dropdown, Toast
- Key files: `src/components/ui/index.ts` (barrel export)

**`src/components/layout/`:**
- Purpose: Top-level page chrome
- Contains: Sidebar (with Zustand store), Header, Footer
- Key files: `src/components/layout/sidebar.tsx`

**`src/components/preview/`:**
- Purpose: Shared TypeScript types for the section data model used by both the editor and the public renderer
- Contains: `types.ts`

**`src/lib/`:**
- Purpose: Shared utilities and infrastructure
- Contains: Auth setup (split into config + full), DB client, password utils, `cn()`, Zod validation schemas
- Key files: `src/lib/db.ts`, `src/lib/auth.ts`, `src/lib/auth.config.ts`

**`prisma/`:**
- Purpose: Database schema and seed data
- Contains: `schema.prisma` (models: User, Account, Session, VerificationToken, Server, Section)

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root HTML shell, font injection, ToastProvider
- `src/middleware.ts`: Subdomain rewrite + auth guard (runs on every non-static request)
- `src/app/[subdomain]/page.tsx`: Public server site entry point

**Configuration:**
- `prisma/schema.prisma`: Database schema
- `src/lib/auth.config.ts`: NextAuth config (edge-safe)
- `src/lib/auth.ts`: NextAuth full config with Prisma adapter
- `tsconfig.json`: `@/` alias resolves to `src/`

**Core Logic:**
- `src/app/(dashboard)/dashboard/actions.ts`: All server mutation Server Actions
- `src/app/api/servers/[serverId]/route.ts`: GET + PUT with full section upsert in DB transaction
- `src/app/[subdomain]/preview-client.tsx`: All public section rendering logic (~950 lines)

**Validation:**
- `src/lib/validations/server.ts`: `createServerSchema`, `updateServerSchema` (Zod)
- `src/lib/validations/auth.ts`: Auth form schemas (Zod)

## Naming Conventions

**Files:**
- Page files: `page.tsx` (required by Next.js)
- Layout files: `layout.tsx` (required by Next.js)
- API route files: `route.ts` (required by Next.js)
- Server Actions files: `actions.ts`
- Component files: `kebab-case.tsx` (e.g., `hero-section.tsx`, `create-server-dialog.tsx`)
- Utility/lib files: `kebab-case.ts` (e.g., `auth.config.ts`, `db.ts`)

**Directories:**
- Route groups: `(group-name)/` — parenthetical, no URL path segment
- Dynamic segments: `[paramName]/`
- Feature directories: `kebab-case/`

**Exports:**
- Named exports from component files: `export function ComponentName`
- Barrel `index.ts` files in `ui/` and `layout/` for clean imports
- Default exports for Next.js page and layout files

## Where to Add New Code

**New dashboard page:**
- Implementation: `src/app/(dashboard)/dashboard/[new-page]/page.tsx`
- Uses the dashboard layout automatically (sidebar + header)

**New public section type:**
- Add a new `Preview*` function component in `src/app/[subdomain]/preview-client.tsx`
- Add a case to the switch statement in the `PreviewClient` default export
- Add corresponding settings type to `src/components/preview/types.ts`
- Add section type option in the editor `src/app/(dashboard)/dashboard/[serverId]/page.tsx`

**New API endpoint:**
- Implementation: `src/app/api/[resource]/route.ts`
- Always check session via `auth()` from `src/lib/auth.ts`
- Use `db` from `src/lib/db.ts` for database access

**New Server Action:**
- Add to `src/app/(dashboard)/dashboard/actions.ts` (keeps all mutations co-located)
- Mark file with `"use server"` directive
- Validate with Zod before writing to DB

**New UI primitive:**
- Implementation: `src/components/ui/[component-name].tsx`
- Export from `src/components/ui/index.ts`

**New Zod validation schema:**
- Add to the relevant file in `src/lib/validations/`

**New shared utility:**
- Add to `src/lib/utils.ts` (currently only `cn()`) or create a new `src/lib/[utility].ts` file

## Special Directories

**`src/app/(marketing)/`:**
- Purpose: Contains multiple unused homepage version files (`page-v2.tsx` through `page-v5.tsx`)
- Generated: No
- Committed: Yes — these are design iteration artifacts not yet cleaned up

**`.planning/codebase/`:**
- Purpose: Architecture reference documents for planning and execution agents
- Generated: Yes (by codebase mapping)
- Committed: Yes

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes
- Committed: No (in `.gitignore`)

---

*Structure analysis: 2026-05-07*
