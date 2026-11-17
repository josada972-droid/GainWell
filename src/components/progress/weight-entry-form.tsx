"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { createEntryAction, type ProgressState } from "@/lib/progress/actions";

/**
 * The "record a measurement" form (Stage 5). The date starts on today and can
 * only move backwards (the max attribute plus a server-side future check —
 * the attribute alone is a convenience, not the trust boundary).
 */
export function WeightEntryForm({
  locale,
  today,
}: {
  locale: string;
  today: string;
}) {
  const t = useTranslations("progress");
  const [state, action] = useActionState<ProgressState, FormData>(
    createEntryAction,
    {},
  );

  return (
    <form action={action} className="grid gap-(--space-sm)">
      <input type="hidden" name="locale" value={locale} />
      <div className="grid gap-(--space-2xs) sm:grid-cols-2">
        <div>
          <label htmlFor="weight-weight" className="text-sm font-medium">
            {t("form.weightLabel")}
          </label>
          <input
            id="weight-weight"
            name="weight"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="25"
            max="300"
            className="field"
            required
          />
        </div>
        <div>
          <label htmlFor="weight-date" className="text-sm font-medium">
            {t("form.dateLabel")}
          </label>
          <input
            id="weight-date"
            name="date"
            type="date"
            min="2000-01-01"
            max={today}
            defaultValue={today}
            className="field"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="weight-note" className="text-sm font-medium">
          {t("form.noteLabel")}
        </label>
        <input
          id="weight-note"
          name="note"
          type="text"
          maxLength={300}
          placeholder={t("form.notePlaceholder")}
          className="field"
        />
      </div>
      {state.errorKey ? (
        <FormAlert errorKey={state.errorKey} namespace="progress" />
      ) : null}
      <div>
        <SubmitButton>{t("form.submit")}</SubmitButton>
      </div>
    </form>
  );
}
