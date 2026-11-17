import type { Locale } from "@/i18n/routing";

/**
 * Chart/window math for the progress page (Stage 5). Pure functions, no
 * interpolation: a chart shows only the measurements the user actually
 * recorded, connected in date order — nothing invented between days.
 */

export type ChartPoint = { date: string; weightKg: number };

export type WindowKey = "week" | "month";

export const windowDays: Record<WindowKey, number> = { week: 7, month: 30 };

/** Today as YYYY-MM-DD (UTC, matching how the date column is written). */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** `days`-many calendar days back, inclusive, as YYYY-MM-DD. */
export function windowStartIso(days: number, fromIso: string): string {
  const from = new Date(`${fromIso}T00:00:00Z`);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  return from.toISOString().slice(0, 10);
}

/**
 * The entries inside the window, oldest first (a chart reads left to right).
 * Input is the store's rows newest-first; the window boundary is a plain
 * string comparison on ISO dates.
 */
export function windowEntries(
  entries: ReadonlyArray<ChartPoint>,
  window: WindowKey,
  today = todayIso(),
): ChartPoint[] {
  const start = windowStartIso(windowDays[window], today);
  return entries
    .filter((entry) => entry.date >= start && entry.date <= today)
    .map((entry) => ({ date: entry.date, weightKg: entry.weightKg }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * A Y axis that does not exaggerate: a small fixed pad around the recorded
 * range (or ±2 kg around a single point), so day-to-day noise is visible but
 * never stretched to look like a dramatic trend.
 */
export function chartYDomain(points: ChartPoint[]): [number, number] {
  const weights = points.map((point) => point.weightKg);
  if (weights.length === 0) return [25, 300];
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  return [Math.floor(min) - 1, Math.ceil(max) + 1];
}

/** X ticks: keep ~6 marks regardless of window length (localized by the UI). */
export function chartTickDates(points: ChartPoint[]): string[] {
  if (points.length === 0) return [];
  const target = 6;
  const step = Math.max(1, Math.ceil(points.length / target));
  const dates = points
    .filter((_, index) => index % step === 0)
    .map((point) => point.date);
  const last = points[points.length - 1]!.date;
  return dates[dates.length - 1] === last ? dates : [...dates, last];
}

/** ISO date → the locale's short date, for axis labels and tooltips. */
export function formatChartDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
