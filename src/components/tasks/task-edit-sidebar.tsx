"use client";

import { useId, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { updateTask } from "@/actions/task";
import { updateTaskSchema, type UpdateTaskInput } from "@/lib/validations/task";
import type { TaskItem } from "@/lib/dal/task";
import type { MemberWithUser } from "@/lib/dal/members";
import PrioritySuggester from "@/components/ai/priority-suggester";

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
  const uid = useId();
  const [isPending, startTransition] = useTransition();
  const [localValues, setLocalValues] = useState<Partial<UpdateTaskInput>>({});

  const getValue = (field: keyof UpdateTaskInput) => {
    const local = localValues[field];
    if (local !== undefined) return local;
    switch (field) {
      case "status": return task.status;
      case "priority": return task.priority;
      case "assigneeId": return task.assigneeId ?? "";
      case "dueDate": return task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "";
      default: return "";
    }
  };

  function onFieldChange(field: keyof UpdateTaskInput, value: string) {
    setLocalValues((prev) => ({ ...prev, [field]: value }));
    startTransition(async () => {
      const result = await updateTask(workspaceSlug, task._id, {
        [field]: value,
      });
      if (!result.success) {
        toast.error(result.error ?? "Could not update task");
      }
      setLocalValues((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    });
  }

  return (
    <div className="space-y-4 text-sm">
      {/* Status */}
      <div className="space-y-1.5">
        <label htmlFor={`${uid}-status`} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Status
        </label>
        <select
          id={`${uid}-status`}
          value={getValue("status")}
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
        <div className="flex items-center justify-between">
          <label htmlFor={`${uid}-priority`} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Priority
          </label>
          <PrioritySuggester
            workspaceSlug={workspaceSlug}
            taskTitle={task.title}
            taskDescription={task.description}
            currentPriority={getValue("priority") as string}
            onAccept={(p) => onFieldChange("priority", p)}
          />
        </div>
        <select
          id={`${uid}-priority`}
          value={getValue("priority")}
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
        <label htmlFor={`${uid}-assignee`} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Assignee
        </label>
        <select
          id={`${uid}-assignee`}
          value={getValue("assigneeId")}
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
        <label htmlFor={`${uid}-due`} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Due Date
        </label>
        <input
          id={`${uid}-due`}
          type="date"
          value={getValue("dueDate")}
          disabled={isPending}
          onChange={(e) => onFieldChange("dueDate", e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-background disabled:opacity-50"
        />
      </div>

      {isPending && <p className="text-xs text-muted-foreground">Saving...</p>}
    </div>
  );
}
