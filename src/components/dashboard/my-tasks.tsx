"use client";

import Link from "next/link";
import { Calendar, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { MyTask } from "@/lib/dal/dashboard";

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-slate-500",
  medium: "text-blue-500",
  high: "text-orange-500",
  urgent: "text-red-500",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700",
  "in-progress": "bg-blue-100 text-blue-700",
  "in-review": "bg-purple-100 text-purple-700",
  done: "bg-green-100 text-green-700",
};

interface MyTasksProps {
  tasks: MyTask[];
  workspaceSlug: string;
}

export default function MyTasks({
  tasks,
  workspaceSlug,
}: MyTasksProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No tasks are assigned to you
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
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate group-hover:underline">
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {task.projectName}
              </span>
              {task.dueDate && (
                <>
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Due: {formatDate(task.dueDate)}
                  </span>
                </>
              )}
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  STATUS_COLORS[task.status] ?? STATUS_COLORS.todo
                }`}
              >
                {task.status.replace("-", " ")}
              </span>
            </div>
          </div>
          <span
            className={`text-xs font-medium shrink-0 ${PRIORITY_COLORS[task.priority]}`}
          >
            {task.priority}
          </span>
        </Link>
      ))}
    </div>
  );
}