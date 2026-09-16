import { z } from "zod"

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title zaroori hai")
    .max(500, "Title 500 characters se zyada nahi ho sakta")
    .trim(),
  description: z
    .string()
    .max(5000, "Description bahut lamba hai")
    .trim()
    .optional(),
  status: z
    .enum(["todo", "in-progress", "in-review", "done"])
    .default("todo"),
  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .default("medium"),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const updateTaskSchema = createTaskSchema.partial()
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>