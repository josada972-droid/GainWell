import { getTranslations } from "next-intl/server";

import { ActionLink } from "@/components/action-link";
import { DashboardPreview } from "@/components/dashboard-preview";
import { Faq } from "@/components/faq";
import { FeatureSection } from "@/components/feature-section";
import { GuideRow } from "@/components/guide-card";
import { RecipeRow } from "@/components/recipe-card";
import { StatusList } from "@/components/status-list";
import { routing } from "@/i18n/routing";
import { getGuides } from "@/lib/content/guides";
import { getRecipes } from "@/lib/content/recipes";
import { currentLocale } from "@/lib/locale";

/** Three categories on the homepage, so the preview shows the spread of the library. */
const previewRecipes = [
  "banana-oat-smoothie",
  "tuna-rice-bowl",
  "creamy-chicken-rice",
];
const previewGuides = [
  "weight-gain-basics",
  "eating-with-low-appetite",
  "affordable-nutritious-meals",
];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage() {
  const locale = await currentLocale();
  const t = await getTranslations("home");

  const recipes = getRecipes(locale).filter((recipe) =>
    previewRecipes.includes(recipe.slug),
  );
  const guides = getGuides(locale).filter((guide) =>
    previewGuides.includes(guide.slug),
  );
  const faq = [1, 2, 3, 4, 5].map((n) => ({
    question: t(`faq.q${n}`),
    answer: t(`faq.a${n}`),
  }));

  return (
    <>
      <section className="desk hairline py-(--section-gap-l)">
        <div className="container grid gap-(--space-2xl) lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <h1>{t("title")}</h1>
            <p className="lead mt-(--space-lg) text-(--color-ink-2)">
              {t("lead")}
            </p>
            <div className="mt-(--space-xl) flex flex-wrap gap-(--space-sm)">
              <ActionLink href="/how-it-works">{t("ctaPrimary")}</ActionLink>
              <ActionLink href="/recipes" variant="quiet">
                {t("ctaSecondary")}
              </ActionLink>
            </div>
            <p className="mt-(--space-lg) text-sm text-(--color-muted)">
              {t("freeLine")}
            </p>
          </div>
          <div className="lg:col-span-6">
            <DashboardPreview />
          </div>
        </div>
      </section>

      <section className="hairline py-(--section-gap)">
        <div className="container">
          <p className="max-w-[22ch] font-display text-display-s leading-[1.06] text-(--color-ink)">
            {t("statement")}
          </p>
        </div>
      </section>

      <FeatureSection
        index="01"
        title={t("recipesHead")}
        lead={t("recipesLead")}
        action={
          <ActionLink href="/recipes" variant="quiet">
            {t("recipesAll")}
          </ActionLink>
        }
      >
        <ul className="list-none">
          {recipes.map((recipe) => (
            <RecipeRow key={recipe.slug} recipe={recipe} />
          ))}
        </ul>
      </FeatureSection>

      <FeatureSection
        tone="desk"
        index="02"
        title={t("guidesHead")}
        lead={t("guidesLead")}
        action={
          <ActionLink href="/guides" variant="quiet">
            {t("guidesAll")}
          </ActionLink>
        }
      >
        <ul className="list-none">
          {guides.map((guide) => (
            <GuideRow key={guide.slug} guide={guide} />
          ))}
        </ul>
      </FeatureSection>

      <FeatureSection index="03" title={t("todayHead")} lead={t("todayLead")}>
        <StatusList
          groups={[
            {
              label: t("todayNowLabel"),
              tone: "open",
              items: [t("recipesItem"), t("guidesItem"), t("unitsItem")],
            },
            {
              label: t("nextLabel"),
              tone: "next",
              items: [t("accountsItem"), t("logItem"), t("goalsItem")],
            },
          ]}
        />
      </FeatureSection>

      <FeatureSection tone="desk" title={t("faqHead")}>
        <Faq items={faq} />
      </FeatureSection>
    </>
  );
}
