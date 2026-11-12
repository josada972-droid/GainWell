"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { signInAction, type AuthFormState } from "@/lib/auth/actions";

/**
 * Sign-in form. Validation and the Supabase call happen in the Server Action;
 * this component only renders state. The optional `next` destination was
 * already whitelisted server-side before it reaches this hidden field.
 */
export function LoginForm({ next, locale }: { next?: string; locale: string }) {
  const t = useTranslations("auth");
  const [state, formAction] = useActionState(signInAction, {} as AuthFormState);

  return (
    <form action={formAction} className="grid gap-(--space-md)">
      <input type="hidden" name="locale" value={locale} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="grid gap-(--space-3xs)">
        <label htmlFor="login-email" className="text-sm font-medium">
          {t("login.emailLabel")}
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.email}
          className="field w-full"
        />
      </div>
      <div className="grid gap-(--space-3xs)">
        <label htmlFor="login-password" className="text-sm font-medium">
          {t("login.passwordLabel")}
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field w-full"
        />
      </div>
      <FormAlert errorKey={state?.errorKey} noticeKey={state?.noticeKey} />
      <SubmitButton>{t("login.submit")}</SubmitButton>
    </form>
  );
}
