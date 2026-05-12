# Technology Stack

**Analysis Date:** 2026-05-07

## Languages

**Primary:**

- TypeScript ^5 - All application code (frontend, backend, config)

**Secondary:**

- CSS - Global styles via `src/app/globals.css` (Tailwind utility classes)

## Runtime

**Environment:**

- Node.js v25.9.0

**Package Manager:**

- pnpm 10.33.0
- Lockfile: `pnpm-lock.yaml` (present)
- Workspace config: `pnpm-workspace.yaml` (single-package workspace, ignores `sharp` and `unrs-resolver` built deps)

## Frameworks

**Core:**

- Next.js 16.1.6 - Full-stack React framework (App Router, Server Actions, Middleware, Route Handlers)
- React 19.2.3 - UI rendering
- React DOM 19.2.3 - DOM rendering target

**Auth:**

- next-auth 5.0.0-beta.30 - Authentication framework (JWT session strategy, Discord + Google OAuth, Credentials)
- @auth/prisma-adapter ^2.11.1 - Prisma database adapter for NextAuth

**Database ORM:**

- Prisma ^7.3.0 - Schema-driven ORM; schema at `prisma/schema.prisma`
- @prisma/client ^7.3.0 - Generated query client
- @prisma/adapter-pg ^7.3.0 - PostgreSQL adapter using node-postgres connection pool

**Forms & Validation:**

- react-hook-form ^7.71.1 - Form state management
- @hookform/resolvers ^5.2.2 - Zod resolver integration for react-hook-form
- zod ^4.3.6 - Schema validation; schemas at `src/lib/validations/`

**Animation:**

- framer-motion ^12.29.2 - Motion/animation library; used extensively across layout, UI, and section components

**State Management:**

- zustand ^5.0.10 - Lightweight client state; used with `persist` middleware in `src/components/layout/sidebar.tsx`

**Styling:**

- Tailwind CSS ^4 - Utility-first CSS framework
- @tailwindcss/postcss ^4 - PostCSS integration (configured in `postcss.config.mjs`)
- tailwind-merge ^3.4.0 - Merges Tailwind classes without conflicts
- clsx ^2.1.1 - Conditional class name utility; combined with tailwind-merge in `src/lib/utils.ts`

**Icons:**

- lucide-react ^0.563.0 - Icon library

**Security:**

- bcryptjs ^3.0.3 - Password hashing (12 rounds); used in `src/lib/password.ts`

**Build/Dev:**

- TypeScript ^5 - Static type checking
- ESLint ^9 - Linting
- eslint-config-next 16.1.6 - Next.js ESLint rules (core-web-vitals + TypeScript configs)

**Database Driver:**

- pg ^8.18.0 - node-postgres; used for Prisma connection pooling

**Environment:**

- dotenv ^17.2.3 - `.env` loading in `prisma/prisma.config.ts`

## Key Dependencies

**Critical:**

- `next` 16.1.6 - Core framework; all routing, SSR, and API handled here
- `next-auth` 5.0.0-beta.30 - Beta version; breaking changes possible on upgrades
- `@prisma/client` ^7.3.0 - All database queries flow through this
- `@vercel/blob` ^2.0.1 - File/image storage for server logos and banners

**Infrastructure:**

- `pg` ^8.18.0 - Raw PostgreSQL connection pool backing Prisma
- `prisma` ^7.3.0 - Dev-only CLI for migrations and seed

## Configuration

**Environment:**

- No `.env` file committed (absent from repo root)
- Environment loaded at runtime via `process.env` in source; loaded via `dotenv` in `prisma/prisma.config.ts`
- Required vars: `DATABASE_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and implicitly `BLOB_READ_WRITE_TOKEN` for Vercel Blob

**Build:**

- `next.config.ts` - Minimal Next.js config (no custom options set)
- `tsconfig.json` - Target ES2017; strict mode enabled; path alias `@/*` → `./src/*`; module resolution: bundler
- `postcss.config.mjs` - Only plugin: `@tailwindcss/postcss`
- `eslint.config.mjs` - Flat config using `eslint-config-next` core-web-vitals and TypeScript presets

## Platform Requirements

**Development:**

- Node.js v25.x (detected from environment)
- pnpm 10.x
- PostgreSQL database accessible via `DATABASE_URL`

**Production:**

- Deployment target: Vercel (inferred from `@vercel/blob` usage and subdomain middleware in `src/middleware.ts`)
- PostgreSQL database (provider: `postgresql` in Prisma schema)
- Vercel Blob for file storage

---

_Stack analysis: 2026-05-07_
