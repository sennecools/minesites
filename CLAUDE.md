# MineSites — Project Guide

## What We're Building

MineSites is a Minecraft server website builder. Server owners create a gaming-styled public website at `[server].minesites.net` by dragging in Minecraft-native sections (player count, server info, hero, gallery, etc.) and configuring a theme. The core problem: public server websites currently look like the admin dashboard. They shouldn't.

## GSD Workflow

This project uses the Get Shit Done (GSD) planning workflow. Planning artifacts live in `.planning/`.

```
/gsd-progress          — check current state and what to do next
/gsd-discuss-phase 1   — start discussing Phase 1
/gsd-plan-phase 1      — plan Phase 1 (skip discussion)
/gsd-execute-phase 1   — execute Phase 1 plans
```

## Project State

- **Roadmap:** `.planning/ROADMAP.md` — 5 phases, 23 requirements
- **Requirements:** `.planning/REQUIREMENTS.md`
- **Config:** `.planning/config.json` — YOLO mode, coarse granularity, balanced models
- **Codebase map:** `.planning/codebase/` — architecture, stack, concerns

## Current Phase

**Phase 1: Foundation & Extraction** — Not started

Goal: Restructure the codebase so every future section type = 2 files + 1 registry entry, never lines in the god-component.

## Key Architecture Rules

1. **Never grow the god-component** (`src/app/(dashboard)/dashboard/[serverId]/page.tsx`, ~5171 lines). New section types go in `src/components/sections/render/` and `src/components/sections/settings/`.
2. **CSS isolation is mandatory** — server website styles live under `.site-root` scope. Dashboard styles must never bleed into public pages.
3. **Freemium enforcement is server-side** — the `PUT /api/servers/[serverId]` handler must validate section count against `user.plan`. Client-only gating is not sufficient.
4. **Player count is non-blocking** — never await Minecraft status API in the SSR critical path. Use Suspense + cached Route Handler.
5. **Visual effects are `ssr: false`** — particles and parallax must use `next/dynamic({ ssr: false })` to avoid hydration mismatches.

## Tech Stack

- Next.js 16 App Router, TypeScript, Tailwind CSS v4
- Prisma + PostgreSQL
- NextAuth v5 (beta)
- mcstatus.io for Minecraft server status polling
- @tsparticles/slim for visual effects (paid tier)
