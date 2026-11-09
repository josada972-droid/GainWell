import { getTranslations } from "next-intl/server";

import { RecipeBrowser } from "@/components/recipe-browser";
import { SectionHeading } from "@/components/section-heading";
import { routing } from "@/i18n/routing";
import { getRecipes } from "@/lib/content/recipes";
import { currentLocale } from "@/lib/locale";

export async function generateMetadata() {
  const t = await getTranslations("recipes");
  return { title: await t("title"), description: await t("lead") };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RecipesPage() {
  const locale = await currentLocale();
  const t = await getTranslations("recipes");

  return (
    <section className="hairline py-(--section-gap)">
      <div className="container">
        <SectionHeading level={1} title={t("title")} lead={t("lead")} />
        <div className="mt-(--space-xl)">
          <RecipeBrowser recipes={getRecipes(locale)} />
        </div>
      </div>
    </section>
  );
}
