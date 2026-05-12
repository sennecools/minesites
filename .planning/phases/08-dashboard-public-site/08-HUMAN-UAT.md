---
status: partial
phase: 08-dashboard-public-site
source: [08-VERIFICATION.md]
started: 2026-05-12T16:55:00Z
updated: 2026-05-12T16:55:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Dashboard Website grid + Visit anchor click delivery
expected: Visit `/dashboard` in dev with at least one Website seeded; card grid renders Website cards (not Server cards), each card shows name, subdomain URL `{subdomain}.minesites.net`, section count badge, and a Visit affordance. Section count matches the number of Section rows for each Website; hover reveals the Visit anchor; clicking Visit opens `https://{subdomain}.minesites.net` in a new tab; clicking the card body routes to `/dashboard/{websiteId}`. (Note: REVIEW.md CR-01 flags nested-anchor invalid HTML — browsers may reparent the inner anchor; interactive test confirms whether click delivery still works under React 19 / Next.js 16.)
result: [pending]

### 2. Subdomain uniqueness validation UX
expected: Click "New Website" to open the create-website dialog; enter a name + an existing subdomain (already used by another Website); click Create. Server returns `Error("Subdomain is already taken")` from `actions.ts` P2002 catch (or 409 from the API route); the error surfaces in the dialog as a red error block (lines 83-87).
result: [pending]

### 3. Manage Servers end-to-end CRUD
expected: Open the editor on `/dashboard/{websiteId}`, click the "Manage Servers" button in the top-bar action cluster; in the modal: add a server with name + IP + port; edit it inline; delete it via the inline confirm row. Modal opens with "Connected Minecraft Servers" title; empty state shows "No servers connected yet" with primary Add button; add persists via `POST /api/websites/{websiteId}/servers`; row appears on reopen; edit persists via `PUT`; delete persists via `DELETE`; toasts fire "Server added", "Server updated", "Server removed".
result: [pending]

### 4. Subdomain public routing
expected: Visit `{subdomain}.minesites.net` for a published Website in dev (or with wildcard DNS / `/etc/hosts` override); visit the same subdomain for an unpublished Website. Published Website renders SiteNav with `serverName` + the published sections via `PreviewClient`; unpublished Website returns 404 (via `notFound()` in `src/app/[subdomain]/page.tsx`); subdomain routing flows through `src/middleware.ts` which rewrites `hostname.split('.')[0]` to `/[subdomain]`.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
