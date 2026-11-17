import { getFormatter, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listWeightEntries } from "@/lib/progress/store";

/**
 * The weight-progress card on the dashboard (Stage 5). Factual like the rest
 * of the dashboard: the count and the most recent reading only — no trend
 * verdict, no target comparison.
 */
export async function ProgressCard(): Promise<React.ReactNode> {
  const t = await getTranslations("auth.dashboard");
  const format = await getFormatter();

  const user = await getCurrentUser();
  if (!user) return null;

  const entries = await listWeightEntries(user.id);
  const latest = entries[0];

  return (
    <div className="well hairline grid gap-(--space-3xs) p-(--space-md)">
      <div className="flex flex-wrap items-center justify-between gap-(--space-3xs)">
        <h3 className="font-medium">{t("progressTitle")}</h3>
        <Link href="/progress" className="btn btn--quiet">
          {t("progressCta")}
        </Link>
      </div>
      <p>
        {entries.length === 0
          ? t("progressEmpty")
          : `${t("progressCount", { count: entries.length })} — ${t(
              "progressLatest",
              {
                weight: format.number(latest!.weight_kg, {
                  maximumFractionDigits: 1,
                }),
                date: format.dateTime(
                  new Date(`${latest!.measured_on}T00:00:00Z`),
                  {
                    dateStyle: "long",
                  },
                ),
              },
            )}`}
      </p>
    </div>
  );
}
