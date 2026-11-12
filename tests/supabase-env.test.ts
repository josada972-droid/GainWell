import { afterEach, describe, expect, it } from "vitest";

import { readSupabaseEnv, readSupabasePublicEnv } from "@/lib/supabase/env";

const ORIGINAL = { ...process.env };

afterEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL.NEXT_PUBLIC_SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
    ORIGINAL.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  process.env.SUPABASE_SECRET_KEY = ORIGINAL.SUPABASE_SECRET_KEY;
});

function setEnv(values: Record<string, string | undefined>) {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  delete process.env.SUPABASE_SECRET_KEY;
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) process.env[key] = value;
  }
}

describe("supabase env validation", () => {
  it("returns null when nothing is configured (fail closed, no throw)", () => {
    setEnv({});
    expect(readSupabasePublicEnv()).toBeNull();
    expect(readSupabaseEnv()).toBeNull();
  });

  it("returns null when the URL is not a URL", () => {
    setEnv({
      NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
    });
    expect(readSupabasePublicEnv()).toBeNull();
  });

  it("returns the public pair when both values are present", () => {
    setEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://ref.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
    });
    expect(readSupabasePublicEnv()).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://ref.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
    });
  });

  it("attaches the server-only secret when present, without ever printing it", () => {
    setEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://ref.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
      SUPABASE_SECRET_KEY: "sb_secret_y",
    });
    const env = readSupabaseEnv();
    expect(env?.secretKey).toBe("sb_secret_y");
    // The public view must not carry the secret.
    expect(readSupabasePublicEnv()).not.toHaveProperty("secretKey");
  });

  it("treats an empty secret as absent", () => {
    setEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://ref.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
      SUPABASE_SECRET_KEY: "",
    });
    expect(readSupabaseEnv()?.secretKey).toBeUndefined();
  });
});
