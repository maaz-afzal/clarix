import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { OverdueTask } from "@/lib/dal/dashboard";

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-slate-500",
  medium: "text-blue-500",
  high: "text-orange-500",
  urgent: "text-red-500",
};

interface OverdueTasksProps {
  tasks: OverdueTask[];
  workspaceSlug: string;
}

export default function OverdueTasks({
  tasks,
  workspaceSlug,
}: OverdueTasksProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No overdue tasks - great job!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <Link
          key={task._id}
          href={`/${workspaceSlug}/projects/${task.projectId}/tasks/${task._id}`}
          className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors group"
        >
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate group-hover:underline">
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {task.projectName}
              </span>
              <span className="text-xs text-destructive">
                Due: {formatDate(task.dueDate)}
              </span>
            </div>
          </div>
          <span
            className={`text-xs font-medium shrink-0 ${
              PRIORITY_COLORS[task.priority]
            }`}
          >
            {task.priority}
          </span>
        </Link>
      ))}
    </div>
  );
}
