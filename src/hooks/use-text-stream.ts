"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type StreamResult =
  | { ok: true; text: string }
  | { ok: false; text: string; error?: string; aborted?: boolean }

interface StartOptions {
  url: string
  body: unknown
  onChunk: (fullText: string) => void
}

export function useTextStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  const stop = useCallback(() => {
    controllerRef.current?.abort()
  }, [])

  useEffect(() => {
    return () => controllerRef.current?.abort()
  }, [])

  const start = useCallback(
    async ({ url, body, onChunk }: StartOptions): Promise<StreamResult> => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller
      setIsStreaming(true)

      let text = ""

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          return {
            ok: false,
            text,
            error: data?.error ?? "Request failed. Please try again.",
          }
        }

        if (!response.body) {
          return { ok: false, text, error: "No response received." }
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          text += decoder.decode(value, { stream: true })
          onChunk(text)
        }

        text += decoder.decode()
        onChunk(text)

        if (!text.trim()) {
          return {
            ok: false,
            text,
            error: "The AI returned an empty response. Please try again.",
          }
        }

        return { ok: true, text }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return { ok: false, text, aborted: true }
        }
        return { ok: false, text, error: "Connection lost. Please try again." }
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null
          setIsStreaming(false)
        }
      }
    },
    []
  )

  return { start, stop, isStreaming }
}