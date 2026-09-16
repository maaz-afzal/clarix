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
  updateWorkspaceSchema,
} from "@/lib/validations/workspace";

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
}

export async function updateWorkspace(
  workspaceSlug: string,
  formData: FormData,
): Promise<UpdateWorkspaceResult> {
  await verifyPermission(workspaceSlug, "workspace_update");

  const name = formData.get("name") as string | null;
  const description = formData.get("description") as string | null;

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
}
