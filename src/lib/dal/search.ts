import connectDB from "@/lib/db";
import Task from "@/models/Task";
import Project from "@/models/Project";
import mongoose from "mongoose";

export interface SearchResult {
  tasks: SearchTask[];
  projects: SearchProject[];
  totalCount: number;
}

export interface SearchTask {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  projectId: string;
  projectName: string;
  dueDate?: string;
}

export interface SearchProject {
  _id: string;
  name: string;
  description?: string;
  color: string;
  status: string;
  taskCount: number;
}

export async function searchWorkspace(
  workspaceId: string,
  query: string,
  type?: "task" | "project",
): Promise<SearchResult> {
  if (!query.trim() || query.trim().length < 2) {
    return { tasks: [], projects: [], totalCount: 0 };
  }

  try {
    await connectDB();

    const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);
    const cleanQuery = query.trim();

    const taskPromise =
      type === "project"
        ? Promise.resolve([])
        : Task.find({
            $text: { $search: cleanQuery },
            workspaceId: workspaceObjectId,
          })
            .select("title description status priority projectId dueDate")
            .sort({ score: { $meta: "textScore" } })
            .limit(10)
            .lean();

    const projectPromise =
      type === "task"
        ? Promise.resolve([])
        : Project.find({
            $text: { $search: cleanQuery },
            workspaceId: workspaceObjectId,
          })
            .select("name description color status")
            .sort({ score: { $meta: "textScore" } })
            .limit(5)
            .lean();

    const [tasks, projects] = await Promise.all([taskPromise, projectPromise]);

    if (tasks.length === 0 && projects.length === 0) {
      return searchFallback(workspaceId, query, type);
    }

    let taskResults: SearchTask[] = [];

    if (tasks.length > 0) {
      const projectIds = [...new Set(tasks.map((t) => t.projectId))];
      const taskProjects = await Project.find({ _id: { $in: projectIds } })
        .select("name")
        .lean();

      const projectMap = taskProjects.reduce(
        (acc, p) => {
          acc[p._id.toString()] = p.name;
          return acc;
        },
        {} as Record<string, string>,
      );

      taskResults = tasks.map((t) => ({
        _id: t._id.toString(),
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId.toString(),
        projectName: projectMap[t.projectId.toString()] ?? "Unknown",
        dueDate: t.dueDate?.toISOString(),
      }));
    }

    let projectResults: SearchProject[] = [];

    if (projects.length > 0) {
      const projectIds = projects.map((p) => p._id);
      const taskCounts = await Task.aggregate([
        {
          $match: {
            workspaceId: workspaceObjectId,
            projectId: { $in: projectIds },
          },
        },
        {
          $group: {
            _id: "$projectId",
            count: { $sum: 1 },
          },
        },
      ]);

      const countMap = taskCounts.reduce(
        (acc, tc) => {
          acc[tc._id.toString()] = tc.count;
          return acc;
        },
        {} as Record<string, number>,
      );

      projectResults = projects.map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        description: p.description,
        color: p.color,
        status: p.status,
        taskCount: countMap[p._id.toString()] ?? 0,
      }));
    }

    return {
      tasks: taskResults,
      projects: projectResults,
      totalCount: taskResults.length + projectResults.length,
    };
  } catch (error) {
    console.error("Search error:", error);
    return searchFallback(workspaceId, query, type);
  }
}

async function searchFallback(
  workspaceId: string,
  query: string,
  type?: "task" | "project",
): Promise<SearchResult> {
  const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);
  const regex = new RegExp(query.trim(), "i");

  try {
    const [tasks, projects] = await Promise.all([
      type === "project"
        ? Promise.resolve([])
        : Task.find({
            workspaceId: workspaceObjectId,
            $or: [{ title: regex }, { description: regex }],
          })
            .select("title description status priority projectId dueDate")
            .limit(10)
            .lean(),

      type === "task"
        ? Promise.resolve([])
        : Project.find({
            workspaceId: workspaceObjectId,
            $or: [{ name: regex }, { description: regex }],
          })
            .select("name description color status")
            .limit(5)
            .lean(),
    ]);

    const projectIds = projects.map((p) => p._id);

    const taskCounts = await Task.aggregate([
      {
        $match: {
          workspaceId: workspaceObjectId,
          projectId: { $in: projectIds },
        },
      },
      {
        $group: {
          _id: "$projectId",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = taskCounts.reduce(
      (acc, tc) => {
        acc[tc._id.toString()] = tc.count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const taskProjectIds = [...new Set(tasks.map((t) => t.projectId))];
    const taskProjects = await Project.find({ _id: { $in: taskProjectIds } })
      .select("name")
      .lean();

    const projectMap = taskProjects.reduce(
      (acc, p) => {
        acc[p._id.toString()] = p.name;
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      tasks: tasks.map((t) => ({
        _id: t._id.toString(),
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId.toString(),
        projectName: projectMap[t.projectId.toString()] ?? "Unknown",
        dueDate: t.dueDate?.toISOString(),
      })),
      projects: projects.map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        description: p.description,
        color: p.color,
        status: p.status,
        taskCount: countMap[p._id.toString()] ?? 0,
      })),
      totalCount: tasks.length + projects.length,
    };
  } catch {
    return { tasks: [], projects: [], totalCount: 0 };
  }
}
