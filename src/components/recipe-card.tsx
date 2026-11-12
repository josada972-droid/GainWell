import {
  Apple,
  Beef,
  Clock,
  Coffee,
  Flame,
  GlassWater,
  Sandwich,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { Recipe, RecipeCategory } from "@/lib/content/recipes";

export const categoryKey: Record<RecipeCategory, string> = {
  smoothie: "filterSmoothie",
  breakfast: "filterBreakfast",
  lunch: "filterLunch",
  dinner: "filterDinner",
  snack: "filterSnack",
};

/** Drawn food marks instead of photographs: one icon per category. */
export const categoryIcon: Record<RecipeCategory, LucideIcon> = {
  smoothie: GlassWater,
  breakfast: Coffee,
  lunch: Sandwich,
  dinner: Beef,
  snack: Apple,
};

/**
 * One recipe as a hairline row rather than a repeated card: its mark, its title,
 * one line of summary, and the four figures a person checks before cooking.
 */
export function RecipeRow({ recipe }: { recipe: Recipe }) {
  const t = useTranslations("recipes");
  const format = useFormatter();
  const Icon = categoryIcon[recipe.category];

  return (
    <li className="recipe-row hairline">
      <span className="food-mark" aria-hidden="true">
        <Icon className="size-5" />
      </span>
      <div>
        <h3>
          <Link
            href={`/recipes/${recipe.slug}`}
            className="no-underline hover:underline"
          >
            {recipe.title}
          </Link>
        </h3>
        <p className="mt-(--space-xs) text-(--color-ink-2)">{recipe.summary}</p>

        <div className="num mt-(--space-xs) flex flex-wrap gap-x-(--space-md) gap-y-(--space-2xs) text-sm text-(--color-muted)">
          <span className="text-(--color-ink-2)">
            {t(categoryKey[recipe.category])}
          </span>
          <span className="inline-flex items-center gap-(--space-2xs)">
            <Clock aria-hidden="true" className="size-4" />
            {t("prepTime")} {t("minutes", { count: recipe.prepMinutes })}
          </span>
          <span className="inline-flex items-center gap-(--space-2xs)">
            <Flame aria-hidden="true" className="size-4" />
            {format.number(recipe.perServing.kcal)} {t("kcal")}
          </span>
          <span>
            {format.number(recipe.perServing.proteinG)} {t("grams")}
          </span>
          <span>{t("servings", { count: recipe.baseServings })}</span>
        </div>
      </div>
    </li>
  );
}
