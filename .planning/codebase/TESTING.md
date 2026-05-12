# Testing Patterns

**Analysis Date:** 2026-05-07

## Test Framework

**Runner:** None installed

No testing framework is present in this codebase. `package.json` contains no test runner (`jest`, `vitest`, `playwright`, `cypress`, or similar) in either `dependencies` or `devDependencies`. The `scripts` section has no `test` command.

**Test files found:** 0

No `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files exist anywhere in the repository.

**Test directories found:** 0

No `__tests__/` directories exist.

## Test File Organization

Not applicable — no tests exist.

## Types of Tests Present

| Type              | Present |
| ----------------- | ------- |
| Unit tests        | No      |
| Integration tests | No      |
| E2E tests         | No      |
| API tests         | No      |
| Component tests   | No      |

## Test Coverage

**Coverage:** 0% — no tests of any kind.

**What is completely untested:**

- `src/lib/validations/auth.ts` — Zod schemas for login and signup (input validation logic, password matching refinement)
- `src/lib/validations/server.ts` — Zod schemas for server create/update (subdomain regex, field length limits)
- `src/lib/password.ts` — `hashPassword` and `verifyPassword` functions (bcrypt wrappers)
- `src/lib/utils.ts` — `cn()` utility function
- `src/lib/auth.ts` / `src/lib/auth.config.ts` — Auth configuration and JWT/session callbacks
- `src/lib/db.ts` — Prisma client singleton initialization
- `src/app/(dashboard)/dashboard/actions.ts` — All server actions (`createServer`, `updateServer`, `deleteServer`, `togglePublished`)
- `src/app/api/**/*.ts` — All API route handlers (servers CRUD, auth register, upload, Discord invite)
- `src/components/preview/types.ts` — `isColorDark` and `isLightColor` utility functions
- All UI components in `src/components/ui/`
- All layout components in `src/components/layout/`

## CI/CD Testing Setup

No CI/CD pipeline configuration detected. No `.github/workflows/`, `.gitlab-ci.yml`, or similar files are present.

## Testing Patterns

Not applicable — no tests exist to observe patterns from.

## Recommendations for Adding Tests

Given the current stack (Next.js 16, React 19, TypeScript), the natural choices for this codebase would be:

**Unit/Integration testing:**

- **Vitest** — compatible with the ESM/bundler module resolution used (`moduleResolution: "bundler"`) and aligns with the Vite ecosystem; lighter than Jest for TypeScript projects
- **Jest** — alternative if Vitest is not preferred; requires additional config for ESM

**Component testing:**

- **React Testing Library** — pairs with either Vitest or Jest for rendering and interaction testing

**E2E testing:**

- **Playwright** — recommended for testing authentication flows (OAuth redirects, credential login), subdomain routing logic in middleware, and the server editor page

**Highest-priority areas to test first:**

1. `src/lib/validations/` — Pure functions with no side effects; easy to test, high value since they gate all data entry
2. `src/lib/password.ts` — `hashPassword`/`verifyPassword` are security-critical and straightforward to unit test
3. `src/app/(dashboard)/dashboard/actions.ts` — Server actions are the primary mutation path; mock Prisma client and auth
4. `src/app/api/**/route.ts` — API route handlers can be tested with `NextRequest` mocks
5. `src/middleware.ts` — Subdomain routing and auth redirect logic; testable with request mocks

**Test file placement convention (recommended):**
Co-locate test files alongside source files using the pattern `[filename].test.ts` / `[filename].test.tsx`, consistent with Next.js App Router conventions.

---

_Testing analysis: 2026-05-07_
