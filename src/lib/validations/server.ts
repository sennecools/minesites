import { z } from "zod";

export const createServerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(30, "Subdomain must be less than 30 characters")
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  serverIp: z.string().max(100, "Server IP must be less than 100 characters").optional(),
  serverPort: z.number().int().min(1).max(65535).optional(),
});

export const updateServerSchema = createServerSchema.partial();

export type CreateServerInput = z.infer<typeof createServerSchema>;
export type UpdateServerInput = z.infer<typeof updateServerSchema>;
