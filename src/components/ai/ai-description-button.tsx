"use client";

import { useTransition } from "react";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { generateTaskDescription } from "@/actions/ai";

interface AIDescriptionButtonProps {
  workspaceSlug: string;
  projectName?: string;
  getTitle: () => string;
  onGenerated: (text: string) => void;
}

export default function AIDescriptionButton({
  workspaceSlug,
  projectName,
  getTitle,
  onGenerated,
}: AIDescriptionButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    const title = getTitle().trim();

    if (!title || title.length < 3) {
      toast.error("Please enter a task title first (at least 3 characters)");
      return;
    }

    startTransition(async () => {
      const result = await generateTaskDescription(workspaceSlug, {
        title,
        projectName,
      });

      if (!result.success) {
        toast.error(result.error || "Could not generate description");
        return;
      }

      onGenerated(result.text!);
      toast.success("AI generated the description!");
    });
  }

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={isPending}
      className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <span className="h-3 w-3 border border-primary border-t-transparent rounded-full animate-spin" />
      ) : (
        <Sparkles className="w-3 h-3" />
      )}
      {isPending ? "Generating..." : "Generate with AI"}
    </button>
  );
}
