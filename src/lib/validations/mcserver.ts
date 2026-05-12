import { z } from "zod";

export const createMcserverSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  ip: z
    .string()
    .min(1, "IP is required")
    .max(253, "IP must be less than 253 characters"),
  port: z
    .number()
    .int("Port must be an integer")
    .min(1, "Port must be at least 1")
    .max(65535, "Port must be at most 65535")
    .optional(),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
});

export const updateMcserverSchema = createMcserverSchema.partial();

export type CreateMcserverInput = z.infer<typeof createMcserverSchema>;
export type UpdateMcserverInput = z.infer<typeof updateMcserverSchema>;
