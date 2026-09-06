import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Task from "@/models/Task";

export interface TaskItem {
  _id: string;
  projectId: string;
  workspaceId: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "in-review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assigneeId?: string;
  createdBy: string;
  dueDate?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  byStatus: {
    todo: number;
    "in-progress": number;
    "in-review": number;
    done: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export async function getTasksByProject(
  projectId: string,
): Promise<TaskItem[]> {
  try {
    await connectDB();

    const tasks = await Task.find({ projectId }).sort({ position: 1 }).lean();

    return tasks.map((task) => ({
      _id: task._id.toString(),
      projectId: task.projectId.toString(),
      workspaceId: task.workspaceId.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId?.toString(),
      createdBy: task.createdBy.toString(),
      dueDate: task.dueDate?.toISOString(),
      position: task.position,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch tasks by project:", error);
    throw new Error("Failed to fetch tasks");
  }
}

export async function getTaskStatsByWorkspace(
  workspaceId: string,
): Promise<TaskStats> {
  try {
    await connectDB();

    const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);

    const [statusStats, priorityStats] = await Promise.all([
      Task.aggregate([
        {
          $match: { workspaceId: workspaceObjectId },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Task.aggregate([
        {
          $match: { workspaceId: workspaceObjectId },
        },
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const byStatus: TaskStats["byStatus"] = {
      todo: 0,
      "in-progress": 0,
      "in-review": 0,
      done: 0,
    };

    const byPriority: TaskStats["byPriority"] = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    for (const stat of statusStats) {
      if (stat._id in byStatus) {
        byStatus[stat._id as keyof TaskStats["byStatus"]] = stat.count;
      }
    }

    for (const stat of priorityStats) {
      if (stat._id in byPriority) {
        byPriority[stat._id as keyof TaskStats["byPriority"]] = stat.count;
      }
    }

    return {
      byStatus,
      byPriority,
    };
  } catch (error) {
    console.error("Failed to fetch task stats:", error);
    throw new Error("Failed to fetch task stats");
  }
}
