import { describe, expect, it } from "vitest";

import {
  weightDateSchema,
  weightEntryIdSchema,
  weightKgSchema,
  weightNoteSchema,
} from "@/lib/progress/schema";

/**
 * The Zod boundary for weight entries (Stage 5). These decide what a form
 * value may be before anything touches the database; the DB CHECKs re-state
 * the same limits for direct API access.
 */

describe("weightKgSchema", () => {
  it.each(["70", "70.0", "70,0", " 70.5 ", "25", "300"])(
    "accepts %s",
    (value) => {
      expect(weightKgSchema.safeParse(value).success).toBe(true);
    },
  );

  it.each([
    // Outside the plausible range the onboarding engine and the DB use.
    "24.9",
    "300.1",
    "0",
    "-70",
    // More than one decimal: numeric(5,1) would silently round it.
    "70.25",
    "70.125",
    // Not a number / empty.
    "abc",
    "",
    "  ",
    "NaN",
    "Infinity",
    "70.000.0",
  ])("rejects %s", (value) => {
    expect(weightKgSchema.safeParse(value).success).toBe(false);
  });

  it("parses the French comma decimal", () => {
    const parsed = weightKgSchema.parse("70,5");
    expect(parsed).toBe(70.5);
  });
});

describe("weightDateSchema", () => {
  it("accepts a real calendar date", () => {
    expect(weightDateSchema.safeParse("2026-02-10").success).toBe(true);
  });

  it.each([
    "not-a-date",
    "2026-2-10", // wrong shape
    "02/10/2026", // wrong shape
    "2026-02-30", // impossible date
    "2026-13-01", // month 13
    "1999-12-31", // before the DB's lower bound
  ])("rejects %s", (value) => {
    expect(weightDateSchema.safeParse(value).success).toBe(false);
  });
});

describe("weightNoteSchema", () => {
  it("accepts a short note and a blank one", () => {
    expect(weightNoteSchema.parse("morning, at home")).toBe("morning, at home");
    expect(weightNoteSchema.parse("   ")).toBe("");
  });

  it("rejects a note over 300 characters", () => {
    expect(weightNoteSchema.safeParse("a".repeat(301)).success).toBe(false);
    expect(weightNoteSchema.safeParse("a".repeat(300)).success).toBe(true);
  });
});

describe("weightEntryIdSchema", () => {
  it("requires a uuid", () => {
    expect(weightEntryIdSchema.safeParse("not-a-uuid").success).toBe(false);
    expect(
      weightEntryIdSchema.safeParse("550e8400-e29b-41d4-a716-446655440000")
        .success,
    ).toBe(true);
  });
});
