import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Activity from "@/models/Activity";
import User from "@/models/User";
import mongoose from "mongoose";

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export interface ProjectProgress {
  _id: string;
  name: string;
  color: string;
  total: number;
  completed: number;
  percentage: number;
}

export interface OverdueTask {
  _id: string;
  title: string;
  projectId: string;
  projectName: string;
  dueDate: string;
  priority: string;
  assignee?: { name: string; image?: string };
}

export interface RecentActivityItem {
  _id: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  user: { name: string; image?: string };
  projectName?: string;
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

    return { totalProjects, totalTasks, completedTasks, overdueTasks };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    throw new Error("Could not load stats");
  }
}

export async function getProjectsProgress(
  workspaceId: string,
): Promise<ProjectProgress[]> {
  try {
    await connectDB();

    const projects = await Project.find({
      workspaceId,
      status: "active",
    })
      .select("name color")
      .limit(6)
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
      (acc, s) => {
        acc[s._id.toString()] = s;
        return acc;
      },
      {} as Record<string, { total: number; completed: number }>,
    );

    return projects.map((p) => {
      const id = p._id.toString();
      const stats = statsMap[id] ?? { total: 0, completed: 0 };
      const percentage =
        stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

      return {
        _id: id,
        name: p.name,
        color: p.color,
        total: stats.total,
        completed: stats.completed,
        percentage,
      };
    });
  } catch (error) {
    console.error("Failed to fetch project progress:", error);
    return [];
  }
}

export async function getOverdueTasks(
  workspaceId: string,
  limit = 5,
): Promise<OverdueTask[]> {
  try {
    await connectDB();

    const tasks = await Task.find({
      workspaceId,
      status: { $ne: "done" },
      dueDate: { $lt: new Date() },
    })
      .populate<{ assigneeId: { name: string; image?: string } | null }>(
        "assigneeId",
        "name image",
      )
      .sort({ dueDate: 1 })
      .limit(limit)
      .lean();

    if (tasks.length === 0) return [];

    const projectIds = [...new Set(tasks.map((t) => t.projectId))];
    const projects = await Project.find({ _id: { $in: projectIds } })
      .select("name")
      .lean();

    const projectMap = projects.reduce(
      (acc, p) => {
        acc[p._id.toString()] = p.name;
        return acc;
      },
      {} as Record<string, string>,
    );

    return tasks.map((t) => {
      const assignee = t.assigneeId as {
        name: string;
        image?: string;
      } | null;

      return {
        _id: t._id.toString(),
        title: t.title,
        projectId: t.projectId.toString(),
        projectName: projectMap[t.projectId.toString()] ?? "Unknown",
        dueDate: t.dueDate!.toISOString(),
        priority: t.priority,
        assignee: assignee
          ? { name: assignee.name, image: assignee.image }
          : undefined,
      };
    });
  } catch (error) {
    console.error("Failed to fetch overdue tasks:", error);
    return [];
  }
}

export async function getRecentActivity(
  workspaceId: string,
  limit = 10,
): Promise<RecentActivityItem[]> {
  try {
    await connectDB();

    const activities = await Activity.find({ workspaceId })
      .populate<{
        userId: { name: string; image?: string };
      }>("userId", "name image")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    if (activities.length === 0) return [];

    const projectIds = activities.map((a) => a.projectId).filter(Boolean);

    const projects = await Project.find({ _id: { $in: projectIds } })
      .select("name")
      .lean();

    const projectMap = projects.reduce(
      (acc, p) => {
        acc[p._id.toString()] = p.name;
        return acc;
      },
      {} as Record<string, string>,
    );

    return activities.map((a) => {
      const user = a.userId as { name: string; image?: string };
      return {
        _id: a._id.toString(),
        action: a.action,
        metadata: a.metadata as Record<string, unknown>,
        createdAt: a.createdAt.toISOString(),
        user: { name: user.name, image: user.image },
        projectName: a.projectId
          ? projectMap[a.projectId.toString()]
          : undefined,
      };
    });
  } catch (error) {
    console.error("Failed to fetch activity:", error);
    return [];
  }
}
