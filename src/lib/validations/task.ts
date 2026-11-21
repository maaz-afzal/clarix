import { z } from "zod";

const objectIdString = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(500, "Title cannot exceed 500 characters")
    .trim(),
  description: z
    .string()
    .max(5000, "Description is too long")
    .trim()
    .optional(),
  status: z.enum(["todo", "in-progress", "in-review", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assigneeId: objectIdString.or(z.literal("")).optional(),
  dueDate: z.string().optional(),
});

export type CreateTaskInput = z.input<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment cannot be longer than 2000 characters")
    .trim(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
