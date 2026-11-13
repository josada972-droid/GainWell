import { z } from "zod";

import { activityLevels, sexValues } from "@/lib/nutrition/energy";
import type { ActivityLevel, Sex } from "@/lib/nutrition/energy";
import { goalValues, type Goal } from "@/lib/nutrition/goals";

/**
 * Input validation for the nutrition engine. Ranges are product safety limits,
 * not medical ones: they exist to reject typos and implausible entries so the
 * estimates never run on nonsense (docs/nutrition.md).
 */
export const HEIGHT_RANGE = { min: 90, max: 250 }; // cm
export const WEIGHT_RANGE = { min: 25, max: 300 }; // kg
export const AGE_RANGE = { min: 0, max: 120 }; // completed years
export const PROFESSIONAL_KCAL_RANGE = { min: 800, max: 8000 };

/** A field the engine needs, and why it cannot be used. */
export type NutrientIssue = {
  field:
    | "ageYears"
    | "sex"
    | "heightCm"
    | "weightKg"
    | "activityLevel"
    | "goal"
    | "professionalKcal";
  reason: "missing" | "invalid";
};

export type NutrientField = NutrientIssue["field"];

export type NutritionInput = {
  ageYears: number | null;
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
  professionalKcal: number | null;
};

/**
 * Accepts what the database and forms actually hand back (numbers, numeric
 * strings from PostgREST `numeric`, empty strings for cleared optional fields)
 * and never guesses a value: anything unusable becomes `null` plus an issue.
 */
export function parseNutritionInput(raw: Record<string, unknown>): {
  input: NutritionInput;
  issues: NutrientIssue[];
} {
  const issues: NutrientIssue[] = [];

  const number = (
    field: NutrientField | "professionalKcal",
    value: unknown,
    min: number,
    max: number,
    integer = false,
  ): number | null => {
    const parsed = z
      .number()
      .min(min)
      .max(max)
      .refine((v) => (integer ? Number.isInteger(v) : true))
      .safeParse(typeof value === "string" ? Number(value) : value);
    if (parsed.success) return parsed.data;
    const present = value !== null && value !== undefined && value !== "";
    if (present) issues.push({ field, reason: "invalid" });
    else if (field !== "professionalKcal")
      issues.push({ field, reason: "missing" });
    return null;
  };

  const sex = z
    .enum(sexValues)
    .nullable()
    .safeParse(raw.sex ?? null);
  if (
    raw.sex !== null &&
    raw.sex !== undefined &&
    raw.sex !== "" &&
    !sex.success
  ) {
    issues.push({ field: "sex", reason: "invalid" });
  } else if ((raw.sex ?? "") === "") {
    issues.push({ field: "sex", reason: "missing" });
  }

  const activity = z
    .enum(activityLevels)
    .nullable()
    .safeParse(raw.activityLevel ?? null);
  if (
    raw.activityLevel !== null &&
    raw.activityLevel !== undefined &&
    raw.activityLevel !== "" &&
    !activity.success
  ) {
    issues.push({ field: "activityLevel", reason: "invalid" });
  } else if ((raw.activityLevel ?? "") === "") {
    issues.push({ field: "activityLevel", reason: "missing" });
  }

  // A goal is optional: no goal means maintenance, never a guessed surplus.
  // An unknown value is reported rather than substituted.
  const goal = z
    .enum(goalValues)
    .nullable()
    .safeParse(raw.goal ?? null);
  if (
    raw.goal !== null &&
    raw.goal !== undefined &&
    raw.goal !== "" &&
    !goal.success
  ) {
    issues.push({ field: "goal", reason: "invalid" });
  }

  return {
    input: {
      ageYears: number(
        "ageYears",
        raw.ageYears,
        AGE_RANGE.min,
        AGE_RANGE.max,
        true,
      ),
      sex: sex.success ? sex.data : null,
      heightCm: number(
        "heightCm",
        raw.heightCm,
        HEIGHT_RANGE.min,
        HEIGHT_RANGE.max,
      ),
      weightKg: number(
        "weightKg",
        raw.weightKg,
        WEIGHT_RANGE.min,
        WEIGHT_RANGE.max,
      ),
      activityLevel: activity.success ? activity.data : null,
      goal: goal.success ? goal.data : null,
      professionalKcal: number(
        "professionalKcal",
        raw.professionalKcal,
        PROFESSIONAL_KCAL_RANGE.min,
        PROFESSIONAL_KCAL_RANGE.max,
        true,
      ),
    },
    issues,
  };
}

/** BMI sanity gate: rejects nonsense combinations before they become "estimates". */
export function plausibleBmi(heightCm: number, weightKg: number): boolean {
  const bmi = weightKg / (heightCm / 100) ** 2;
  return bmi >= 12 && bmi <= 60;
}
