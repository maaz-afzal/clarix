"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/lib/validations/project";
import { createProject } from "@/actions/project";

const PROJECT_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

interface CreateProjectFormProps {
  workspaceSlug: string;
  onSuccess?: () => void;
}

export default function CreateProjectForm({
  workspaceSlug,
  onSuccess,
}: CreateProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      color: "#6366f1",
      status: undefined,
    },
  });

  const selectedColor = watch("color");

  function onSubmit(data: CreateProjectInput) {
    startTransition(async () => {
      const result = await createProject(workspaceSlug, data);

      if (!result.success) {
        toast.error(result.error || "Something went wrong");
        return;
      }

      toast.success("Project Created!");
      reset();
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Project Name */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Project Name <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          {...register("name")}
          placeholder="Website Redesign"
          disabled={isPending}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium">
          Description{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          id="description"
          {...register("description")}
          placeholder="Write something about the project..."
          rows={3}
          disabled={isPending}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 resize-none"
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Color Picker */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Color</label>
        <div className="flex gap-2 flex-wrap">
          {PROJECT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue("color", color)}
              disabled={isPending}
              className="w-7 h-7 rounded-full transition-transform hover:scale-110 disabled:opacity-50"
              style={{ backgroundColor: color }}
            >
              {selectedColor === color && (
                <span className="flex items-center justify-center text-white text-xs font-bold">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
        <input type="hidden" {...register("color")} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Creating...
          </>
        ) : (
          "Create Project"
        )}
      </button>
    </form>
  );
}
