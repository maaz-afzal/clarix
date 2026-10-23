"use client"

import { useState, useTransition } from "react"
import { Sparkles, RefreshCw, X } from "lucide-react"
import toast from "react-hot-toast"
import { generateProjectSummary } from "@/actions/ai"

interface ProjectSummaryProps {
  workspaceSlug: string
  projectName: string
  stats: {
    total: number
    todo: number
    inProgress: number
    inReview: number
    done: number
    overdue: number
  }
}

export default function ProjectSummary({
  workspaceSlug,
  projectName,
  stats,
}: ProjectSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleGenerate() {
    if (stats.total === 0) {
      toast.error("Project must have tasks to generate a summary")
      return
    }

    startTransition(async () => {
      const result = await generateProjectSummary(
        workspaceSlug,
        projectName,
        stats
      )

      if (!result.success) {
        toast.error(result.error || "Could not generate project summary")
        return
      }

      setSummary(result.text ?? null)
    })
  }

  return (
    <div className="border rounded-xl p-4 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">AI Summary</h3>
        </div>
        <div className="flex items-center gap-2">
          {summary && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              title="Regenerate"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending || stats.total === 0}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <>
                <span className="h-3 w-3 border border-primary border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                {summary ? "Regenerate" : "Generate"}
              </>
            )}
          </button>
        </div>
      </div>

      {summary ? (
        <div className="relative">
          <p className="text-sm text-muted-foreground leading-relaxed pr-6">
            {summary}
          </p>
          <button
            type="button"
            onClick={() => setSummary(null)}
            className="absolute top-0 right-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {stats.total === 0
            ? "Add tasks first, then generate a summary"
            : "Generate an AI-powered status summary of the project"}
        </p>
      )}
    </div>
  );
}