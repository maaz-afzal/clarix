import { z } from "zod";

export const generatePrioritySuggestionSchema = z.object({
  title: z.string().min(3).max(500),
  description: z.string().max(2000).optional(),
});

export const generateTaskDescriptionSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(500, "Title is too long"),
  projectName: z.string().optional(),
  context: z.string().max(500, "Context is too long").optional(),
});

export type GenerateTaskDescriptionInput = z.infer<
  typeof generateTaskDescriptionSchema
>;

export const streamDescriptionRequestSchema = generateTaskDescriptionSchema.extend({
  workspaceSlug: z.string().min(1),
});

export type StreamDescriptionRequest = z.infer<
  typeof streamDescriptionRequestSchema
>;

export const generateTaskBreakdownSchema = z.object({
  title: z.string().min(3).max(500),
  description: z.string().max(2000).optional(),
  projectName: z.string().optional(),
});

export type GenerateTaskBreakdownInput = z.infer<
  typeof generateTaskBreakdownSchema
>;
