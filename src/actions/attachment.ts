"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Attachment from "@/models/Attachment";
import { auth } from "@/lib/auth";
import { verifyWorkspaceMember } from "@/lib/authorization";
import { deleteFile } from "@/lib/cloudinary";
import mongoose from "mongoose";

interface AttachmentResult {
  success: boolean;
  error?: string;
}

export async function deleteAttachment(
  workspaceSlug: string,
  attachmentId: string,
  taskId: string,
  projectId: string,
): Promise<AttachmentResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  const { membership } = await verifyWorkspaceMember(workspaceSlug);

  try {
    await connectDB();

    const attachment = await Attachment.findById(attachmentId);
    if (!attachment) {
      return { success: false, error: "Attachment not found" };
    }

    if (attachment.workspaceId.toString() !== membership.workspaceId) {
      return { success: false, error: "You don't have access to this attachment" };
    }

    const isUploader = attachment.uploadedBy.toString() === session.user.id;
    const isAdmin = ["owner", "admin"].includes(membership.role);

    if (!isUploader && !isAdmin) {
      return {
        success: false,
        error: "You don't have permission to delete this attachment",
      };
    }

    await deleteFile(attachment.publicId);

    await Attachment.findByIdAndDelete(attachmentId);

    revalidatePath(`/${workspaceSlug}/projects/${projectId}/tasks/${taskId}`);

    return { success: true };
  } catch (error) {
    console.error("Delete attachment error:", error);
    return { success: false, error: "Failed to delete attachment" };
  }
}
