import { unstable_rethrow } from "next/navigation"

export const ERROR_MESSAGES = {
  UNAUTHENTICATED: "Please log in to continue",
  UNAUTHORIZED: "You do not have access to this workspace",
  FORBIDDEN: "You do not have permission to do this",
  NOT_FOUND: "Resource not found",
  INTERNAL: "Something went wrong. Please try again.",
  VALIDATION: "Invalid input",
  RATE_LIMITED: "Too many requests. Please try again later.",
} as const

export type ActionFailure = { success: false; error: string }

export function handleActionError(error: unknown): ActionFailure {
  unstable_rethrow(error)

  if (error instanceof Error) {
    if (error.message in ERROR_MESSAGES) {
      const key = error.message as keyof typeof ERROR_MESSAGES
      return { success: false, error: ERROR_MESSAGES[key] }
    }
  }

  console.error("Unhandled action error:", error)
  return { success: false, error: ERROR_MESSAGES.INTERNAL }
}

export async function safeAction<T extends { success: boolean }>(
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    return handleActionError(error) as unknown as T
  }
}
