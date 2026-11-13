"use server";

import { localeSchema } from "@/lib/auth/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { parseStep } from "@/lib/onboarding/schema";
import { completeOnboarding, saveNutritionStep } from "@/lib/onboarding/store";
import { redirect } from "@/i18n/navigation";

/**
 * Onboarding mutations. Identity always comes from the server-verified session
 * (`auth.getUser()`), never from a form field; ownership is then enforced again
 * by RLS in Postgres. Each step saves only the columns that step owns, so an
 * unfinished onboarding resumes where the visitor stopped.
 *
 * The locale is a validated hidden field (Server Actions cannot read next-intl's
 * request config — see docs/ARCHITECTURE.md).
 */
export type OnboardingState = { errorKey?: string };

export async function saveOnboardingStepAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const step = Number(formData.get("step"));
  const locale = localeSchema.parse(formData.get("locale"));

  const user = await getCurrentUser();
  if (!user) return { errorKey: "sessionExpired" };

  const parsed = parseStep(step, formData);
  if (!parsed.ok) return { errorKey: parsed.errorKey };

  const saved = await saveNutritionStep(user.id, parsed.patch, step);
  if (!saved.ok) return { errorKey: saved.errorKey };

  // One roundtrip: the redirect streams the next step with the saved values.
  return redirect({ href: `/onboarding?step=${step + 1}`, locale });
}

/** Review step: finish onboarding, then go to the dashboard. */
export async function completeOnboardingAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const locale = localeSchema.parse(formData.get("locale"));

  const user = await getCurrentUser();
  if (!user) return { errorKey: "sessionExpired" };

  const done = await completeOnboarding(user.id);
  if (!done.ok) return { errorKey: done.errorKey };

  return redirect({ href: "/dashboard", locale });
}
