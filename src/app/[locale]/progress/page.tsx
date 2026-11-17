import { Suspense } from "react";
import { getFormatter, getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { RequireSignedIn } from "@/components/auth/session-gate";
import { SectionHeading } from "@/components/section-heading";
import { WeightChart } from "@/components/progress/weight-chart";
import { WeightEntryControls } from "@/components/progress/weight-entry-controls";
import { WeightEntryForm } from "@/components/progress/weight-entry-form";
import { getCurrentUser } from "@/lib/auth/session";
import { todayIso } from "@/lib/progress/chart";
import { listWeightEntries } from "@/lib/progress/store";
import { currentLocale } from "@/lib/locale";

export async function generateMetadata() {
  const t = await getTranslations("progress");
  return { title: t("title"), description: t("lead") };
}

/**
 * Weight progress (Stage 5). A factual record of the user's own
 * measurements: no targets, no goal inference, no verdicts on single
 * readings — the copy says plainly that weeks matter more than one day.
 */
export default async function ProgressPage() {
  const t = await getTranslations("progress");
  return (
    <section className="hairline py-(--section-gap)">
      <div className="container">
        <SectionHeading level={1} title={t("title")} lead={t("lead")} />
        <Suspense fallback={null}>
          <RequireSignedIn next="/progress" />
        </Suspense>
        <Suspense fallback={null}>
          <ProgressPanel />
        </Suspense>
      </div>
    </section>
  );
}

async function ProgressPanel() {
  const locale = await currentLocale();
  const t = await getTranslations("progress");
  const format = await getFormatter();
  const user = await getCurrentUser();
  if (!user) {
    return (
      <AuthCard>
        <p>{t("sessionGate")}</p>
      </AuthCard>
    );
  }

  const entries = await listWeightEntries(user.id);
  const today = todayIso();
  const fmtDate = (iso: string) =>
    format.dateTime(new Date(`${iso}T00:00:00Z`), { dateStyle: "long" });
  const fmtKg = (value: number) =>
    `${format.number(value, { maximumFractionDigits: 1 })} kg`;
  const latest = entries[0];

  return (
    <div className="mt-(--space-xl) grid gap-(--space-xl)">
      <div className="well p-(--space-md)">
        <h2>{t("summary.title")}</h2>
        <p className="num mt-(--space-sm)">
          {t("summary.entries", { count: entries.length })}
          {entries.length > 0
            ? ` — ${t("summary.latest", {
                weight: format.number(latest!.weight_kg, {
                  maximumFractionDigits: 1,
                }),
                date: fmtDate(latest!.measured_on),
              })}`
            : null}
        </p>
        <p className="mt-(--space-sm) text-sm text-(--color-ink-2)">
          {entries.length < 3
            ? t("summary.fewEntries")
            : t("summary.fluctuation")}
        </p>
        <p className="mt-(--space-2xs) text-sm text-(--color-muted)">
          {t("summary.noTarget")}
        </p>
      </div>

      <div className="well p-(--space-md)">
        <h2>{t("form.heading")}</h2>
        <div className="mt-(--space-sm)">
          <WeightEntryForm locale={locale} today={today} />
        </div>
      </div>

      <div className="well p-(--space-md)">
        <h2>{t("chart.heading")}</h2>
        <div className="mt-(--space-sm)">
          <WeightChart
            entries={entries.map((entry) => ({
              date: entry.measured_on,
              weightKg: entry.weight_kg,
            }))}
            today={today}
            locale={locale}
          />
        </div>
      </div>

      <div>
        <h2>{t("history.title")}</h2>
        {entries.length === 0 ? (
          <div className="well mt-(--space-md) p-(--space-md)">
            <h3>{t("history.emptyTitle")}</h3>
            <p className="mt-(--space-xs) text-(--color-muted)">
              {t("history.emptyBody")}
            </p>
          </div>
        ) : (
          <ul className="mt-(--space-md) list-none">
            {entries.map((entry) => (
              <li key={entry.id} className="hairline py-(--space-md)">
                <div className="flex flex-wrap items-baseline justify-between gap-(--space-2xs)">
                  <p className="num font-display">
                    {fmtKg(entry.weight_kg)}{" "}
                    <span className="text-sm text-(--color-muted)">
                      {fmtDate(entry.measured_on)}
                    </span>
                  </p>
                </div>
                {entry.note ? (
                  <p className="mt-(--space-2xs) text-sm text-(--color-ink-2)">
                    {entry.note}
                  </p>
                ) : null}
                <div className="mt-(--space-2xs)">
                  <WeightEntryControls
                    entryId={entry.id}
                    weightKg={entry.weight_kg}
                    measuredOn={entry.measured_on}
                    note={entry.note}
                    locale={locale}
                    today={today}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
