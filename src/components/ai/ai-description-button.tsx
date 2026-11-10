"use client"

import { useEffect, useRef } from "react"
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
  // Current textarea value to save/restore on error
  currentValue: string
  onRestoreValue?: (value: string) => void
}

export default function AIDescriptionButton({
  workspaceSlug,
  projectName,
  getTitle,
  onGenerated,
  onStreamingChange,
  currentValue,
  onRestoreValue,
}: AIDescriptionButtonProps) {
  const { start, stop, isStreaming } = useTextStream()
  const previousValueRef = useRef<string>("")

  useEffect(() => {
    onStreamingChange?.(isStreaming)
  }, [isStreaming, onStreamingChange])

  async function handleGenerate() {
    const title = getTitle().trim()

    if (title.length < 3) {
      notify.error("Write a task title first (at least 3 characters)")
      return
    }

    // Save current value before starting stream
    previousValueRef.current = currentValue

    const result = await start({
      url: "/api/ai/description",
      body: { workspaceSlug, title, projectName },
      onChunk: onGenerated,
    })

    if (!result.ok && !result.aborted) {
      notify.error(result.error ?? "Could not generate a description")
      // Restore previous value on error or empty response
      if (onRestoreValue) {
        onRestoreValue(previousValueRef.current)
      }
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