import { describe, expect, it } from "vitest";

import {
  roundGrams,
  scaleIngredient,
  scaleNutrition,
} from "@/lib/nutrition/scale";

/** The recipe stepper's pure maths (src/lib/nutrition/scale.ts). */
describe("recipe scaling", () => {
  it("multiplies nutrition and keeps the rounding rule", () => {
    expect(
      scaleNutrition({ kcal: 420, proteinG: 18.4, carbsG: 55, fatG: 9.9 }, 2),
    ).toEqual({
      kcal: 840,
      proteinG: 37,
      carbsG: 110,
      fatG: 20,
    });
  });

  it("keeps one decimal below 10 g and whole numbers above it", () => {
    expect(roundGrams(4.44)).toBe(4.4);
    expect(roundGrams(9.96)).toBe(10);
    expect(roundGrams(12.6)).toBe(13);
  });

  it("scales ingredient quantities and leaves unquantified lines alone", () => {
    expect(scaleIngredient("350 ml whole milk", 2)).toBe("700 ml whole milk");
    expect(scaleIngredient("1 banana", 1.5)).toBe("1.5 banana");
    expect(scaleIngredient("a pinch of cinnamon", 3)).toBe(
      "a pinch of cinnamon",
    );
    expect(scaleIngredient("250,5 g flour", 2)).toBe("501 g flour");
  });
});
