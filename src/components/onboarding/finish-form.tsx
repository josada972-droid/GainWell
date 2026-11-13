"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  completeOnboardingAction,
  type OnboardingState,
} from "@/lib/onboarding/actions";

/**
 * The review step's save control. The locale is a hidden validated field —
 * Server Actions cannot read next-intl's request config (docs/ARCHITECTURE.md).
 */
export function FinishForm({ disabled }: { disabled: boolean }) {
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const [state, formAction] = useActionState(
    completeOnboardingAction,
    {} as OnboardingState,
  );

  return (
    <form action={formAction} className="grid gap-(--space-sm)">
      <input type="hidden" name="locale" value={locale} />
      <FormAlert errorKey={state?.errorKey} namespace="onboarding" />
      <SubmitButton disabled={disabled}>{t("finish")}</SubmitButton>
    </form>
  );
}
