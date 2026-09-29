"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Workspace from "@/models/Workspace";
import { verifyPermission } from "@/lib/authorization";
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/lib/validations/project";
import mongoose from "mongoose";

interface ActionResult {
  success: boolean;
  error?: string;
  projectId?: string;
}

export async function createProject(
  workspaceSlug: string,
  data: CreateProjectInput,
): Promise<ActionResult> {
  const { userId, membership } = await verifyPermission(
    workspaceSlug,
    "project_create",
  );

  const result = createProjectSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  try {
    await connectDB();

    const project = await Project.create({
      workspaceId: new mongoose.Types.ObjectId(membership.workspaceId),
      name: result.data.name,
      description: result.data.description,
      color: result.data.color,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    revalidatePath(`/${workspaceSlug}/projects`);
    revalidatePath(`/${workspaceSlug}/dashboard`);

    return { success: true, projectId: project._id.toString() };
  } catch (error) {
    console.error("Project create error:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function updateProject(
  workspaceSlug: string,
  projectId: string,
  data: UpdateProjectInput,
): Promise<ActionResult> {
  const { membership } = await verifyPermission(
    workspaceSlug,
    "project_update",
  );

  const result = updateProjectSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  try {
    await connectDB();

    const project = await Project.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(projectId),
        workspaceId: new mongoose.Types.ObjectId(membership.workspaceId),
      },
      { $set: result.data },
      { new: true },
    );

    if (!project) {
      return { success: false, error: "Project not found or access denied" };
    }

    revalidatePath(`/${workspaceSlug}/projects`);
    revalidatePath(`/${workspaceSlug}/projects/${projectId}`);
    revalidatePath(`/${workspaceSlug}/dashboard`);

    return { success: true };
  } catch (error) {
    console.error("Project update error:", error);
    return { success: false, error: "Failed to update project" };
  }
}

export async function archiveProject(
  workspaceSlug: string,
  projectId: string,
): Promise<ActionResult> {
  const { membership } = await verifyPermission(
    workspaceSlug,
    "project_update",
  );

  try {
    await connectDB();

    const project = await Project.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(projectId),
        workspaceId: new mongoose.Types.ObjectId(membership.workspaceId),
      },
      { status: "archived" },
      { new: true },
    );

    if (!project) {
      return { success: false, error: "Project not found or access denied" };
    }

    revalidatePath(`/${workspaceSlug}/projects`);
    revalidatePath(`/${workspaceSlug}/dashboard`);

    return { success: true };
  } catch (error) {
    console.error("Archive error:", error);
    return { success: false, error: "Failed to archive project" };
  }
}

export async function restoreProject(
  workspaceSlug: string,
  projectId: string,
): Promise<ActionResult> {
  const { membership } = await verifyPermission(
    workspaceSlug,
    "project_update",
  );

  try {
    await connectDB();

    await Project.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(projectId),
        workspaceId: new mongoose.Types.ObjectId(membership.workspaceId),
      },
      { status: "active" },
    );

    revalidatePath(`/${workspaceSlug}/projects`);

    return { success: true };
  } catch (error) {
    console.error("Restore error:", error);
    return { success: false, error: "Failed to restore project" };
  }
}

export async function deleteProject(
  workspaceSlug: string,
  projectId: string,
): Promise<ActionResult> {
  const { membership } = await verifyPermission(
    workspaceSlug,
    "project_delete",
  );

  try {
    await connectDB();

    const workspaceObjectId = new mongoose.Types.ObjectId(
      membership.workspaceId,
    );
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    const project = await Project.findOne({
      _id: projectObjectId,
      workspaceId: workspaceObjectId,
    });

    if (!project) {
      return { success: false, error: "Project not found or access denied" };
    }

    await Task.deleteMany({ projectId: projectObjectId });

    await Project.findByIdAndDelete(projectObjectId);

    revalidatePath(`/${workspaceSlug}/projects`);
    revalidatePath(`/${workspaceSlug}/dashboard`);

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "Failed to delete project" };
  }
}
