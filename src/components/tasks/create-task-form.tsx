"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { createTaskSchema, type CreateTaskInput } from "@/lib/validations/task";
import { createTask } from "@/actions/task";
import { generateTaskDescription } from "@/actions/ai";
import AIDescriptionButton from "../ai/ai-description-button";

interface Member {
  userId: string;
  user: { name: string; image?: string };
}

interface CreateTaskFormProps {
  workspaceSlug: string;
  projectId: string;
  projectName?: string;
  members: { userId: string; user: { name: string; image?: string } }[];
  defaultStatus?: string;
  onSuccess?: () => void;
}

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

export default function CreateTaskForm({
  workspaceSlug,
  projectId,
  projectName,
  members,
  defaultStatus = "todo",
  onSuccess,
}: CreateTaskFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      status: defaultStatus as CreateTaskInput["status"],
      priority: "medium",
    },
  });

  function onSubmit(data: CreateTaskInput) {
    startTransition(async () => {
      const result = await createTask(workspaceSlug, projectId, data);

      if (!result.success) {
        toast.error(result.error || "Failed to create task");
        return;
      }

      toast.success("Task created successfully!");
      reset();
      onSuccess?.();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Title <span className="text-destructive">*</span>
        </label>
        <input
          {...register("title")}
          placeholder="Task Name"
          disabled={isPending}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Description</label>
          <AIDescriptionButton
            workspaceSlug={workspaceSlug}
            projectName={projectName}
            getTitle={() => watch("title")}
            onGenerated={(text) => setValue("description", text)}
          />
        </div>
        <textarea
          {...register("description")}
          placeholder="Task Description"
          rows={3}
          disabled={isPending}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 resize-none"
        />
      </div>

      {/* Status + Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Status</label>
          <select
            {...register("status")}
            disabled={isPending}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Priority</label>
          <select
            {...register("priority")}
            disabled={isPending}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignee + Due Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Assignee</label>
          <select
            {...register("assigneeId")}
            disabled={isPending}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Due Date</label>
          <input
            type="date"
            {...register("dueDate")}
            disabled={isPending}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Creating...
          </>
        ) : (
          "Create Task"
        )}
      </button>
    </form>
  );
}
