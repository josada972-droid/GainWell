import { z } from "zod";

import { activityLevels } from "@/lib/nutrition/energy";
import { goalValues } from "@/lib/nutrition/goals";

/**
 * Onboarding form validation (Zod at the trust boundary). Values arrive as
 * strings from `<form>`, so numbers are coerced — French input may use a comma
 * decimal ("72,5"), which is accepted. Empty means "not answered", never 0.
 * Error values are message keys; the UI translates them (AGENTS.md §14).
 */

/** Required number: empty or out-of-range is an error, never a default. */
function requiredNumber(
  min: number,
  max: number,
  errorKey: string,
  integer = false,
) {
  return z
    .string()
    .transform((value) =>
      value.trim() === "" ? Number.NaN : Number(value.trim().replace(",", ".")),
    )
    .refine(
      (value) =>
        Number.isFinite(value) &&
        (integer ? Number.isInteger(value) : true) &&
        value >= min &&
        value <= max,
      errorKey,
    );
}

/** Optional number: blank is a real answer ("no target"), not a fabricated one. */
function optionalNumber(
  min: number,
  max: number,
  errorKey: string,
  integer = false,
) {
  return z
    .string()
    .transform((value) =>
      value.trim() === "" ? null : Number(value.trim().replace(",", ".")),
    )
    .refine(
      (value) =>
        value === null ||
        (Number.isFinite(value) &&
          (integer ? Number.isInteger(value) : true) &&
          value >= min &&
          value <= max),
      errorKey,
    );
}

/** Optional enum: "" means "not answered"/"cleared". */
function optionalEnum<T extends readonly [string, ...string[]]>(
  values: T,
  errorKey: string,
) {
  return z
    .string()
    .transform((value) => (value === "" ? null : value))
    .refine((value) => value === null || values.includes(value), errorKey)
    .pipe(z.enum(values).nullable());
}

function requiredEnum<T extends readonly [string, ...string[]]>(
  values: T,
  errorKey: string,
) {
  // The membership check runs before the enum pipe, so the failure carries the
  // message key instead of Zod's generic "invalid input" text.
  return z
    .string()
    .refine((value) => values.includes(value), errorKey)
    .pipe(z.enum(values));
}

/** Sex is optional and only feeds the resting-energy equation. */
export const sexSchema = optionalEnum(
  ["female", "male"] as const,
  "invalidSex",
);

export const step1Schema = z.object({
  ageYears: requiredNumber(0, 120, "invalidAge", true),
  heightCm: requiredNumber(90, 250, "invalidHeight"),
  weightKg: requiredNumber(25, 300, "invalidWeight"),
  sex: sexSchema,
});

export const step2Schema = z.object({
  activityLevel: requiredEnum(activityLevels, "invalidActivity"),
  eatingHabits: requiredEnum(
    ["regular", "skipped_meals", "low_appetite", "varied"] as const,
    "invalidHabits",
  ),
  appetiteLevel: optionalEnum(
    ["low", "medium", "high"] as const,
    "invalidAppetite",
  ),
  mealsPerDay: optionalNumber(1, 12, "invalidMeals", true),
});

export const step3Schema = z.object({
  dietaryPreference: requiredEnum(
    ["none", "vegetarian", "vegan", "pescatarian", "other"] as const,
    "invalidPreference",
  ),
  dietaryNotes: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine((value) => value === null || value.length <= 300, "notesTooLong"),
});

export const step4Schema = z.object({
  goal: requiredEnum(goalValues, "invalidGoal"),
  targetWeightKg: optionalNumber(25, 300, "invalidTargetWeight"),
  professionalKcal: optionalNumber(800, 8000, "invalidProfessionalKcal", true),
});

export type StepPatch = Record<string, unknown>;

/** Onboarding has five steps; step 5 is the review, which saves nothing new. */
export const STEP_COUNT = 5;

/**
 * Form field names → the table columns that store them, per step. The DB layer
 * (`src/lib/onboarding/store.ts`) writes through this map and the onboarding page
 * reads saved answers through the same map, so the two never drift apart.
 */
export const stepColumns: Record<number, Record<string, string>> = {
  1: {
    ageYears: "age_years",
    heightCm: "height_cm",
    weightKg: "weight_kg",
    sex: "sex",
  },
  2: {
    activityLevel: "activity_level",
    eatingHabits: "eating_habits",
    appetiteLevel: "appetite_level",
    mealsPerDay: "meals_per_day",
  },
  3: { dietaryPreference: "dietary_preference", dietaryNotes: "dietary_notes" },
  4: {
    goal: "goal",
    targetWeightKg: "target_weight_kg",
    professionalKcal: "professional_kcal",
  },
};

/** Parses one step's form values into the columns that step owns. */
export function parseStep(
  step: number,
  formData: FormData,
): { ok: true; patch: StepPatch } | { ok: false; errorKey: string } {
  const text = (name: string) => String(formData.get(name) ?? "");

  const schemas: Record<number, z.ZodType<{ [key: string]: unknown }>> = {
    1: step1Schema,
    2: step2Schema,
    3: step3Schema,
    4: step4Schema,
  };
  const schema = schemas[step];
  if (!schema) return { ok: false, errorKey: "invalidStep" };

  const parsed = schema.safeParse({
    ...(step === 1
      ? {
          ageYears: text("ageYears"),
          heightCm: text("heightCm"),
          weightKg: text("weightKg"),
          sex: text("sex"),
        }
      : step === 2
        ? {
            activityLevel: text("activityLevel"),
            eatingHabits: text("eatingHabits"),
            appetiteLevel: text("appetiteLevel"),
            mealsPerDay: text("mealsPerDay"),
          }
        : step === 3
          ? {
              dietaryPreference: text("dietaryPreference"),
              dietaryNotes: text("dietaryNotes"),
            }
          : {
              goal: text("goal"),
              targetWeightKg: text("targetWeightKg"),
              professionalKcal: text("professionalKcal"),
            }),
  });

  if (!parsed.success) {
    return {
      ok: false,
      errorKey: parsed.error.issues[0]?.message ?? "invalidStep",
    };
  }
  return { ok: true, patch: parsed.data };
}
