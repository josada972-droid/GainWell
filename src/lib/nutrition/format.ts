import type { NutrientField, NutrientIssue } from "@/lib/nutrition/input";

/**
 * Output formatting helpers. The engine returns numbers and field names; the
 * UI translates human text from message files, so nothing user-facing is
 * hardcoded here (AGENTS.md §14).
 */
export const UNITS = {
  energy: "kcal",
  macronutrient: "g",
  height: "cm",
  weight: "kg",
  age: "years",
} as const;

/** Message keys for "we need this to estimate" text (onboarding/dashboard). */
export const MISSING_MESSAGE_KEYS: Record<NutrientField, string> = {
  ageYears: "age",
  sex: "sex",
  heightCm: "height",
  weightKg: "weight",
  activityLevel: "activity",
  goal: "goal",
  professionalKcal: "professional",
};

/** Unique message keys for the fields an estimate is waiting on. */
export function missingMessages(issues: NutrientIssue[]): string[] {
  return [...new Set(issues.map((issue) => MISSING_MESSAGE_KEYS[issue.field]))];
}

/** True only when a plan carries real numbers (adults with complete inputs). */
export function planHasNumbers(plan: { status: string }): boolean {
  return plan.status === "estimated";
}
