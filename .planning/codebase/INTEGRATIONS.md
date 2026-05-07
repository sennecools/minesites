# External Integrations

**Analysis Date:** 2026-05-07

## APIs & External Services

**Discord:**
- OAuth 2.0 login via next-auth Discord provider (`src/lib/auth.config.ts`)
  - SDK/Client: `next-auth/providers/discord`
  - Auth env vars: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
- Discord Public API (unauthenticated) — fetches guild invite metadata
  - Endpoint: `https://discord.com/api/v10/invites/{code}?with_counts=true&with_expiration=true`
  - Implementation: `src/app/api/discord/invite/route.ts`
  - Cached: 5-minute Next.js cache revalidation (`next: { revalidate: 300 }`)
  - Returns: guild name, icon, banner, splash URLs, member/online counts

**Google:**
- OAuth 2.0 login via next-auth Google provider (`src/lib/auth.config.ts`)
  - SDK/Client: `next-auth/providers/google`
  - Auth env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

**Vercel Blob:**
- File storage for server logos and banners
  - SDK: `@vercel/blob` ^2.0.1
  - Operations used: `put` (upload), `del` (delete)
  - Implementation: `src/app/api/upload/route.ts`
  - Access mode: `public` (uploaded files are publicly accessible via CDN URL)
  - Auth env var: `BLOB_READ_WRITE_TOKEN` (implicitly required by `@vercel/blob` SDK)
  - Constraints: max 5MB, allowed types: JPEG, PNG, GIF, WebP
  - File path pattern: `{userId}/{timestamp}.{ext}`

## Data Storage

**Databases:**
- PostgreSQL
  - Provider: `postgresql` (Prisma schema `prisma/schema.prisma`)
  - Connection: `DATABASE_URL` env var
  - Client: Prisma ORM with `@prisma/adapter-pg` (node-postgres connection pool)
  - Pool setup: `src/lib/db.ts` — global singleton pool to survive hot reloads in dev
  - Prisma config: `prisma/prisma.config.ts`
  - Seed script: `prisma/seed.ts` (run via `npx tsx prisma/seed.ts`)

**File Storage:**
- Vercel Blob (see above) — used for images only

**Caching:**
- Next.js built-in fetch cache (used in Discord invite route; 5-minute TTL)
- No Redis or other dedicated cache layer

## Authentication & Identity

**Auth Provider:**
- next-auth 5.0.0-beta.30 (beta)
  - Session strategy: JWT (configured in `src/lib/auth.config.ts`)
  - Adapter: `@auth/prisma-adapter` — persists accounts, sessions, verification tokens to PostgreSQL
  - Route handler: `src/app/api/auth/[...nextauth]/route.ts`
  - Middleware: `src/middleware.ts` — protects `/dashboard` routes, handles subdomain rewrites
  - Auth secret env var: `AUTH_SECRET` (implicitly required by next-auth; not explicitly referenced in source but required at runtime)

**OAuth Providers:**
- Discord OAuth 2.0 (`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`)
- Google OAuth 2.0 (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)

**Credentials Provider:**
- Email + password authentication (`src/lib/auth.ts`)
- Passwords hashed with bcryptjs (12 rounds) via `src/lib/password.ts`
- Registration endpoint: `src/app/api/auth/register/route.ts`

**Database models for auth** (all in `prisma/schema.prisma`):
- `User` — core user record with optional `discordId`
- `Account` — OAuth account links (provider + providerAccountId)
- `Session` — session records (used by adapter even with JWT strategy)
- `VerificationToken` — email verification tokens

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- `console.error` used in API route catch blocks (`src/app/api/upload/route.ts`, `src/app/api/discord/invite/route.ts`)
- No structured logging library

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from `@vercel/blob` dependency and subdomain routing middleware targeting `minesites.net`)
- Subdomain routing: middleware rewrites `{subdomain}.minesites.net` → `/{subdomain}` (Next.js dynamic route `src/app/[subdomain]/`)

**CI Pipeline:**
- None detected (no GitHub Actions, CircleCI, etc.)

## Environment Configuration

**Required env vars:**

| Variable | Used By | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `src/lib/db.ts`, `prisma/prisma.config.ts`, `prisma/seed.ts` | PostgreSQL connection string |
| `DISCORD_CLIENT_ID` | `src/lib/auth.config.ts` | Discord OAuth app ID |
| `DISCORD_CLIENT_SECRET` | `src/lib/auth.config.ts` | Discord OAuth secret |
| `GOOGLE_CLIENT_ID` | `src/lib/auth.config.ts` | Google OAuth app ID |
| `GOOGLE_CLIENT_SECRET` | `src/lib/auth.config.ts` | Google OAuth secret |
| `BLOB_READ_WRITE_TOKEN` | `@vercel/blob` SDK (implicit) | Vercel Blob storage token |
| `AUTH_SECRET` | `next-auth` (implicit) | JWT signing secret |

**Secrets location:**
- No `.env` file committed to repo (absent at project root)
- Vercel dashboard or local `.env` file (not checked in) for development

## Webhooks & Callbacks

**Incoming:**
- OAuth callbacks handled by next-auth at `/api/auth/[...nextauth]`

**Outgoing:**
- None (Discord API is called server-side on demand, not via webhooks)

---

*Integration audit: 2026-05-07*
