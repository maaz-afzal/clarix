import { getTasksByProject } from "@/lib/dal/task";
import { getWorkspaceBySlug } from "@/lib/dal/workspace";
import { getWorkspaceMembers } from "@/lib/dal/members";
import TaskCard from "@/components/tasks/task-card";

type Props = {
  params: Promise<{
    workspaceSlug: string;
    projectId: string;
  }>;
};

export default async function BoardPage({ params }: Props) {
  const { workspaceSlug, projectId } = await params;

  const workspace = await getWorkspaceBySlug(workspaceSlug);

  if (!workspace) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Workspace not found</h1>
      </div>
    );
  }

  const [tasks, members] = await Promise.all([
    getTasksByProject(projectId),
    getWorkspaceMembers(workspace._id),
  ]);

  const grouped = {
    todo: tasks.filter((task) => task.status === "todo"),
    "in-progress": tasks.filter((task) => task.status === "in-progress"),
    "in-review": tasks.filter((task) => task.status === "in-review"),
    done: tasks.filter((task) => task.status === "done"),
  };

  const columns = [
    {
      id: "todo",
      title: "To Do",
      tasks: grouped.todo,
    },
    {
      id: "in-progress",
      title: "In Progress",
      tasks: grouped["in-progress"],
    },
    {
      id: "in-review",
      title: "In Review",
      tasks: grouped["in-review"],
    },
    {
      id: "done",
      title: "Done",
      tasks: grouped.done,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <p className="text-muted-foreground">{workspace.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex min-h-125 flex-col rounded-lg border bg-muted/30 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{column.title}</h2>

              <span className="rounded-md bg-muted px-2 py-1 text-sm text-muted-foreground">
                {column.tasks.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-3">
              {column.tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  workspaceSlug={workspaceSlug}
                />
              ))}

              {column.tasks.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No tasks
                </p>
              )}
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Add task
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
