import connectDB from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";

export async function getWorkspaceBySlug(slug: string) {
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
}

export async function getWorkspacesByUser(userId: string) {
  await connectDB();

  const memberships = await WorkspaceMember.find({ userId })
    .populate<{
      workspaceId: { _id: unknown; name: string; slug: string };
    }>("workspaceId", "name slug")
    .lean();

  return memberships.map((m) => ({
    workspaceId: (
      m.workspaceId as { _id: unknown; name: string; slug: string }
    )._id.toString(),
    name: (m.workspaceId as { _id: unknown; name: string; slug: string }).name,
    slug: (m.workspaceId as { _id: unknown; name: string; slug: string }).slug,
    role: m.role,
  }));
}
