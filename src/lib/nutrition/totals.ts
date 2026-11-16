/**
 * Nutrition totals with explicit completeness semantics (Stage 4). Pure
 * TypeScript, independent of React/Next/Supabase/networking.
 *
 * One representation for incomplete totals, applied to every nutrient:
 * * all contributors known      → exact total, `complete: true`
 * * some known, some unknown    → sum of the known ones as a LOWER BOUND,
 *                                 `complete: false`, `unknownCount > 0`
 *                                 — the UI labels it "At least X"
 * * no contributor known        → `value: null` (unknown), `complete: false`
 * * an empty list               → 0, `complete: true` (nothing logged is a
 *                                 real answer, not a missing one)
 */
import type { QuantityNutrition } from "@/lib/nutrition/food";

export type NutrientTotal = {
  /** Sum of known values; `null` when nothing is known. */
  value: number | null;
  /** True only when every contributor's value was known. */
  complete: boolean;
  /** How many contributors had an unknown value for this nutrient. */
  unknownCount: number;
};

export type NutritionTotals = {
  entryCount: number;
  kcal: NutrientTotal;
  proteinG: NutrientTotal;
  carbsG: NutrientTotal;
  fatG: NutrientTotal;
  fiberG: NutrientTotal;
};

type NutrientKey = "kcal" | "proteinG" | "carbsG" | "fatG" | "fiberG";

function totalFor(
  entries: ReadonlyArray<Partial<QuantityNutrition>>,
  key: NutrientKey,
  entryCount: number,
): NutrientTotal {
  if (entryCount === 0) {
    return { value: 0, complete: true, unknownCount: 0 };
  }
  let sum = 0;
  let unknownCount = 0;
  for (const entry of entries) {
    const value = entry[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      sum += value;
    } else {
      unknownCount += 1;
    }
  }
  if (unknownCount === entryCount) {
    return { value: null, complete: false, unknownCount };
  }
  return {
    value: Math.round(sum * 1000) / 1000,
    complete: unknownCount === 0,
    unknownCount,
  };
}

/**
 * Totals for any group of entries (a meal, a day, a saved meal). To combine
 * several groups (e.g. a day from its meals), pass the flattened entry list —
 * lower-bound semantics are only exact with the original entries.
 */
export function sumEntries(
  entries: ReadonlyArray<Partial<QuantityNutrition> | null>,
): NutritionTotals {
  const usable = entries.filter(
    (entry): entry is Partial<QuantityNutrition> => entry !== null,
  );
  return {
    entryCount: usable.length,
    kcal: totalFor(usable, "kcal", usable.length),
    proteinG: totalFor(usable, "proteinG", usable.length),
    carbsG: totalFor(usable, "carbsG", usable.length),
    fatG: totalFor(usable, "fatG", usable.length),
    fiberG: totalFor(usable, "fiberG", usable.length),
  };
}
