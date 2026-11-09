"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";

import type { Recipe } from "@/lib/content/recipes";
import { scaleIngredient, scaleNutrition } from "@/lib/nutrition/scale";

/** Four times the recipe's own serving count is enough for a home kitchen. */
const MAX_SERVINGS_FACTOR = 4;

const stepButton =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-(--radius-input) border border-(--color-rule-2) text-(--color-ink) disabled:opacity-55 disabled:cursor-not-allowed";

/**
 * Serving adjustments: one control drives the ingredient quantities and the
 * nutrition figures, so the numbers on the page always match each other.
 */
export function RecipeServings({ recipe }: { recipe: Recipe }) {
  const t = useTranslations("recipe");
  const format = useFormatter();
  const [servings, setServings] = useState(recipe.baseServings);

  const max = recipe.baseServings * MAX_SERVINGS_FACTOR;
  const factor = servings / recipe.baseServings;
  const totals = scaleNutrition(recipe.perServing, servings);
  const rows = [
    {
      key: "kcal",
      per: recipe.perServing.kcal,
      total: totals.kcal,
      unit: "kcal",
    },
    {
      key: "protein",
      per: recipe.perServing.proteinG,
      total: totals.proteinG,
      unit: "g",
    },
    {
      key: "carbs",
      per: recipe.perServing.carbsG,
      total: totals.carbsG,
      unit: "g",
    },
    { key: "fat", per: recipe.perServing.fatG, total: totals.fatG, unit: "g" },
  ] as const;

  return (
    <div>
      <div className="hairline flex flex-wrap items-center gap-(--space-md) py-(--space-md)">
        <span className="text-sm text-(--color-muted)" id="servings-label">
          {t("servingsLabel")}
        </span>
        <div className="flex items-center gap-(--space-xs)">
          <button
            type="button"
            className={stepButton}
            aria-label={t("servingsDecrease")}
            disabled={servings <= 1}
            onClick={() => setServings((value) => Math.max(1, value - 1))}
          >
            <Minus aria-hidden="true" className="size-4" />
          </button>
          <output
            aria-labelledby="servings-label"
            className="num px-(--space-xs) font-display text-lg"
          >
            {servings}
          </output>
          <button
            type="button"
            className={stepButton}
            aria-label={t("servingsIncrease")}
            disabled={servings >= max}
            onClick={() => setServings((value) => Math.min(max, value + 1))}
          >
            <Plus aria-hidden="true" className="size-4" />
          </button>
        </div>
        <p className="text-sm text-(--color-muted)">{t("scaledNote")}</p>
      </div>

      <h2 className="mt-(--space-xl)">{t("ingredientsHead")}</h2>
      <ul className="mt-(--space-sm) list-none">
        {recipe.ingredients.map((line) => (
          <li className="hairline py-(--space-xs)" key={line}>
            {scaleIngredient(line, factor)}
          </li>
        ))}
      </ul>

      <h2 className="mt-(--space-xl)">{t("nutritionHead")}</h2>
      <table className="num mt-(--space-sm) w-full border-collapse text-sm">
        <caption className="visually-hidden">{t("nutritionHead")}</caption>
        <thead>
          <tr className="text-(--color-muted)">
            <th scope="col" className="text-left font-normal">
              {t("nutritionPerServing")}
            </th>
            <th scope="col" className="text-left font-normal">
              {t("nutritionTotal", { count: servings })}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, per, total, unit }) => (
            <tr className="hairline" key={key}>
              <th
                scope="row"
                className="py-(--space-xs) text-left font-medium text-(--color-ink)"
              >
                {t(key)}
                <span className="text-(--color-muted)">{unit}</span>
              </th>
              <td className="py-(--space-xs) text-left text-(--color-ink-2)">
                {format.number(per)}
              </td>
              <td className="py-(--space-xs) text-left text-(--color-ink)">
                {format.number(total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
