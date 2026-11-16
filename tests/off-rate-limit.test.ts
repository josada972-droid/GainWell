import { beforeEach, describe, expect, it, vi } from "vitest";

// The privileged client is mocked here: this suite checks the caller's
// fail-closed contract with controlled RPC results, no live Open Food Facts
// requests and no live database. Real grants, buckets and limits are verified
// against the actual Supabase in tests/security-hardening.test.ts.
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { takeOffRateLimit } from "@/lib/food/off-rate-limit";

/**
 * Rate-limiter caller tests (Stage 4 hardening): `takeOffRateLimit` proceeds
 * only when the shared limiter answers exactly `true`. Anything else — false,
 * NULL, an RPC error, a throw, or no privileged client at all — denies the
 * outbound request. The RPC also takes a bucket name only, so a caller cannot
 * pass a limit or a window.
 */

const mockedGet = vi.mocked(getSupabaseAdminClient);

function stubClient(rpc: () => Promise<{ data: unknown; error: unknown }>) {
  return { rpc } as unknown as ReturnType<typeof getSupabaseAdminClient>;
}

beforeEach(() => {
  mockedGet.mockReset();
});

describe("takeOffRateLimit fails closed", () => {
  it("denies when no privileged client is configured", async () => {
    mockedGet.mockReturnValue(null);
    expect(await takeOffRateLimit("search")).toBe(false);
  });

  it("admits only an exact `true`", async () => {
    mockedGet.mockReturnValue(
      stubClient(async () => ({ data: true, error: null })),
    );
    expect(await takeOffRateLimit("product")).toBe(true);
  });

  it("denies `false`, `null`, and `undefined`", async () => {
    for (const data of [false, null, undefined, 1, "true"]) {
      mockedGet.mockReturnValue(
        stubClient(async () => ({ data, error: null })),
      );
      expect(await takeOffRateLimit("search"), String(data)).toBe(false);
    }
  });

  it("denies when the RPC errors or throws", async () => {
    mockedGet.mockReturnValue(
      stubClient(async () => ({ data: null, error: { message: "42501" } })),
    );
    expect(await takeOffRateLimit("search")).toBe(false);

    mockedGet.mockReturnValue(
      stubClient(async () => {
        throw new Error("network");
      }),
    );
    expect(await takeOffRateLimit("product")).toBe(false);
  });

  it("asks for a bucket only — no caller-supplied limit or window", async () => {
    const rpc = vi.fn(async () => ({ data: true, error: null }));
    mockedGet.mockReturnValue(stubClient(rpc));
    await takeOffRateLimit("search");
    expect(rpc).toHaveBeenCalledWith("off_rate_limit_take", {
      p_bucket: "search",
    });
  });
});
