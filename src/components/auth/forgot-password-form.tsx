"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { forgotPasswordAction, type AuthFormState } from "@/lib/auth/actions";

/**
 * Password-reset request. The Server Action answers with the same neutral
 * notice for every deliverable address — known or unknown — so this form can
 * never be used to probe which emails have accounts.
 */
export function ForgotPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    {} as AuthFormState,
  );

  return (
    <form action={formAction} className="grid gap-(--space-md)">
      <input type="hidden" name="locale" value={locale} />
      <div className="grid gap-(--space-3xs)">
        <label htmlFor="forgot-email" className="text-sm font-medium">
          {t("forgot.emailLabel")}
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.email}
          className="field w-full"
        />
      </div>
      <FormAlert errorKey={state?.errorKey} noticeKey={state?.noticeKey} />
      <SubmitButton>{t("forgot.submit")}</SubmitButton>
    </form>
  );
}
