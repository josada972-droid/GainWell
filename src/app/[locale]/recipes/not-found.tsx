import { getTranslations } from "next-intl/server";

import { ActionLink } from "@/components/action-link";

/** Used when notFound() is thrown inside /recipes, so the copy names the library. */
export default async function RecipesNotFound() {
  const t = await getTranslations("recipe");

  return (
    <section className="desk hairline py-(--section-gap-l)">
      <div className="container">
        <h1>{t("notFoundTitle")}</h1>
        <p className="lead mt-(--space-md) text-(--color-ink-2)">
          {t("notFoundBody")}
        </p>
        <div className="mt-(--space-xl)">
          <ActionLink href="/recipes" variant="quiet">
            {t("backToRecipes")}
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
