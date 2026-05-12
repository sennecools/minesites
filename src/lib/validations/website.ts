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
	// BL-06: `.nullable()` lets clients send `null` to explicitly clear the field.
	// Without this, an omitted/undefined value tells Prisma "do not change" and the
	// user cannot clear an existing description from the UI (silent data-loss-of-intent).
	description: z
		.string()
		.max(500, 'Description must be less than 500 characters')
		.optional()
		.nullable(),
});

export const updateWebsiteSchema = createWebsiteSchema.partial();

export type CreateWebsiteInput = z.infer<typeof createWebsiteSchema>;
export type UpdateWebsiteInput = z.infer<typeof updateWebsiteSchema>;

// ---------- BL-03: URL field validation for logo/banner ----------
// Reject non-http(s) schemes (notably javascript:, data:) to prevent stored XSS
// when these strings are later rendered as <img src=...>. Allow `null` so a user
// can explicitly clear a previously-uploaded asset.
const httpUrlSchema = z
	.string()
	.max(2048, 'URL must be at most 2048 characters')
	.url('Must be a valid URL')
	.refine(
		(value) => {
			try {
				const parsed = new URL(value);
				return parsed.protocol === 'http:' || parsed.protocol === 'https:';
			} catch {
				return false;
			}
		},
		{ message: 'URL must use http or https' },
	);

// ---------- BL-03: NavbarSettings shape (mirrors editor page.tsx `NavbarSettings`) ----------
// Strict mode rejects unknown keys so a client cannot pad the JSON column with
// arbitrary data. Length caps on string fields prevent payload bloat.
export const navbarSchema = z
	.object({
		links: z
			.array(
				z
					.object({
						label: z.string().min(1).max(60),
						// Permit relative paths (e.g. "/store") and absolute http(s) URLs.
						href: z.string().min(1).max(2048),
					})
					.strict(),
			)
			.max(20, 'Too many navbar links'),
		showLogo: z.boolean(),
		style: z.enum(['default', 'centered', 'minimal']),
	})
	.strict();

// ---------- BL-03: SiteTheme schema (mirrors src/types/site-theme.ts) ----------
// Enum lists must stay in lockstep with the runtime keys of THEME_PRESETS and
// FONT_FAMILY_MAP in src/lib/theme-presets.ts. Adding a palette/font requires
// updating both files.
export const themeSchema = z
	.object({
		palette: z.enum(['cyan', 'emerald', 'violet', 'orange', 'red', 'gold', 'pink', 'white']),
		font: z.enum(['rajdhani', 'orbitron', 'cinzel', 'exo2', 'bebas']),
	})
	.strict();

// ---------- BL-04 + WR-05: Section schema ----------
// SECTION_TYPES mirrors the SectionType union in src/types/sections.ts.
// Duplicating the literal list here (instead of importing the type union) lets
// us reference `section-registry.tsx` indirectly without pulling a "use client"
// module into a server route. If the union changes, this list must change too.
export const SECTION_TYPES = [
	'hero',
	'stats',
	'features',
	'gamemodes',
	'discord',
	'gallery',
	'staff',
	'text',
	'rules',
	'voting',
	'store',
	'reviews',
	'faq',
	'video',
] as const;

const sectionSchema = z
	.object({
		// WR-05: client-supplied IDs must look like a UUID/cuid. Anything that
		// doesn't match is rejected before it lands in createMany (where a P2002
		// would surface as a confusing 409). UUID v4 covers the editor's
		// `crypto.randomUUID()` call. cuid/cuid2 are also accepted for parity with
		// Prisma's default ID generator on the seed path.
		id: z
			.string()
			.min(8)
			.max(60)
			.regex(/^[a-zA-Z0-9_-]+$/, 'Section id must be alphanumeric (UUID or cuid format)'),
		type: z.enum(SECTION_TYPES, {
			message: 'Unknown section type',
		}),
		title: z.string().max(200).optional().nullable(),
		subtitle: z.string().max(500).optional().nullable(),
		// `settings` is opaque JSON — schema is per-type and lives in
		// src/types/sections.ts. We enforce only the outer envelope here:
		// - object only (not array, not primitive)
		// - max 200 top-level keys (sanity cap, well above any registered type)
		// Per-key XSS scrubbing happens at render time in the Hero/Section renderers.
		settings: z
			.record(z.string(), z.unknown())
			.refine((s) => Object.keys(s).length <= 200, 'Too many keys in section.settings')
			.optional(),
		visible: z.boolean().optional(),
		// `order` is overwritten server-side from array index — accept any number
		// but don't trust it.
		order: z.number().int().optional(),
	})
	.strict();

export const sectionsArraySchema = z
	.array(sectionSchema)
	.max(50, 'Too many sections')
	.refine(
		(arr) => new Set(arr.map((s) => s.id)).size === arr.length,
		'Duplicate section IDs in payload',
	);

// ---------- BL-03 + BL-04: Full PUT body schema ----------
// `updateWebsiteSchema` covers name/subdomain/description. This extension adds
// the four JSON/URL fields and the sections array, all validated together so a
// single safeParse rejects bad input before the transaction starts.
export const updateWebsiteFullSchema = updateWebsiteSchema.extend({
	logo: httpUrlSchema.optional().nullable(),
	banner: httpUrlSchema.optional().nullable(),
	navbar: navbarSchema.optional(),
	theme: themeSchema.optional(),
	sections: sectionsArraySchema.optional(),
});

export type UpdateWebsiteFullInput = z.infer<typeof updateWebsiteFullSchema>;
export type SectionInput = z.infer<typeof sectionSchema>;
