import { getTranslations } from "next-intl/server";

import { ActionLink } from "@/components/action-link";

/** Used when notFound() is thrown inside /guides, so the copy names the library. */
export default async function GuidesNotFound() {
  const t = await getTranslations("guides");
  const back = await getTranslations("guide");

  return (
    <section className="desk hairline py-(--section-gap-l)">
      <div className="container">
        <h1>{t("notFoundTitle")}</h1>
        <p className="lead mt-(--space-md) text-(--color-ink-2)">
          {t("notFoundBody")}
        </p>
        <div className="mt-(--space-xl)">
          <ActionLink href="/guides" variant="quiet">
            {back("backToGuides")}
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
