/**
 * Food representation and quantity calculations (Stage 4). Pure TypeScript:
 * no React, no Next, no Supabase, no networking — the same independence the
 * rest of the engine keeps (docs/nutrition.md documents the rules).
 *
 * Core rules:
 * * A missing nutrient value is `null`, never 0.
 * * Every food carries an explicit nutrition basis; a quantity is only
 *   computable when the quantity unit matches the basis. Grams and
 *   millilitres are NEVER interchangeable — there is no density to assume.
 * * Per-serving foods are logged in servings: without a known serving mass,
 *   converting "1 serving" into grams would be a guess.
 * * A quantity that cannot be computed safely returns `null` (an explicit
 *   "incomplete" result), never an invented number.
 */

/** The nutrition basis the values describe. */
export type NutritionBasis = "per_100g" | "per_100ml" | "per_serving";

/** The quantity unit an entry is recorded in. */
export type QuantityUnit = "g" | "ml" | "serving";

export type FoodSourceKind = "open_food_facts" | "custom";

/**
 * One nutrient set on a basis. `null` = unknown; consumers must surface
 * missing values, not treat them as zero.
 */
export type NutrientSet = {
  kcal: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
};

export type Food = {
  name: string;
  brand: string | null;
  /** The basis the `values` describe. */
  basis: NutritionBasis;
  values: NutrientSet;
  /** Serving size where the source supplied one (number + unit). */
  servingQuantity: number | null;
  servingUnit: QuantityUnit | null;
  /** Whether the values were supplied directly or derived/estimated. */
  estimated: boolean;
  source: {
    kind: FoodSourceKind;
    /** Open Food Facts barcode, when the food came from there. */
    code: string | null;
    /** Custom-foods row id, when the food came from there. */
    customFoodId?: string | null;
    /** Attribution, e.g. the Open Food Facts product page URL. */
    attribution: string | null;
  };
};

/**
 * Nutrition for one recorded quantity. `null` nutrient values are unknown;
 * `grams` is null when the unit/basis pair does not determine a mass.
 */
export type QuantityNutrition = {
  grams: number | null;
  kcal: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  /** True when every nutrient value was known for this quantity. */
  complete: boolean;
};

function scaleValue(value: number | null, factor: number): number | null {
  if (value === null) return null;
  return Math.round(value * factor * 1000) / 1000;
}

/**
 * Whether a quantity unit can be honestly applied to a basis. Only matching
 * pairs compute: grams for per-100g, millilitres for per-100ml, servings for
 * per-serving. Nothing is converted across (no assumed densities).
 */
export function unitMatchesBasis(
  unit: QuantityUnit,
  basis: NutritionBasis,
): boolean {
  if (unit === "serving") return basis === "per_serving";
  if (unit === "g") return basis === "per_100g";
  return basis === "per_100ml";
}

/** Rejects non-finite, zero and negative quantities. */
export function isValidQuantity(quantity: number): boolean {
  return Number.isFinite(quantity) && quantity > 0;
}

/**
 * Nutrition for `quantity` of `unit`, or `null` when the combination cannot
 * be computed safely (invalid quantity, unit does not fit the basis).
 */
export function nutritionForQuantity(
  food: Food,
  quantity: number,
  unit: QuantityUnit,
): QuantityNutrition | null {
  if (!isValidQuantity(quantity)) return null;
  if (!unitMatchesBasis(unit, food.basis)) return null;

  const factor = food.basis === "per_serving" ? quantity : quantity / 100; // per-100 bases

  const kcal = scaleValue(food.values.kcal, factor);
  const proteinG = scaleValue(food.values.proteinG, factor);
  const carbsG = scaleValue(food.values.carbsG, factor);
  const fatG = scaleValue(food.values.fatG, factor);
  const fiberG = scaleValue(food.values.fiberG, factor);

  return {
    // Mass: grams are only known for per-100g foods logged in grams (and for
    // per-100ml foods logged in ml, where the basis IS the volume basis —
    // the grams of product, not the volume). Servings carry no known mass
    // unless the source supplied one in grams, which OFF does not reliably
    // distinguish — so servings never report a mass.
    grams:
      food.basis === "per_100g" && unit === "g"
        ? Math.round(quantity * 1000) / 1000
        : null,
    kcal,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    complete:
      kcal !== null &&
      proteinG !== null &&
      carbsG !== null &&
      fatG !== null &&
      fiberG !== null,
  };
}

/**
 * Recalculates an entry's nutrition from its stored immutable source values
 * — the exact operation a quantity edit performs. Reads nothing external:
 * the source snapshot on the row is the only input.
 */
export function recalculateFromSource(
  source: {
    source_kcal: number | null;
    source_protein_g: number | null;
    source_carbs_g: number | null;
    source_fat_g: number | null;
    source_fiber_g: number | null;
    source_basis: string;
  },
  quantity: number,
  unit: QuantityUnit,
): QuantityNutrition | null {
  const food: Food = {
    name: "",
    brand: null,
    basis: source.source_basis as NutritionBasis,
    values: {
      kcal: source.source_kcal,
      proteinG: source.source_protein_g,
      carbsG: source.source_carbs_g,
      fatG: source.source_fat_g,
      fiberG: source.source_fiber_g,
    },
    servingQuantity: null,
    servingUnit: null,
    estimated: false,
    source: { kind: "custom", code: null, attribution: null },
  };
  return nutritionForQuantity(food, quantity, unit);
}
