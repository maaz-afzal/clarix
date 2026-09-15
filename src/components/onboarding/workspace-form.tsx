"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { generateSlug } from "@/lib/utils";
import { createWorkspace } from "@/actions/workspace";

export default function WorkspaceForm() {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [isPending, startTransition] = useTransition();

  const slug = generateSlug(workspaceName);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createWorkspace(formData);

      if (!result.success) {
        toast.error(result.error || "Something went wrong!");
        return;
      }

      toast.success("Workspace successfully created");
      router.push(`/${result.slug}/dashboard`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Workspace Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="My Company"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          disabled={isPending}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors disabled:opacity-50"
        />

        {slug && (
          <p className="text-xs text-muted-foreground">
            URL:{" "}
            <span className="font-mono text-foreground">clarix.com/{slug}</span>
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || !workspaceName.trim()}
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
