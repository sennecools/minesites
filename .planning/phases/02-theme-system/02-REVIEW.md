---
phase: 02-theme-system
reviewed: 2026-05-07T00:00:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - src/types/site-theme.ts
  - src/lib/theme-presets.ts
  - src/app/[subdomain]/layout.tsx
  - src/components/site/nav.tsx
  - src/components/editor/color-swatch-picker.tsx
  - src/components/editor/font-picker.tsx
  - src/components/editor/appearance-tab.tsx
  - src/app/(dashboard)/dashboard/[serverId]/page.tsx
  - src/components/sections/settings/hero-settings.tsx
  - src/components/sections/render/hero-render.tsx
findings:
  critical: 3
  warning: 5
  info: 3
  total: 11
status: fixed
---

# Phase 02: Code Review Report

**Reviewed:** 2026-05-07
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

The theme system implementation is largely sound. CSS vars are server-rendered inline on `.site-root` (no FOUC), all five fonts are declared at module top-level correctly, the live preview uses a dual-path update (state + direct DOM mutation), and Prisma queries are parameterized. However, there are three blockers: (1) the `body` element carries `bg-zinc-50 text-zinc-900` from the root layout, and `.site-root` has no `min-height: 100%` or color override in CSS — any gap below the site content exposes the zinc background on public pages; (2) the hero heading (`<h1>`) never applies `--site-font-display`, making the font switcher visually inert on the most prominent element; (3) `navigator.clipboard.writeText()` in `SiteNav` is an unhandled promise — on HTTPS denials or non-secure contexts it throws silently and the "Copied!" state never reverts. There are also five warnings covering an unvalidated free-text `backgroundImage` URL used directly in a CSS `url()` call, a type divergence between the duplicate `HeroSectionSettings` in `page.tsx` and the canonical `HeroSettings` in `sections.ts`, the player-badge "bottom" position rendering before the CTA buttons (likely wrong order), missing `type="button"` on picker buttons, and `parseInt()` calls without a radix argument.

---

## Critical Issues

### CR-01: `<h1>` in hero-render ignores `--site-font-display` — font picker has no visible effect on the hero title

**File:** `src/components/sections/render/hero-render.tsx:122`

**Issue:** The hero `<h1>` uses only Tailwind utility classes (`font-extrabold`, `tracking-tight`). It never sets `fontFamily: "var(--site-font-display)"` in its `style` prop. The entire purpose of the font picker is to change the display font on the public site — with this omission the heading always renders in the inherited body font (`Plus Jakarta Sans`) regardless of what the user selects. The `SiteNav` server name span applies the var correctly (nav.tsx:28) which demonstrates the pattern exists; it was simply not carried into the hero heading.

**Fix:**
```tsx
// hero-render.tsx line 122 — add style prop
<h1
  className={`text-5xl md:text-6xl font-extrabold mb-4 tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}
  style={{ fontFamily: "var(--site-font-display)" }}
>
  {section.title || serverData.name}
</h1>
```

---

### CR-02: `navigator.clipboard.writeText()` unhandled promise — silent failure + broken UI state

**File:** `src/components/site/nav.tsx:15`

**Issue:** `navigator.clipboard.writeText(serverIp)` returns a `Promise<void>` that is not awaited and has no `.catch()`. In two failure scenarios this causes silent errors: (a) the Clipboard API is unavailable in non-HTTPS contexts (e.g., preview over HTTP, or in an iframe on the dashboard preview panel where permissions may be denied); (b) `serverIp` is an empty string when the server owner has not configured an IP — the layout passes `server?.serverIp ?? ""` (layout.tsx:77), so clicking "Copy IP" silently writes an empty string and incorrectly shows "Copied!" for 2 seconds. There is no guard against an empty `serverIp` prop.

**Fix:**
```tsx
const handleCopy = async () => {
  if (!serverIp) return; // guard: nothing to copy
  try {
    await navigator.clipboard.writeText(serverIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch {
    // Clipboard unavailable (non-HTTPS or permission denied) — fail silently
  }
};
```

---

### CR-03: Body background (`bg-zinc-50`) bleeds through `.site-root` on public pages — CSS isolation broken

**File:** `src/app/[subdomain]/layout.tsx:97-108` / `src/app/layout.tsx:29`

**Issue:** The root layout (`app/layout.tsx`) applies `bg-zinc-50 text-zinc-900` directly to `<body>`. The subdomain layout wraps its content in a `.site-root` div with `backgroundColor: "var(--site-bg)"` (#0e0e10) inline, but the div has no `min-height: 100%` or `min-height: 100dvh`. On pages where content is shorter than the viewport (e.g., a server with one section), the zinc-50 body background is visible below `.site-root`. Similarly, `text-zinc-900` cascades into `.site-root` unless explicitly overridden — the CSS text variables (`--site-text`, `--site-text-muted`) are defined but only used through explicit `style` props; any child that relies on the inherited `color` will get zinc-900 instead of the gaming dark theme's `#f4f4f5`. There is no `.site-root { color: var(--site-text); min-height: 100dvh; }` rule in `globals.css`, which is where this should live.

**Fix:** Add to `src/app/globals.css`:
```css
.site-root {
  min-height: 100dvh;
  color: var(--site-text);
  background-color: var(--site-bg);
}
```
The `backgroundColor` inline style on the div can then be removed (the CSS rule takes over and the inline style was a workaround for the missing rule).

---

## Warnings

### WR-01: `backgroundImage` URL used unvalidated in CSS `url()` — potential CSS injection

**File:** `src/components/sections/render/hero-render.tsx:97`

**Issue:** `hero.backgroundImage` is a free-text string typed by the server owner in `hero-settings.tsx:179`. It is embedded directly into a CSS `backgroundImage` value:
```tsx
backgroundImage: `url(${backgroundImage})`,
```
If the string contains `)` followed by `;` or another CSS token, the injected value breaks out of the `url()` call and appends arbitrary CSS properties. This is a CSS injection vector. Concrete example: a value of `x) ; background: red; --x: (y` produces malformed but potentially exploitable CSS-in-JS output depending on React's style sanitization. React's `style` prop does sanitize against XSS in the HTML sense, but CSS injection through crafted `url()` values is a known gap in React's sanitization model.

**Fix:** Validate the URL before embedding it. Reject values that contain unencoded `)`, `(`, or control characters:
```tsx
function safeBackgroundUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return undefined;
    return url;
  } catch {
    return undefined;
  }
}

// Then:
const safeImage = safeBackgroundUrl(backgroundImage);
const hasImage = backgroundType === "image" && !!safeImage;

// In the style prop:
backgroundImage: `url(${safeImage})`,
```

---

### WR-02: Duplicate `HeroSectionSettings` type in `page.tsx` diverges from canonical `HeroSettings` — `discordButtonText` and `copyIpButtonText` are missing

**File:** `src/app/(dashboard)/dashboard/[serverId]/page.tsx:65-78`

**Issue:** `page.tsx` defines `type HeroSectionSettings` at line 65 independently of the canonical `interface HeroSettings` in `src/types/sections.ts`. The `page.tsx` copy is missing two fields present in the canonical type: `discordButtonText` and `copyIpButtonText`. Because `page.tsx` uses its own local type (line 240) for settings access, any code in `page.tsx` that reads or writes hero button text fields via `section.settings.hero as HeroSectionSettings` will see those fields as absent from the type — leading to undetected type errors if such code is added, and causing confusion for maintainers. The canonical type in `sections.ts` is the source of truth per Phase 1 decisions; the local copy should be removed.

**Fix:** Remove the local `type HeroSectionSettings` block (lines 65-78) and import from `@/types/sections`:
```tsx
import type { HeroSettings as HeroSectionSettings } from '@/types/sections';
```

---

### WR-03: Player badge "bottom" position renders *before* the CTA buttons, not after them

**File:** `src/components/sections/render/hero-render.tsx:132-136`

**Issue:** The DOM order for `playerBadge === "bottom"` is:
1. `<h1>` — server title
2. `<p>` — subtitle
3. **PlayerBadge** (if `playerBadge === "bottom"`)
4. Discord / Copy IP buttons

"Bottom" visually implies the badge appears below the action buttons, not sandwiched between the subtitle and the buttons. As implemented, "bottom" and "top" differ only in whether the badge is above the `<h1>` (top) or above the buttons (bottom-ish). If the design intent is badge below buttons, the `{playerBadge === "bottom"}` block must move after the buttons `div`. If the current position is intentional ("bottom of the text block, above buttons"), the settings label "Bottom" is misleading.

**Fix (if below-buttons is the intended meaning):**
```tsx
{(showDiscordButton || showCopyIpButton) && (
  <div className={`flex gap-3 ...`}>
    ...buttons...
  </div>
)}
{playerBadge === "bottom" && (
  <div className="mt-6">
    <PlayerBadge />
  </div>
)}
```

---

### WR-04: `ColorSwatchPicker` and `FontPicker` buttons missing `type="button"` — will submit any enclosing form

**File:** `src/components/editor/color-swatch-picker.tsx:19` / `src/components/editor/font-picker.tsx:19`

**Issue:** Both picker components render `<button>` elements without `type="button"`. The HTML default for `<button>` is `type="submit"`. If the editor panel is ever wrapped in a `<form>` element (e.g., by a future refactor or a UI component that adds a form internally), clicking a color swatch or font label will submit the form, triggering a full page navigation instead of the intended picker change. The hero settings panel already uses `type="button"` on all its buttons (hero-settings.tsx:65, 88, 219) — the pickers should follow the same convention.

**Fix:**
```tsx
// color-swatch-picker.tsx line 19
<button
  key={key}
  type="button"
  onClick={() => onChange(key)}
  ...
>

// font-picker.tsx line 19
<motion.button
  key={key}
  type="button"
  onClick={() => onChange(key)}
  ...
>
```

---

### WR-05: `parseInt()` without radix argument in `hero-settings.tsx`

**File:** `src/components/sections/settings/hero-settings.tsx:191,202`

**Issue:** `parseInt(e.target.value)` is called without a radix argument on both the blur and darken sliders. Per the ECMAScript spec, when no radix is supplied, values starting with `0x` are parsed as hex and (in some older engines) values starting with `0` may be parsed as octal. While `<input type="range">` produces decimal strings in browsers today, omitting the radix violates the project's implicit requirement of explicit, unambiguous code and will trigger lint rules (e.g., `radix` in ESLint). More concretely, if a future refactor changes the input type or allows manual entry, octal-like strings (`"08"`) would produce `NaN`, silently setting the CSS filter to `blur(NaNpx)`.

**Fix:**
```tsx
onChange={(e) => updateHero({ imageBlur: parseInt(e.target.value, 10) })}
// ...
onChange={(e) => updateHero({ imageDarken: parseInt(e.target.value, 10) })}
```

---

## Info

### IN-01: `FONT_FAMILY_MAP` uses literal font-family strings instead of CSS variables — correct but fragile

**File:** `src/lib/theme-presets.ts:28-34`

**Issue:** The comment on `FONT_FAMILY_MAP` explains why literal font-family names are used instead of `var(--font-*)` CSS variables (editor preview panel lacks the next/font CSS vars). This is correct behavior per RESEARCH.md Pitfall 5. However, the literal strings (`'Rajdhani'`, `'Exo 2'`, etc.) must stay in sync with the actual font family names loaded by `next/font/google` in `layout.tsx`. There is no compile-time or test-time check ensuring this. If a font is renamed or replaced in `layout.tsx`, the `FONT_FAMILY_MAP` string may silently become stale and the browser falls back to `sans-serif` with no error.

**Fix:** Add a comment cross-referencing the exact font declaration in `layout.tsx` next to each entry, or add a build-time test that validates each `FONT_FAMILY_MAP` key resolves to a loaded font. No code change is strictly required now, but this is a future maintenance trap.

---

### IN-02: `ColorSwatchPicker` buttons lack `aria-pressed` — selected state not communicated to screen readers

**File:** `src/components/editor/color-swatch-picker.tsx:19-39`

**Issue:** The swatch buttons communicate their selected state visually via `scale(1.1)` animation and an `outline` border. Screen readers receive an `aria-label` with the color name (e.g., "Cyan") but no indication of whether that color is currently selected. The `aria-pressed` attribute is the standard way to convey toggle state for buttons that do not use `role="radio"`. The font picker (`font-picker.tsx`) has the same gap — selected font is shown only via `fontWeight: 700` and a colored underline.

**Fix:**
```tsx
// color-swatch-picker.tsx
<button
  key={key}
  type="button"
  aria-label={PALETTE_DISPLAY_NAMES[key]}
  aria-pressed={selected === key}
  onClick={() => onChange(key)}
  ...
>

// font-picker.tsx
<motion.button
  key={key}
  type="button"
  aria-pressed={selected === key}
  onClick={() => onChange(key)}
  ...
>
```

---

### IN-03: `theme` field in PUT handler accepts and stores arbitrary JSON without validation

**File:** `src/app/api/servers/[serverId]/route.ts:58,88`

**Issue:** The PUT handler extracts `theme` from the request body and writes it directly to the `Server.theme Json` Prisma field with no validation. Any JSON value (including arrays, numbers, or deeply nested objects) is accepted and stored. When `[subdomain]/layout.tsx` reads this value back and casts it as `SiteTheme | null`, an invalid value (e.g., `{ palette: "invalid-key", font: "invalid-key" }`) will pass the `as` cast (TypeScript `as` is compile-time only) and reach `THEME_PRESETS[palette]` — which is guarded by the `?? DEFAULT_THEME.palette` fallback, so runtime crashes are avoided. However, a deliberately crafted `theme` with a very long string value for `palette` or `font` will be stored and re-read on every public page load without rejection. Validation at the API boundary is the correct enforcement point.

**Fix:** Validate palette and font keys server-side before the Prisma update:
```ts
import { THEME_PRESETS, FONT_FAMILY_MAP } from "@/lib/theme-presets";

const validPalettes = new Set(Object.keys(THEME_PRESETS));
const validFonts = new Set(Object.keys(FONT_FAMILY_MAP));

const safeTheme =
  theme &&
  typeof theme === "object" &&
  validPalettes.has(theme.palette) &&
  validFonts.has(theme.font)
    ? { palette: theme.palette, font: theme.font }
    : DEFAULT_THEME;

// Then pass safeTheme to Prisma update
```

---

_Reviewed: 2026-05-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
