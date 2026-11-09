import connectDB from "@/lib/db";
import Task from "@/models/Task";
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
}

const TREND_DAYS = 14;

export async function getProjectAnalytics(
  projectId: string,
  workspaceId: string
): Promise<ProjectAnalytics> {
  try {
    await connectDB();

    const base = {
      projectId: new mongoose.Types.ObjectId(projectId),
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    };

    // Pichle 14 din, aaj ka din shamil, UTC ke hisaab se
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (TREND_DAYS - 1));

    const [statusRows, priorityRows, trendRows, overdue] = await Promise.all([
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

    // Jin dino mein koi task complete nahi hua unke liye 0, taake chart mein gap na aaye
    const counts = new Map<string, number>(
      trendRows.map((r) => [r._id as string, r.count as number])
    );
    const trend = Array.from({ length: TREND_DAYS }, (_, i) => {
      const day = new Date(since);
      day.setUTCDate(since.getUTCDate() + i);
      const key = day.toISOString().slice(0, 10);
      return { date: key, completed: counts.get(key) ?? 0 };
    });

    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

    return { total, overdue, byStatus, byPriority, trend };
  } catch (error) {
    console.error("Failed to fetch project analytics:", error);
    throw new Error("Failed to load analytics");
  }
}