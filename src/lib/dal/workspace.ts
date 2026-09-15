import connectDB from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import mongoose from "mongoose";

export async function getWorkspaceBySlug(slug: string) {
  try {
    await connectDB();
    const workspace = await Workspace.findOne({ slug }).lean();
    if (!workspace) return null;

    return {
      _id: workspace._id.toString(),
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      ownerId: workspace.ownerId.toString(),
    };
  } catch (error) {
    console.error("Failed to fetch workspace:", error);
    throw new Error("Workspace load nahi ho saka");
  }
}

export async function getWorkspaceMembership(
  workspaceSlug: string,
  userId: string,
) {
  try {
    await connectDB();

    const workspace = await Workspace.findOne({ slug: workspaceSlug }).lean();
    if (!workspace) return null;

    const membership = await WorkspaceMember.findOne({
      workspaceId: workspace._id,
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (!membership) return null;

    return {
      workspaceId: workspace._id.toString(),
      workspaceName: workspace.name,
      workspaceSlug: workspace.slug,
      userId: membership.userId.toString(),
      role: membership.role,
    };
  } catch (error) {
    console.error("Failed to fetch workspace membership:", error);
    throw new Error("Membership check nahi ho saka");
  }
}

export async function getWorkspacesByUser(userId: string) {
  try {
    await connectDB();

    const memberships = await WorkspaceMember.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (memberships.length === 0) return [];

    const workspaceIds = memberships.map((m) => m.workspaceId);
    const workspaces = await Workspace.find({
      _id: { $in: workspaceIds },
    }).lean();

    return workspaces.map((w) => {
      const membership = memberships.find(
        (m) => m.workspaceId.toString() === w._id.toString(),
      );
      return {
        _id: w._id.toString(),
        name: w.name,
        slug: w.slug,
        role: membership?.role ?? "member",
      };
    });
  } catch (error) {
    console.error("Failed to fetch user workspaces:", error);
    throw new Error("Workspaces load nahi ho sake");
  }
}
