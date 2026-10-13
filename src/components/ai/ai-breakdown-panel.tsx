"use client";

import { useState, useTransition } from "react";
import { Sparkles, Plus, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { generateTaskBreakdown } from "@/actions/ai";
import { createTask } from "@/actions/task";
import type { TaskItem } from "@/lib/dal/task";

interface AIBreakdownPanelProps {
  task: TaskItem;
  workspaceSlug: string;
  projectName?: string;
}

export default function AIBreakdownPanel({
  task,
  workspaceSlug,
  projectName,
}: AIBreakdownPanelProps) {
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [createdIndexes, setCreatedIndexes] = useState<Set<number>>(new Set());
  const [isGenerating, startGenerating] = useTransition();
  const [isCreating, startCreating] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  function handleGenerate() {
    startGenerating(async () => {
      const result = await generateTaskBreakdown(workspaceSlug, {
        title: task.title,
        description: task.description,
        projectName,
      });

      if (!result.success) {
        toast.error(result.error || "Breakdown cannot be generated");
        return;
      }

      setSubtasks(result.subtasks ?? []);
      setCreatedIndexes(new Set());
      setIsOpen(true);
    });
  }

  function handleCreateSubtask(subtaskTitle: string, index: number) {
    startCreating(async () => {
      const result = await createTask(workspaceSlug, task.projectId, {
        title: subtaskTitle,
        status: "todo",
        priority: task.priority,
        assigneeId: task.assigneeId,
      });

      if (!result.success) {
        toast.error(result.error || "Subtask cannot be created");
        return;
      }

      setCreatedIndexes((prev) => new Set([...prev, index]));
      toast.success("Subtask created!");
    });
  }

  function handleCreateAll() {
    const remaining = subtasks.filter((_, i) => !createdIndexes.has(i));

    if (remaining.length === 0) {
      toast("All subtasks have already been created");
      return;
    }

    startCreating(async () => {
      let successCount = 0;

      for (let i = 0; i < subtasks.length; i++) {
        if (createdIndexes.has(i)) continue;

        const result = await createTask(workspaceSlug, task.projectId, {
          title: subtasks[i],
          status: "todo",
          priority: task.priority,
        });

        if (result.success) {
          successCount++;
          setCreatedIndexes((prev) => new Set([...prev, i]));
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} subtasks created!`);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          AI Breakdown
        </h3>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || isCreating}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          {isGenerating ? "Generating..." : "Generate"}
        </button>
      </div>

      {isOpen && subtasks.length > 0 && (
        <div className="space-y-2">
          {subtasks.map((subtask, index) => {
            const isCreated = createdIndexes.has(index);
            return (
              <div
                key={index}
                className={`flex items-start gap-2 p-2 rounded-md border text-xs ${
                  isCreated ? "bg-muted/50 opacity-60" : "bg-background"
                }`}
              >
                <p className="flex-1 leading-relaxed">{subtask}</p>
                {isCreated ? (
                  <span className="text-green-600 shrink-0 mt-0.5">✓</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCreateSubtask(subtask, index)}
                    disabled={isCreating}
                    className="text-primary hover:text-primary/80 shrink-0 mt-0.5 disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {subtasks.some((_, i) => !createdIndexes.has(i)) && (
            <button
              type="button"
              onClick={handleCreateAll}
              disabled={isCreating}
              className="w-full text-xs py-1.5 border border-dashed rounded-md text-muted-foreground hover:text-foreground hover:border-foreground transition-colors disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create All"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
          >
            <X className="w-3 h-3" />
            Close
          </button>
        </div>
      )}
    </div>
  );
}
