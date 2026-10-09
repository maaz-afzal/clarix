"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import Activity from "@/models/Activity";
import { verifyPermission, verifyTaskAccess, verifyWorkspaceMember } from "@/lib/authorization";
import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/lib/validations/task";
import mongoose from "mongoose";

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
  } catch {
  }
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

    // Position - existing tasks mein sabse aakhir mein
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

  const { userId } = await verifyPermission(workspaceSlug, "task_update_own");

  try {
    await connectDB();

    const updateData: Record<string, unknown> = {};

    if (result.data.title !== undefined) updateData.title = result.data.title;
    if (result.data.description !== undefined)
      updateData.description = result.data.description;
    if (result.data.status !== undefined)
      updateData.status = result.data.status;
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
  const task = await verifyTaskAccess(taskId, workspaceSlug, "delete");

  try {
    await connectDB();

    await Task.findByIdAndDelete(taskId);

    revalidatePath(`/${workspaceSlug}/projects/${task.projectId.toString()}`);

    return { success: true };
  } catch (error) {
    console.error("Task delete error:", error);
    return { success: false, error: "Task delete cannot be completed" };
  }
}

export async function updateTaskPositions(
  workspaceSlug: string,
  updates: { taskId: string; position: number; status: string }[]
): Promise<TaskActionResult> {
  await verifyWorkspaceMember(workspaceSlug)

  try {
    await connectDB()

    const bulkOps = updates.map(({ taskId, position, status }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(taskId) },
        update: { $set: { position, status } },
      },
    }))

    await Task.bulkWrite(bulkOps)

    return { success: true }
  } catch (error) {
    console.error("Position update error:", error)
    return { success: false, error: "Positions update nahi ho sake" }
  }
}
