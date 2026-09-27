"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  updateWorkspaceSchema,
  type UpdateWorkspaceInput,
} from "@/lib/validations/workspace";

import { updateWorkspace } from "@/actions/workspace";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type WorkspaceSettingsFormProps = {
  workspaceSlug: string;
  name: string;
  description: string;
  slug: string;
};

export default function WorkspaceSettingsForm({
  workspaceSlug,
  name,
  description,
  slug,
}: WorkspaceSettingsFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name,
      description,
    },
  });

  const onSubmit = async (data: UpdateWorkspaceInput) => {
    try {
      const result = await updateWorkspace(workspaceSlug, data);

      if (!result.success) {
        toast.error(result.error || "Could not update workspace");
        return;
      }

      toast.success("Workspace updated successfully.");
      router.refresh();
    } catch (error) {
      console.error("Workspace update failed:", error);
      toast.error("Could not update workspace. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Workspace Name
        </label>

        <input
          id="name"
          type="text"
          {...register("name")}
          className="w-full rounded-md border px-3 py-2"
        />

        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>

        <textarea
          id="description"
          rows={4}
          {...register("description")}
          className="w-full rounded-md border px-3 py-2"
        />

        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="slug" className="text-sm font-medium">
          Workspace Slug
        </label>

        <input
          id="slug"
          type="text"
          value={slug}
          disabled
          className="w-full rounded-md border px-3 py-2 bg-muted"
        />

        <p className="text-sm text-muted-foreground">
          Workspace slug cannot be changed.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
