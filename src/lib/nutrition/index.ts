import type { Eligibility } from "@/lib/nutrition/eligibility";
import { ageEligibility } from "@/lib/nutrition/eligibility";
import {
  maintenanceEnergy,
  restingEnergy,
  type Sex,
} from "@/lib/nutrition/energy";
import {
  type NutrientIssue,
  type NutritionInput,
  parseNutritionInput,
  plausibleBmi,
} from "@/lib/nutrition/input";
import {
  energyTarget,
  type Goal,
  type SurplusPolicy,
} from "@/lib/nutrition/goals";
import {
  macroTargets,
  type Macronutrients,
} from "@/lib/nutrition/macronutrients";
import type { NutritionProfile } from "@/lib/supabase/types";

/**
 * The nutrition engine's entry point: validation → eligibility → energy → goal
 * adjustment → macronutrients. Nothing here depends on React, Next or
 * Supabase, so it is testable on its own (docs/nutrition.md documents the
 * formulas, sources, units and limitations).
 *
 * Eligibility is enforced *inside* the engine: a minor or an unverified age
 * returns a non-numeric result and no estimate is ever computed and hidden.
 * Missing inputs are reported by name; nothing is fabricated.
 *
 * `estimateNutritionProfile` below is the only DB-aware helper: it takes the
 * stored row's shape (a type-only import) and hands plain values to the engine.
 */
export type NutritionPlan =
  | {
      status: "estimated";
      eligibility: "adult";
      /** Estimated maintenance energy (TDEE), rounded to 10 kcal. */
      maintenanceKcal: number;
      /** The number shown as the daily target: professional or GainWell. */
      targetKcal: number;
      targetSource: "professional" | "gainwell";
      /** GainWell's own suggestion, always kept for comparison. */
      gainwellSuggestedKcal: number;
      /** True when GainWell's own suggestion computes below the policy's
       * threshold (1200 kcal): the number is shown as computed plus an
       * "unusually low" note, never raised to the threshold. */
      belowFloor?: true;
      surplusKcal: number;
      macros: Macronutrients;
      /** The current weight the estimate was built from (kg). */
      weightKg: number;
      sex: Sex;
      goal: Goal | null;
      /** The activity band the estimate used, so the UI can flag the known
       * limitation of the highest band (below FAO's vigorous PAL). */
      activityLevel: NonNullable<NutritionInput["activityLevel"]>;
    }
  | {
      status: "minor";
      eligibility: "minor";
      missing: NutrientIssue[];
      invalid: NutrientIssue[];
    }
  | {
      status: "incomplete";
      eligibility: "unverified" | "adult";
      missing: NutrientIssue[];
      invalid: NutrientIssue[];
      /** Set when the numbers are there but the combination is nonsense. */
      implausible?: true;
    };

export function estimateNutritionPlan(
  raw: Record<string, unknown>,
  policy?: SurplusPolicy,
): NutritionPlan {
  const { input, issues } = parseNutritionInput(raw);
  const eligibility: Eligibility = ageEligibility(input.ageYears);

  // Age first: a minor or an unverified age never reaches the energy maths.
  if (eligibility === "minor") {
    return {
      status: "minor",
      eligibility: "minor",
      missing: issues.filter((i) => i.reason === "missing"),
      invalid: issues.filter((i) => i.reason === "invalid"),
    };
  }
  if (eligibility === "unverified") {
    return {
      status: "incomplete",
      eligibility: "unverified",
      missing: issues.filter((i) => i.reason === "missing"),
      invalid: issues.filter((i) => i.reason === "invalid"),
    };
  }

  const missing = issues.filter((i) => i.reason === "missing");
  const invalid = issues.filter((i) => i.reason === "invalid");
  if (missing.length > 0 || invalid.length > 0) {
    return {
      status: "incomplete",
      eligibility: "adult",
      missing,
      invalid,
    };
  }

  // All numbers are present and range-valid by this point.
  const { ageYears, sex, heightCm, weightKg, activityLevel, goal } = input as {
    ageYears: number;
    sex: Sex;
    heightCm: number;
    weightKg: number;
    activityLevel: NonNullable<NutritionInput["activityLevel"]>;
    goal: Goal | null;
  };

  if (!plausibleBmi(heightCm, weightKg)) {
    return {
      status: "incomplete",
      eligibility: "adult",
      missing: [],
      invalid: [{ field: "weightKg", reason: "invalid" }],
      implausible: true,
    };
  }

  const maintenanceKcal = maintenanceEnergy(
    restingEnergy({ weightKg, heightCm, ageYears, sex }),
    activityLevel,
  );
  const target = energyTarget({
    maintenanceKcal,
    goal,
    professionalKcal: input.professionalKcal,
    policy,
  });

  return {
    status: "estimated",
    eligibility: "adult",
    maintenanceKcal,
    targetKcal: target.targetKcal,
    targetSource: target.source,
    gainwellSuggestedKcal: target.gainwellSuggestedKcal,
    ...(target.belowFloor ? { belowFloor: true as const } : {}),
    surplusKcal: target.surplusKcal,
    macros: macroTargets(target.targetKcal, weightKg),
    weightKg,
    sex,
    goal,
    activityLevel,
  };
}

/** Turns the stored onboarding row into engine input — no defaults, no guessing. */
export function estimateNutritionProfile(
  profile: NutritionProfile | null,
): NutritionPlan {
  return estimateNutritionPlan({
    ageYears: profile?.age_years,
    sex: profile?.sex,
    heightCm: profile?.height_cm,
    weightKg: profile?.weight_kg,
    activityLevel: profile?.activity_level,
    goal: profile?.goal,
    professionalKcal: profile?.professional_kcal,
  });
}
