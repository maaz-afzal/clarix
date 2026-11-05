"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import { requireAuth, verifyPermission } from "@/lib/authorization";
import { generateSlug } from "@/lib/utils";
import {
  CreateWorkspaceInput,
  createWorkspaceSchema,
  UpdateWorkspaceInput,
  updateWorkspaceSchema,
} from "@/lib/validations/workspace";
import Task from "@/models/Task";
import Project from "@/models/Project";
import Activity from "@/models/Activity";
import Notification from "@/models/Notification";
import Invitation from "@/models/Invitation";
import Comment from "@/models/Comment";
import Attachment from "@/models/Attachment";
import { Types } from "mongoose";
import { safeAction } from "@/lib/errors";
import { deleteTasksWithRelated } from "@/lib/cascade";

interface CreateWorkspaceResult {
  success: boolean;
  error?: string;
  slug?: string;
}

interface UpdateWorkspaceResult {
  success: boolean;
  error?: string;
}

export async function createWorkspace(
  input: CreateWorkspaceInput,
): Promise<CreateWorkspaceResult> {
  return safeAction(async () => {
    const user = await requireAuth();
    const result = createWorkspaceSchema.safeParse(input);

    if (!result.success) {
      return {
        success: false,
        error: result.error.errors[0].message,
      };
    }

    const { name } = result.data;

    try {
      await connectDB();

      let slug = generateSlug(name);
      let slugExists = await Workspace.findOne({ slug });
      let attempt = 0;

      while (slugExists && attempt < 10) {
        attempt++;
        slug = `${generateSlug(name)}-${attempt}`;
        slugExists = await Workspace.findOne({ slug });
      }

      const workspace = await Workspace.create({
        name,
        slug,
        ownerId: user.id,
      });

      await WorkspaceMember.create({
        workspaceId: workspace._id,
        userId: user.id,
        role: "owner",
      });

      return { success: true, slug: workspace.slug };
    } catch (error) {
      console.error("Workspace create error:", error);
      return {
        success: false,
        error: "Could not create workspace. Please try again.",
      };
    }
  });
}

export async function updateWorkspace(
  workspaceSlug: string,
  input: UpdateWorkspaceInput,
): Promise<UpdateWorkspaceResult> {
  return safeAction(async () => {
    await verifyPermission(workspaceSlug, "workspace_update");

    const { name, description } = input;

    const result = updateWorkspaceSchema.safeParse({
      name: name !== null ? name : undefined,
      description: description !== null ? description : undefined,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error.errors[0].message,
      };
    }

    const updateData: {
      name?: string;
      description?: string;
    } = {};

    if (result.data.name !== undefined) updateData.name = result.data.name;

    if (result.data.description !== undefined)
      updateData.description = result.data.description;

    try {
      await connectDB();

      const workspace = await Workspace.findOneAndUpdate(
        { slug: workspaceSlug },
        { $set: updateData },
        { new: true },
      );

      if (!workspace) {
        return {
          success: false,
          error: "Workspace not found.",
        };
      }

      revalidatePath(`/${workspaceSlug}`, "layout");

      return {
        success: true,
      };
    } catch (error) {
      console.error("Workspace update error:", error);

      return {
        success: false,
        error: "Could not update workspace. Please try again.",
      };
    }
  });
}

export async function deleteWorkspace(
  workspaceSlug: string,
): Promise<{ success: boolean; error?: string }> {
  return safeAction(async () => {
    const { userId, membership } = await verifyPermission(
      workspaceSlug,
      "workspace_delete",
    );

    if (membership.role !== "owner") {
      return {
        success: false,
        error: "Only the workspace owner can delete it",
      };
    }

    try {
      await connectDB();

      const workspaceObjectId = new Types.ObjectId(
        membership.workspaceId,
      );

      // Get all task IDs in this workspace to cascade delete
      const tasks = await Task.find({ workspaceId: workspaceObjectId })
        .select("_id")
        .lean();

      const taskIds = tasks.map((t) => t._id);

      // Delete related data for all tasks in workspace
      if (taskIds.length > 0) {
        await Promise.all([
          Comment.deleteMany({ taskId: { $in: taskIds } }),
          Activity.deleteMany({ taskId: { $in: taskIds } }),
        ]);

        // Get attachments to delete Cloudinary files first
        const attachments = await Attachment.find({ taskId: { $in: taskIds } })
          .select("publicId")
          .lean();

        if (attachments.length > 0) {
          const { deleteFile } = await import("@/lib/cloudinary");
          const cloudinaryResults = await Promise.allSettled(
            attachments.map((a) => deleteFile(a.publicId)),
          );

          cloudinaryResults.forEach((result, index) => {
            if (result.status === "rejected") {
              console.error(
                `Failed to delete Cloudinary file for attachment ${attachments[index]._id}:`,
                result.reason,
              );
            }
          });
        }

        await Attachment.deleteMany({ taskId: { $in: taskIds } });
      }

      await Promise.all([
        Task.deleteMany({ workspaceId: workspaceObjectId }),
        Project.deleteMany({ workspaceId: workspaceObjectId }),
        WorkspaceMember.deleteMany({ workspaceId: workspaceObjectId }),
        Notification.deleteMany({ workspaceId: workspaceObjectId }),
        Activity.deleteMany({ workspaceId: workspaceObjectId }),
        Invitation.deleteMany({ workspaceId: workspaceObjectId }),
        Workspace.findOneAndDelete({ slug: workspaceSlug }),
      ]);

      return { success: true };
    } catch (error) {
      console.error("Delete workspace error:", error);
      return { success: false, error: "Failed to delete workspace" };
    }
  });
}
