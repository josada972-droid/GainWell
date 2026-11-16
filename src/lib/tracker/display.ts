import type { NutrientTotal } from "@/lib/nutrition/totals";

/**
 * Display rules for nutrition totals (Stage 4). The engine reports numbers
 * and completeness; this module maps them onto message keys — the UI
 * translates, nothing user-facing is hardcoded (AGENTS.md §14).
 *
 * * complete total       → "X"
 * * incomplete lower bound → "At least X" (never presented as exact)
 * * no known values      → "unknown", never zero
 */
export type TotalTranslator = {
  (key: string): string;
  (key: string, values: Record<string, string | number>): string;
};

export function totalLine(
  t: TotalTranslator,
  total: NutrientTotal,
  unit: string,
  formatNumber: (value: number) => string,
): string {
  if (total.value === null) return t("totals.unknown");
  const value = `${formatNumber(total.value)} ${unit}`;
  return total.complete ? value : t("totals.atLeast", { value });
}

/** Compact one-line summary for a meal/day: "540 kcal · 12 g protein". */
export function totalsSummary(
  t: TotalTranslator,
  totals: {
    kcal: NutrientTotal;
    proteinG: NutrientTotal;
    carbsG: NutrientTotal;
    fatG: NutrientTotal;
    fiberG: NutrientTotal;
  },
  formatNumber: (value: number) => string,
): string {
  const parts: string[] = [];
  if (totals.kcal.value !== null) {
    parts.push(totalLine(t, totals.kcal, t("totals.units.kcal"), formatNumber));
  }
  for (const [key, label] of [
    ["proteinG", "totals.protein"],
    ["carbsG", "totals.carbs"],
    ["fatG", "totals.fat"],
    ["fiberG", "totals.fiber"],
  ] as const) {
    const total = totals[key];
    if (total.value !== null) {
      parts.push(
        `${formatNumber(total.value)} ${t("totals.units.g")} ${t(label)}`,
      );
    }
  }
  const anyUnknown =
    totals.kcal.value === null ||
    totals.kcal.unknownCount > 0 ||
    totals.proteinG.value === null ||
    totals.proteinG.unknownCount > 0 ||
    totals.carbsG.value === null ||
    totals.carbsG.unknownCount > 0 ||
    totals.fatG.value === null ||
    totals.fatG.unknownCount > 0 ||
    totals.fiberG.value === null ||
    totals.fiberG.unknownCount > 0;
  if (anyUnknown) {
    parts.push(t("totals.someUnknown"));
  }
  return parts.length > 0 ? parts.join(" · ") : t("totals.empty");
}
