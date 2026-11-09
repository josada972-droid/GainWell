import { BookOpen } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { Guide } from "@/lib/content/guides";

/** A guide as a hairline row: title, one line of summary, reading time, date. */
export function GuideRow({ guide }: { guide: Guide }) {
  const t = useTranslations("guides");
  const format = useFormatter();

  return (
    <li className="hairline py-(--space-md)">
      <h3>
        <Link
          href={`/guides/${guide.slug}`}
          className="no-underline hover:underline"
        >
          {guide.title}
        </Link>
      </h3>
      <p className="mt-(--space-xs) text-(--color-ink-2)">{guide.summary}</p>
      <div className="mt-(--space-sm) flex flex-wrap gap-x-(--space-lg) text-sm text-(--color-muted)">
        <span className="inline-flex items-center gap-(--space-2xs)">
          <BookOpen aria-hidden="true" className="size-4" />
          {t("readingTime", { count: guide.readingMinutes })}
        </span>
        <span>
          {t("updated", {
            date: format.dateTime(new Date(guide.updatedAt), {
              dateStyle: "long",
            }),
          })}
        </span>
      </div>
    </li>
  );
}
