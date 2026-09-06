import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";

export interface ProjectWithStats {
  _id: string;
  name: string;
  description?: string;
  color: string;
  status: string;
  createdAt: string;
  taskCount: number;
  completedCount: number;
}

export async function getProjectsByWorkspace(
  workspaceId: string,
): Promise<ProjectWithStats[]> {
  await connectDB();

  const projects = await Project.find({
    workspaceId,
    status: "active",
  })
    .sort({ createdAt: -1 })
    .lean();

  if (projects.length === 0) return [];

  const projectIds = projects.map((p) => p._id);

  const taskStats = await Task.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    {
      $group: {
        _id: "$projectId",
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
        },
      },
    },
  ]);

  const statsMap = taskStats.reduce(
    (acc, stat) => {
      acc[stat._id.toString()] = stat;
      return acc;
    },
    {} as Record<string, { total: number; completed: number }>,
  );

  return projects.map((p) => {
    const id = p._id.toString();
    const stats = statsMap[id];
    return {
      _id: id,
      name: p.name,
      description: p.description,
      color: p.color,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      taskCount: stats?.total ?? 0,
      completedCount: stats?.completed ?? 0,
    };
  });
}

export async function getProjectById(projectId: string) {
  try {
    await connectDB();

    const project = await Project.findById(projectId).lean();
    if (!project) return null;

    return {
      _id: project._id.toString(),
      workspaceId: project.workspaceId.toString(),
      name: project.name,
      description: project.description,
      color: project.color,
      status: project.status,
      createdBy: project.createdBy.toString(),
      createdAt: project.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("Failed to fetch project:", error);
    throw new Error("Project load nahi ho saka");
  }
}
