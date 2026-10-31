export const ERROR_MESSAGES = {
  UNAUTHENTICATED: "Login is required",
  UNAUTHORIZED: "No access",
  FORBIDDEN: "You don't have permission to perform this action",
  NOT_FOUND: "Resource not found",
  INTERNAL: "Something went wrong. Please try again.",
  VALIDATION: "Invalid input",
  RATE_LIMITED: "Too many requests. Please try again later.",
} as const;

export function handleActionError(error: unknown): {
  success: false;
  error: string;
} {
  if (error instanceof Error) {
    if (error.message === "UNAUTHENTICATED") {
      return { success: false, error: ERROR_MESSAGES.UNAUTHENTICATED };
    }
    if (error.message === "UNAUTHORIZED") {
      return { success: false, error: ERROR_MESSAGES.UNAUTHORIZED };
    }
    if (error.message === "FORBIDDEN") {
      return { success: false, error: ERROR_MESSAGES.FORBIDDEN };
    }
  }

  console.error("Unhandled action error:", error);
  return { success: false, error: ERROR_MESSAGES.INTERNAL };
}
