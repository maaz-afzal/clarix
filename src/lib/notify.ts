import toast from "react-hot-toast"

export const notify = {
  success: (message: string) => toast.success(message, { id: message }),
  error: (message: string) => toast.error(message, { id: message }),
}

// Server Action ka result le kar sahi toast dikhao.
// Success par true, failure par false return karta hai.
export function notifyResult(
  result: { success: boolean; error?: string },
  successMessage: string
): boolean {
  if (result.success) {
    notify.success(successMessage)
    return true
  }
  notify.error(result.error ?? "Something went wrong")
  return false
}