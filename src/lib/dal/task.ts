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
