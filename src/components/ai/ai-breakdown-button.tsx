"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2, Plus, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { createTask } from "@/actions/task";
import { generateTaskBreakdown } from "@/actions/ai";

type Props = {
  workspaceSlug: string;
  projectId: string;
  title: string;
  description?: string;
  projectName?: string;
};

export default function AIBreakdownButton({
  workspaceSlug,
  projectId,
  title,
  description,
  projectName,
}: Props) {
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [creatingIndex, setCreatingIndex] = useState<number | null>(null);
  const [createdSubtasks, setCreatedSubtasks] = useState<number[]>([]);
  const [isGenerating, startGenerating] = useTransition();
  const [isCreating, startCreating] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleGenerate() {
    setError(null);
    setSubtasks([]);
    setCreatedSubtasks([]);

    startGenerating(async () => {
      try {
        const result = await generateTaskBreakdown(workspaceSlug, {
          title,
          description,
          projectName,
        });

        if (!result.success) {
          setError(result.error ?? "Failed to generate subtasks.");
          return;
        }

        setSubtasks(result.subtasks ?? []);
      } catch {
        setError("Could not generate subtasks. Please try again.");
      }
    });
  }

  function handleCreate(index: number, subtask: string) {
    setCreatingIndex(index);
    setError(null);

    startCreating(async () => {
      try {
        const result = await createTask(workspaceSlug, projectId, {
          title: subtask,
          status: "todo",
          priority: "medium",
        });

        if (!result.success) {
          setError(result.error ?? "Failed to create the task.");
          return;
        }

        setCreatedSubtasks((previous) => [...previous, index]);
        toast.success("Subtask created successfully");
      } catch {
        setError("Could not create the task. Please try again.");
      } finally {
        setCreatingIndex(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || !title.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {isGenerating ? "Generating..." : "Break down task"}
      </button>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 p-3 text-sm text-destructive">
          <X className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {subtasks.length > 0 && (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold">Suggested subtasks</h4>
            <p className="text-xs text-muted-foreground">
              Select which subtasks you want to create.
            </p>
          </div>

          <ul className="space-y-3">
            {subtasks.map((subtask, index) => {
              const isCreated = createdSubtasks.includes(index);
              const isThisCreating = creatingIndex === index;

              return (
                <li
                  key={`${index}-${subtask}`}
                  className="space-y-2 rounded-md border p-3"
                >
                  <p className="wrap-break-words text-sm">{subtask}</p>

                  <button
                    type="button"
                    onClick={() => handleCreate(index, subtask)}
                    disabled={isCreating || isCreated}
                    className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs font-medium hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isThisCreating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isCreated ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}

                    {isCreated
                      ? "Created"
                      : isThisCreating
                        ? "Creating..."
                        : "Create as task"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
