"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  MoreHorizontal,
  Calendar,
  AlertCircle,
  Trash2,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn, formatDate } from "@/lib/utils";
import { deleteTask } from "@/actions/task";
import type { TaskItem } from "@/lib/dal/task";

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "text-slate-500" },
  medium: { label: "Medium", color: "text-blue-500" },
  high: { label: "High", color: "text-orange-500" },
  urgent: { label: "Urgent", color: "text-red-500" },
};

interface TaskCardProps {
  task: TaskItem;
  workspaceSlug: string;
  projectId: string;
  onEdit?: (task: TaskItem) => void;
  isDragging?: boolean;
}

export default function TaskCard({
  task,
  workspaceSlug,
  projectId,
  onEdit,
  isDragging = false,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done";

  const priority = PRIORITY_CONFIG[task.priority];

  function handleDelete() {
    setMenuOpen(false);
    if (!confirm("Are you sure you want to delete this task?")) return;

    startTransition(async () => {
      const result = await deleteTask(workspaceSlug, task._id);
      if (!result.success) toast.error(result.error || "Failed to delete task");
      else toast.success("Task deleted successfully!");
    });
  }

  return (
    <div
      className={cn(
        "bg-card border rounded-lg p-3 space-y-2 cursor-grab active:cursor-grabbing group",
        isDragging && "shadow-lg rotate-1 opacity-90",
        isPending && "opacity-50",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/${workspaceSlug}/projects/${projectId}/tasks/${task._id}`}
          className="text-sm font-medium line-clamp-2 flex-1 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {task.title}
        </Link>

        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-accent"
          >
            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-5 z-20 bg-card border rounded-lg shadow-md min-w-32 py-1">
                {onEdit && (
                  <button
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(task);
                    }}
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                )}
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-accent text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-1">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <span className={cn("text-xs font-medium", priority.color)}>
            {priority.label}
          </span>

          {/* Due date */}
          {task.dueDate && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {isOverdue ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <Calendar className="w-3 h-3" />
              )}
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>

        {/* Assignee */}
        {task.assignee && (
          <div
            className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0"
            title={task.assignee.name}
          >
            {task.assignee.image ? (
              <img
                src={task.assignee.image}
                alt={task.assignee.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-primary">
                {task.assignee.name.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
