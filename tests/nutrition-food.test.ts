import { describe, expect, it } from "vitest";

import {
  isValidQuantity,
  nutritionForQuantity,
  recalculateFromSource,
  unitMatchesBasis,
  type Food,
} from "@/lib/nutrition/food";
import { sumEntries } from "@/lib/nutrition/totals";

/**
 * Pure engine tests for the Stage 4 food representation and totals
 * (docs/nutrition.md §5). No Supabase, no network, no React.
 */

function food(overrides: Partial<Food> = {}): Food {
  return {
    name: "Test food",
    brand: null,
    basis: "per_100g",
    values: {
      kcal: 100,
      proteinG: 10,
      carbsG: 20,
      fatG: 5,
      fiberG: 1,
    },
    servingQuantity: null,
    servingUnit: null,
    estimated: false,
    source: { kind: "open_food_facts", code: "123", attribution: null },
    ...overrides,
  };
}

describe("unitMatchesBasis", () => {
  it("only pairs a unit with its own basis", () => {
    expect(unitMatchesBasis("g", "per_100g")).toBe(true);
    expect(unitMatchesBasis("ml", "per_100ml")).toBe(true);
    expect(unitMatchesBasis("serving", "per_serving")).toBe(true);
  });

  it("never equates grams and millilitres (no density is assumed)", () => {
    expect(unitMatchesBasis("ml", "per_100g")).toBe(false);
    expect(unitMatchesBasis("g", "per_100ml")).toBe(false);
  });

  it("keeps servings with the per-serving basis only", () => {
    expect(unitMatchesBasis("serving", "per_100g")).toBe(false);
    expect(unitMatchesBasis("g", "per_serving")).toBe(false);
  });
});

describe("isValidQuantity", () => {
  it("rejects zero, negative and non-finite values", () => {
    expect(isValidQuantity(0)).toBe(false);
    expect(isValidQuantity(-1)).toBe(false);
    expect(isValidQuantity(Number.NaN)).toBe(false);
    expect(isValidQuantity(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isValidQuantity(0.001)).toBe(true);
  });
});

describe("nutritionForQuantity", () => {
  it("scales per-100g values linearly (g basis)", () => {
    const result = nutritionForQuantity(food(), 250, "g");
    expect(result).not.toBeNull();
    expect(result!.kcal).toBe(250);
    expect(result!.proteinG).toBe(25);
    expect(result!.carbsG).toBe(50);
    expect(result!.fatG).toBe(12.5);
    expect(result!.fiberG).toBe(2.5);
    expect(result!.grams).toBe(250);
    expect(result!.complete).toBe(true);
  });

  it("scales per-100ml values with the ml basis and reports no mass in grams", () => {
    const result = nutritionForQuantity(
      food({ basis: "per_100ml", values: { ...food().values, kcal: 50 } }),
      200,
      "ml",
    );
    expect(result!.kcal).toBe(100);
    // ml entries never claim a gram mass: no density is known.
    expect(result!.grams).toBeNull();
  });

  it("scales per-serving values with the serving basis", () => {
    const result = nutritionForQuantity(
      food({ basis: "per_serving" }),
      2,
      "serving",
    );
    expect(result!.kcal).toBe(200);
    expect(result!.grams).toBeNull(); // servings carry no known mass
  });

  it("rejects a unit that does not match the basis", () => {
    expect(nutritionForQuantity(food(), 250, "ml")).toBeNull();
    expect(
      nutritionForQuantity(food({ basis: "per_serving" }), 2, "g"),
    ).toBeNull();
  });

  it("rejects invalid quantities", () => {
    expect(nutritionForQuantity(food(), 0, "g")).toBeNull();
    expect(nutritionForQuantity(food(), -5, "g")).toBeNull();
  });

  it("keeps unknown nutrients unknown (never zero) and flags incompleteness", () => {
    const result = nutritionForQuantity(
      food({
        values: {
          kcal: 100,
          proteinG: null,
          carbsG: 20,
          fatG: null,
          fiberG: 1,
        },
      }),
      100,
      "g",
    );
    expect(result!.kcal).toBe(100);
    expect(result!.proteinG).toBeNull();
    expect(result!.fatG).toBeNull();
    expect(result!.complete).toBe(false);
  });
});

describe("recalculateFromSource", () => {
  it("recomputes a snapshot from stored source values only", () => {
    const source = {
      source_kcal: 539,
      source_protein_g: 6.3,
      source_carbs_g: 57.5,
      source_fat_g: 30.9,
      source_fiber_g: 0,
      source_basis: "per_100g",
    };
    const result = recalculateFromSource(source, 30, "g");
    expect(result!.kcal).toBeCloseTo(161.7, 3);
    expect(result!.proteinG).toBeCloseTo(1.89, 3);
    expect(result!.complete).toBe(true);
  });

  it("refuses an unsupported unit/basis pair instead of guessing", () => {
    const source = {
      source_kcal: 539,
      source_protein_g: 6.3,
      source_carbs_g: 57.5,
      source_fat_g: 30.9,
      source_fiber_g: 0,
      source_basis: "per_100g",
    };
    expect(recalculateFromSource(source, 30, "serving")).toBeNull();
  });

  it("preserves unknown source values through the recalculation", () => {
    const result = recalculateFromSource(
      {
        source_kcal: null,
        source_protein_g: 10,
        source_carbs_g: null,
        source_fat_g: null,
        source_fiber_g: null,
        source_basis: "per_100g",
      },
      200,
      "g",
    );
    expect(result!.kcal).toBeNull();
    expect(result!.proteinG).toBe(20);
    expect(result!.complete).toBe(false);
  });
});

describe("sumEntries", () => {
  it("returns exact totals when every contributor is known", () => {
    const totals = sumEntries([
      { kcal: 100, proteinG: 10, carbsG: 20, fatG: 5, fiberG: 1 },
      { kcal: 200, proteinG: 20, carbsG: 40, fatG: 10, fiberG: 2 },
    ]);
    expect(totals.kcal).toEqual({
      value: 300,
      complete: true,
      unknownCount: 0,
    });
    expect(totals.proteinG.value).toBe(30);
    expect(totals.entryCount).toBe(2);
  });

  it("reports known values as a lower bound when some are unknown", () => {
    const totals = sumEntries([
      { kcal: 100, proteinG: null, carbsG: 20, fatG: 5, fiberG: 1 },
      { kcal: 200, proteinG: 20, carbsG: null, fatG: 10, fiberG: null },
    ]);
    // Completeness is per nutrient: kcal was known on both entries, so its
    // total is exact even while other nutrients stay unknown.
    expect(totals.kcal).toEqual({
      value: 300,
      complete: true,
      unknownCount: 0,
    });
    expect(totals.proteinG).toEqual({
      value: 20,
      complete: false,
      unknownCount: 1,
    });
    expect(totals.carbsG).toEqual({
      value: 20,
      complete: false,
      unknownCount: 1,
    });
    expect(totals.fiberG).toEqual({
      value: 1,
      complete: false,
      unknownCount: 1,
    });
  });

  it("reports unknown (never zero) when no contributor is known", () => {
    const totals = sumEntries([
      { kcal: null, proteinG: null, carbsG: null, fatG: null, fiberG: null },
    ]);
    expect(totals.kcal).toEqual({
      value: null,
      complete: false,
      unknownCount: 1,
    });
    expect(totals.fatG.value).toBeNull();
  });

  it("returns complete zero for an empty meal", () => {
    const totals = sumEntries([]);
    expect(totals.kcal).toEqual({ value: 0, complete: true, unknownCount: 0 });
    expect(totals.entryCount).toBe(0);
  });

  it("ignores null entries", () => {
    const totals = sumEntries([
      null,
      { kcal: 50, proteinG: 1, carbsG: 1, fatG: 1, fiberG: 1 },
    ]);
    expect(totals.entryCount).toBe(1);
    expect(totals.kcal.value).toBe(50);
  });

  it("applies the same semantics per nutrient, independently", () => {
    const totals = sumEntries([
      { kcal: 10, proteinG: 1, carbsG: null, fatG: 2, fiberG: null },
      { kcal: 20, proteinG: null, carbsG: 3, fatG: 4, fiberG: null },
      { kcal: null, proteinG: 5, carbsG: 6, fatG: null, fiberG: null },
    ]);
    expect(totals.kcal).toEqual({
      value: 30,
      complete: false,
      unknownCount: 1,
    });
    expect(totals.proteinG).toEqual({
      value: 6,
      complete: false,
      unknownCount: 1,
    });
    expect(totals.carbsG).toEqual({
      value: 9,
      complete: false,
      unknownCount: 1,
    });
    expect(totals.fatG).toEqual({ value: 6, complete: false, unknownCount: 1 });
    expect(totals.fiberG).toEqual({
      value: null,
      complete: false,
      unknownCount: 3,
    });
  });

  it("works on saved-meal style entries (partial QuantityNutrition)", () => {
    const totals = sumEntries([{ kcal: 42 }]);
    expect(totals.kcal.value).toBe(42);
    expect(totals.proteinG).toEqual({
      value: null,
      complete: false,
      unknownCount: 1,
    });
  });
});
