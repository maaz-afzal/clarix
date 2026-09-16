"use client";

import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { generateSlug } from "@/lib/utils";
import { createWorkspace } from "@/actions/workspace";
import { createWorkspaceSchema, type CreateWorkspaceInput } from "@/lib/validations/workspace";

export default function WorkspaceForm() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const nameValue = watch("name") ?? "";
  const slug = generateSlug(nameValue);

  async function onSubmit(data: CreateWorkspaceInput) {
    startTransition(async () => {
      const result = await createWorkspace(data);

      if (!result.success) {
        toast.error(result.error || "Something went wrong!");
        return;
      }

      toast.success("Workspace successfully created");
      reset();
      router.push(`/${result.slug}/dashboard`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Workspace Name
        </label>

        <input
          id="name"
          type="text"
          placeholder="My Company"
          disabled={isPending}
          {...register("name")}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors disabled:opacity-50"
        />

        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}

        {slug && (
          <p className="text-xs text-muted-foreground">
            URL:{" "}
            <span className="font-mono text-foreground">clarix.com/{slug}</span>
          </p>
        )}
      </div>

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
          "Create Workspace"
        )}
      </button>
    </form>
  );
}
