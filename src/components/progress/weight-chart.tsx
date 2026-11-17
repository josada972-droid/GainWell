"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  chartTickDates,
  chartYDomain,
  formatChartDate,
  windowEntries,
  type ChartPoint,
  type WindowKey,
} from "@/lib/progress/chart";

/**
 * The weight chart (Stage 5). Only the user's own measurements are drawn —
 * the line connects recorded points in date order and invents nothing
 * between them. Week/month is a window over real entries, not interpolation.
 */
export function WeightChart({
  entries,
  today,
  locale,
}: {
  entries: ChartPoint[];
  today: string;
  locale: string;
}) {
  const t = useTranslations("progress");
  const format = useFormatter();
  const [window, setWindow] = useState<WindowKey>("week");

  const points = windowEntries(entries, window, today);
  const ticks = chartTickDates(points);

  return (
    <div>
      <div
        role="group"
        aria-label={t("chart.heading")}
        className="groove flex-wrap"
      >
        {(["week", "month"] as WindowKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className="groove__stop"
            aria-pressed={window === key}
            onClick={() => setWindow(key)}
          >
            {t(`chart.${key}`)}
          </button>
        ))}
      </div>

      {points.length === 0 ? (
        <p className="mt-(--space-md) text-(--color-muted)">
          {t("chart.empty")}
        </p>
      ) : (
        <>
          {/* The description carries the plain-language version of the chart
              for screen readers; the SVG itself is presentational noise. */}
          <p id={`chart-desc-${window}`} className="sr-only">
            {t("chart.description")}
          </p>
          <div
            className="mt-(--space-md) h-64 w-full"
            role="img"
            aria-labelledby={`chart-desc-${window}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={points}
                margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  stroke="var(--color-hairline)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  ticks={ticks}
                  tickFormatter={(value: string) =>
                    formatChartDate(value, locale === "fr" ? "fr" : "en")
                  }
                  tick={{ fontSize: 12, fill: "var(--color-muted)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-hairline)" }}
                />
                <YAxis
                  domain={chartYDomain(points)}
                  tickFormatter={(value: number) =>
                    format.number(value, { maximumFractionDigits: 1 })
                  }
                  tick={{ fontSize: 12, fill: "var(--color-muted)" }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  label={{
                    value: "kg",
                    position: "insideTopLeft",
                    fontSize: 12,
                    fill: "var(--color-muted)",
                  }}
                />
                <Tooltip
                  formatter={(value) => [
                    `${format.number(Number(value), {
                      maximumFractionDigits: 1,
                    })} kg`,
                    "",
                  ]}
                  labelFormatter={(value) =>
                    format.dateTime(new Date(`${String(value)}T00:00:00Z`), {
                      dateStyle: "long",
                    })
                  }
                  contentStyle={{
                    borderRadius: "var(--radius-card)",
                    border: "1px solid var(--color-hairline)",
                  }}
                />
                <Line
                  type="linear"
                  dataKey="weightKg"
                  stroke="var(--color-green)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-green)" }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
