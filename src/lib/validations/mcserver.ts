import { z } from 'zod';

export const createMcserverSchema = z.object({
	name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
	// WR-08: validate the IP/hostname structurally so user input cannot smuggle
	// HTML/script content that would later land in a public-page "Copy IP" UI.
	// The regex accepts:
	//   - DNS hostnames: lowercase/uppercase letters, digits, dots, hyphens
	//   - IPv4 literals (subset of hostname grammar above)
	//   - IPv6 literals in bracketed form `[::1]:25565`
	//   - Optional `:port` suffix (1-5 digits, validator stricter than regex)
	// It rejects spaces, angle brackets, quotes, schemes (http:, javascript:),
	// and anything else that would render unsafely.
	ip: z
		.string()
		.min(1, 'IP is required')
		.max(253, 'IP must be less than 253 characters')
		.regex(
			/^(?:\[[0-9a-fA-F:]+\]|[a-zA-Z0-9][a-zA-Z0-9.-]*)(?::[0-9]{1,5})?$/,
			'IP must be a valid hostname or IP address (optionally with :port)',
		),
	port: z
		.number()
		.int('Port must be an integer')
		.min(1, 'Port must be at least 1')
		.max(65535, 'Port must be at most 65535')
		.optional(),
	description: z.string().max(200, 'Description must be less than 200 characters').optional(),
});

export const updateMcserverSchema = createMcserverSchema.partial();

export type CreateMcserverInput = z.infer<typeof createMcserverSchema>;
export type UpdateMcserverInput = z.infer<typeof updateMcserverSchema>;
