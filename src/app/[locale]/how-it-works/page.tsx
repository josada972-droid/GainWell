import { CircleCheck, CircleDashed } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ActionLink } from "@/components/action-link";
import { SectionHeading } from "@/components/section-heading";
import { routing } from "@/i18n/routing";

export async function generateMetadata() {
  const t = await getTranslations("howItWorks");
  return { title: await t("title"), description: await t("lead") };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HowItWorksPage() {
  const t = await getTranslations("howItWorks");
  const steps = [
    { title: t("step1Title"), body: t("step1Body") },
    { title: t("step2Title"), body: t("step2Body") },
    { title: t("step3Title"), body: t("step3Body") },
  ];

  return (
    <>
      <section className="desk hairline py-(--section-gap)">
        <div className="container">
          <SectionHeading level={1} title={t("title")} lead={t("lead")} />
        </div>
      </section>

      <section className="hairline py-(--section-gap)">
        <div className="container">
          <h2>{t("stepsHead")}</h2>
          <ol className="mt-(--space-lg) list-none">
            {steps.map(({ title, body }, index) => (
              <li
                className="hairline grid grid-cols-[3ch_minmax(0,1fr)] gap-(--space-lg) py-(--space-lg)"
                key={title}
              >
                <span className="num font-display text-(--color-green)">
                  {index + 1}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p className="mt-(--space-xs) text-(--color-ink-2)">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="hairline py-(--section-gap)">
        <div className="container">
          <h2>{t("statusHead")}</h2>
          <div className="mt-(--space-lg)">
            <p className="hairline flex items-start gap-(--space-xs) py-(--space-md)">
              <CircleCheck
                aria-hidden="true"
                className="size-5 shrink-0 text-(--color-green)"
              />
              <span className="text-(--color-ink)">{t("statusOpen")}</span>
            </p>
            <p className="hairline flex items-start gap-(--space-xs) py-(--space-md)">
              <CircleDashed
                aria-hidden="true"
                className="size-5 shrink-0 text-(--color-muted)"
              />
              <span className="text-(--color-ink)">{t("statusBuilding")}</span>
            </p>
          </div>
          <p className="mt-(--space-md) text-sm leading-relaxed text-(--color-muted)">
            {t("statusNote")}
          </p>
          <div className="mt-(--space-xl) flex flex-wrap gap-(--space-sm)">
            <ActionLink href="/recipes" variant="quiet">
              {t("ctaRecipes")}
            </ActionLink>
            <ActionLink href="/guides" variant="quiet">
              {t("ctaGuides")}
            </ActionLink>
          </div>
        </div>
      </section>
    </>
  );
}
