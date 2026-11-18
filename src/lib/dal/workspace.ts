import { cache } from "react";
import connectDB from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import mongoose from "mongoose";

export const getWorkspaceBySlug = cache(async (slug: string) => {
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
    throw new Error("Failed to load workspace");
  }
});

export const getWorkspaceMembership = cache(
  async (workspaceSlug: string, userId: string) => {
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
      throw new Error("Membership check failed");
    }
  },
);

export async function getWorkspacesByUser(userId: string) {
  try {
    await connectDB();

    const rows = await WorkspaceMember.aggregate<{
      role: string;
      workspace: {
        _id: mongoose.Types.ObjectId;
        name: string;
        slug: string;
      };
    }>([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      { $sort: { joinedAt: 1 } },
      {
        $lookup: {
          from: Workspace.collection.name,
          localField: "workspaceId",
          foreignField: "_id",
          as: "workspace",
        },
      },
      { $unwind: "$workspace" },
      {
        $project: {
          role: 1,
          "workspace._id": 1,
          "workspace.name": 1,
          "workspace.slug": 1,
        },
      },
    ]);

    return rows.map((r) => ({
      _id: r.workspace._id.toString(),
      name: r.workspace.name,
      slug: r.workspace.slug,
      role: r.role ?? "member",
    }));
  } catch (error) {
    console.error("Failed to fetch user workspaces:", error);
    throw new Error("Failed to load workspaces");
  }
}
