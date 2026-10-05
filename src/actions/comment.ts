"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Comment from "@/models/Comment";
import Task from "@/models/Task";
import { auth } from "@/lib/auth";
import { verifyWorkspaceMember } from "@/lib/authorization";
import { createCommentSchema } from "@/lib/validations/task";
import mongoose from "mongoose";

interface CommentResult {
  success: boolean;
  error?: string;
}

export async function addComment(
  workspaceSlug: string,
  taskId: string,
  data: { content: string },
): Promise<CommentResult> {
  const { userId } = await verifyWorkspaceMember(workspaceSlug);

  const result = createCommentSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  try {
    await connectDB();

    const task = await Task.findById(taskId).lean();
    if (!task) return { success: false, error: "Task not found" };

    await Comment.create({
      taskId: new mongoose.Types.ObjectId(taskId),
      userId: new mongoose.Types.ObjectId(userId),
      content: result.data.content,
    });

    revalidatePath(
      `/${workspaceSlug}/projects/${task.projectId.toString()}/tasks/${taskId}`,
    );

    return { success: true };
  } catch (error) {
    console.error("Comment error:", error);
    return { success: false, error: "Comment not added" };
  }
}

export async function deleteComment(
  workspaceSlug: string,
  commentId: string,
  taskId: string,
  projectId: string,
): Promise<CommentResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  const { membership } = await verifyWorkspaceMember(workspaceSlug);

  try {
    await connectDB();

    const comment = await Comment.findById(commentId);
    if (!comment) return { success: false, error: "Comment not found" };
    const isOwner = comment.userId.toString() === session.user.id;
    const isAdmin = ["owner", "admin"].includes(membership.role);

    if (!isOwner && !isAdmin) {
      return {
        success: false,
        error: "You are not the owner of this comment",
      };
    }

    await Comment.findByIdAndDelete(commentId);

    revalidatePath(`/${workspaceSlug}/projects/${projectId}/tasks/${taskId}`);

    return { success: true };
  } catch (error) {
    console.error("Delete comment error:", error);
    return { success: false, error: "Comment not deleted" };
  }
}
