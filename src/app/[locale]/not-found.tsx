import { getTranslations } from "next-intl/server";

import { ActionLink } from "@/components/action-link";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <section className="desk hairline py-(--section-gap-l)">
      <div className="container">
        <h1>{t("title")}</h1>
        <p className="lead mt-(--space-md) text-(--color-ink-2)">{t("body")}</p>
        <div className="mt-(--space-xl) flex flex-wrap gap-(--space-sm)">
          <ActionLink href="/">{t("ctaHome")}</ActionLink>
          <ActionLink href="/recipes" variant="quiet">
            {t("ctaRecipes")}
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
