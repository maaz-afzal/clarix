export async function callAction<
  T extends { success: boolean; error?: string },
>(fn: () => Promise<T>): Promise<T | { success: false; error: string }> {
  try {
    return await fn();
  } catch {
    return { success: false, error: "Connection lost. Please try again." };
  }
}
