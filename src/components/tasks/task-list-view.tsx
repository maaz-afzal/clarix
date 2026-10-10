"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { cn, formatDate } from "@/lib/utils";
import { updateTask, deleteTask } from "@/actions/task";
import type { TaskItem } from "@/lib/dal/task";
import type { MemberWithUser } from "@/lib/dal/members";
import CreateTaskForm from "./create-task-form";
import Link from "next/link";

const STATUS_OPTIONS = ["todo", "in-progress", "in-review", "done"];
const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"];

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-600",
  urgent: "bg-red-100 text-red-600",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-slate-100 text-slate-600",
  "in-progress": "bg-blue-100 text-blue-600",
  "in-review": "bg-purple-100 text-purple-600",
  done: "bg-green-100 text-green-600",
};

interface TaskListViewProps {
  tasks: TaskItem[];
  members: MemberWithUser[];
  workspaceSlug: string;
  projectId: string;
  currentUserId: string;
  canManage: boolean;
}

export default function TaskListView({
  tasks,
  members,
  workspaceSlug,
  projectId,
  currentUserId,
  canManage,
}: TaskListViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  const hasFilters =
    searchParams.has("status") ||
    searchParams.has("priority") ||
    searchParams.has("assignee");

  function handleStatusChange(taskId: string, newStatus: string) {
    startTransition(async () => {
      const result = await updateTask(workspaceSlug, taskId, {
        status: newStatus as TaskItem["status"],
      });
      if (!result.success) toast.error(result.error || "Failed to update task status");
    });
  }

  function handleDelete(taskId: string) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    startTransition(async () => {
      const result = await deleteTask(workspaceSlug, taskId);
      if (!result.success) toast.error(result.error || "Failed to delete task");
      else toast.success("Task deleted successfully");
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b px-6 py-3 flex items-center gap-3 flex-wrap">
        {/* Status filter */}
        <select
          value={searchParams.get("status") ?? ""}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="text-sm border rounded-md px-2 py-1 bg-background"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace("-", " ")}
            </option>
          ))}
        </select>

        {/* Priority filter */}
        <select
          value={searchParams.get("priority") ?? ""}
          onChange={(e) => updateFilter("priority", e.target.value)}
          className="text-sm border rounded-md px-2 py-1 bg-background"
        >
          <option value="">All Priority</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {/* Assignee filter */}
        <select
          value={searchParams.get("assignee") ?? ""}
          onChange={(e) => updateFilter("assignee", e.target.value)}
          className="text-sm border rounded-md px-2 py-1 bg-background"
        >
          <option value="">All Assignees</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.user.name}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}

        <div className="ml-auto">
          {canManage && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <div className="border-b px-6 py-4 bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">New Task</h3>
            <button onClick={() => setShowCreateForm(false)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <CreateTaskForm
            workspaceSlug={workspaceSlug}
            projectId={projectId}
            members={members.map((m) => ({
              userId: m.userId,
              user: { name: m.user.name, image: m.user.image },
            }))}
            onSuccess={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Task Table */}
      <div className="flex-1 overflow-auto">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-muted-foreground">
                {hasFilters
                  ? "Filters do not match any tasks"
                  : "No tasks available"}
              </p>
              {!hasFilters && canManage && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Create First Task
                </button>
              )}
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground w-[40%]">
                  Title
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Priority
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Assignee
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Due Date
                </th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks.map((task) => {
                const isOverdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== "done";

                return (
                  <tr
                    key={task._id}
                    className={cn(
                      "group hover:bg-muted/30 transition-colors",
                      isPending && "opacity-50",
                    )}
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/${workspaceSlug}/projects/${projectId}/tasks/${task._id}`}
                        className="font-medium line-clamp-1 hover:underline hover:text-primary transition-colors"
                      >
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task._id, e.target.value)
                        }
                        disabled={isPending}
                        className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer",
                          STATUS_COLORS[task.status],
                        )}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("-", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          PRIORITY_COLORS[task.priority],
                        )}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                            {task.assignee.image ? (
                              <img
                                src={task.assignee.image}
                                alt={task.assignee.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-semibold text-primary">
                                {task.assignee.name[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {task.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {task.dueDate ? (
                        <span
                          className={cn(
                            "text-xs",
                            isOverdue
                              ? "text-destructive font-medium"
                              : "text-muted-foreground",
                          )}
                        >
                          {formatDate(task.dueDate)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No date
                        </span>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(task._id)}
                          disabled={isPending}
                          className="opacity-0 group-hover:opacity-100 text-xs text-destructive hover:underline disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
