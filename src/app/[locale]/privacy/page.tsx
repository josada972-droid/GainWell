import { getFormatter, getTranslations } from "next-intl/server";

import { ProseSections } from "@/components/prose-sections";
import { SectionHeading } from "@/components/section-heading";
import { routing } from "@/i18n/routing";

export async function generateMetadata() {
  const t = await getTranslations("privacy");
  return { title: await t("title"), description: await t("lead") };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");
  const tl = await getTranslations("legal");
  const format = await getFormatter();
  // A fixed date, because prerendering cannot read the clock (Cache Components).
  const updated = format.dateTime(new Date(tl("updatedDate")), {
    dateStyle: "long",
  });
  const sections = t.raw("sections") as {
    heading: string;
    body: string | string[];
  }[];

  return (
    <section className="hairline py-(--section-gap)">
      <div className="container">
        <SectionHeading level={1} title={t("title")} lead={t("lead")} />
        <p className="mt-(--space-md) text-sm text-(--color-muted)">
          {t("updated", { date: updated })}
        </p>
        <div className="mt-(--space-lg)">
          <ProseSections sections={sections} />
        </div>
      </div>
    </section>
  );
}
