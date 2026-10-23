"use client";

import { useTransition } from "react";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { generatePrioritySuggestion } from "@/actions/ai";

interface PrioritySuggesterProps {
  workspaceSlug: string;
  taskTitle: string;
  taskDescription?: string;
  currentPriority: string;
  onAccept: (priority: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-slate-600 bg-slate-100",
  medium: "text-blue-600 bg-blue-100",
  high: "text-orange-600 bg-orange-100",
  urgent: "text-red-600 bg-red-100",
};

export default function PrioritySuggester({
  workspaceSlug,
  taskTitle,
  taskDescription,
  currentPriority,
  onAccept,
}: PrioritySuggesterProps) {
  const [isPending, startTransition] = useTransition();

  function handleSuggest() {
    if (!taskTitle.trim() || taskTitle.trim().length < 3) {
      toast.error("Task title must be at least 3 characters long");
      return;
    }

    startTransition(async () => {
      const result = await generatePrioritySuggestion(workspaceSlug, {
        title: taskTitle,
        description: taskDescription,
      });

      if (!result.success) {
        toast.error(result.error || "Could not generate priority suggestion");
        return;
      }

      if (result.priority && result.priority !== currentPriority) {
        toast(
          (t) => (
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium">AI ka suggestion</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Priority:{" "}
                  <span
                    className={`font-semibold ${PRIORITY_COLORS[result.priority!]?.split(" ")[0]}`}
                  >
                    {result.priority}
                  </span>
                </p>
                {result.reason && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.reason}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => {
                    onAccept(result.priority!);
                    toast.dismiss(t.id);
                  }}
                  className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="text-xs px-2 py-1 bg-muted rounded"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ),
          { duration: 8000 },
        );
      } else if (result.priority === currentPriority) {
        toast.success(`Current priority "${currentPriority}" is correct!`);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleSuggest}
      disabled={isPending}
      className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
      title="Get priority suggested by AI"
    >
      {isPending ? (
        <span className="h-3 w-3 border border-primary border-t-transparent rounded-full animate-spin" />
      ) : (
        <Sparkles className="w-3 h-3" />
      )}
      {isPending ? "Thinking..." : "Suggest"}
    </button>
  );
}
