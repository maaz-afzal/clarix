import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Task from "@/models/Task";
import Project from "@/models/Project";
import WorkspaceMember from "@/models/WorkspaceMember";
import Comment from "@/models/Comment";
import { hasPermission, type MemberRole } from "@/lib/permissions";
import { ERROR_MESSAGES } from "@/lib/errors";

export function isObjectIdString(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);
}

export async function findTaskInWorkspace(taskId: string, workspaceId: string) {
  if (!isObjectIdString(taskId)) return null;
  await connectDB();
  return Task.findOne({ _id: taskId, workspaceId }).lean();
}

export async function findProjectInWorkspace(projectId: string, workspaceId: string) {
  if (!isObjectIdString(projectId)) return null;
  await connectDB();
  return Project.findOne({ _id: projectId, workspaceId }).lean();
}

export async function findCommentInWorkspace(commentId: string, workspaceId: string) {
  if (!isObjectIdString(commentId)) return null;
  await connectDB();

  const comment = await Comment.findById(commentId).lean();
  if (!comment) return null;

  const task = await findTaskInWorkspace(comment.taskId.toString(), workspaceId);
  if (!task) return null;

  return { comment, task };
}

export async function validateAssignee(params: {
  userId: string;
  role: MemberRole;
  workspaceId: string;
  assigneeId: string | undefined;
}): Promise<string | null> {
  const { userId, role, workspaceId, assigneeId } = params;

  if (!assigneeId) return null; // unassign

  if (!isObjectIdString(assigneeId)) return "Invalid assignee";

  if (assigneeId !== userId && !hasPermission(role, "task_assign")) {
    return ERROR_MESSAGES.FORBIDDEN;
  }

  await connectDB();
  const member = await WorkspaceMember.exists({ workspaceId, userId: assigneeId });
  if (!member) return "Assignee must be a member of this workspace";

  return null;
}