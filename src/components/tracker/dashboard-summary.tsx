import { getFormatter, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { sumEntries } from "@/lib/nutrition/totals";
import { getDay } from "@/lib/tracker/store";
import { totalsSummary } from "@/lib/tracker/display";

/**
 * Today's meal-tracking summary on the dashboard (Stage 4). Purely factual:
 * it describes what was logged today, never a verdict ("you are behind") and
 * never a target comparison — the nutrition numbers a minor sees are the same
 * neutral facts adults see, with no adult prescriptions attached.
 */
export async function DashboardSummary(): Promise<React.ReactNode> {
  const t = await getTranslations("tracker");
  const format = await getFormatter();

  const { getCurrentUser } = await import("@/lib/auth/session");
  const user = await getCurrentUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const meals = await getDay(user.id, today);
  const totals = sumEntries(
    meals
      .flatMap((meal) => meal.meal_entries ?? [])
      .map((entry) => ({
        kcal: entry.calc_kcal,
        proteinG: entry.calc_protein_g,
        carbsG: entry.calc_carbs_g,
        fatG: entry.calc_fat_g,
        fiberG: entry.calc_fiber_g,
      })),
  );
  const number = (value: number) =>
    format.number(value, { maximumFractionDigits: 1 });

  return (
    <div className="well hairline grid gap-(--space-3xs) p-(--space-md)">
      <div className="flex flex-wrap items-center justify-between gap-(--space-3xs)">
        {/* h2 (title-sized via the utility): the dashboard h1 must not skip
            straight to an h3 card. */}
        <h2 className="font-medium text-title">{t("summary.today")}</h2>
        <Link href="/tracker" className="btn btn--quiet">
          {t("summary.openTracker")}
        </Link>
      </div>
      <p>
        {totals.entryCount === 0
          ? t("summary.todayEmpty")
          : totalsSummary(t, totals, number)}
      </p>
      <p className="text-sm text-(--color-ink-2)">{t("summary.note")}</p>
    </div>
  );
}
