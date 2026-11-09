import { Clock, Flame } from "lucide-react";
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

/**
 * One recipe as a hairline row rather than a repeated card: title, one line of
 * summary, and the four figures a person checks before cooking.
 */
export function RecipeRow({ recipe }: { recipe: Recipe }) {
  const t = useTranslations("recipes");
  const format = useFormatter();

  return (
    <li className="hairline py-(--space-md)">
      <span className="rounded-(--radius-pill) bg-(--color-sage) px-(--space-sm) py-(--space-2xs) text-sm text-(--color-accent-ink)">
        {t(categoryKey[recipe.category])}
      </span>
      <h3 className="mt-(--space-xs)">
        <Link
          href={`/recipes/${recipe.slug}`}
          className="no-underline hover:underline"
        >
          {recipe.title}
        </Link>
      </h3>
      <p className="mt-(--space-xs) text-(--color-ink-2)">{recipe.summary}</p>

      <div className="num mt-(--space-sm) flex flex-wrap gap-x-(--space-lg) text-sm text-(--color-muted)">
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
    </li>
  );
}
