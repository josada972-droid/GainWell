"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { resetPasswordAction, type AuthFormState } from "@/lib/auth/actions";

/**
 * New-password form. It only works while the visitor holds the recovery
 * session that `/auth/confirm` established; the action re-checks that
 * server-side, so a stale page cannot set anything.
 */
export function ResetPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState(
    resetPasswordAction,
    {} as AuthFormState,
  );

  return (
    <form action={formAction} className="grid gap-(--space-md)">
      <input type="hidden" name="locale" value={locale} />
      <div className="grid gap-(--space-3xs)">
        <label htmlFor="reset-password" className="text-sm font-medium">
          {t("reset.passwordLabel")}
        </label>
        <input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="field w-full"
        />
        <p className="text-sm text-(--color-muted)">
          {t("reset.passwordHint")}
        </p>
      </div>
      <FormAlert errorKey={state?.errorKey} noticeKey={state?.noticeKey} />
      <SubmitButton>{t("reset.submit")}</SubmitButton>
    </form>
  );
}
