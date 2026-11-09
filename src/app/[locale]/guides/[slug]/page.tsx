import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ProseSections } from "@/components/prose-sections";
import { routing } from "@/i18n/routing";
import { getGuide, getGuides, guideSlugs } from "@/lib/content/guides";
import { currentLocale } from "@/lib/locale";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/guides/[slug]">) {
  const { slug } = await params;
  const locale = await currentLocale();
  const guide = getGuide(locale, slug);
  const t = await getTranslations("guides");
  return guide
    ? { title: guide.title, description: guide.summary }
    : { title: await t("title"), description: await t("lead") };
}

// Slugs are locale-independent, so the language switcher keeps working here.
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    guideSlugs.map((slug) => ({ locale, slug })),
  );
}

export default async function GuidePage({
  params,
}: PageProps<"/[locale]/guides/[slug]">) {
  const { slug } = await params;
  const locale = await currentLocale();
  const guide = getGuide(locale, slug);
  if (!guide) notFound();

  const t = await getTranslations("guide");
  const tr = await getTranslations("guides");
  const format = await getFormatter();
  const guides = getGuides(locale);
  const next = guides[guides.findIndex((item) => item.slug === slug) + 1];

  return (
    <article>
      <section className="desk hairline py-(--section-gap)">
        <div className="container">
          <Link
            href="/guides"
            className="text-sm text-(--color-muted) hover:text-(--color-ink)"
          >
            {t("backToGuides")}
          </Link>
          <h1 className="mt-(--space-md)">{guide.title}</h1>
          <p className="lead mt-(--space-md) text-(--color-ink-2)">
            {guide.summary}
          </p>
          <div className="mt-(--space-lg) flex flex-wrap gap-x-(--space-lg) gap-y-(--space-xs) text-sm text-(--color-muted)">
            <span>{tr("readingTime", { count: guide.readingMinutes })}</span>
            <span>
              {tr("updated", {
                date: format.dateTime(new Date(guide.updatedAt), {
                  dateStyle: "long",
                }),
              })}
            </span>
            <span>{t("writtenBy")}</span>
          </div>
          <p className="mt-(--space-lg) text-sm text-(--color-muted)">
            {t("sampleNotice")}
          </p>
        </div>
      </section>

      <section className="hairline py-(--section-gap)">
        <div className="container">
          <ProseSections sections={guide.sections} />

          {next ? (
            <div className="hairline mt-(--space-2xl) pt-(--space-lg)">
              <h2>{t("nextHead")}</h2>
              <p className="mt-(--space-sm) font-display text-title leading-tight">
                {t("nextLead")}{" "}
                <Link
                  href={`/guides/${next.slug}`}
                  className="no-underline hover:underline"
                >
                  {next.title}
                </Link>
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </article>
  );
}
