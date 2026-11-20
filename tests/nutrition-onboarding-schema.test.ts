import { describe, expect, it } from "vitest";

import { parseStep, stepColumns } from "@/lib/onboarding/schema";

/** One form's values, as a browser would submit them. */
function form(values: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(values)) formData.set(name, value);
  return formData;
}

describe("onboarding step validation", () => {
  it("step 1 accepts plain numbers and a French comma decimal", () => {
    const parsed = parseStep(
      1,
      form({ ageYears: "30", heightCm: "165", weightKg: "62,5", sex: "" }),
    );
    expect(parsed).toEqual({
      ok: true,
      patch: { ageYears: 30, heightCm: 165, weightKg: 62.5, sex: null },
    });
  });

  it("step 1 rejects blanks and out-of-range numbers without substituting them", () => {
    expect(
      parseStep(
        1,
        form({ ageYears: "", heightCm: "165", weightKg: "60", sex: "" }),
      ).ok,
    ).toBe(false);
    expect(
      parseStep(
        1,
        form({ ageYears: "-1", heightCm: "165", weightKg: "60", sex: "" }),
      ).ok,
    ).toBe(false);
    expect(
      parseStep(
        1,
        form({ ageYears: "30", heightCm: "30", weightKg: "60", sex: "" }),
      ).ok,
    ).toBe(false);
    expect(
      parseStep(
        1,
        form({ ageYears: "30", heightCm: "165", weightKg: "400", sex: "" }),
      ).ok,
    ).toBe(false);
    expect(
      parseStep(
        1,
        form({ ageYears: "30", heightCm: "165", weightKg: "60", sex: "other" }),
      ).ok,
    ).toBe(false);
  });

  it("step 1 needs no sex answer — that is the engine's problem, not the form's", () => {
    const parsed = parseStep(
      1,
      form({ ageYears: "17", heightCm: "160", weightKg: "55", sex: "" }),
    );
    expect(parsed.ok).toBe(true);
  });

  it("step 2 requires the two compulsory groups and keeps optional blanks empty", () => {
    expect(
      parseStep(
        2,
        form({
          activityLevel: "moderate",
          eatingHabits: "regular",
          appetiteLevel: "",
          mealsPerDay: "",
        }),
      ),
    ).toEqual({
      ok: true,
      patch: {
        activityLevel: "moderate",
        eatingHabits: "regular",
        appetiteLevel: null,
        mealsPerDay: null,
      },
    });
    expect(
      parseStep(
        2,
        form({
          activityLevel: "",
          eatingHabits: "regular",
          appetiteLevel: "",
          mealsPerDay: "",
        }),
      ).ok,
    ).toBe(false);
    expect(
      parseStep(
        2,
        form({
          activityLevel: "extreme",
          eatingHabits: "regular",
          appetiteLevel: "",
          mealsPerDay: "",
        }),
      ).ok,
    ).toBe(false);
    expect(
      parseStep(
        2,
        form({
          activityLevel: "moderate",
          eatingHabits: "regular",
          appetiteLevel: "",
          mealsPerDay: "0",
        }),
      ).ok,
    ).toBe(false);
  });

  it("step 3 stores a preference and trims or clears the notes", () => {
    expect(
      parseStep(
        3,
        form({ dietaryPreference: "vegetarian", dietaryNotes: "  no dairy  " }),
      ),
    ).toEqual({
      ok: true,
      patch: { dietaryPreference: "vegetarian", dietaryNotes: "no dairy" },
    });
    expect(
      parseStep(3, form({ dietaryPreference: "none", dietaryNotes: "" })),
    ).toEqual({
      ok: true,
      patch: { dietaryPreference: "none", dietaryNotes: null },
    });
    expect(
      parseStep(
        3,
        form({ dietaryPreference: "none", dietaryNotes: "x".repeat(301) }),
      ).ok,
    ).toBe(false);
    expect(
      parseStep(3, form({ dietaryPreference: "carnivore", dietaryNotes: "" }))
        .ok,
    ).toBe(false);
  });

  it("step 4 keeps a professional target as a number and refuses an out-of-range one", () => {
    expect(
      parseStep(
        4,
        form({
          goal: "professional_guidance",
          targetWeightKg: "",
          professionalKcal: "2000",
        }),
      ),
    ).toEqual({
      ok: true,
      patch: {
        goal: "professional_guidance",
        targetWeightKg: null,
        professionalKcal: 2000,
      },
    });
    expect(
      parseStep(
        4,
        form({
          goal: "gain_gradually",
          targetWeightKg: "68",
          professionalKcal: "9000",
        }),
      ).ok,
    ).toBe(false);
    expect(
      parseStep(4, form({ goal: "", targetWeightKg: "", professionalKcal: "" }))
        .ok,
    ).toBe(false);
  });

  it("refuses steps that do not exist", () => {
    expect(parseStep(5, form({ goal: "gain_gradually" })).ok).toBe(false);
    expect(parseStep(0, form({ ageYears: "30" })).ok).toBe(false);
  });

  it("carries message keys, never user-visible text", () => {
    const parsed = parseStep(
      1,
      form({ ageYears: "30.5", heightCm: "165", weightKg: "60", sex: "" }),
    );
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.errorKey).toBe("invalidAge");
  });
});

/**
 * The names the storage layer writes with. These are the column names from
 * `supabase/migrations/20251117000002_nutrition_profiles.sql`; a rename in either place
 * fails here before it fails against the database.
 */
describe("answers → table columns", () => {
  const fullForms: Record<number, Record<string, string>> = {
    1: { ageYears: "30", heightCm: "165", weightKg: "60", sex: "female" },
    2: {
      activityLevel: "moderate",
      eatingHabits: "regular",
      appetiteLevel: "",
      mealsPerDay: "",
    },
    3: { dietaryPreference: "none", dietaryNotes: "" },
    4: { goal: "gain_gradually", targetWeightKg: "", professionalKcal: "" },
  };

  it("names the columns of the migration for every step", () => {
    expect(stepColumns).toEqual({
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
      3: {
        dietaryPreference: "dietary_preference",
        dietaryNotes: "dietary_notes",
      },
      4: {
        goal: "goal",
        targetWeightKg: "target_weight_kg",
        professionalKcal: "professional_kcal",
      },
    });
  });

  it("maps every answer a step can produce", () => {
    for (const [step, values] of Object.entries(fullForms)) {
      const parsed = parseStep(Number(step), form(values));
      if (!parsed.ok) throw new Error(`step ${step} should parse`);
      for (const key of Object.keys(parsed.patch)) {
        expect(stepColumns[Number(step)]?.[key]).toBeDefined();
      }
    }
  });
});
