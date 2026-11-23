import { describe, expect, it } from "vitest";
import { getSafeCallbackUrl } from "@/lib/safe-redirect";

describe("getSafeCallbackUrl", () => {
  it.each([
    ["/dashboard", "/dashboard"],
    ["/ws/projects/1?x=1#h", "/ws/projects/1?x=1#h"],
    ["/ok/path?next=/x", "/ok/path?next=/x"],
  ])("keeps same-site path %s", (input, expected) => {
    expect(getSafeCallbackUrl(input)).toBe(expected);
  });

  it.each([
    "https://example.com/audit",
    "//example.com",
    "///evil.com",
    "/\\example.com",
    "javascript:alert(1)",
    " /foo",
    "/\u0000x",
    "/a\tb",
    "",
    null,
    undefined,
  ])("falls back for %j", (input) => {
    expect(getSafeCallbackUrl(input)).toBe("/onboarding");
  });
});