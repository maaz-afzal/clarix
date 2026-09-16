import { z } from "zod"

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(150, "Name cannot exceed 150 characters")
    .trim(),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .trim()
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Valid hex color is required")
    .default("#6366f1"),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const updateProjectSchema = createProjectSchema
  .omit({ color: true })
  .extend({
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Valid hex color is required")
      .optional(),
    status: z.enum(["active", "archived"]).optional(),
  })
  .partial()

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>