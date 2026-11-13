/**
 * Resting energy and total daily energy expenditure for eligible adults.
 *
 * Equation: Mifflin–St Jeor (Mifflin MD, St Jeor ST, et al., "A new 'resting
 * energy' equation for adults", American Journal of Clinical Nutrition 57(3),
 * 1990, pp. 325–327):
 *   men:   RMR = 10·kg + 6.25·cm − 5·years + 5
 *   women: RMR = 10·kg + 6.25·cm − 5·years − 161
 * Units: kilograms, centimetres, completed years; output in kilocalories.
 *
 * The study's participants were 19–78 years old. GainWell applies the equation
 * from 18 by product policy; that one year below the sample is an
 * extrapolation, not something the study validated.
 *
 * Sex is required by the equation (its two constants come from measured male
 * and female bodies) and is never inferred. It is an optional onboarding field:
 * without it the engine reports an incomplete result instead of guessing, and
 * the question is about the body the equation models, not about gender
 * identity.
 *
 * Activity multipliers are **GainWell's own simplified product values**, in the
 * tradition of the Harris–Benedict activity factors (1.2 sedentary … 1.725 very
 * active). They are NOT the PAL categories of FAO/WHO/UNU (Human Energy
 * Requirements, 2004), whose bands are much higher and wider: sedentary/light
 * 1.40–1.69, moderate 1.70–1.99, vigorous 2.00–2.40. A person whose real PAL
 * falls in FAO's "vigorous" band has no matching choice here, and for genuinely
 * active people these values underestimate TDEE — pick the next band up when in
 * doubt. Coarse by design: TDEE from a multiplier is an estimate, not a
 * measurement.
 */
export const sexValues = ["female", "male"] as const;
export type Sex = (typeof sexValues)[number];

export const activityLevels = [
  "sedentary",
  "light",
  "moderate",
  "high",
] as const;
export type ActivityLevel = (typeof activityLevels)[number];

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.35,
  moderate: 1.5,
  high: 1.7,
};

/** Energy estimates are rounded to the nearest 10 kcal: finer numbers imply a
 * precision these equations do not have. */
export function roundKcal(value: number): number {
  return Math.round(value / 10) * 10;
}

export function restingEnergy(input: {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: Sex;
}): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.ageYears;
  return base + (input.sex === "male" ? 5 : -161);
}

/** Maintenance energy (TDEE) = RMR × PAL multiplier, rounded to 10 kcal. */
export function maintenanceEnergy(
  rmr: number,
  activityLevel: ActivityLevel,
): number {
  return roundKcal(rmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}
