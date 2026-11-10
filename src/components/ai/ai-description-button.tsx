"use client"

import { useEffect } from "react"
import { Sparkles, Square } from "lucide-react"
import { useTextStream } from "@/hooks/use-text-stream"
import { notify } from "@/lib/notify"

interface AIDescriptionButtonProps {
  workspaceSlug: string
  projectName?: string
  getTitle: () => string
  // Har chunk par ab tak ka poora text milta hai
  onGenerated: (text: string) => void
  onStreamingChange?: (isStreaming: boolean) => void
}

export default function AIDescriptionButton({
  workspaceSlug,
  projectName,
  getTitle,
  onGenerated,
  onStreamingChange,
}: AIDescriptionButtonProps) {
  const { start, stop, isStreaming } = useTextStream()

  useEffect(() => {
    onStreamingChange?.(isStreaming)
  }, [isStreaming, onStreamingChange])

  async function handleGenerate() {
    const title = getTitle().trim()

    if (title.length < 3) {
      notify.error("Write a task title first (at least 3 characters)")
      return
    }

    const result = await start({
      url: "/api/ai/description",
      body: { workspaceSlug, title, projectName },
      onChunk: onGenerated,
    })

    if (!result.ok && !result.aborted) {
      notify.error(result.error ?? "Could not generate a description")
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={isStreaming ? stop : handleGenerate}
        className="flex items-center gap-1.5 text-xs text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
      >
        {isStreaming ? (
          <>
            <Square className="h-3 w-3" aria-hidden="true" />
            Stop
          </>
        ) : (
          <>
            <Sparkles className="h-3 h-3" aria-hidden="true" />
            Generate with AI
          </>
        )}
      </button>
      <span role="status" className="sr-only">
        {isStreaming ? "Generating description" : ""}
      </span>
    </>
  )
}