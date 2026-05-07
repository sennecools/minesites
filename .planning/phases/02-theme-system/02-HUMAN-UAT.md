---
status: partial
phase: 02-theme-system
source: [02-VERIFICATION.md]
started: 2026-05-07T20:00:00Z
updated: 2026-05-07T20:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Dark background + no FOUC on public site
expected: Page is dark from first byte; SiteNav visible with server name left and Copy IP button right; no white flash before styles apply
result: [pending]

### 2. Live preview accent color change on swatch click
expected: --site-accent updates immediately to the selected palette hex in the preview panel without clicking Save
result: [pending]

### 3. Live preview font change on font click
expected: --site-font-display updates immediately in the preview panel; preview content renders in the selected font
result: [pending]

### 4. Theme persistence round-trip (save → reload)
expected: theme.palette and theme.font survive a page reload; the editor reloads with the saved values
result: [pending]

### 5. Dashboard visual isolation
expected: Dashboard pages render with standard neutral design; no --site-* vars applied; no dark background
result: [pending]

### 6. Hero section background override interactive flow
expected: The hero section outer wrapper gets the custom backgroundColor; 'Reset Background' button appears; clicking it restores the site-wide default
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
