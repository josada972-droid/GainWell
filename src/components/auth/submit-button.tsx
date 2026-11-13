"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";

/**
 * The submit control for every auth form. `useFormStatus` reads the parent
 * form's pending state, so the button disables itself while the Server Action
 * runs and stays at the 48 px touch target the design system requires.
 */
export function SubmitButton({
  children,
  disabled,
}: {
  children: ReactNode;
  /** A disabled control the page wants blocked until its data is complete. */
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const t = useTranslations("auth");
  return (
    <button
      type="submit"
      className="btn btn--primary"
      disabled={pending || disabled}
      aria-busy={pending}
    >
      {pending ? t("common.submitting") : children}
    </button>
  );
}
