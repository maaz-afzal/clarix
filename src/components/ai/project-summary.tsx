"use client"

import { useState, useEffect } from "react"
import { Sparkles, RefreshCw, X } from "lucide-react"
import { useTextStream } from "@/hooks/use-text-stream"
import { notify } from "@/lib/notify"

interface ProjectSummaryProps {
  workspaceSlug: string
  projectName: string
  projectId: string
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
  projectId,
  stats,
}: ProjectSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const { start, stop, isStreaming } = useTextStream()

  useEffect(() => {
  }, [])

  async function handleGenerate() {
    if (stats.total === 0) {
      notify.error("Project must have tasks to generate a summary")
      return
    }

    const result = await start({
      url: "/api/ai/summary",
      body: { workspaceSlug, projectId },
      onChunk: (text) => {
        setSummary(text)
      },
    })

    if (!result.ok && !result.aborted) {
      notify.error(result.error ?? "Could not generate project summary")
      setSummary(null)
    }
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
              onClick={() => setSummary(null)}
              className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              title="Clear summary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={isStreaming ? stop : handleGenerate}
            disabled={isStreaming || stats.total === 0}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors disabled:opacity-50"
          >
            {isStreaming ? (
              <>
                <span className="h-3 w-3 border border-primary border-t-transparent rounded-full animate-spin" />
                Stop
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
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {stats.total === 0
            ? "Add tasks first, then generate a summary"
            : "Generate an AI-powered status summary of the project"}
        </p>
      )}
    </div>
  )
}