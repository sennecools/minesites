---
phase: 07-api-layer
plan: 05
subsystem: editor
tags: [refactor, editor, api-layer]
requires:
    - 07-02 (GET/PUT /api/websites/[websiteId])
    - 07-04 (or parallel: 07-06 removal of /api/servers)
provides:
    - editor-fetches-websites-api
    - editor-no-serverip-state
affects:
    - src/app/(dashboard)/dashboard/[serverId]/page.tsx
tech_stack_added: []
patterns_used:
    - 'Narrow-scope deletion (D-15): editor only, types.ts untouched'
key_files:
    modified:
        - src/app/(dashboard)/dashboard/[serverId]/page.tsx
    created: []
    deleted: []
key_decisions:
    - 'SectionPreview now receives serverIp: null literal — preview/types.ts WebsiteData stays serverIp: string | null until renderer phase'
    - 'Copy icon import removed; Check retained (still used by plan rank UI at line ~1942)'
metrics:
    duration: '~2 minutes'
    completed: '2026-05-12'
    tasks_total: 2
    tasks_completed: 2
    files_changed: 1
    line_count_before: 3202
    line_count_after: 3172
    line_count_delta: -30
---

# Phase 07 Plan 05: Editor Wired to /api/websites Summary

Editor god-component now fetches load/save from `/api/websites/${serverId}` and no longer carries `serverIp` in its local state; the IP-display sidebar block and its copy button were removed. Net deletion: 30 lines.

## What Changed

Two atomic refactor commits applied to `src/app/(dashboard)/dashboard/[serverId]/page.tsx`:

1. **Task 1 (`6d40d33`)** — URL swap on both load + save fetch calls. Body, headers, and error handling unchanged.
2. **Task 2 (`b30fca7`)** — Seven precise deletions to drop `serverIp` from editor state and the IP copy UI.

### Task 1: fetch URL swap

| Location         | Before                                                        | After                                                          |
| ---------------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| Load (line 2282) | `fetch(\`/api/servers/${serverId}\`)`                         | `fetch(\`/api/websites/${serverId}\`)`                         |
| Save (line 2375) | `fetch(\`/api/servers/${serverId}\`, { method: "PUT", ... })` | `fetch(\`/api/websites/${serverId}\`, { method: "PUT", ... })` |

`grep -c "/api/servers" src/app/(dashboard)/dashboard/[serverId]/page.tsx` → `0`.
`grep -c "fetch(\`/api/websites/" src/app/(dashboard)/dashboard/[serverId]/page.tsx`→`2`.

### Task 2: the seven edits

| Edit                          | Region (original line) | Action                                                                            |
| ----------------------------- | ---------------------- | --------------------------------------------------------------------------------- | --- | ---- |
| A — lucide imports            | line 15                | Removed `  Copy,` (kept `  Check,` — still used at line 1942 in the plan rank UI) |
| B — ServerDataState type      | line ~2251             | Removed `serverIp: string;` field                                                 |
| C — useState                  | line 2267              | Removed `const [copied, setCopied] = useState(false);`                            |
| D — setServerData initializer | line ~2294             | Removed `serverIp: data.serverIp                                                  |     | "",` |
| E — handleCopyIP callback     | lines ~2480-2484       | Removed entire 5-line function                                                    |
| F — Server Info IP JSX        | lines ~2760-2779       | Removed the entire IP code + copy button block (20 JSX lines)                     |
| G — SectionPreview prop       | line ~2935             | Changed `serverIp: serverData.serverIp` → `serverIp: null`                        |

## Verification

| Check                                              | Result                                         |
| -------------------------------------------------- | ---------------------------------------------- |
| `! grep -nE "^  Copy," page.tsx`                   | PASS                                           |
| `grep -q "Check," page.tsx` (still imported)       | PASS                                           |
| `! grep -q "serverIp: string;" page.tsx`           | PASS                                           |
| `! grep -q "serverIp: data.serverIp" page.tsx`     | PASS                                           |
| `! grep -q "handleCopyIP" page.tsx`                | PASS                                           |
| `! grep -q "const \[copied" page.tsx`              | PASS                                           |
| `! grep -q "serverData.serverIp" page.tsx`         | PASS                                           |
| `grep -q "serverIp: null" page.tsx`                | PASS                                           |
| `npx tsc --noEmit` exit code                       | `0` (zero new errors)                          |
| line count strictly decreased                      | 3172 < 3202 (−30 lines, exceeds 25-line floor) |
| `/api/servers` references in page.tsx              | `0` (none)                                     |
| references to `lib/validations/server` in page.tsx | `0` (clean for parallel 07-06 deletion merge)  |

## Confirmation of Out-of-Scope Files

`src/components/preview/types.ts` is **unchanged**. `WebsiteData.serverIp: string | null` remains; the editor satisfies it with a literal `null` per D-15. Any future renderer phase will remove that field once consumers stop using it.

## Parallel-Wave Compatibility

Plan 07-06 is removing `src/app/api/servers/` and `src/lib/validations/server.ts` in a sibling worktree. The editor no longer imports or references either:

- No `import` from `validations/server` exists in the file.
- No `/api/servers` URL string remains.

After both worktrees merge, no dangling references should exist from the dashboard editor.

## Deviations from Plan

None — plan executed exactly as written.

## Authentication Gates

None.

## Commits

| Hash      | Type            | Summary                                                   |
| --------- | --------------- | --------------------------------------------------------- |
| `6d40d33` | refactor(07-05) | Swap editor fetch URLs from /api/servers to /api/websites |
| `b30fca7` | refactor(07-05) | Drop serverIp from editor state and remove IP copy UI     |

## Known Stubs

None introduced by this plan. `serverIp: null` literal in the SectionPreview prop is the intentional, plan-documented bridge until the renderer phase removes `WebsiteData.serverIp`.

## Self-Check: PASSED

- `src/app/(dashboard)/dashboard/[serverId]/page.tsx` exists (3172 lines).
- Commit `6d40d33` present in `git log`.
- Commit `b30fca7` present in `git log`.
- `npx tsc --noEmit` exits 0.
- All grep-based acceptance criteria pass.
