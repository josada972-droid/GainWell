import type { Nutrition } from "@/lib/content/recipes";

/**
 * Pure scaling for the serving stepper. Recipe values are written per serving and
 * ingredient lines start with a quantity, so scaling is a multiply plus a rounding
 * rule. Unit tests land with Vitest in Stage 3; e2e tests cover the stepper here.
 */

export function scaleNutrition(
  perServing: Nutrition,
  servings: number,
): Nutrition {
  return {
    kcal: Math.round(perServing.kcal * servings),
    proteinG: roundGrams(perServing.proteinG * servings),
    carbsG: roundGrams(perServing.carbsG * servings),
    fatG: roundGrams(perServing.fatG * servings),
  };
}

/** Grams keep one decimal below 10, whole numbers above it. */
export function roundGrams(value: number): number {
  return value < 10 ? Math.round(value * 10) / 10 : Math.round(value);
}

/**
 * Ingredient lines look like "350 ml whole milk" or "1 banana". Lines without a
 * leading quantity ("a pinch of cinnamon") are left alone.
 */
export function scaleIngredient(line: string, factor: number): string {
  const match = /^(\d+(?:[.,]\d+)?)\s+(.+)$/.exec(line.trim());
  if (!match) return line;

  const amount = Number(match[1].replace(",", ".")) * factor;
  return `${formatAmount(amount)} ${match[2]}`;
}

function formatAmount(amount: number): string {
  const rounded =
    amount < 10 ? Math.round(amount * 10) / 10 : Math.round(amount);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
