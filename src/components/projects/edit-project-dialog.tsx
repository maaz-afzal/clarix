"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import {
  updateProjectSchema,
  type UpdateProjectInput,
} from "@/lib/validations/project";
import { updateProject } from "@/actions/project";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface EditProjectDialogProps {
  workspaceSlug: string;
  project: {
    _id: string;
    name: string;
    description?: string;
    color: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProjectDialog({
  workspaceSlug,
  project,
  isOpen,
  onClose,
}: EditProjectDialogProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      color: project.color,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: project.name,
        description: project.description ?? "",
        color: project.color,
      });
    }
  }, [isOpen, project, reset]);

  const selectedColor = watch("color");

  function onSubmit(data: UpdateProjectInput) {
    startTransition(async () => {
      const result = await updateProject(workspaceSlug, project._id, data);

      if (!result.success) {
        toast.error(result.error || "Could not update project.");
        return;
      }

      toast.success("Project updated successfully.");
      onClose();
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project's name, description, and color.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Project Name <span className="text-destructive">*</span>
            </label>
            <input
              {...register("name")}
              disabled={isPending}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              disabled={isPending}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  disabled={isPending}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 disabled:opacity-50 flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
            <input type="hidden" {...register("color")} />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-2 border rounded-lg text-sm hover:bg-accent transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
