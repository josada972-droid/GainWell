import { describe, expect, it } from "vitest";

import {
  ADULT_MIN_AGE,
  ageEligibility,
  answersNeedReconfirm,
} from "@/lib/nutrition/eligibility";
import {
  ACTIVITY_MULTIPLIERS,
  maintenanceEnergy,
  restingEnergy,
  roundKcal,
} from "@/lib/nutrition/energy";
import {
  estimateNutritionPlan,
  estimateNutritionProfile,
  type NutritionPlan,
} from "@/lib/nutrition/index";
import { missingMessages } from "@/lib/nutrition/format";
import {
  DEFAULT_SURPLUS_POLICY,
  energyTarget,
  capKcal,
} from "@/lib/nutrition/goals";
import { KCAL_PER_GRAM, macroTargets } from "@/lib/nutrition/macronutrients";
import type { NutritionProfile } from "@/lib/supabase/types";

/**
 * Unit tests for the nutrition engine (docs/nutrition.md documents the formulas
 * these tests pin down). The numbers below are worked out by hand from the
 * documented equations, not from the implementation.
 */

/** A stored row with every optional column empty, then patched per test. */
function row(patch: Partial<NutritionProfile>): NutritionProfile {
  return {
    user_id: "00000000-0000-0000-0000-000000000000",
    age_years: null,
    sex: null,
    height_cm: null,
    weight_kg: null,
    activity_level: null,
    eating_habits: null,
    appetite_level: null,
    meals_per_day: null,
    dietary_preference: "none",
    dietary_notes: null,
    goal: null,
    target_weight_kg: null,
    professional_kcal: null,
    onboarding_status: "in_progress",
    onboarding_step: 1,
    created_at: "2026-11-12T00:00:00Z",
    updated_at: "2026-11-12T00:00:00Z",
    ...patch,
  };
}

/** Asserts an incomplete result and narrows it so the issue lists are typed. */
function incomplete(plan: NutritionPlan) {
  if (plan.status !== "incomplete") {
    throw new Error(`expected an incomplete result, got ${plan.status}`);
  }
  return plan;
}

describe("resting energy (Mifflin-St Jeor)", () => {
  it("matches the published equation for men", () => {
    // 10·80 + 6.25·175 − 5·30 + 5 = 1748.75
    expect(
      restingEnergy({ weightKg: 80, heightCm: 175, ageYears: 30, sex: "male" }),
    ).toBe(1748.75);
  });

  it("matches the published equation for women", () => {
    // 10·60 + 6.25·165 − 5·30 − 161 = 1320.25
    expect(
      restingEnergy({
        weightKg: 60,
        heightCm: 165,
        ageYears: 30,
        sex: "female",
      }),
    ).toBe(1320.25);
  });

  it("uses GainWell's documented simplified multipliers (not FAO PAL categories)", () => {
    expect(ACTIVITY_MULTIPLIERS).toEqual({
      sedentary: 1.2,
      light: 1.35,
      moderate: 1.5,
      high: 1.7,
    });
  });

  it("rounds maintenance energy to the nearest 10 kcal", () => {
    // 1320.25 × 1.2 = 1584.3 → 1580
    expect(maintenanceEnergy(1320.25, "sedentary")).toBe(1580);
    // 1320.25 × 1.35 = 1782.3375 → 1780
    expect(maintenanceEnergy(1320.25, "light")).toBe(1780);
    // 1748.75 × 1.5 = 2623.125 → 2620
    expect(maintenanceEnergy(1748.75, "moderate")).toBe(2620);
    // 1748.75 × 1.7 = 2972.875 → 2970
    expect(maintenanceEnergy(1748.75, "high")).toBe(2970);
    expect(roundKcal(1585)).toBe(1590);
    expect(roundKcal(1574)).toBe(1570);
  });
});

describe("macronutrients (Atwater factors)", () => {
  it("keeps grams and kilocalories consistent with each other", () => {
    const macros = macroTargets(1780, 60);
    // protein min(60·1.2, 150) = 72 g; fat 1780·0.25/9 = 49.44 → 49 g (the
    // rounding rule keeps one decimal only below 10 g)
    expect(macros.proteinG).toBe(72);
    expect(macros.fatG).toBe(49);
    // carbohydrate fills the remainder: (1780 − 288 − 441)/4 = 262.75 → 263 g
    expect(macros.carbohydrateG).toBe(263);
    // the displayed kcal is the sum of the displayed grams, so they never
    // contradict each other; the difference from the target is rounding noise
    expect(macros.kcal).toBe(
      macros.proteinG * KCAL_PER_GRAM.protein +
        macros.carbohydrateG * KCAL_PER_GRAM.carbohydrate +
        macros.fatG * KCAL_PER_GRAM.fat,
    );
    expect(macros.kcal).toBe(1781);
    expect(Math.abs(macros.kcal - 1780)).toBeLessThanOrEqual(5);
  });

  it("caps protein at 150 g per day", () => {
    expect(macroTargets(3000, 200).proteinG).toBe(150);
  });

  it("never reports a negative carbohydrate amount", () => {
    const macros = macroTargets(300, 100);
    expect(macros.carbohydrateG).toBe(0);
    expect(macros.kcal).toBeGreaterThanOrEqual(300);
  });

  it("keeps fat at a quarter of the energy, within rounding", () => {
    const macros = macroTargets(2000, 70);
    expect(Math.abs(macros.fatG * KCAL_PER_GRAM.fat - 500)).toBeLessThanOrEqual(
      5,
    );
  });
});

describe("goal adjustment", () => {
  it("adds only the conservative surplus for a gradual goal", () => {
    const target = energyTarget({
      maintenanceKcal: 2620,
      goal: "gain_gradually",
      professionalKcal: null,
    });
    expect(target.surplusKcal).toBe(DEFAULT_SURPLUS_POLICY.gradualSurplusKcal);
    expect(target.targetKcal).toBe(2820);
    expect(target.source).toBe("gainwell");
  });

  it("adds no surplus for consistency or habit goals", () => {
    for (const goal of [
      "eating_consistency",
      "healthier_habits",
      "professional_guidance",
    ] as const) {
      const target = energyTarget({
        maintenanceKcal: 2620,
        goal,
        professionalKcal: null,
      });
      expect(target.surplusKcal).toBe(0);
      expect(target.targetKcal).toBe(2620);
    }
  });

  it("keeps a professional target untouched and keeps its own suggestion beside it", () => {
    const target = energyTarget({
      maintenanceKcal: 2620,
      goal: "gain_gradually",
      professionalKcal: 2500,
    });
    expect(target.targetKcal).toBe(2500);
    expect(target.source).toBe("professional");
    expect(target.surplusKcal).toBe(0);
    expect(target.gainwellSuggestedKcal).toBe(2820);
  });

  it("does not clamp a professional number, only its own suggestion", () => {
    const target = energyTarget({
      maintenanceKcal: 2000,
      goal: "gain_gradually",
      professionalKcal: 900,
    });
    expect(target.targetKcal).toBe(900);
    expect(target.gainwellSuggestedKcal).toBe(2200);
  });

  it("caps its own suggestion so an implausible maintenance cannot become an extreme target", () => {
    expect(capKcal(9000, DEFAULT_SURPLUS_POLICY)).toBe(5000);
    const target = energyTarget({
      maintenanceKcal: 6000,
      goal: "gain_gradually",
      professionalKcal: null,
    });
    expect(target.targetKcal).toBe(5000);
  });

  it("never raises a low suggestion to the floor — it flags it instead", () => {
    expect(capKcal(900, DEFAULT_SURPLUS_POLICY)).toBe(900);
    const target = energyTarget({
      maintenanceKcal: 600,
      goal: "gain_gradually",
      professionalKcal: null,
    });
    // 600 + 200 = 800, below the 1200 threshold: shown as computed, flagged.
    expect(target.targetKcal).toBe(800);
    expect(target.belowFloor).toBe(true);
  });

  it("keeps a suggestion at or above the threshold unflagged", () => {
    const target = energyTarget({
      maintenanceKcal: 1580,
      goal: "gain_gradually",
      professionalKcal: null,
    });
    expect(target.targetKcal).toBe(1780);
    expect(target.belowFloor).toBe(false);
  });
});

describe("age eligibility", () => {
  it("treats 18 as the adult boundary", () => {
    expect(ADULT_MIN_AGE).toBe(18);
    expect(ageEligibility(17)).toBe("minor");
    expect(ageEligibility(18)).toBe("adult");
  });

  it("never assumes an adult for missing or unusable ages", () => {
    expect(ageEligibility(null)).toBe("unverified");
    expect(ageEligibility(17.5)).toBe("unverified");
    expect(ageEligibility(-1)).toBe("unverified");
    expect(ageEligibility(Number.NaN)).toBe("unverified");
  });

  it("asks for a reconfirmation only when the saved answers are stale", () => {
    const now = new Date("2026-11-13T00:00:00Z");
    expect(answersNeedReconfirm(null, now)).toBe(false);
    expect(answersNeedReconfirm("2026-11-12T00:00:00Z", now)).toBe(false);
    expect(answersNeedReconfirm("not-a-date", now)).toBe(false);
    // One year and a day old: time to reconfirm — the stored age is a
    // snapshot and can only be *younger* than reality, so this is about
    // estimate freshness, never about unlocking eligibility.
    expect(answersNeedReconfirm("2025-11-12T00:00:00Z", now)).toBe(true);
  });
});

describe("estimateNutritionPlan", () => {
  const adult = {
    ageYears: 30,
    sex: "female",
    heightCm: 165,
    weightKg: 60,
    activityLevel: "sedentary",
    goal: "gain_gradually",
    professionalKcal: null,
  };

  it("produces an adult estimate built from the documented equations", () => {
    const plan = estimateNutritionPlan(adult);
    expect(plan.status).toBe("estimated");
    if (plan.status !== "estimated") return;
    expect(plan.eligibility).toBe("adult");
    expect(plan.maintenanceKcal).toBe(1580);
    expect(plan.targetKcal).toBe(1780);
    expect(plan.targetSource).toBe("gainwell");
    expect(plan.surplusKcal).toBe(200);
    expect(plan.weightKg).toBe(60);
    // The activity band travels with the estimate, so the UI can flag the
    // known limitation of the highest band.
    expect(plan.activityLevel).toBe("sedentary");
    expect(Math.abs(plan.macros.kcal - plan.targetKcal)).toBeLessThanOrEqual(5);
  });

  it("computes nothing at all for a 17-year-old", () => {
    const plan = estimateNutritionPlan({ ...adult, ageYears: 17 });
    expect(plan.status).toBe("minor");
    expect(plan.eligibility).toBe("minor");
    expect("maintenanceKcal" in plan).toBe(false);
    expect("targetKcal" in plan).toBe(false);
    expect("macros" in plan).toBe(false);
  });

  it("treats an 18-year-old as eligible", () => {
    const plan = estimateNutritionPlan({ ...adult, ageYears: 18 });
    expect(plan.status).toBe("estimated");
  });

  it("reports unverified for a missing age, without numbers", () => {
    const plan = incomplete(
      estimateNutritionPlan({ ...adult, ageYears: null }),
    );
    expect(plan.eligibility).toBe("unverified");
    expect("maintenanceKcal" in plan).toBe(false);
    expect(missingMessages(plan.missing)).toContain("age");
  });

  it("reports the missing sex instead of guessing it", () => {
    const plan = incomplete(estimateNutritionPlan({ ...adult, sex: null }));
    expect(plan.eligibility).toBe("adult");
    expect(missingMessages(plan.missing)).toContain("sex");
    expect("maintenanceKcal" in plan).toBe(false);
  });

  it("flags invalid values instead of substituting defaults", () => {
    const plan = incomplete(
      estimateNutritionPlan({
        ageYears: "abc",
        sex: "female",
        heightCm: 165,
        weightKg: 60,
        activityLevel: "bogus",
        goal: null,
        professionalKcal: 9000,
      }),
    );
    expect(plan.invalid.map((i) => i.field).sort()).toEqual([
      "activityLevel",
      "ageYears",
      "professionalKcal",
    ]);
    expect("targetKcal" in plan).toBe(false);
  });

  it("rejects implausible body-measure combinations", () => {
    const plan = incomplete(
      estimateNutritionPlan({ ...adult, heightCm: 90, weightKg: 300 }),
    );
    expect(plan.implausible).toBe(true);
    expect("maintenanceKcal" in plan).toBe(false);
  });

  it("accepts extreme but plausible values", () => {
    const plan = estimateNutritionPlan({
      ageYears: 120,
      sex: "female",
      heightCm: 160,
      weightKg: 60,
      activityLevel: "sedentary",
      goal: "gain_gradually",
      professionalKcal: null,
    });
    expect(plan.status).toBe("estimated");
    if (plan.status !== "estimated") return;
    // 10·60 + 6.25·160 − 5·120 − 161 = 839 → ×1.2 = 1006.8 → 1010, +200 → 1210
    expect(plan.maintenanceKcal).toBe(1010);
    expect(plan.targetKcal).toBe(1210);
  });

  it("keeps a professional target as the answer for an adult", () => {
    const plan = estimateNutritionPlan({ ...adult, professionalKcal: 2000 });
    expect(plan.status).toBe("estimated");
    if (plan.status !== "estimated") return;
    expect(plan.targetKcal).toBe(2000);
    expect(plan.targetSource).toBe("professional");
    expect(plan.gainwellSuggestedKcal).toBe(1780);
  });

  it("shows an unusually low adult estimate as computed, flagged, never raised", () => {
    // Smallest accepted body: 25 kg, 90 cm, 18 years, female, sedentary.
    // RMR = 250 + 562.5 − 90 − 161 = 561.5 → ×1.2 = 673.8 → 670; +200 → 870.
    const plan = estimateNutritionPlan({
      ageYears: 18,
      sex: "female",
      heightCm: 90,
      weightKg: 25,
      activityLevel: "sedentary",
      goal: "gain_gradually",
      professionalKcal: null,
    });
    expect(plan.status).toBe("estimated");
    if (plan.status !== "estimated") return;
    expect(plan.maintenanceKcal).toBe(670);
    expect(plan.targetKcal).toBe(870);
    expect(plan.belowFloor).toBe(true);
    // Macros still sum to what they claim, even at this unusual level.
    expect(Math.abs(plan.macros.kcal - plan.targetKcal)).toBeLessThanOrEqual(5);
  });

  it("never flags a professional target, even a very low or very high one", () => {
    for (const professionalKcal of [800, 8000]) {
      const plan = estimateNutritionPlan({ ...adult, professionalKcal });
      if (plan.status !== "estimated") throw new Error("expected estimated");
      expect(plan.targetKcal).toBe(professionalKcal);
      expect(plan.belowFloor).toBeUndefined();
    }
  });

  it("accepts numeric strings and empty optional fields from the database", () => {
    const plan = estimateNutritionPlan({
      ageYears: "30",
      sex: "female",
      heightCm: "165.5",
      weightKg: "60.0",
      activityLevel: "sedentary",
      goal: "",
      professionalKcal: "",
    });
    expect(plan.status).toBe("estimated");
    if (plan.status !== "estimated") return;
    // 10·60 + 6.25·165.5 − 150 − 161 = 1323.375 → ×1.2 = 1588.05 → 1590
    expect(plan.maintenanceKcal).toBe(1590);
    expect(plan.targetKcal).toBe(1590);
    expect(plan.surplusKcal).toBe(0);
  });
});

describe("estimateNutritionProfile", () => {
  it("maps a stored row into the engine", () => {
    const plan = estimateNutritionProfile(
      row({
        age_years: 30,
        sex: "female",
        height_cm: 165,
        weight_kg: 60,
        activity_level: "sedentary",
        goal: "gain_gradually",
      }),
    );
    expect(plan.status).toBe("estimated");
  });

  it("reports incomplete for a row that stopped mid-onboarding", () => {
    const plan = incomplete(estimateNutritionProfile(row({ age_years: 30 })));
    expect(missingMessages(plan.missing)).toEqual([
      "sex",
      "activity",
      "height",
      "weight",
    ]);
  });

  it("reports minor for a stored row under 18", () => {
    const plan = estimateNutritionProfile(
      row({
        age_years: 16,
        sex: "female",
        height_cm: 160,
        weight_kg: 55,
        activity_level: "moderate",
        goal: "healthier_habits",
      }),
    );
    expect(plan.status).toBe("minor");
  });

  it("reports incomplete for no profile at all", () => {
    expect(estimateNutritionProfile(null).status).toBe("incomplete");
  });
});
