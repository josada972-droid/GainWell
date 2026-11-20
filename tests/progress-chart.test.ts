import { describe, expect, it } from "vitest";

import {
  chartTickDates,
  chartYDomain,
  formatChartDate,
  windowEntries,
  type ChartPoint,
} from "@/lib/progress/chart";

/**
 * The chart math (Stage 5, unit-tested in Stage 6). These pin the honest
 * scale: a small pad around the recorded range, never a stretched trend.
 * Entries from newest first (the store's order) to match the real caller.
 */

const pts = (values: Array<[string, number]>): ChartPoint[] =>
  values.map(([date, weightKg]) => ({ date, weightKg }));

describe("chartYDomain", () => {
  it("does not exaggerate a small gain: 86.0 → 86.2", () => {
    expect(
      chartYDomain(
        pts([
          ["2026-11-10", 86],
          ["2026-11-16", 86.2],
        ]),
      ),
    ).toEqual([85, 88]); // 0.2 kg ≈ 7% of the 3 kg plot, not a drama
  });

  it("keeps a real drop clearly visible: 86.0 → 85.0", () => {
    expect(
      chartYDomain(
        pts([
          ["2026-11-10", 86],
          ["2026-11-16", 85],
        ]),
      ),
    ).toEqual([84, 87]); // 1 kg ≈ 33% of the plot
  });

  it("reads near-identical noise as flat: 86.0/86.1/86.0/86.2", () => {
    const points = pts([
      ["2026-11-10", 86],
      ["2026-11-12", 86.1],
      ["2026-11-14", 86],
      ["2026-11-16", 86.2],
    ]);
    expect(chartYDomain(points)).toEqual([85, 88]);
  });

  it("pads a single measurement around the recorded value", () => {
    expect(chartYDomain(pts([["2026-11-16", 86]]))).toEqual([85, 87]);
  });

  it("pads several identical measurements the same way", () => {
    const points = pts([
      ["2026-11-10", 86.4],
      ["2026-11-13", 86.4],
      ["2026-11-16", 86.4],
    ]);
    expect(chartYDomain(points)).toEqual([85, 88]);
  });

  it("lets a genuine large trend fill the chart: 90 → 80", () => {
    const points = pts([
      ["2026-10-01", 90],
      ["2026-11-16", 80],
    ]);
    expect(chartYDomain(points)).toEqual([79, 91]); // 10 kg ≈ 83% of the plot
  });

  it("has a harmless empty-state fallback (the UI shows a message instead)", () => {
    expect(chartYDomain([])).toEqual([25, 300]);
  });

  it("always leaves at least 1 kg of padding on each side", () => {
    const [lo, hi] = chartYDomain(pts([["2026-11-16", 86.05]]));
    expect(86.05 - lo).toBeGreaterThanOrEqual(0.95);
    expect(hi - 86.05).toBeGreaterThanOrEqual(0.95);
  });
});

describe("windowEntries", () => {
  const history = pts([
    ["2026-11-16", 86.2], // newest first, as the store returns them
    ["2026-11-14", 86],
    ["2026-11-12", 86.1],
    ["2026-10-20", 85.5], // outside the week window
  ]);

  it("keeps only real entries inside the window, oldest first", () => {
    const week = windowEntries(history, "week", "2026-11-16");
    expect(week.map((p) => p.date)).toEqual([
      "2026-11-12",
      "2026-11-14",
      "2026-11-16",
    ]);
  });

  it("invents nothing between recorded days", () => {
    // 3 recorded points in, 3 points out — no interpolation, no padding.
    expect(windowEntries(history, "week", "2026-11-16")).toHaveLength(3);
  });

  it("the month window reaches further back", () => {
    expect(windowEntries(history, "month", "2026-11-16")).toHaveLength(4);
  });
});

describe("chartTickDates", () => {
  it("keeps about six marks and always ends on the latest entry", () => {
    const points = pts(
      Array.from({ length: 30 }, (_, i) => {
        const day = new Date(Date.UTC(2026, 9, 18 + i));
        return [day.toISOString().slice(0, 10), 86] as [string, number];
      }),
    );
    const ticks = chartTickDates(points);
    expect(ticks.length).toBeLessThanOrEqual(7);
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    expect(ticks[ticks.length - 1]).toBe("2026-11-16");
  });

  it("is empty for an empty window", () => {
    expect(chartTickDates([])).toEqual([]);
  });
});

describe("formatChartDate", () => {
  it("formats in the requested locale, UTC-safe", () => {
    expect(formatChartDate("2026-11-16", "en")).toBe("Nov 16");
    expect(formatChartDate("2026-11-16", "fr")).toBe("16 nov.");
  });
});
