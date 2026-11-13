import { roundGrams } from "@/lib/nutrition/scale";

/**
 * Macronutrient estimates for eligible adults only.
 *
 * Conversion factors are the Atwater general factors (protein 4 kcal/g,
 * carbohydrate 4 kcal/g, fat 9 kcal/g; FAO/USDA Food Energy — widely used for
 * labelled values). Grams and kilocalories are kept separate throughout.
 *
 * Method (a share-based approach, deliberately conservative — these are
 * GainWell's simplified product assumptions, not universal prescriptions and
 * not something any individual "must" hit):
 *   protein 1.2 g per kg of body weight, capped at 150 g/day — inside the
 *     1.0–1.6 g/kg range commonly cited for adults building weight;
 *   fat 25% of the daily energy target — a fixed share chosen for simplicity;
 *     it sits near the low end of the 20–35% of energy commonly quoted for
 *     adults, and other valid splits exist;
 *   carbohydrate fills the remainder, never below zero.
 *
 * Totals are recomputed from the *rounded* gram figures, so the kcal number
 * shown always equals the sum of the grams shown (±0), rather than a target
 * that the grams contradict.
 */
export const KCAL_PER_GRAM = { protein: 4, carbohydrate: 4, fat: 9 } as const;

export const PROTEIN_G_PER_KG = 1.2;
export const PROTEIN_MAX_G = 150;
export const FAT_ENERGY_SHARE = 0.25;

export type Macronutrients = {
  proteinG: number;
  carbohydrateG: number;
  fatG: number;
  /** Sum of the rounded grams × Atwater factors — internally consistent. */
  kcal: number;
};

export function macroTargets(
  targetKcal: number,
  weightKg: number,
): Macronutrients {
  const proteinG = roundGrams(
    Math.min(weightKg * PROTEIN_G_PER_KG, PROTEIN_MAX_G),
  );
  const fatG = roundGrams((targetKcal * FAT_ENERGY_SHARE) / KCAL_PER_GRAM.fat);
  const carbohydrateG = roundGrams(
    Math.max(
      0,
      (targetKcal -
        proteinG * KCAL_PER_GRAM.protein -
        fatG * KCAL_PER_GRAM.fat) /
        KCAL_PER_GRAM.carbohydrate,
    ),
  );

  return {
    proteinG,
    carbohydrateG,
    fatG,
    kcal:
      proteinG * KCAL_PER_GRAM.protein +
      carbohydrateG * KCAL_PER_GRAM.carbohydrate +
      fatG * KCAL_PER_GRAM.fat,
  };
}
