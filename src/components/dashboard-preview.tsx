import { CircleCheck } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { getRecipes } from "@/lib/content/recipes";
import { currentLocale } from "@/lib/locale";

/** The three sample meals shown in the preview, one per meal type. */
const SAMPLE_MEALS = [
  "egg-cheese-scramble",
  "tuna-rice-bowl",
  "banana-oat-smoothie",
] as const;

/** A sample daily line, stated in the caption as sample, not a promise. */
const SAMPLE_TARGET = 2400;

/**
 * The dashboard GainWell will have, built as HTML because there is no dashboard
 * route to screenshot yet (Stage 3 tracking). Display only: no controls, no
 * success state, and every figure is a sample value taken from the seed recipes.
 */
export async function DashboardPreview() {
  const locale = await currentLocale();
  const t = await getTranslations("home");
  const format = await getFormatter();

  const meals = getRecipes(locale).filter((recipe) =>
    (SAMPLE_MEALS as readonly string[]).includes(recipe.slug),
  );
  const eaten = meals.reduce((sum, recipe) => sum + recipe.perServing.kcal, 0);
  const protein = meals.reduce(
    (sum, recipe) => sum + recipe.perServing.proteinG,
    0,
  );
  const fill = Math.min(100, Math.round((eaten / SAMPLE_TARGET) * 100));

  return (
    <figure data-slot="dashboard" className="stock p-(--space-lg)">
      <div className="flex items-baseline justify-between gap-(--space-md)">
        <span className="text-sm text-(--color-muted)">
          {t("previewTargetLabel")}
        </span>
        <span className="num font-display text-2xl text-(--color-ink)">
          {format.number(SAMPLE_TARGET)} {t("previewTargetUnit")}
        </span>
      </div>
      <div className="preview-bar mt-(--space-sm)" aria-hidden="true">
        <span style={{ width: `${fill}%` }} />
      </div>

      <ul className="mt-(--space-md) list-none">
        {meals.map((recipe) => (
          <li className="preview-row" key={recipe.slug}>
            <span className="text-(--color-ink-2)">{recipe.title}</span>
            <span className="num text-(--color-ink)">
              {format.number(recipe.perServing.kcal)}
            </span>
          </li>
        ))}
      </ul>

      <div className="preview-row">
        <span className="text-(--color-ink)">{t("previewEatenLabel")}</span>
        <span className="num font-display text-lg text-(--color-ink)">
          {format.number(eaten)} {t("previewTargetUnit")}
        </span>
      </div>
      <div className="preview-row">
        <span className="inline-flex items-center gap-(--space-2xs) text-(--color-accent-ink)">
          <CircleCheck
            aria-hidden="true"
            className="size-4 text-(--color-green)"
          />
          {t("previewState")}
        </span>
        <span className="num text-(--color-ink-2)">
          {t("previewMealsLabel")} {format.number(meals.length)}
        </span>
      </div>
      <div className="preview-row">
        <span className="text-(--color-ink-2)">{t("previewProteinLabel")}</span>
        {/* "g" is a unit symbol, the same in both languages. */}
        <span className="num text-(--color-ink)">
          {format.number(protein)} g
        </span>
      </div>

      <figcaption className="mt-(--space-md) text-sm leading-relaxed text-(--color-muted)">
        {t("previewCaption")}
      </figcaption>
    </figure>
  );
}
