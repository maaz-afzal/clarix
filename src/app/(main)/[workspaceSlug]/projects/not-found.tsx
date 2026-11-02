import Link from "next/link"
import ErrorState from "@/components/shared/error-state"

export default function ProjectNotFound() {
  return (
    <ErrorState
      title="Not Found"
      description="This project or task does not exist, has already been deleted, or is not part of your workspace."
    >
      <Link
        href="/"
        className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
      >
        Go to Home
      </Link>
    </ErrorState>
  );
}