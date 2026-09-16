"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import { verifyWorkspaceMember, verifyPermission } from "@/lib/authorization";
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
} from "@/lib/validations/project";

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
    return {
      success: false,
      error: result.error.errors[0].message,
    };
  }

  try {
    await connectDB();

    const project = await Project.create({
      workspaceId: membership.workspaceId,
      name: result.data.name,
      description: result.data.description,
      color: result.data.color,
      createdBy: userId,
    });

    revalidatePath(`/${workspaceSlug}/projects`);
    revalidatePath(`/${workspaceSlug}/dashboard`);

    return { success: true, projectId: project._id.toString() };
  } catch (error) {
    console.error("Project create error:", error);
    return {
      success: false,
      error: "Could not create project. Please try again.",
    };
  }
}

export async function deleteProject(
  workspaceSlug: string,
  projectId: string,
): Promise<ActionResult> {
  await verifyPermission(workspaceSlug, "project_delete");

  try {
    await connectDB();

    const project = await Project.findById(projectId);

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    if (
      project.workspaceId.toString() !== (await getWorkspaceId(workspaceSlug))
    ) {
      return { success: false, error: "Access nahi hai" };
    }

    await Project.findByIdAndDelete(projectId);

    revalidatePath(`/${workspaceSlug}/projects`);
    revalidatePath(`/${workspaceSlug}/dashboard`);

    return { success: true };
  } catch (error) {
    console.error("Project delete error:", error);
    return { success: false, error: "Could not delete project" };
  }
}

async function getWorkspaceId(slug: string): Promise<string> {
  const { default: Workspace } = await import("@/models/Workspace");
  const workspace = await Workspace.findOne({ slug }).lean();
  return workspace?._id.toString() ?? "";
}
