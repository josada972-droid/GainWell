import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ActionLink } from "@/components/action-link";
import { FavoriteButton } from "@/components/favorite-button";
import { categoryKey, tagKey } from "@/components/recipe-card";
import { RecipeServings } from "@/components/recipe-servings";
import { routing } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/session";
import { getRecipe, recipeSlugs } from "@/lib/content/recipes";
import { listFavoriteSlugs } from "@/lib/progress/store";
import { currentLocale } from "@/lib/locale";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/recipes/[slug]">) {
  const { slug } = await params;
  const locale = await currentLocale();
  const recipe = getRecipe(locale, slug);
  const t = await getTranslations("recipes");
  return recipe
    ? { title: recipe.title, description: recipe.summary }
    : { title: await t("title"), description: await t("lead") };
}

// Slugs are locale-independent, so the language switcher keeps working here.
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    recipeSlugs.map((slug) => ({ locale, slug })),
  );
}

/** The favourite toggle, resolved against the live session. */
async function RecipeFavorite({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) {
  const user = await getCurrentUser();
  const favoriteSlugs = user ? await listFavoriteSlugs(user.id) : [];

  return (
    <FavoriteButton
      slug={slug}
      isFavorite={favoriteSlugs.includes(slug)}
      signedIn={Boolean(user)}
      locale={locale}
    />
  );
}

export default async function RecipePage({
  params,
}: PageProps<"/[locale]/recipes/[slug]">) {
  const { slug } = await params;
  const locale = await currentLocale();
  const recipe = getRecipe(locale, slug);
  if (!recipe) notFound();

  const t = await getTranslations("recipe");
  const tr = await getTranslations("recipes");
  const format = await getFormatter();

  return (
    <article>
      <section className="desk hairline py-(--section-gap)">
        <div className="container">
          <Link
            href="/recipes"
            className="text-sm text-(--color-muted) hover:text-(--color-ink)"
          >
            {t("backToRecipes")}
          </Link>
          <h1 className="mt-(--space-md)">{recipe.title}</h1>
          <p className="lead mt-(--space-md) text-(--color-ink-2)">
            {recipe.summary}
          </p>

          <div className="num mt-(--space-lg) flex flex-wrap items-center gap-x-(--space-lg) gap-y-(--space-xs) text-sm text-(--color-muted)">
            <span className="rounded-(--radius-pill) bg-(--color-sage) px-(--space-sm) py-(--space-2xs) text-(--color-accent-ink)">
              {tr(categoryKey[recipe.category])}
            </span>
            <span>
              {tr("prepTime")} {tr("minutes", { count: recipe.prepMinutes })}
            </span>
            {recipe.cookMinutes ? (
              <span>
                {tr("cookTime")} {tr("minutes", { count: recipe.cookMinutes })}
              </span>
            ) : null}
            <span>{tr("servings", { count: recipe.baseServings })}</span>
            <span>
              {t("updated", {
                date: format.dateTime(new Date(recipe.updatedAt), {
                  dateStyle: "long",
                }),
              })}
            </span>
          </div>

          {recipe.tags.length > 0 ? (
            <ul
              aria-label={tr("tagsLabel")}
              className="mt-(--space-md) flex list-none flex-wrap gap-(--space-2xs)"
            >
              {recipe.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-(--radius-pill) bg-(--color-sage) px-(--space-sm) py-(--space-2xs) text-sm text-(--color-accent-ink)"
                >
                  {tr(`tags.${tagKey[tag]}`)}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-(--space-lg)">
            {/* The session read (favourite state) is the only dynamic part
                of this page. */}
            <Suspense fallback={null}>
              <RecipeFavorite slug={recipe.slug} locale={locale} />
            </Suspense>
          </div>

          <p className="mt-(--space-lg) inline-flex items-start gap-(--space-xs) text-sm leading-relaxed text-(--color-ink-2)">
            <TriangleAlert
              aria-hidden="true"
              className="mt-px size-4 shrink-0 text-(--color-green)"
            />
            {t("sampleNotice")}
          </p>
          <p className="mt-(--space-xs) text-sm text-(--color-muted)">
            {t("source")}
          </p>
        </div>
      </section>

      <section className="hairline py-(--section-gap)">
        <div className="container">
          <RecipeServings recipe={recipe} />
        </div>
      </section>

      <section className="hairline py-(--section-gap)">
        <div className="container">
          <h2>{t("stepsHead")}</h2>
          <ol className="mt-(--space-md) list-none">
            {recipe.steps.map((step, index) => (
              <li
                className="hairline grid grid-cols-[3ch_minmax(0,1fr)] gap-(--space-md) py-(--space-md)"
                key={step}
              >
                <span className="num font-display text-(--color-green)">
                  {index + 1}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>

          <div className="mt-(--space-xl) rounded-(--radius-card) bg-(--color-peach) p-(--space-md)">
            <h3>{t("tipHead")}</h3>
            <p className="mt-(--space-xs) text-(--color-ink-2)">{recipe.tip}</p>
          </div>

          <div className="mt-(--space-xl)">
            <ActionLink href="/recipes" variant="quiet">
              {t("backToRecipes")}
            </ActionLink>
          </div>
        </div>
      </section>
    </article>
  );
}
