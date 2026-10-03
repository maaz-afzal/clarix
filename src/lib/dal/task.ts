import connectDB from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import mongoose from "mongoose";

export interface TaskItem {
  _id: string;
  projectId: string;
  workspaceId: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "in-review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assigneeId?: string;
  assignee?: {
    _id: string;
    name: string;
    image?: string;
  };
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
  filters?: {
    status?: string;
    priority?: string;
    assigneeId?: string;
  },
): Promise<TaskItem[]> {
  try {
    await connectDB();

    const query: Record<string, unknown> = {
      projectId: new mongoose.Types.ObjectId(projectId),
    };

    if (filters?.status) query.status = filters.status;
    if (filters?.priority) query.priority = filters.priority;
    if (filters?.assigneeId) {
      query.assigneeId = new mongoose.Types.ObjectId(filters.assigneeId);
    }

    const tasks = await Task.find(query)
      .populate<{
        assigneeId: {
          _id: mongoose.Types.ObjectId;
          name: string;
          image?: string;
        };
      }>("assigneeId", "name image")
      .sort({ position: 1 })
      .lean();

    return tasks.map((task) => {
      const assignee = task.assigneeId as {
        _id: mongoose.Types.ObjectId;
        name: string;
        image?: string;
      } | null;

      return {
        _id: task._id.toString(),
        projectId: task.projectId.toString(),
        workspaceId: task.workspaceId.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeId: assignee?._id.toString(),
        assignee: assignee
          ? {
              _id: assignee._id.toString(),
              name: assignee.name,
              image: assignee.image,
            }
          : undefined,
        createdBy: task.createdBy.toString(),
        dueDate: task.dueDate?.toISOString(),
        position: task.position,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      };
    });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
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

export async function getTaskById(taskId: string): Promise<TaskItem | null> {
  try {
    await connectDB();

    const task = await Task.findById(taskId)
      .populate<{
        assigneeId: {
          _id: mongoose.Types.ObjectId;
          name: string;
          image?: string;
        };
      }>("assigneeId", "name image")
      .lean();

    if (!task) return null;

    const assignee = task.assigneeId as {
      _id: mongoose.Types.ObjectId;
      name: string;
      image?: string;
    } | null;

    return {
      _id: task._id.toString(),
      projectId: task.projectId.toString(),
      workspaceId: task.workspaceId.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: assignee?._id.toString(),
      assignee: assignee
        ? {
            _id: assignee._id.toString(),
            name: assignee.name,
            image: assignee.image,
          }
        : undefined,
      createdBy: task.createdBy.toString(),
      dueDate: task.dueDate?.toISOString(),
      position: task.position,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return null;
  }
}