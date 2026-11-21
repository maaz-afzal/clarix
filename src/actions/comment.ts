"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { verifyPermission, verifyWorkspaceMember } from "@/lib/authorization";
import { createCommentSchema } from "@/lib/validations/task";
import mongoose from "mongoose";
import Comment from "@/models/Comment";
import { createNotification } from "@/lib/notifications";
import { safeAction } from "@/lib/errors";
import {
  findTaskInWorkspace,
  findCommentInWorkspace,
} from "@/lib/resource-access";

interface CommentResult {
  success: boolean;
  error?: string;
}

export async function addComment(
  workspaceSlug: string,
  taskId: string,
  data: { content: string },
): Promise<CommentResult> {
  return safeAction(async () => {
    const { userId, membership } = await verifyPermission(
      workspaceSlug,
      "comment_create",
    );

    const result = createCommentSchema.safeParse(data);
    if (!result.success) {
      return { success: false, error: result.error.errors[0].message };
    }

    const task = await findTaskInWorkspace(taskId, membership.workspaceId);
    if (!task) throw new Error("NOT_FOUND");

    try {
      const session = await auth();
      const commenterName = session?.user?.name ?? "A user";

      await Comment.create({
        taskId: task._id,
        userId: new mongoose.Types.ObjectId(userId),
        content: result.data.content,
      });

      if (task.assigneeId && task.assigneeId.toString() !== userId) {
        await createNotification({
          userId: task.assigneeId.toString(),
          workspaceId: task.workspaceId.toString(),
          type: "comment",
          message: `${commenterName} commented on your task: "${task.title}"`,
          link: `/${workspaceSlug}/projects/${task.projectId.toString()}/tasks/${task._id.toString()}`,
        });
      }

      revalidatePath(
        `/${workspaceSlug}/projects/${task.projectId.toString()}`,
        "layout",
      );

      return { success: true };
    } catch (error) {
      console.error("Comment error:", error);
      return { success: false, error: "Comment not added" };
    }
  });
}

export async function deleteComment(
  workspaceSlug: string,
  commentId: string,
): Promise<CommentResult> {
  return safeAction(async () => {
    const { userId, membership } = await verifyWorkspaceMember(workspaceSlug);

    const found = await findCommentInWorkspace(commentId, membership.workspaceId);
    if (!found) throw new Error("NOT_FOUND");

    const isOwner = found.comment.userId.toString() === userId;
    const isAdmin = ["owner", "admin"].includes(membership.role);

    if (!isOwner && !isAdmin) {
      return { success: false, error: "You are not the owner of this comment" };
    }

    try {
      await Comment.findByIdAndDelete(found.comment._id);

      revalidatePath(
        `/${workspaceSlug}/projects/${found.task.projectId.toString()}`,
        "layout",
      );

      return { success: true };
    } catch (error) {
      console.error("Delete comment error:", error);
      return { success: false, error: "Comment not deleted" };
    }
  });
}