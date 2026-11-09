import { getTranslations } from "next-intl/server";

import { SectionHeading } from "@/components/section-heading";
import { routing } from "@/i18n/routing";

export async function generateMetadata() {
  const t = await getTranslations("about");
  return { title: await t("title"), description: await t("lead") };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const body = t.raw("body") as string[];
  const principles = t.raw("principles") as string[];

  return (
    <>
      <section className="desk hairline py-(--section-gap)">
        <div className="container">
          <SectionHeading level={1} title={t("title")} lead={t("lead")} />
        </div>
      </section>

      <section className="hairline py-(--section-gap)">
        <div className="container">
          <div className="prose">
            {body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <h2>{t("principlesHead")}</h2>
            <ul>
              {principles.map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>

            <h2>{t("languagesHead")}</h2>
            <p>{t("languagesBody")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
