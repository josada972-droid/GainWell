import { describe, expect, it } from "vitest";
import type { z } from "zod";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/auth/schemas";

/** The first issue's message is what the Server Actions surface to the UI. */
function firstMessage(schema: z.ZodType, value: unknown): string | undefined {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe("signUpSchema", () => {
  const valid = {
    email: "  A@Example.COM  ",
    password: "correct horse",
    displayName: "  Ana  ",
  };

  it("accepts a valid signup and normalizes the email", () => {
    const result = signUpSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("a@example.com");
      expect(result.data.displayName).toBe("Ana");
    }
  });

  it("rejects a malformed email with the invalidEmail key", () => {
    expect(
      firstMessage(signUpSchema, { ...valid, email: "not-an-email" }),
    ).toBe("invalidEmail");
  });

  it("rejects a short password with the weakPassword key", () => {
    expect(firstMessage(signUpSchema, { ...valid, password: "short" })).toBe(
      "weakPassword",
    );
  });

  it("rejects a password over the bcrypt ceiling", () => {
    expect(
      firstMessage(signUpSchema, { ...valid, password: "x".repeat(73) }),
    ).toBe("passwordTooLong");
  });

  it("rejects a display name over 60 characters", () => {
    expect(
      firstMessage(signUpSchema, { ...valid, displayName: "n".repeat(61) }),
    ).toBe("invalidName");
  });
});

describe("signInSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      signInSchema.safeParse({ email: "a@example.com", password: "whatever" })
        .success,
    ).toBe(true);
  });

  it("requires a non-empty password without assuming its strength", () => {
    expect(
      firstMessage(signInSchema, { email: "a@example.com", password: "" }),
    ).toBe("missingPassword");
  });

  it("rejects a malformed email", () => {
    expect(
      firstMessage(signInSchema, { email: "nope", password: "whatever" }),
    ).toBe("invalidEmail");
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts an email and normalizes case and surrounding spaces", () => {
    const result = forgotPasswordSchema.safeParse({ email: "  B@x.io " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("b@x.io");
  });

  it("rejects anything that is not an email", () => {
    expect(firstMessage(forgotPasswordSchema, { email: "@" })).toBe(
      "invalidEmail",
    );
  });
});

describe("resetPasswordSchema", () => {
  it("accepts an 8-character password", () => {
    expect(
      resetPasswordSchema.safeParse({ password: "12345678" }).success,
    ).toBe(true);
  });

  it("rejects a 7-character password", () => {
    expect(firstMessage(resetPasswordSchema, { password: "1234567" })).toBe(
      "weakPassword",
    );
  });
});
