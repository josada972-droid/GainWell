import { getTranslations } from "next-intl/server";

import { GuideRow } from "@/components/guide-card";
import { SectionHeading } from "@/components/section-heading";
import { routing } from "@/i18n/routing";
import { getGuides } from "@/lib/content/guides";
import { currentLocale } from "@/lib/locale";

export async function generateMetadata() {
  const t = await getTranslations("guides");
  return { title: await t("title"), description: await t("lead") };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function GuidesPage() {
  const locale = await currentLocale();
  const t = await getTranslations("guides");

  return (
    <section className="hairline py-(--section-gap)">
      <div className="container">
        <SectionHeading level={1} title={t("title")} lead={t("lead")} />
        <p className="mt-(--space-md) text-sm text-(--color-muted)">
          {t("sampleNotice")}
        </p>
        <ul className="mt-(--space-lg) list-none">
          {getGuides(locale).map((guide) => (
            <GuideRow key={guide.slug} guide={guide} />
          ))}
        </ul>
      </div>
    </section>
  );
}
