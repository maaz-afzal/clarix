"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { updateTask } from "@/actions/task";
import { updateTaskSchema, type UpdateTaskInput } from "@/lib/validations/task";
import type { TaskItem } from "@/lib/dal/task";
import type { MemberWithUser } from "@/lib/dal/members";

const STATUS_OPTIONS = [
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In Progress" },
  { value: "in-review", label: "In Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

interface TaskEditSidebarProps {
  task: TaskItem;
  members: MemberWithUser[];
  workspaceSlug: string;
}

export default function TaskEditSidebar({
  task,
  members,
  workspaceSlug,
}: TaskEditSidebarProps) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit } = useForm<UpdateTaskInput>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId ?? "",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    },
  });

  function onFieldChange(field: keyof UpdateTaskInput, value: string) {
    startTransition(async () => {
      const result = await updateTask(workspaceSlug, task._id, {
        [field]: value || undefined,
      });
      if (!result.success) toast.error(result.error || "Could not update task");
    });
  }

  return (
    <div className="space-y-4 text-sm">
      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Status
        </label>
        <select
          defaultValue={task.status}
          disabled={isPending}
          onChange={(e) => onFieldChange("status", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-background disabled:opacity-50"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Priority */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Priority
        </label>
        <select
          defaultValue={task.priority}
          disabled={isPending}
          onChange={(e) => onFieldChange("priority", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-background disabled:opacity-50"
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Assignee */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Assignee
        </label>
        <select
          defaultValue={task.assigneeId ?? ""}
          disabled={isPending}
          onChange={(e) => onFieldChange("assigneeId", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-background disabled:opacity-50"
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.user.name}
            </option>
          ))}
        </select>
      </div>

      {/* Due Date */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Due Date
        </label>
        <input
          type="date"
          defaultValue={
            task.dueDate
              ? new Date(task.dueDate).toISOString().split("T")[0]
              : ""
          }
          disabled={isPending}
          onChange={(e) => onFieldChange("dueDate", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-background disabled:opacity-50"
        />
      </div>

      {isPending && <p className="text-xs text-muted-foreground">Saving...</p>}
    </div>
  );
}
