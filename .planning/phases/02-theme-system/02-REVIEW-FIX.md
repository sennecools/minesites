---
phase: 02-theme-system
fixed_at: 2026-05-07T00:00:00Z
review_path: .planning/phases/02-theme-system/02-REVIEW.md
iteration: 1
findings_in_scope: 8
fixed: 8
skipped: 0
status: all_fixed
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-05-07
**Source review:** .planning/phases/02-theme-system/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 8 (CR-01, CR-02, CR-03, WR-01, WR-02, WR-03, WR-04, WR-05)
- Fixed: 8
- Skipped: 0

## Fixed Issues

### CR-01: hero h1 font — apply --site-font-display

**Files modified:** `src/components/sections/render/hero-render.tsx`
**Commit:** 6023b49
**Applied fix:** Added `style={{ fontFamily: "var(--site-font-display)" }}` to the hero `<h1>` element so the font picker selection is visually reflected on the most prominent heading of public server pages.

---

### CR-02: clipboard handler — async with guard and try/catch

**Files modified:** `src/components/site/nav.tsx`
**Commit:** cca9845
**Applied fix:** Rewrote `handleCopy` as `async`. Added an early-return guard `if (!serverIp) return` so "Copied!" is never shown for an empty IP. Wrapped `navigator.clipboard.writeText` in try/catch so non-HTTPS contexts or permission denials fail silently instead of leaving an unhandled rejected promise.

---

### CR-03: CSS isolation — site-root min-height and color override

**Files modified:** `src/app/globals.css`, `src/app/[subdomain]/layout.tsx`
**Commit:** af2be0a
**Applied fix:** Added `.site-root { min-height: 100dvh; color: var(--site-text); background-color: var(--site-bg); }` to globals.css so the body's `bg-zinc-50`/`text-zinc-900` never bleeds through on short public pages. Removed the now-redundant `backgroundColor: "var(--site-bg)"` inline style from the `cssVars` object in layout.tsx.

---

### WR-01: hero background URL — validate before CSS url() embedding

**Files modified:** `src/components/sections/render/hero-render.tsx`
**Commit:** 9f3b00f
**Applied fix:** Added `safeBackgroundUrl()` helper that parses the URL and rejects anything that is not `http:` or `https:` protocol. `hasImage` and the `backgroundImage` inline style both now use the validated `safeImage` value instead of the raw `backgroundImage` string.

---

### WR-02: remove duplicate HeroSectionSettings — import from sections.ts

**Files modified:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx`
**Commit:** d7efb4c
**Applied fix:** Removed the local `type HeroSectionSettings` block (14 lines) that was missing `discordButtonText` and `copyIpButtonText`. Replaced with `import type { HeroSettings as HeroSectionSettings } from '@/types/sections'` so all hero type references in page.tsx use the canonical, complete definition.

---

### WR-03: player badge bottom — move after CTA buttons

**Files modified:** `src/components/sections/render/hero-render.tsx`
**Commit:** 11dfc0a
**Applied fix:** Moved the `playerBadge === "bottom"` render block to after the Discord/Copy-IP buttons div so "Bottom" truly means below the action buttons. Changed the margin class from `mb-6` to `mt-6` to match the new DOM position.

**Note:** This fix changes the visible render order on public pages for servers with `playerBadge = "bottom"` set. The change is intentional per the REVIEW.md finding.

---

### WR-04: picker buttons — add type="button" to prevent form submit

**Files modified:** `src/components/editor/color-swatch-picker.tsx`, `src/components/editor/font-picker.tsx`
**Commit:** 54b79d2
**Applied fix:** Added `type="button"` to the `<button>` in `ColorSwatchPicker` and to the `<motion.button>` in `FontPicker`. This prevents accidental form submission if either picker is ever rendered inside a `<form>` element.

---

### WR-05: parseInt radix — add explicit radix 10 to slider onChange

**Files modified:** `src/components/sections/settings/hero-settings.tsx`
**Commit:** 7068330
**Applied fix:** Added explicit radix `10` to both `parseInt()` calls in hero-settings.tsx — the `imageBlur` slider onChange (line 191) and the `imageDarken` slider onChange (line 202).

---

## Skipped Issues

None — all findings were fixed.

---

## TypeScript Check Result

Running `npx tsc --noEmit --skipLibCheck` from the project root after all fixes:

```
src/app/[subdomain]/preview-client.tsx(711,7): error TS2322: Type 'unknown' is not assignable to type 'ReactNode'.
```

Only the pre-existing `preview-client.tsx` error remains. No new TypeScript errors were introduced by any of the fixes. All 8 fixes compile cleanly.

---

_Fixed: 2026-05-07_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
