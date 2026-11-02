"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"

export function useRetry(reset: () => void) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function retry() {
    startTransition(() => {
      router.refresh()
      reset()
    })
  }

  return { retry, isPending }
}