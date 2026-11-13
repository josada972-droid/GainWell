/**
 * Age eligibility for personalized numbers. The boundary is explicit: 18
 * completed years. Anything below is a minor, anything missing or invalid is
 * unverified — neither may receive adult calorie or macro prescriptions.
 *
 * The check lives here (not in the UI) so every caller — dashboard, onboarding
 * review, API — gets the same answer, and no adult estimate can be computed
 * in the background and merely hidden.
 */
export const ADULT_MIN_AGE = 18;

export type Eligibility = "adult" | "minor" | "unverified";

export function ageEligibility(ageYears: number | null): Eligibility {
  if (ageYears === null || !Number.isInteger(ageYears) || ageYears < 0) {
    return "unverified";
  }
  return ageYears >= ADULT_MIN_AGE ? "adult" : "minor";
}

/**
 * Age freshness. The stored age is a snapshot in completed years — no date of
 * birth is collected — so time can only make the stored age *younger* than
 * reality. That drift is safe for eligibility (a 17-year-old snapshot can never
 * become an adult calculation on its own), but estimates slowly go stale, so
 * the dashboard asks for a reconfirmation after this many days. The check uses
 * the row's `updated_at` (any edit counts as a confirmation); no exact birth
 * date is ever needed.
 */
export const ANSWER_RECONFIRM_DAYS = 365;

export function answersNeedReconfirm(
  updatedAt: string | null,
  now: Date,
): boolean {
  if (!updatedAt) return false;
  const saved = new Date(updatedAt);
  if (Number.isNaN(saved.getTime())) return false;
  return now.getTime() - saved.getTime() > ANSWER_RECONFIRM_DAYS * 86_400_000;
}
