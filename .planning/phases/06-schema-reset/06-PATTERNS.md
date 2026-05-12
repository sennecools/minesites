# Phase 6: Schema Reset - Pattern Map

**Mapped:** 2026-05-08
**Files analyzed:** 17 (16 modified + 1 new)
**Analogs found:** 17 / 17

---

## File Classification

| New/Modified File                                              | Role                  | Data Flow        | Closest Analog                           | Match Quality |
| -------------------------------------------------------------- | --------------------- | ---------------- | ---------------------------------------- | ------------- |
| `prisma/schema.prisma`                                         | config/schema         | CRUD             | self (current file)                      | self          |
| `src/lib/validations/website.ts` (new)                         | utility/validation    | request-response | `src/lib/validations/server.ts`          | exact         |
| `src/components/preview/types.ts`                              | utility/types         | transform        | self (rename only)                       | self          |
| `src/types/sections.ts`                                        | utility/types         | transform        | self (import update)                     | self          |
| `src/app/(dashboard)/dashboard/actions.ts`                     | service/server-action | CRUD             | self (rename calls)                      | self          |
| `src/app/api/servers/route.ts`                                 | controller            | request-response | self (rename calls)                      | self          |
| `src/app/api/servers/[serverId]/route.ts`                      | controller            | CRUD             | self (rename calls)                      | self          |
| `src/app/[subdomain]/layout.tsx`                               | component/layout      | request-response | self (rename call)                       | self          |
| `src/app/[subdomain]/page.tsx`                                 | component/page        | request-response | self (rename call)                       | self          |
| `src/app/[subdomain]/preview-client.tsx`                       | component             | request-response | self (import update)                     | self          |
| `src/app/(dashboard)/dashboard/page.tsx`                       | component             | request-response | self (local interface rename)            | self          |
| `src/app/(dashboard)/dashboard/servers/page.tsx`               | component             | request-response | `src/app/(dashboard)/dashboard/page.tsx` | exact         |
| `src/app/(dashboard)/dashboard/create-server-dialog.tsx`       | component             | request-response | self (import update)                     | self          |
| `src/app/(dashboard)/dashboard/[serverId]/page.tsx`            | component             | CRUD             | self (import + type renames)             | self          |
| `src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx` | component             | request-response | self (import update)                     | self          |
| `src/components/sections/hero-section.tsx`                     | component             | transform        | no change needed                         | n/a           |
| `src/components/site/nav.tsx`                                  | component             | transform        | no change needed                         | n/a           |

---

## Pattern Assignments

### `prisma/schema.prisma` (config/schema)

**Analog:** Current `prisma/schema.prisma` — replace `Server` with `Website` + `MinecraftServer`, rename foreign key in `Section`.

**Current Server model pattern to replace** (lines 60–79):

```prisma
model Server {
  id          String    @id @default(cuid())
  name        String
  subdomain   String    @unique
  description String?
  serverIp    String?
  serverPort  Int?      @default(25565)
  logo        String?
  banner      String?
  navbar      Json?     @default("{}")  // Navbar settings
  theme       Json?     @default("{}")  // Global theme settings
  published   Boolean   @default(false)
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sections    Section[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId])
}
```

**New Website model** (replace the entire `Server` block with):

```prisma
model Website {
  id          String            @id @default(cuid())
  name        String
  subdomain   String            @unique
  description String?
  logo        String?
  banner      String?
  navbar      Json?             @default("{}")
  theme       Json?             @default("{}")
  published   Boolean           @default(false)
  userId      String
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  sections    Section[]
  servers     MinecraftServer[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([userId])
}

model MinecraftServer {
  id          String   @id @default(cuid())
  name        String
  ip          String
  port        Int      @default(25565)
  description String?
  websiteId   String
  website     Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Current Section model to update** (lines 81–95):

```prisma
model Section {
  ...
  serverId  String
  server    Server   @relation(fields: [serverId], references: [id], onDelete: Cascade)
  ...
  @@index([serverId])
}
```

**New Section model** (rename foreign key only):

```prisma
model Section {
  id        String   @id @default(cuid())
  type      String
  title     String?
  subtitle  String?
  settings  Json     @default("{}")
  order     Int      @default(0)
  visible   Boolean  @default(true)
  websiteId String
  website   Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([websiteId])
}
```

**User model update** (line 21):

```prisma
// Before:
servers   Server[]
// After:
websites  Website[]
```

---

### `src/lib/validations/website.ts` (new file — utility/validation)

**Analog:** `src/lib/validations/server.ts` (lines 1–21) — copy structure exactly, remove `serverIp`/`serverPort` fields (those move to MinecraftServer, out of scope for Phase 6 creation schema).

**Full current analog** (`src/lib/validations/server.ts` lines 1–21):

```typescript
import { z } from 'zod';

export const createServerSchema = z.object({
	name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
	subdomain: z
		.string()
		.min(3, 'Subdomain must be at least 3 characters')
		.max(30, 'Subdomain must be less than 30 characters')
		.regex(
			/^[a-z0-9-]+$/,
			'Subdomain can only contain lowercase letters, numbers, and hyphens',
		),
	description: z.string().max(500, 'Description must be less than 500 characters').optional(),
	serverIp: z.string().max(100, 'Server IP must be less than 100 characters').optional(),
	serverPort: z.number().int().min(1).max(65535).optional(),
});

export const updateServerSchema = createServerSchema.partial();

export type CreateServerInput = z.infer<typeof createServerSchema>;
export type UpdateServerInput = z.infer<typeof updateServerSchema>;
```

**New file to write** (`src/lib/validations/website.ts`):

```typescript
import { z } from 'zod';

export const createWebsiteSchema = z.object({
	name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
	subdomain: z
		.string()
		.min(3, 'Subdomain must be at least 3 characters')
		.max(30, 'Subdomain must be less than 30 characters')
		.regex(
			/^[a-z0-9-]+$/,
			'Subdomain can only contain lowercase letters, numbers, and hyphens',
		),
	description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export const updateWebsiteSchema = createWebsiteSchema.partial();

export type CreateWebsiteInput = z.infer<typeof createWebsiteSchema>;
export type UpdateWebsiteInput = z.infer<typeof updateWebsiteSchema>;
```

---

### `src/components/preview/types.ts` (utility/types — high fan-out)

**Analog:** self — rename the `ServerData` interface, keep `serverIp: string | null` in it for Phase 6 compile-only (A1 assumption).

**Current interface** (lines 3–10):

```typescript
export interface ServerData {
	name: string;
	subdomain: string;
	serverIp: string | null;
	players?: number;
	maxPlayers?: number;
	version?: string;
}
```

**Rename to** (only the interface name changes; field `serverIp` is KEPT for Phase 6 compile):

```typescript
export interface WebsiteData {
	name: string;
	subdomain: string;
	serverIp: string | null; // kept for Phase 6 compile-only; Phase 7 will remove
	players?: number;
	maxPlayers?: number;
	version?: string;
}
```

**Critical:** All other content in the file (lines 12–65: `Section`, `StatsServer`, `FeatureItem`, `GalleryImage`, utility functions) is unchanged.

---

### `src/types/sections.ts` (utility/types)

**Analog:** self — update import and two usages of `ServerData`.

**Current import and usage** (lines 4, 199–203):

```typescript
// line 4
import type { Section, ServerData } from '@/components/preview/types';

// lines 199-202
export interface SectionRenderProps {
	section: Section;
	serverData: ServerData;
}
```

**After rename**:

```typescript
// line 4
import type { Section, WebsiteData } from '@/components/preview/types';

// lines 199-202
export interface SectionRenderProps {
	section: Section;
	serverData: WebsiteData;
}
```

---

### `src/app/(dashboard)/dashboard/actions.ts` (service/server-action — 9 Prisma call sites)

**Analog:** self — rename import, rename all `db.server.*` → `db.website.*`, remove `serverIp`/`serverPort` from create/update data objects.

**Current import** (line 7):

```typescript
import { createServerSchema, updateServerSchema } from '@/lib/validations/server';
```

**After**:

```typescript
import { createWebsiteSchema, updateWebsiteSchema } from '@/lib/validations/website';
```

**Current create pattern** (lines 24–48) — key changes:

```typescript
// Before:
const validated = createServerSchema.parse(rawData);
const existing = await db.server.findUnique({ where: { subdomain: validated.subdomain } });
const server = await db.server.create({ data: { ...validated, userId: session.user.id, sections: { create: { ... } } } });

// After:
const validated = createWebsiteSchema.parse(rawData);
const existing = await db.website.findUnique({ where: { subdomain: validated.subdomain } });
const server = await db.website.create({ data: { ...validated, userId: session.user.id, sections: { create: { ... } } } });
```

**Note:** The `rawData` object in `createServer` (lines 16–21) includes `serverIp` and `serverPort` from `formData`. After rename, these fields are not part of `createWebsiteSchema` and will be stripped by Zod's `.parse()`. Remove them from `rawData` to avoid a TypeScript error on the raw object (or leave them — Zod strips unknown keys by default with `.parse()`). Simplest: remove `serverIp` and `serverPort` lines from `rawData`.

**Current update pattern** (lines 68–94) — same substitution:

```typescript
// Before:
const validated = updateServerSchema.parse(rawData);
await db.server.findFirst({ where: { id: serverId, userId: session.user.id } });
await db.server.findUnique({ where: { subdomain: validated.subdomain } });
await db.server.update({ where: { id: serverId }, data: validated });

// After:
const validated = updateWebsiteSchema.parse(rawData);
await db.website.findFirst({ where: { id: serverId, userId: session.user.id } });
await db.website.findUnique({ where: { subdomain: validated.subdomain } });
await db.website.update({ where: { id: serverId }, data: validated });
```

**Delete and togglePublished patterns** (lines 97–140) — same: `db.server.*` → `db.website.*`.

---

### `src/app/api/servers/route.ts` (controller — 1 Prisma call site)

**Analog:** self — rename `db.server.findMany` → `db.website.findMany`, remove `serverIp: true` from `select`.

**Current** (lines 13–26):

```typescript
const servers = await db.server.findMany({
	where: { userId: session.user.id },
	orderBy: { updatedAt: 'desc' },
	select: {
		id: true,
		name: true,
		subdomain: true,
		description: true,
		serverIp: true, // <-- REMOVE: field does not exist on Website
		published: true,
		createdAt: true,
		updatedAt: true,
	},
});
```

**After**:

```typescript
const websites = await db.website.findMany({
	where: { userId: session.user.id },
	orderBy: { updatedAt: 'desc' },
	select: {
		id: true,
		name: true,
		subdomain: true,
		description: true,
		published: true,
		createdAt: true,
		updatedAt: true,
	},
});
return NextResponse.json(websites);
```

---

### `src/app/api/servers/[serverId]/route.ts` (controller — 4 Prisma call sites + transaction)

**Analog:** self — rename all `db.server.*` → `db.website.*`, `tx.server.*` → `tx.website.*`, rename `serverId` field in section createMany/deleteMany.

**GET handler change** (line 19):

```typescript
// Before:
const server = await db.server.findUnique({
	where: { id: serverId },
	include: { sections: { orderBy: { order: 'asc' } } },
});
// After:
const website = await db.website.findUnique({
	where: { id: serverId },
	include: { sections: { orderBy: { order: 'asc' } } },
});
```

**PUT handler — body destructure** (line 58):

```typescript
// Before:
const {
	name,
	subdomain,
	description,
	serverIp,
	serverPort,
	logo,
	banner,
	navbar,
	theme,
	sections,
} = body;
// After (remove serverIp, serverPort):
const { name, subdomain, description, logo, banner, navbar, theme, sections } = body;
```

**PUT handler — ownership check** (line 61):

```typescript
// Before:
const existingServer = await db.server.findUnique({
	where: { id: serverId },
	select: { userId: true },
});
// After:
const existingWebsite = await db.website.findUnique({
	where: { id: serverId },
	select: { userId: true },
});
```

**PUT handler — transaction** (lines 75–119):

```typescript
// Before:
const updatedServer = await db.$transaction(async (tx) => {
  const server = await tx.server.update({
    where: { id: serverId },
    data: { name, subdomain, description, serverIp, serverPort, logo, banner, navbar, theme },
  });
  await tx.section.deleteMany({ where: { serverId } });
  await tx.section.createMany({
    data: sections.map((section, index) => ({
      ...
      serverId,            // <-- rename
    })),
  });
  return server;
});

// After:
const updatedWebsite = await db.$transaction(async (tx) => {
  const website = await tx.website.update({
    where: { id: serverId },
    data: { name, subdomain, description, logo, banner, navbar, theme },  // serverIp/serverPort removed
  });
  await tx.section.deleteMany({ where: { websiteId: serverId } });
  await tx.section.createMany({
    data: sections.map((section, index) => ({
      ...
      websiteId: serverId, // was: serverId
    })),
  });
  return website;
});
```

---

### `src/app/[subdomain]/layout.tsx` (component/layout — 1 Prisma call site)

**Analog:** self — rename `db.server.findUnique` → `db.website.findUnique`, remove `serverIp` from select, pass `serverIp: ""` hardcoded.

**Current `getServerData` cache function** (lines 50–55):

```typescript
const getServerData = cache((subdomain: string) =>
	db.server.findUnique({
		where: { subdomain },
		select: { theme: true, name: true, serverIp: true },
	}),
);
```

**After**:

```typescript
const getServerData = cache((subdomain: string) =>
	db.website.findUnique({
		where: { subdomain },
		select: { theme: true, name: true }, // serverIp removed — not on Website model
	}),
);
```

**Current usage** (lines 77–78):

```typescript
const serverName = server?.name ?? subdomain;
const serverIp = server?.serverIp ?? '';
```

**After** (line 78 — `serverIp` no longer on the fetched object):

```typescript
const serverName = server?.name ?? subdomain;
const serverIp = ''; // Phase 6 placeholder; Phase 7 adds MinecraftServer lookup
```

---

### `src/app/[subdomain]/page.tsx` (component/page — 1 Prisma call site)

**Analog:** self — rename `db.server.findUnique` → `db.website.findUnique`, update `serverData` construction.

**Current query** (lines 15–23):

```typescript
const server = await db.server.findUnique({
	where: { subdomain },
	include: {
		sections: { where: { visible: true }, orderBy: { order: 'asc' } },
	},
});
```

**After**:

```typescript
const server = await db.website.findUnique({
	where: { subdomain },
	include: {
		sections: { where: { visible: true }, orderBy: { order: 'asc' } },
	},
});
```

**Current serverData construction** (lines 31–35):

```typescript
const serverData = {
	name: server.name,
	subdomain: server.subdomain,
	serverIp: server.serverIp, // <-- field gone from Website
};
```

**After**:

```typescript
const serverData = {
	name: server.name,
	subdomain: server.subdomain,
	serverIp: null as string | null, // Phase 6 placeholder; Phase 7 adds MinecraftServer lookup
};
```

---

### `src/app/[subdomain]/preview-client.tsx` (component — import update)

**Analog:** self — update import from `ServerData` → `WebsiteData`, update interface reference.

**Current import** (lines 22–29):

```typescript
import {
  type Section,
  type ServerData,
  ...
} from "@/components/preview/types";
```

**After**: replace `type ServerData` with `type WebsiteData`.

**Current props interface** (lines 732–735):

```typescript
interface PreviewClientProps {
	server: ServerData;
	sections: Section[];
	isPreviewMode: boolean;
}
```

**After**: `server: WebsiteData`.

---

### `src/app/(dashboard)/dashboard/page.tsx` (component — local interface rename)

**Analog:** self — rename local `ServerData` interface, remove `serverIp` field, update state type.

**Current local interface** (lines 18–27):

```typescript
interface ServerData {
	id: string;
	name: string;
	subdomain: string;
	description: string | null;
	serverIp: string | null; // <-- remove: field gone from API response
	published: boolean;
	createdAt: string;
	updatedAt: string;
}
```

**After**:

```typescript
interface WebsiteData {
	id: string;
	name: string;
	subdomain: string;
	description: string | null;
	published: boolean;
	createdAt: string;
	updatedAt: string;
}
```

**State declaration** (line 30): `useState<ServerData[]>` → `useState<WebsiteData[]>`.

**Also rename variable** (line 56): `servers.filter(s => s.published)` — variable name `servers` is fine to keep (local var, not model name).

---

### `src/app/(dashboard)/dashboard/servers/page.tsx` (component — local interface rename)

**Analog:** `src/app/(dashboard)/dashboard/page.tsx` — identical treatment (same local `ServerData` interface pattern, same `serverIp` field to remove).

**Current local interface** (lines 19–28):

```typescript
interface ServerData {
	id: string;
	name: string;
	subdomain: string;
	description: string | null;
	serverIp: string | null; // <-- remove
	published: boolean;
	createdAt: string;
	updatedAt: string;
}
```

**After**: rename to `WebsiteData`, remove `serverIp` line. Update `useState<ServerData[]>` → `useState<WebsiteData[]>`.

---

### `src/app/(dashboard)/dashboard/create-server-dialog.tsx` (component — import update)

**Analog:** self — update import from `server` validation to `website` validation.

**Current import** (line 16):

```typescript
import { createServerSchema, type CreateServerInput } from '@/lib/validations/server';
```

**After**:

```typescript
import { createWebsiteSchema, type CreateWebsiteInput } from '@/lib/validations/website';
```

**Current form hook** (line 40):

```typescript
useForm<CreateServerInput>({ resolver: zodResolver(createServerSchema), ... })
```

**After**:

```typescript
useForm<CreateWebsiteInput>({ resolver: zodResolver(createWebsiteSchema), ... })
```

**Note:** Any form fields for `serverIp`/`serverPort` in this dialog's JSX must be removed or they will cause a TypeScript error (schema no longer has those fields).

---

### `src/app/(dashboard)/dashboard/[serverId]/page.tsx` (component — import + type renames, 5+ reference sites)

**Analog:** self — update import, rename local `ServerDataState`, update `serverData.serverIp` references.

**Current import** (line 59):

```typescript
import type { ServerData } from '@/components/preview/types';
```

**After**:

```typescript
import type { WebsiteData } from '@/components/preview/types';
```

**Current local type** (lines 2375–2382):

```typescript
type ServerDataState = {
  name: string;
  subdomain: string;
  ...
  serverIp: string;
  ...
};
```

**After**: Keep `serverIp: string` in `ServerDataState` — this is a local runtime type, not a Prisma type. The field is populated from `data.serverIp` in the fetch response. For Phase 6, the API response will no longer include `serverIp` (it's removed from `Website`). Update fetch result population (line 2423): `serverIp: data.serverIp || ""` stays syntactically valid but `data.serverIp` will be `undefined` at runtime. This compiles cleanly because `data` is typed as `any` from `response.json()`. No TypeScript error.

**Current `SectionPreview` prop** (line 2304):

```typescript
function SectionPreview({ section, serverData }: { section: Section; serverData: ServerData }) {
```

**After**: `serverData: WebsiteData`.

**Paste-to-preview call** (line 3057):

```typescript
serverData={{ name: serverData.name, subdomain: serverData.subdomain, serverIp: serverData.serverIp, ... }}
```

This constructs a `WebsiteData` object inline — `serverIp` stays valid because `WebsiteData` still has `serverIp: string | null` in Phase 6.

---

### `src/app/(dashboard)/dashboard/[serverId]/server-settings.tsx` (component — import update)

**Analog:** self — update import, leave local `interface Server` untouched (D-06/A3).

**Current import** (line 6):

```typescript
import { updateServerSchema, type UpdateServerInput } from '@/lib/validations/server';
```

**After**:

```typescript
import { updateWebsiteSchema, type UpdateWebsiteInput } from '@/lib/validations/website';
```

**Update form hook** (same line pattern as create-server-dialog): replace schema and input type references.

**Local interface** (lines 10–17):

```typescript
interface Server {
	id: string;
	name: string;
	subdomain: string;
	description: string | null;
	serverIp: string | null;
	serverPort: number | null;
}
```

Per D-06/A3: leave this local interface as-is. It is not typed against Prisma directly; it describes runtime prop data. TypeScript will not flag it for Phase 6.

---

### Files with NO changes needed

| File                                                          | Reason                                                                                                   |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/components/sections/hero-section.tsx`                    | `serverIp?: string \| null` is a standalone component prop — no Prisma or validation dependency          |
| `src/components/site/nav.tsx`                                 | `serverIp: string` is a standalone component prop — no Prisma or validation dependency                   |
| `src/app/(dashboard)/dashboard/[serverId]/server-actions.tsx` | Only calls `togglePublished(serverId)` and `deleteServer(serverId)` with string args — no type reference |

---

## Shared Patterns

### Pattern: Prisma `db.server.*` → `db.website.*` rename

**Source:** `src/app/(dashboard)/dashboard/actions.ts` (all call sites)
**Apply to:** Every file in Group 3 (5 files, 14 call sites)

The substitution is mechanical:

```typescript
// Before:
db.server.findUnique(...)
db.server.findFirst(...)
db.server.findMany(...)
db.server.create(...)
db.server.update(...)
db.server.delete(...)
tx.server.update(...)
// After: replace 'server' with 'website' at every occurrence
db.website.findUnique(...)
db.website.findFirst(...)
db.website.findMany(...)
db.website.create(...)
db.website.update(...)
db.website.delete(...)
tx.website.update(...)
```

### Pattern: `serverIp`/`serverPort` field removal from Prisma operations

**Source:** `src/app/api/servers/route.ts` (line 21) and `src/app/api/servers/[serverId]/route.ts` (lines 58, 80–89)
**Apply to:** Every `select`, `data`, or destructure that referenced `serverIp` or `serverPort`

```typescript
// Remove from select clauses:
serverIp: true,    // DELETE this line
serverPort: true,  // DELETE this line

// Remove from data objects:
serverIp,          // DELETE this line
serverPort,        // DELETE this line

// Remove from body destructure:
const { ..., serverIp, serverPort, ... } = body;  // remove serverIp and serverPort
```

### Pattern: `Section.serverId` → `Section.websiteId` in Prisma operations

**Source:** `src/app/api/servers/[serverId]/route.ts` (lines 94–115)
**Apply to:** Any `tx.section.deleteMany` or `tx.section.createMany` that uses `serverId` as a Prisma field

```typescript
// Before:
await tx.section.deleteMany({ where: { serverId } });
await tx.section.createMany({ data: sections.map(s => ({ ..., serverId })) });

// After:
await tx.section.deleteMany({ where: { websiteId: serverId } });
await tx.section.createMany({ data: sections.map(s => ({ ..., websiteId: serverId })) });
```

### Pattern: Validation import rename (server → website)

**Source:** `src/lib/validations/server.ts` → `src/lib/validations/website.ts`
**Apply to:** `create-server-dialog.tsx`, `actions.ts`, `server-settings.tsx`

```typescript
// Before:
import {
	createServerSchema,
	updateServerSchema,
	type CreateServerInput,
	type UpdateServerInput,
} from '@/lib/validations/server';
// After:
import {
	createWebsiteSchema,
	updateWebsiteSchema,
	type CreateWebsiteInput,
	type UpdateWebsiteInput,
} from '@/lib/validations/website';
```

### Pattern: `ServerData` → `WebsiteData` type import rename

**Source:** `src/components/preview/types.ts` (interface rename)
**Apply to:** `src/types/sections.ts`, `src/app/[subdomain]/preview-client.tsx`, `src/app/(dashboard)/dashboard/[serverId]/page.tsx`

```typescript
// Before:
import type { ServerData } from '@/components/preview/types';
// or:
import { type ServerData, ... } from "@/components/preview/types";

// After:
import type { WebsiteData } from '@/components/preview/types';
// or:
import { type WebsiteData, ... } from "@/components/preview/types";
```

### Pattern: `onDelete: Cascade` on all child relations

**Source:** Current `prisma/schema.prisma` (lines 39, 73, 90)
**Apply to:** All new relations in schema (`Website → Section`, `Website → MinecraftServer`)

```prisma
// Existing pattern (Account → User, lines 39):
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

// Apply same pattern to new relations:
user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)  // Website
website Website @relation(fields: [websiteId], references: [id], onDelete: Cascade) // MinecraftServer
website Website @relation(fields: [websiteId], references: [id], onDelete: Cascade) // Section
```

### Pattern: Auth guard in server actions

**Source:** `src/app/(dashboard)/dashboard/actions.ts` (lines 10–13)
**Apply to:** All server action functions — pattern is already present, do not remove during rename

```typescript
const session = await auth();
if (!session?.user?.id) {
	throw new Error('Unauthorized');
}
```

### Pattern: Auth guard in API route handlers

**Source:** `src/app/api/servers/route.ts` (lines 8–10) and `src/app/api/servers/[serverId]/route.ts` (lines 8–11)
**Apply to:** Both GET and PUT handlers — pattern is already present, do not remove during rename

```typescript
const session = await auth();
if (!session?.user?.id) {
	return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## Migration Execution Pattern

The migration must be run in this exact order to avoid mid-task compile errors:

```bash
# Step 1: Update schema (do this FIRST — everything else derives from it)
# Edit prisma/schema.prisma

# Step 2: Run migration (creates SQL + applies to DB)
npx prisma migrate dev --name schema-reset

# Step 3: Regenerate client (db.website.* becomes available)
npx prisma generate

# Step 4: Update types.ts (fixes fan-out cascade before touching callers)
# Edit src/components/preview/types.ts
# Edit src/types/sections.ts

# Step 5: Create new validation file
# Create src/lib/validations/website.ts

# Step 6: Update all Prisma call sites (5 files)
# Edit actions.ts, api/servers/route.ts, api/servers/[serverId]/route.ts,
#      [subdomain]/layout.tsx, [subdomain]/page.tsx

# Step 7: Update remaining TypeScript type references (remaining files)
# Edit preview-client.tsx, dashboard/page.tsx, dashboard/servers/page.tsx,
#      create-server-dialog.tsx, [serverId]/page.tsx, [serverId]/server-settings.tsx

# Step 8: Verify
npx tsc --noEmit
```

---

## No Analog Found

All 17 files have clear analogs (the source files themselves or near-exact peer files). No file requires pattern invention from scratch — `src/lib/validations/website.ts` is the only new file, and it is a direct copy-and-modify of `src/lib/validations/server.ts`.

---

## Metadata

**Analog search scope:** `src/` tree + `prisma/`
**Files read:** 13 source files read directly; 2 files grepped for specific references
**Pattern extraction date:** 2026-05-08
