import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Workspace from "@/models/Workspace";

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export async function getDashboardStats(
  workspaceId: string,
): Promise<DashboardStats> {
  try {
    await connectDB();

    const now = new Date();

    const [totalProjects, totalTasks, completedTasks, overdueTasks] =
      await Promise.all([
        Project.countDocuments({ workspaceId, status: "active" }),
        Task.countDocuments({ workspaceId }),
        Task.countDocuments({ workspaceId, status: "done" }),
        Task.countDocuments({
          workspaceId,
          status: { $ne: "done" },
          dueDate: { $lt: now },
        }),
      ]);

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    throw new Error("Dashboard stats load nahi ho sake");
  }
}
