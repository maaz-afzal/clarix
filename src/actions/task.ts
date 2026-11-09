"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import Activity from "@/models/Activity";
import {
  verifyPermission,
  verifyTaskAccess,
  verifyWorkspaceMember,
} from "@/lib/authorization";
import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/lib/validations/task";
import mongoose from "mongoose";
import { createNotification } from "@/lib/notifications";
import { auth } from "@/lib/auth";
import { safeAction } from "@/lib/errors";

interface TaskActionResult {
  success: boolean;
  error?: string;
  taskId?: string;
}

async function logActivity(
  workspaceId: string,
  projectId: string,
  taskId: string,
  userId: string,
  action: string,
  metadata: Record<string, unknown> = {},
) {
  try {
    await Activity.create({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      projectId: new mongoose.Types.ObjectId(projectId),
      taskId: new mongoose.Types.ObjectId(taskId),
      userId: new mongoose.Types.ObjectId(userId),
      action,
      metadata,
    });
  } catch {}
}

export async function createTask(
  workspaceSlug: string,
  projectId: string,
  data: CreateTaskInput,
): Promise<TaskActionResult> {
  const { userId, membership } = await verifyPermission(
    workspaceSlug,
    "task_create",
  );

  const result = createTaskSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  try {
    await connectDB();

    const lastTask = await Task.findOne({
      projectId: new mongoose.Types.ObjectId(projectId),
      status: result.data.status,
    })
      .sort({ position: -1 })
      .lean();

    const position = lastTask ? lastTask.position + 1000 : 1000;

    const task = await Task.create({
      projectId: new mongoose.Types.ObjectId(projectId),
      workspaceId: new mongoose.Types.ObjectId(membership.workspaceId),
      title: result.data.title,
      description: result.data.description,
      status: result.data.status,
      priority: result.data.priority,
      assigneeId: result.data.assigneeId
        ? new mongoose.Types.ObjectId(result.data.assigneeId)
        : undefined,
      dueDate: result.data.dueDate ? new Date(result.data.dueDate) : undefined,
      createdBy: new mongoose.Types.ObjectId(userId),
      position,
      completedAt: result.data.status === "done" ? new Date() : undefined,
    });

    await logActivity(
      membership.workspaceId,
      projectId,
      task._id.toString(),
      userId,
      "task_created",
      { taskTitle: task.title },
    );

    revalidatePath(`/${workspaceSlug}/projects/${projectId}`);
    revalidatePath(`/${workspaceSlug}/dashboard`);

    return { success: true, taskId: task._id.toString() };
  } catch (error) {
    console.error("Task create error:", error);
    return { success: false, error: "Task create cannot be completed" };
  }
}

export async function updateTask(
  workspaceSlug: string,
  taskId: string,
  data: UpdateTaskInput,
): Promise<TaskActionResult> {
  const task = await verifyTaskAccess(taskId, workspaceSlug, "update");

  const result = updateTaskSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }
  const session = await auth();
  const userId = session!.user!.id!;
  
  try {
    await connectDB();

    const updateData: Record<string, unknown> = {};

    if (result.data.title !== undefined) updateData.title = result.data.title;
    if (result.data.description !== undefined)
      updateData.description = result.data.description;
    if (result.data.status !== undefined) {
      updateData.status = result.data.status;
      if (result.data.status === "done") {
        if (task.status !== "done") updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }
    if (result.data.priority !== undefined)
      updateData.priority = result.data.priority;
    if (result.data.dueDate !== undefined)
      updateData.dueDate = result.data.dueDate
        ? new Date(result.data.dueDate)
        : null;
    if (result.data.assigneeId !== undefined) {
      updateData.assigneeId = result.data.assigneeId
        ? new mongoose.Types.ObjectId(result.data.assigneeId)
        : null;
    }

    await Task.findByIdAndUpdate(taskId, { $set: updateData });

    if (
      result.data.assigneeId !== undefined &&
      result.data.assigneeId &&
      task.assigneeId?.toString() !== result.data.assigneeId
    ) {
      await createNotification({
        userId: result.data.assigneeId,
        workspaceId: task.workspaceId.toString(),
        type: "assignment",
        message: `You have been assigned a task: "${task.title}"`,
        link: `/${workspaceSlug}/projects/${task.projectId.toString()}/tasks/${taskId}`,
      });
    }

    if (result.data.status && result.data.status !== task.status) {
      await logActivity(
        task.workspaceId.toString(),
        task.projectId.toString(),
        taskId,
        userId,
        "task_status_changed",
        { from: task.status, to: result.data.status },
      );
    }

    revalidatePath(`/${workspaceSlug}/projects/${task.projectId.toString()}`);
    revalidatePath(`/${workspaceSlug}/dashboard`);

    return { success: true };
  } catch (error) {
    console.error("Task update error:", error);
    return { success: false, error: "Task update cannot be completed" };
  }
}

export async function updateTaskStatus(
  workspaceSlug: string,
  taskId: string,
  newStatus: string,
): Promise<TaskActionResult> {
  return updateTask(workspaceSlug, taskId, {
    status: newStatus as CreateTaskInput["status"],
  });
}

export async function deleteTask(
  workspaceSlug: string,
  taskId: string,
): Promise<TaskActionResult> {
  return safeAction(async () => {
    const task = await verifyTaskAccess(taskId, workspaceSlug, "delete");

    try {
      await connectDB();

      await Task.findByIdAndDelete(taskId);

      revalidatePath(`/${workspaceSlug}/projects/${task.projectId.toString()}`);

      return { success: true };
    } catch (error) {
      console.error("Task delete error:", error);
      return { success: false, error: "Failed to delete task" };
    }
  });
}

export async function updateTaskPositions(
  workspaceSlug: string,
  updates: { taskId: string; position: number; status: string }[],
): Promise<TaskActionResult> {
  return safeAction(async () => {
    const { membership } = await verifyWorkspaceMember(workspaceSlug);

    const validStatuses = ["todo", "in-progress", "in-review", "done"];
    const cleaned = updates.filter(
      (u) =>
        mongoose.isValidObjectId(u.taskId) &&
        validStatuses.includes(u.status) &&
        Number.isFinite(u.position)
    );

    if (cleaned.length === 0) return { success: true };

    try {
      await connectDB();

      // Sirf is workspace ke tasks, doosre workspace ke IDs yahin filter ho jayenge
      const existing = await Task.find({
        _id: { $in: cleaned.map((u) => u.taskId) },
        workspaceId: new mongoose.Types.ObjectId(membership.workspaceId),
      })
        .select("completedAt")
        .lean();

      const byId = new Map(existing.map((t) => [t._id.toString(), t]));

      const ops = cleaned.flatMap((u) => {
        const current = byId.get(u.taskId);
        if (!current) return [];

        const $set: Record<string, unknown> = {
          position: u.position,
          status: u.status,
        };
        if (u.status === "done") {
          if (!current.completedAt) $set.completedAt = new Date();
        } else {
          $set.completedAt = null;
        }

        return [{ updateOne: { filter: { _id: current._id }, update: { $set } } }];
      });

      if (ops.length > 0) await Task.bulkWrite(ops);

      return { success: true };
    } catch (error) {
      console.error("Position update error:", error);
      return { success: false, error: "Could not save task positions" };
    }
  });
}
