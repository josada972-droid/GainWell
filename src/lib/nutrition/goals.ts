/** The goal an adult describes during onboarding (mirrors the SQL enum). */
export const goalValues = [
  "gain_gradually",
  "eating_consistency",
  "healthier_habits",
  "professional_guidance",
] as const;
export type Goal = (typeof goalValues)[number];

/**
 * Weight-gain adjustment policy — the single place a surplus is defined, so it
 * can be reviewed and tuned without hunting through the code (AGENTS.md §8:
 * conservative, labelled as an estimate, configurable).
 *
 * Assumption: roughly 7700 kcal of accumulated energy per kilogram of gained
 * body weight is a commonly used approximation. A 200 kcal/day surplus is
 * therefore around 0.2 kg per week — deliberately below the 0.25–0.5 kg/week
 * often quoted, and no rate is ever promised. Goals about consistency or habits
 * get no surplus at all: maintenance is the honest answer for them.
 *
 * The ceiling exists so a mistaken or aggressive input cannot produce a target
 * that encourages extreme intake. There is deliberately **no floor applied to
 * people**: a suggestion that computes below `minTargetKcal` (1200) is shown as
 * computed and flagged "unusually low", never raised — 1200 is a threshold for
 * that note, not a universal minimum safe intake.
 */
export type SurplusPolicy = {
  gradualSurplusKcal: number;
  maxSurplusKcal: number;
  minTargetKcal: number;
  maxTargetKcal: number;
};

export const DEFAULT_SURPLUS_POLICY: SurplusPolicy = {
  gradualSurplusKcal: 200,
  maxSurplusKcal: 300,
  minTargetKcal: 1200,
  maxTargetKcal: 5000,
};

export const SURPLUS_BY_GOAL: Record<Goal, number> = {
  gain_gradually: DEFAULT_SURPLUS_POLICY.gradualSurplusKcal,
  eating_consistency: 0,
  healthier_habits: 0,
  professional_guidance: 0,
};

/**
 * Caps a GainWell suggestion at the policy ceiling. It is deliberately a
 * ceiling **only**: a suggestion that computes below `minTargetKcal` is shown
 * as computed and flagged (`belowFloor`), never silently raised to the floor.
 * 1200 kcal is a product threshold for the "unusually low" note — it is never
 * presented as a universal minimum safe intake.
 */
export function capKcal(value: number, policy: SurplusPolicy): number {
  return Math.min(value, policy.maxTargetKcal);
}

export type EnergyTarget = {
  targetKcal: number;
  /** How the target was produced: a professional number wins outright. */
  source: "professional" | "gainwell";
  /** The GainWell surplus applied, if any. 0 for maintenance-only goals. */
  surplusKcal: number;
  /** GainWell's own suggestion, kept alongside a professional target so the
   * two are never confused and a professional value is never overwritten. */
  gainwellSuggestedKcal: number;
  /** True when GainWell's own suggestion computes below `minTargetKcal`. The
   * number is still shown, with an explicit "unusually low" note — it is never
   * raised to meet the floor. Always false for a professional target. */
  belowFloor: boolean;
};

export function energyTarget(options: {
  maintenanceKcal: number;
  goal: Goal | null;
  professionalKcal: number | null;
  policy?: SurplusPolicy;
}): EnergyTarget {
  const policy = options.policy ?? DEFAULT_SURPLUS_POLICY;
  const surplus = Math.min(
    options.goal ? SURPLUS_BY_GOAL[options.goal] : 0,
    policy.maxSurplusKcal,
  );
  const gainwellSuggestedKcal = capKcal(
    options.maintenanceKcal + surplus,
    policy,
  );
  const belowFloor = gainwellSuggestedKcal < policy.minTargetKcal;

  return options.professionalKcal !== null
    ? {
        // The professional's number is used exactly as given — never clamped or
        // rewritten. The database range constraint (800–8000 kcal) is its guard.
        targetKcal: options.professionalKcal,
        source: "professional",
        surplusKcal: 0,
        gainwellSuggestedKcal,
        belowFloor: false,
      }
    : {
        targetKcal: gainwellSuggestedKcal,
        source: "gainwell",
        surplusKcal: surplus,
        gainwellSuggestedKcal,
        belowFloor,
      };
}
