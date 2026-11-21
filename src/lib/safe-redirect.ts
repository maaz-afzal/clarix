export function getSafeCallbackUrl(
  raw: string | null | undefined,
  fallback = "/onboarding",
): string {
  if (!raw) return fallback;

  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return fallback;
  }
  if (/[\u0000-\u001f\\]/.test(raw)) return fallback;

  try {
    const url = new URL(raw, "http://localhost");
    if (url.origin !== "http://localhost") return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}