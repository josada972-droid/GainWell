import type { Locale } from "@/i18n/routing";
import type { Recipe, RecipeCategory, RecipeTag } from "../recipes";

/**
 * Compact bilingual definition for the Stage 7G recipe expansion.
 *
 * One definition per recipe holds both languages side by side, so a recipe can
 * never be added in English only. `macros` are the per-serving protein / carbs /
 * fat estimates the recipe's ingredients support; `kcal` is DERIVED from them
 * with the Atwater factors (4/4/9), which keeps the catalogue's nutrition
 * internally consistent by construction (tests/recipe-content.test.ts asserts
 * kcal within 8% of 4·P + 4·C + 9·F).
 */
export type Pair = readonly [en: string, fr: string];

export type RecipeDef = {
  slug: string;
  category: RecipeCategory;
  tags: RecipeTag[];
  /** Hands-on minutes; `quick` must be present exactly when this is <= 15. */
  prep: number;
  /** Stove/oven minutes; omit entirely for a no-cook recipe (`noCook`). */
  cook?: number;
  servings: number;
  /** Per serving: [protein g, carbs g, fat g]. */
  macros: readonly [number, number, number];
  title: Pair;
  summary: Pair;
  ingredients: Pair[];
  steps: Pair[];
  tip: Pair;
};

export function toRecipes(
  defs: readonly RecipeDef[],
  locale: Locale,
): Recipe[] {
  const at = locale === "en" ? 0 : 1;
  return defs.map((d) => ({
    slug: d.slug,
    category: d.category,
    title: d.title[at],
    summary: d.summary[at],
    prepMinutes: d.prep,
    ...(d.cook === undefined ? {} : { cookMinutes: d.cook }),
    baseServings: d.servings,
    perServing: {
      kcal: Math.round(4 * d.macros[0] + 4 * d.macros[1] + 9 * d.macros[2]),
      proteinG: d.macros[0],
      carbsG: d.macros[1],
      fatG: d.macros[2],
    },
    tags: d.tags,
    ingredients: d.ingredients.map((p) => p[at]),
    steps: d.steps.map((p) => p[at]),
    tip: d.tip[at],
    updatedAt: "2026-11-20",
  }));
}
