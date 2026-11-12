import { describe, expect, it } from "vitest";

import { authErrorKey } from "@/lib/auth/errors";

/** Errors shaped like the ones @supabase/supabase-js throws and returns. */
function authApiError(code: string, status: number) {
  return { name: "AuthApiError", code, status };
}

describe("authErrorKey", () => {
  it("maps credential failures to a single generic key", () => {
    expect(authErrorKey(authApiError("invalid_credentials", 400))).toBe(
      "invalidCredentials",
    );
    expect(authErrorKey(authApiError("user_not_found", 400))).toBe(
      "invalidCredentials",
    );
    // Legacy servers send only the HTTP status.
    expect(authErrorKey({ code: "", status: 400 })).toBe("invalidCredentials");
  });

  it("maps a taken email and an unconfirmed email", () => {
    expect(authErrorKey(authApiError("user_already_exists", 422))).toBe(
      "emailTaken",
    );
    expect(authErrorKey({ status: 422 })).toBe("emailTaken");
    expect(authErrorKey(authApiError("email_not_confirmed", 400))).toBe(
      "emailNotConfirmed",
    );
  });

  it("maps rate limits and session loss", () => {
    expect(authErrorKey(authApiError("over_email_send_rate_limit", 429))).toBe(
      "rateLimited",
    );
    expect(authErrorKey(authApiError("refresh_token_not_found", 401))).toBe(
      "sessionExpired",
    );
  });

  it("collapses everything unknown into the generic key", () => {
    expect(authErrorKey(authApiError("some_new_server_code", 500))).toBe(
      "unexpected",
    );
    expect(authErrorKey(new Error("boom"))).toBe("unexpected");
    expect(authErrorKey(null)).toBe("unexpected");
    expect(authErrorKey("weird")).toBe("unexpected");
  });

  it("never echoes server error text", () => {
    const key = authErrorKey(
      Object.assign(new Error("SQLSTATE 42P01 relata"), {
        code: "unexpected_db_failure",
        status: 500,
      }),
    );
    expect(key).toBe("unexpected");
  });
});
