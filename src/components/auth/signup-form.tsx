"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { signUpAction, type AuthFormState } from "@/lib/auth/actions";

/**
 * Sign-up form. The display name is optional and capped server-side; the
 * locale comes from the page as a validated hidden field (see actions.ts).
 */
export function SignupForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState(signUpAction, {} as AuthFormState);

  return (
    <form action={formAction} className="grid gap-(--space-md)">
      <input type="hidden" name="locale" value={locale} />
      <div className="grid gap-(--space-3xs)">
        <label htmlFor="signup-name" className="text-sm font-medium">
          {t("signup.displayNameLabel")}
        </label>
        <input
          id="signup-name"
          name="displayName"
          type="text"
          autoComplete="nickname"
          maxLength={60}
          className="field w-full"
        />
        <p className="text-sm text-(--color-muted)">
          {t("signup.displayNameHint")}
        </p>
      </div>
      <div className="grid gap-(--space-3xs)">
        <label htmlFor="signup-email" className="text-sm font-medium">
          {t("signup.emailLabel")}
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.email}
          className="field w-full"
        />
      </div>
      <div className="grid gap-(--space-3xs)">
        <label htmlFor="signup-password" className="text-sm font-medium">
          {t("signup.passwordLabel")}
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="field w-full"
        />
        <p className="text-sm text-(--color-muted)">
          {t("signup.passwordHint")}
        </p>
      </div>
      <FormAlert errorKey={state?.errorKey} noticeKey={state?.noticeKey} />
      <SubmitButton>{t("signup.submit")}</SubmitButton>
    </form>
  );
}
