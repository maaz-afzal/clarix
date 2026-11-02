"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import ErrorState from "@/components/shared/error-state"
import { useRetry } from "@/hooks/use-retry"

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProjectError({ error, reset }: Props) {
  const { retry, isPending } = useRetry(reset)
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorState
      title="Could not load project"
      description="There was a problem loading this project's data. Please try again."
      digest={error.digest}
    >
      <button
        type="button"
        onClick={retry}
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {isPending ? "Retrying..." : "Try Again"}
      </button>
      <Link
        href={`/${workspaceSlug}/projects`}
        className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
      >
        Go to Projects
      </Link>
    </ErrorState>
  );
}