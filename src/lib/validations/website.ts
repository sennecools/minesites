import { z } from "zod";

export const createWebsiteSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(30, "Subdomain must be less than 30 characters")
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
  // BL-06: `.nullable()` lets clients send `null` to explicitly clear the field.
  // Without this, an omitted/undefined value tells Prisma "do not change" and the
  // user cannot clear an existing description from the UI (silent data-loss-of-intent).
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
});

export const updateWebsiteSchema = createWebsiteSchema.partial();

export type CreateWebsiteInput = z.infer<typeof createWebsiteSchema>;
export type UpdateWebsiteInput = z.infer<typeof updateWebsiteSchema>;
