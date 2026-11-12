"use client";

import { useTranslations } from "next-intl";

/**
 * One announcement line per form: errors assert (`role="alert"`), notices
 * report politely (`role="status"`). Keys come from the Server Actions and
 * are translated here, so no user-visible string crosses the network boundary.
 */
export function FormAlert({
  errorKey,
  noticeKey,
}: {
  errorKey?: string;
  noticeKey?: string;
}) {
  const t = useTranslations("auth");
  if (!errorKey && !noticeKey) return null;
  if (errorKey) {
    return (
      <p role="alert" className="form-alert form-alert--error">
        {t(`errors.${errorKey}`)}
      </p>
    );
  }
  return (
    <p role="status" className="form-alert">
      {t(`notices.${noticeKey}`)}
    </p>
  );
}
