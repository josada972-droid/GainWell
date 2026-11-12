import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "@/lib/auth/redirect";

describe("safeRedirectPath", () => {
  it("accepts plain in-app paths", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("/fr/recipes")).toBe("/fr/recipes");
    expect(safeRedirectPath("/login?confirm=failed")).toBe(
      "/login?confirm=failed",
    );
  });

  it("rejects non-strings and emptiness", () => {
    expect(safeRedirectPath(undefined)).toBeNull();
    expect(safeRedirectPath(null)).toBeNull();
    expect(safeRedirectPath(42)).toBeNull();
    expect(safeRedirectPath("")).toBeNull();
    expect(safeRedirectPath("   ")).toBeNull();
  });

  it("rejects absolute and protocol-relative URLs (open redirects)", () => {
    expect(safeRedirectPath("https://evil.example")).toBeNull();
    expect(safeRedirectPath("http://evil.example/path")).toBeNull();
    expect(safeRedirectPath("//evil.example")).toBeNull();
    expect(safeRedirectPath("/\\evil.example")).toBeNull();
    expect(safeRedirectPath("javascript:alert(1)")).toBeNull();
  });

  it("rejects encoded separators and control characters", () => {
    expect(safeRedirectPath("/%2f%2fevil.example")).toBeNull();
    expect(safeRedirectPath("/dashboard%5c")).toBeNull();
    expect(safeRedirectPath("/dash\nboard")).toBeNull();
    expect(safeRedirectPath("/dashboard\r\nSet-Cookie: x")).toBeNull();
  });

  it("rejects oversized values", () => {
    expect(safeRedirectPath(`/${"a".repeat(512)}`)).toBeNull();
  });
});
