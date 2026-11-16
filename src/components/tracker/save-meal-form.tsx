"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";

import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  createSavedMealAction,
  type TrackerState,
} from "@/lib/tracker/actions";
import { useCloseOnSuccess } from "@/components/tracker/use-close-on-success";

/**
 * "Save this meal as a template": tick the entries to capture, give the
 * template a name. The entries' nutrition snapshots are copied server-side.
 */
export function SaveMealForm({
  entryOptions,
  locale,
}: {
  entryOptions: Array<{ id: string; label: string }>;
  locale: string;
}) {
  const t = useTranslations("tracker");
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<TrackerState, FormData>(
    createSavedMealAction,
    {},
  );

  useCloseOnSuccess(Boolean(state.ok), () => setOpen(false));

  if (entryOptions.length === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn--quiet"
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        {t("saved.create")}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-(--space-sm)">
      <input type="hidden" name="locale" value={locale} />
      <fieldset className="border-0 p-0">
        <legend>{t("saved.pickEntries")}</legend>
        <div className="flex flex-col gap-(--space-3xs) pt-(--space-3xs)">
          {entryOptions.map((entry, index) => (
            <label
              key={entry.id}
              className="flex items-center gap-(--space-3xs)"
            >
              <input
                type="checkbox"
                name="entryId"
                value={entry.id}
                defaultChecked
                id={`save-entry-${entry.id}`}
              />
              {entry.label}
              <span className="sr-only">
                {t("saved.pickEntryAria", { index: index + 1 })}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor={`saved-new-name-${entryOptions[0].id}`}>
          {t("saved.nameLabel")}
        </label>
        <input
          id={`saved-new-name-${entryOptions[0].id}`}
          name="name"
          className="field w-full"
          maxLength={120}
          required
        />
      </div>
      <div>
        <label htmlFor={`saved-new-desc-${entryOptions[0].id}`}>
          {t("saved.descriptionLabel")}
        </label>
        <input
          id={`saved-new-desc-${entryOptions[0].id}`}
          name="description"
          className="field w-full"
          maxLength={300}
          placeholder={t("custom.optional")}
        />
      </div>
      {state.errorKey ? (
        <FormAlert errorKey={state.errorKey} namespace="tracker" />
      ) : null}
      <div className="flex flex-wrap gap-(--space-3xs)">
        <SubmitButton>{t("saved.saveAction")}</SubmitButton>
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => setOpen(false)}
        >
          {t("entry.cancel")}
        </button>
      </div>
    </form>
  );
}
