# Coding Conventions

**Analysis Date:** 2026-05-07

## Naming Patterns

**Files:**

- React component files: PascalCase for standalone components (`ImageUpload.tsx`), kebab-case for grouped UI components (`hero-section.tsx`, `server-settings.tsx`)
- Page files: always `page.tsx` following Next.js App Router convention
- Server action files: `actions.ts` at the route level
- Type declaration files: kebab-case (`next-auth.d.ts`)
- Utility/library files: kebab-case (`auth.config.ts`, `auth.ts`, `db.ts`, `password.ts`, `utils.ts`)
- Validation files: kebab-case under `src/lib/validations/` (`auth.ts`, `server.ts`)

**Components and Functions:**

- React components: PascalCase (`Button`, `ServerSettings`, `CreateServerDialog`, `HeroSection`)
- Named exports for all reusable components — default exports only for Next.js route pages (`page.tsx`, `layout.tsx`)
- Event handler functions: `handle` prefix (`handleSubmit`, `handleDelete`, `handleTogglePublished`, `handleUpload`, `handleDrop`)
- Server actions: verb phrases in camelCase (`createServer`, `updateServer`, `deleteServer`, `togglePublished`)
- Boolean state variables: `is` prefix (`isLoading`, `isSubmitting`, `isDeleting`, `isOpen`, `isDragging`, `isUploading`)
- Hook stores: `use` prefix + `Store` suffix (`useSidebarStore`)

**Variables:**

- camelCase throughout (`serverId`, `formData`, `hashedPassword`, `sessionToken`)
- Type-inferred schema types use `type` keyword: `type LoginInput = z.infer<typeof loginSchema>`
- Constants defined with `const`, no `let` observed for module-level values

**Types:**

- `interface` preferred for component props and data shapes (`interface ButtonProps`, `interface ServerSettingsProps`, `interface ModalProps`)
- `type` used for Zod-inferred types (`type CreateServerInput = z.infer<...>`) and for complex union/intersection types within large page components
- Local-scope shape types within page components use `type` (e.g., `type HeroSettings = { ... }`)
- React HTML element extension always via `interface` extending the HTML attributes type (`interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>`)

## Code Style

**Formatting:**

- No Prettier config detected — formatting is enforced via ESLint (eslint-config-next + core-web-vitals + typescript rules)
- ESLint configured at `eslint.config.mjs` using the flat config format

**TypeScript:**

- `strict: true` enabled in `tsconfig.json`
- `noEmit: true` — TypeScript used for type checking only, not compilation
- Path alias `@/*` maps to `src/*` — used consistently throughout the codebase
- Non-null assertion (`!`) used in auth config for env vars: `process.env.DISCORD_CLIENT_ID!`

**Tailwind CSS:**

- Tailwind v4 with PostCSS
- `cn()` utility (`clsx` + `tailwind-merge`) used in all components that accept `className` props — defined at `src/lib/utils.ts`
- Conditional class application uses object syntax inside `cn()` for variants:
    ```tsx
    cn('base-classes', { 'variant-class': condition === 'value' }, className);
    ```
- Design tokens: `zinc-*` for neutral grays, `cyan-*`/`emerald-*` for brand accent, `red-*` for destructive actions

## React Directive Pattern

- `"use client"` placed at the top of all interactive components (31 files)
- `"use server"` placed at the top of server action files (`src/app/(dashboard)/dashboard/actions.ts` only)
- Server Components (no directive) used for route pages that only fetch data: `src/app/[subdomain]/page.tsx`
- API route handlers (`route.ts`) never have directives — they are always server-side by default

## Component Patterns

**UI primitives** (`src/components/ui/`):

- Form controls (`Button`, `Input`, `Textarea`, `Select`, `Label`) use `forwardRef` with explicit generic types and set `.displayName`:
    ```tsx
    const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    	({ className, variant, ...props }, ref) => {
    		// ...
    	},
    );
    Button.displayName = 'Button';
    ```
- Compound components (`Modal`, `Card`, `Dropdown`) are implemented as separate named functions in the same file and exported together at the bottom

**Feature components** (`src/components/sections/`, `src/components/layout/`):

- Props destructured inline in function signature
- Named exports (not default)
- `interface ComponentNameProps { }` defined immediately before the component function

**Page-level components** (`src/app/**/page.tsx`):

- Default exports
- Data fetching done inline via `useEffect` + `fetch` for client pages, or directly via `db` calls for server pages
- Local loading and error state managed with `useState`:
    ```tsx
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    ```

**Form pattern:**

- `react-hook-form` + `@hookform/resolvers/zod` + Zod schema in all forms
- Zod schemas defined in `src/lib/validations/` and imported into both client forms and server actions
- Form data converted to `FormData` before calling server actions:
    ```tsx
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
    	if (value !== undefined) formData.append(key, String(value));
    });
    await createServer(formData);
    ```

**Animation:**

- Framer Motion used throughout for all interactive micro-animations (`motion.div`, `motion.button`, `AnimatePresence`)
- Standard enter/exit pattern: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}` → `exit={{ opacity: 0, y: 20 }}`
- `whileHover` and `whileTap` used on buttons and cards for tactile feedback

**State management:**

- `useState` for local component state
- Zustand for cross-component persistent state (`useSidebarStore` in `src/components/layout/sidebar.tsx`)
- Context + `useContext` for toast notifications (`ToastContext` in `src/components/ui/toast.tsx`)

## Import Organization

Imports are ordered in this pattern (no enforced grouping separator, but consistently observed):

1. React (only when hooks are used: `import { useState, useEffect } from "react"`)
2. Next.js framework (`import Link from "next/link"`, `import { useRouter } from "next/navigation"`)
3. Third-party libraries (`import { motion } from "framer-motion"`, `import { Eye } from "lucide-react"`)
4. Internal aliases (`import { Button } from "@/components/ui"`, `import { db } from "@/lib/db"`)
5. Relative imports (`import { createServer } from "./actions"`)

Type-only imports use the `type` keyword inline: `import { forwardRef, type ButtonHTMLAttributes } from "react"`.

Barrel files exist at:

- `src/components/ui/index.ts` — re-exports all UI primitives
- `src/components/layout/index.ts` — re-exports layout components
- `src/components/sections/index.ts` — re-exports section components

## Error Handling

**Server actions** (`src/app/(dashboard)/dashboard/actions.ts`):

- Throw `Error` with descriptive messages on auth/validation failure
- Let database errors propagate (no try/catch in actions) — handled at call site
- Auth check is always the first line: `if (!session?.user?.id) throw new Error("Unauthorized")`

**API routes** (`src/app/api/**/route.ts`):

- Wrap entire handler body in `try/catch`
- Return `{ error: "..." }` JSON with appropriate status code on error
- `console.error("context:", error)` in every catch block
- Auth check returns `401` before any data access
- Ownership check returns `403` after confirming resource exists

**Client components:**

- Catch errors from server action calls with `try/catch` in `onSubmit`
- Narrow error type with `err instanceof Error ? err.message : "Something went wrong"` pattern — used in 7+ places
- Display errors inline in red-styled `div` or `p` elements, never as alerts

## Logging

- `console.error("context description:", error)` in all API route catch blocks
- No structured logging framework — plain `console.error` only
- No `console.log` or `console.warn` observed in production code paths

## Comments

- Inline comments used sparingly: section labels in long files (`// Mock server data`, `// GET /api/servers/[serverId] - Load server data with sections`)
- No JSDoc observed
- Complex schema fields annotated in Prisma schema (`// All section-specific settings`, `// Navbar settings`)

## Function Design

**Size:**

- Utility functions are small and focused (`cn`, `hashPassword`, `verifyPassword`, `isColorDark`)
- Server actions are moderately sized (15–40 lines each)
- Page components are sometimes very large — `src/app/(dashboard)/dashboard/[serverId]/page.tsx` is 5,171 lines with all editor logic inlined

**Parameters:**

- Props objects always destructured inline in function signature
- Optional parameters typed with `?` and given default values in destructuring

**Return Values:**

- Server actions use `redirect()` or `revalidatePath()` — no explicit return
- API routes always return `NextResponse.json(...)`
- Utility functions return typed values

## Module Design

**Exports:**

- Named exports for all reusable components and functions
- Default exports only for Next.js route files (`page.tsx`, `layout.tsx`, `route.ts` handlers via re-export)
- Barrel `index.ts` files consolidate exports for component directories
- Zod schemas and their inferred types exported together from validation files

**Anti-Patterns Observed:**

1. **Massive page component** — `src/app/(dashboard)/dashboard/[serverId]/page.tsx` is 5,171 lines with all editor panel logic, local type definitions, and rendering logic co-located in one file. Should be split into sub-components.

2. **Duplicate `ServerData` interface** — defined independently in `src/app/(dashboard)/dashboard/page.tsx`, `src/app/(dashboard)/dashboard/servers/page.tsx`, and `src/components/preview/types.ts`. Should be shared from `src/types/` or `src/components/preview/types.ts`.

3. **Inline raw `<input>` instead of `<Input>` component** — `src/app/(auth)/login/page.tsx` uses raw HTML `<input>` elements with manually written Tailwind instead of the project's own `Input` component, causing style inconsistency.

4. **`input-field` CSS class with no Tailwind definition** — `src/components/ImageUpload.tsx:172` references `className="input-field mt-2 text-xs"` where `input-field` is not a Tailwind class and not found in any CSS file.

5. **Hardcoded user name in dashboard layout** — `src/app/(dashboard)/layout.tsx:70` renders `<p>Senne</p>` instead of reading from session.

6. **Multiple abandoned marketing page versions** — `src/app/(marketing)/page-v2.tsx` through `page-v5.tsx` exist alongside the active `page.tsx`, adding file clutter.

7. **Mock data in production page** — `src/app/(dashboard)/dashboard/[serverId]/page.tsx` contains `const mockServer = { ... }` with hardcoded values used as fallback, which could mask real loading failures.

---

_Convention analysis: 2026-05-07_
