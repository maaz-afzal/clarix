import connectDB from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import mongoose from "mongoose";
import type { TaskItem } from "@/lib/dal/task";

type Status = TaskItem["status"];
type Priority = TaskItem["priority"];

export interface ProjectAnalytics {
  total: number;
  overdue: number;
  byStatus: Record<Status, number>;
  byPriority: Record<Priority, number>;
  trend: { date: string; completed: number }[];
  assigneeWorkload: { name: string; count: number }[];
}

const TREND_DAYS = 14;

export async function getProjectAnalytics(
  projectId: string,
  workspaceId: string,
): Promise<ProjectAnalytics> {
  try {
    await connectDB();

    const base = {
      projectId: new mongoose.Types.ObjectId(projectId),
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    };

    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (TREND_DAYS - 1));

    const [statusRows, priorityRows, trendRows, overdue, assigneeRows] =
      await Promise.all([
        Task.aggregate([
          { $match: base },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Task.aggregate([
          { $match: base },
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]),
        Task.aggregate([
          { $match: { ...base, completedAt: { $gte: since } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$completedAt",
                  timezone: "UTC",
                },
              },
              count: { $sum: 1 },
            },
          },
        ]),
        Task.countDocuments({
          ...base,
          status: { $ne: "done" },
          dueDate: { $lt: new Date() },
        }),
        Task.aggregate([
          { $match: { ...base, status: { $ne: "done" } } },
          {
            $group: {
              _id: "$assigneeId",
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    const byStatus: Record<Status, number> = {
      todo: 0,
      "in-progress": 0,
      "in-review": 0,
      done: 0,
    };
    const byPriority: Record<Priority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    for (const row of statusRows) {
      if (row._id in byStatus) byStatus[row._id as Status] = row.count;
    }
    for (const row of priorityRows) {
      if (row._id in byPriority) byPriority[row._id as Priority] = row.count;
    }

    const counts = new Map<string, number>(
      trendRows.map((r) => [r._id as string, r.count as number]),
    );
    const trend = Array.from({ length: TREND_DAYS }, (_, i) => {
      const day = new Date(since);
      day.setUTCDate(since.getUTCDate() + i);
      const key = day.toISOString().slice(0, 10);
      return { date: key, completed: counts.get(key) ?? 0 };
    });

    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

    const assigneeIds = assigneeRows
      .map((r) => r._id)
      .filter((id): id is mongoose.Types.ObjectId => id != null);
    const users = await User.find({ _id: { $in: assigneeIds } })
      .select("name")
      .lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u.name]));
    const unassignedCount = assigneeRows.find((r) => r._id == null)?.count ?? 0;

    const assigneeWorkload = assigneeRows
      .filter((r) => r._id != null)
      .map((r) => ({
        name: userMap.get(r._id.toString()) ?? "Unknown",
        count: r.count,
      }))
      .sort((a, b) => b.count - a.count);

    if (unassignedCount > 0) {
      assigneeWorkload.push({ name: "Unassigned", count: unassignedCount });
    }

    return { total, overdue, byStatus, byPriority, trend, assigneeWorkload };
  } catch (error) {
    console.error("Failed to fetch project analytics:", error);
    throw new Error("Failed to load analytics");
  }
}
