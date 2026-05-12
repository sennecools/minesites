# Technology Stack — Milestone Additions

**Project:** MineSites  
**Researched:** 2026-05-07  
**Scope:** Stack decisions for the four new capability areas being added to the existing Next.js 16 / TypeScript / Tailwind v4 / Prisma / PostgreSQL / NextAuth app.

---

## 1. Minecraft Server Status API Polling

### Recommended Approach

Use **mcstatus.io** as the upstream API. Call it from a **Next.js Route Handler** (`/api/mc-status/[ip]`) with the `'use cache'` directive and a 60-second `cacheLife`. Never call the external API from the browser or from page-load RSC paths.

**Confidence: HIGH** — Both APIs are live and well-documented. The caching strategy is based on verified Next.js 16 `'use cache'` documentation.

### Why mcstatus.io over mcsrvstat.us

| Criterion       | mcstatus.io                                    | mcsrvstat.us               |
| --------------- | ---------------------------------------------- | -------------------------- |
| Cache TTL       | ~60 seconds (X-Cache-Time-Remaining header)    | Unknown (opaque)           |
| Rate limit      | 5 req/s per IP                                 | Unknown                    |
| API token       | Yes (dashboard)                                | None                       |
| Response schema | Versioned, consistent (`/v2/status/java/<ip>`) | `/3/<ip>`, less documented |
| Self-hostable   | Yes (open source Go)                           | No                         |
| Bedrock support | Yes                                            | Yes                        |

mcsrvstat.us is fine for one-off lookups but has opaque caching, no rate limit documentation, and no API token system. mcstatus.io is designed for developer integration and publishes its limits.

**Endpoint to use:**

```
GET https://api.mcstatus.io/v2/status/java/<address>
```

Returns: `online`, `players.online`, `players.max`, `version.name_clean`, `motd.clean`.

### Caching Strategy

Use Next.js 16's stable `'use cache'` directive (enabled via `cacheComponents: true` in `next.config.ts`). Wrap the fetch in a server-side async function:

```ts
// src/lib/mc-status.ts
import { cacheLife } from 'next/cache';

export async function fetchServerStatus(ip: string) {
	'use cache';
	cacheLife({ revalidate: 60, stale: 30 }); // 60s server revalidation

	const res = await fetch(`https://api.mcstatus.io/v2/status/java/${ip}`, {
		headers: { 'User-Agent': 'minesites.net/1.0' },
	});
	if (!res.ok) return null;
	return res.json();
}
```

Call this from the public server page's RSC layer. The live player count section renders data from it. On cache miss, the external API is hit; subsequent requests within 60s return stale data. The public page never blocks on this — wrap the player count section in `<Suspense>` with a fallback.

**On Vercel (serverless):** In-memory `'use cache'` does not persist across cold starts. The 60s TTL still applies per warm instance, which is acceptable — worst case a cold start re-fetches. For a v1 with low traffic this is fine; if player count freshness is critical later, add Vercel KV as a `cacheHandlers` remote store.

### What NOT to Use

- **Direct socket ping from Next.js** — Requires Node `net` module with careful edge/serverless compatibility checks. The external API abstracts this cleanly at zero added complexity.
- **mcsrvstat.us as primary** — Opaque caching, no rate limit docs, no auth token.
- **Client-side polling** — Never poll from the browser. All external API calls must be server-side to protect the upstream rate limit and prevent the IP of server owners from being exposed via CORS errors.
- **`unstable_cache`** — Superseded by `'use cache'` in Next.js 16. Use the stable directive.

---

## 2. Visual Effects (Particles, Animations, Parallax)

### Recommended Approach

**Framer Motion (already installed at ^12.29.2)** handles all three effect categories. Do not add a second animation library.

**Confidence: HIGH** — Framer Motion is already a production dependency in the codebase. The scroll and particle APIs are verified against current Motion docs.

### Parallax

Use Framer Motion's `useScroll` + `useTransform` hooks. These run on the browser's native `ScrollTimeline` where supported (hardware-accelerated) and fall back to JS otherwise.

```ts
// In a 'use client' section component
import { useScroll, useTransform, motion } from 'framer-motion'

const { scrollYProgress } = useScroll({ target: containerRef })
const y = useTransform(scrollYProgress, [0, 1], ['0%', '-20%'])

return <motion.div style={{ y }}>{children}</motion.div>
```

Parallax is a paid-tier effect. Gate it at the rendering layer: if `server.plan !== 'paid'`, render the section without the `motion.div` wrapper.

### Entrance Animations (free tier)

Framer Motion's `whileInView` + `initial`/`animate` covers all standard entrance effects (fade-up, slide-in). These are lightweight and suitable for the free tier.

### Particles

Use **`@tsparticles/react` v3.0.0** with **`@tsparticles/slim` v3.9.1** (slim preset = ~40kb vs full 200kb). The `@tsparticles/react` package is a Client Component that must be wrapped in `'use client'`. It is not SSR-capable by itself — render it conditionally after mount or use Next.js `dynamic()` with `ssr: false`.

```ts
import dynamic from 'next/dynamic';

const ParticlesBackground = dynamic(() => import('@/components/sections/ParticlesBackground'), {
	ssr: false,
});
```

**Install:**

```bash
pnpm add @tsparticles/react @tsparticles/slim
```

Particles are a paid-tier effect only. The bundle (~40kb slim) must not load for free-tier pages. Gate the `dynamic()` import behind the plan check so the chunk is never requested.

**Note:** `@tsparticles/react` latest stable is 3.0.0 (published ~2 years ago). A 4.0.0-beta is in progress but not recommended for production. The 3.x stable works with React 19 and Next.js App Router via `'use client'`.

### CSS Animations

Use Tailwind's `animate-*` utilities for simple looping effects (pulse, bounce, spin). For custom keyframes, define them in `globals.css` using `@keyframes` inside `@layer utilities`. No additional library needed.

### What NOT to Use

- **`react-spring`** — Redundant; Framer Motion already covers all animation needs.
- **`particles.js` (legacy)** — Unmaintained; `tsparticles` is its maintained successor.
- **`@tsparticles/react` 4.x beta** — Not production-stable; last beta publish was irregular.
- **`react-parallax`** — An extra dependency for something Framer Motion handles natively.
- **GSAP** — License requires payment for SaaS/commercial use cases without a Shockingly Green plan.

---

## 3. Theme System

### Recommended Approach

**Tailwind v4 CSS variables with `@theme inline` and `data-theme` attribute.** Store the theme choice in the `Server` Prisma record (palette key + font key). Inject as `data-theme="[palette]"` and `data-font="[font]"` on the public site's root `<div>`. No runtime JS required for theme switching on the public site — it is server-rendered with the correct attributes.

**Confidence: HIGH** — Tailwind v4 `@theme` and CSS custom property override behavior is verified against official Tailwind docs and the Next.js 16 `use cache` docs.

### CSS Structure

```css
/* globals.css */

/* 1. Register semantic tokens as @theme inline — Tailwind generates utilities */
@theme inline {
	--color-accent: var(--theme-accent);
	--color-accent-foreground: var(--theme-accent-foreground);
	--color-site-bg: var(--theme-bg);
	--color-site-surface: var(--theme-surface);
	--font-display: var(--theme-font-display);
}

/* 2. Default (fallback) values */
@layer base {
	:root {
		--theme-accent: oklch(0.6 0.2 145); /* green */
		--theme-accent-foreground: oklch(1 0 0);
		--theme-bg: oklch(0.13 0.01 240); /* near-black */
		--theme-surface: oklch(0.18 0.01 240);
		--theme-font-display: 'Rajdhani', sans-serif;
	}

	/* 3. Per-palette overrides via data-theme */
	[data-theme='crimson'] {
		--theme-accent: oklch(0.55 0.22 25);
		--theme-accent-foreground: oklch(1 0 0);
		--theme-bg: oklch(0.1 0.02 25);
		--theme-surface: oklch(0.15 0.02 25);
	}

	[data-theme='ocean'] {
		--theme-accent: oklch(0.6 0.18 220);
		--theme-accent-foreground: oklch(1 0 0);
		--theme-bg: oklch(0.1 0.02 220);
		--theme-surface: oklch(0.15 0.02 220);
	}

	/* 4. Per-font overrides via data-font */
	[data-font='orbitron'] {
		--theme-font-display: 'Orbitron', sans-serif;
	}

	[data-font='cinzel'] {
		--theme-font-display: 'Cinzel', serif;
	}
}
```

```tsx
// src/app/[subdomain]/page.tsx (Server Component)
<div
	data-theme={server.settings.palette ?? 'default'}
	data-font={server.settings.font ?? 'rajdhani'}
	className="bg-site-bg min-h-screen"
>
	<PreviewClient sections={server.sections} />
</div>
```

Because `data-theme` is set server-side before HTML is sent to the client, there is no flash of unstyled content. The editor preview uses the same mechanism — update the attribute on the preview wrapper when the user changes palette.

### Font Loading

Use `next/font/google` to load display fonts. Register all available fonts at the root layout level with `variable` mode so they expose CSS variables. The `[data-font]` override simply points `--theme-font-display` at the correct variable.

```ts
// src/app/layout.tsx
import { Cinzel, Orbitron, Rajdhani } from 'next/font/google';

const rajdhani = Rajdhani({
	subsets: ['latin'],
	weight: ['600', '700'],
	variable: '--font-rajdhani',
});
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });

// Apply all variables to <html>; individual data-font selectors activate the right one
```

### Prisma Schema Addition

Add to the `Server` model (or its existing `settings` JSON if you prefer schema-less):

```prisma
// Option A: explicit columns (preferred for querying/validation)
palette  String  @default("default")
font     String  @default("rajdhani")

// Option B: keep in existing settings Json blob (no migration needed)
// settings: { palette: "crimson", font: "orbitron", ... }
```

Option B requires no migration and the settings blob already exists. Use Option B for v1.

### What NOT to Use

- **Runtime `tailwind.config.js` manipulation** — Tailwind v4 does not use a JS config for theme values. All theming is CSS-first.
- **CSS-in-JS (styled-components, emotion)** — Conflicts with Tailwind's approach and adds bundle weight.
- **Per-user theme rebuild** — Never re-generate Tailwind CSS per user. All palettes are defined statically in `globals.css`; only the attribute changes.
- **`class="dark"`-style single toggle** — Too limiting; the system needs N palettes, not just light/dark.

---

## 4. Freemium Gating

### Recommended Approach

**A `plan` column on the `User` model + a single server-side `getPlanLimits()` helper.** No external billing infrastructure, no feature flag service, no third-party SDK.

**Confidence: HIGH** — This is a well-established pattern documented across multiple SaaS build reports. Verification: sole source of truth is the DB record; server actions enforce limits before writes.

### Schema

```prisma
model User {
  // ... existing fields
  plan  String  @default("free")  // "free" | "paid"
}
```

No additional tables. When a payment is processed (future milestone), flip this field. For v1 with no billing, all users are `"free"` by default and you can manually set `"paid"` in the DB for beta testers.

### Limits Helper

```ts
// src/lib/plan.ts
export type Plan = 'free' | 'paid';

export const PLAN_LIMITS = {
	free: {
		maxSectionsPerPage: 5,
		visualEffects: false,
	},
	paid: {
		maxSectionsPerPage: Infinity,
		visualEffects: true,
	},
} satisfies Record<Plan, { maxSectionsPerPage: number; visualEffects: boolean }>;

export function getPlanLimits(plan: Plan) {
	return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}
```

### Enforcement Points

There are two places to enforce limits. Both are required.

**1. Server Action (write path) — hard gate**

```ts
// src/app/(dashboard)/dashboard/actions.ts
export async function saveSections(serverId: string, sections: Section[]) {
	const session = await auth();
	const user = await db.user.findUnique({ where: { id: session.user.id } });
	const limits = getPlanLimits(user.plan as Plan);

	if (sections.length > limits.maxSectionsPerPage) {
		throw new Error(`Free plan is limited to ${limits.maxSectionsPerPage} sections.`);
	}
	// ... proceed with save
}
```

**2. Editor UI (read path) — soft gate with upgrade nudge**

```ts
// In the section editor client component
const canAddSection = sections.length < limits.maxSectionsPerPage

<Button disabled={!canAddSection} onClick={addSection}>
  Add Section
</Button>
{!canAddSection && (
  <p className="text-sm text-muted">
    Upgrade to add more than {limits.maxSectionsPerPage} sections.
  </p>
)}
```

**3. Visual effects render gate**

```ts
// In a paid-tier section component
if (!limits.visualEffects) {
  return <StaticHero {...props} />   // no particles, no parallax
}
return <AnimatedHero {...props} />   // full effects
```

The `limits` object is derived from the session user's plan, fetched server-side. Never trust the client to enforce plan limits — the server action check is the authoritative gate.

### What NOT to Use

- **Feature flag services (LaunchDarkly, Statsig, Unleash)** — Overkill for two tiers and one limit. These services add latency, cost, and a new integration surface. Use plain DB fields.
- **Middleware-based gating** — The Next.js middleware runs on the Edge and cannot query Prisma directly. Keep plan checks in Server Actions and RSC layers.
- **Client-only gating** — Never the sole enforcement point. A user could bypass UI restrictions; the server action must validate.
- **`next-flag` or `happykit`** — Designed for feature rollouts, not entitlement enforcement. Wrong tool for this job.

---

## Dependency Summary

### New packages to install

```bash
# Particles (paid-tier only, lazy-loaded)
pnpm add @tsparticles/react @tsparticles/slim
```

### Existing packages already covering the work

| Need                          | Existing Package       | Version            |
| ----------------------------- | ---------------------- | ------------------ |
| Parallax, entrance animations | framer-motion          | ^12.29.2           |
| CSS animation utilities       | Tailwind CSS           | ^4                 |
| Theme CSS variables           | Tailwind CSS           | ^4                 |
| Gating logic                  | Prisma + custom helper | —                  |
| Minecraft API caching         | Next.js `'use cache'`  | built-in (Next 16) |

Only one new production package is required. Everything else is served by what is already installed.

### next.config.ts addition required

```ts
const nextConfig: NextConfig = {
	cacheComponents: true, // enables 'use cache' directive
};
```

---

## Sources

- mcstatus.io API docs: https://mcstatus.io/docs
- Next.js `'use cache'` directive: https://nextjs.org/docs/app/api-reference/directives/use-cache (version 16.2.5, updated 2026-05-07)
- Tailwind v4 theme variables: https://tailwindcss.com/docs/theme
- Tailwind v4 `data-theme` theming pattern: https://www.jbukuts.com/posts/theming-tailwind-v4
- Tailwind v4 `@theme inline` GitHub discussion: https://github.com/tailwindlabs/tailwindcss/discussions/15199
- tsparticles GitHub: https://github.com/tsparticles/tsparticles
- Framer Motion scroll animations: https://motion.dev/docs/react-scroll-animations
- Feature gating without billing: https://dev.to/aniefon_umanah_ac5f21311c/feature-gating-how-we-built-a-freemium-saas-without-duplicating-components-1lo6
