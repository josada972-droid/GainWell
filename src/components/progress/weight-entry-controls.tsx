"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";

import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { useCloseOnSuccess } from "@/components/tracker/use-close-on-success";
import {
  deleteEntryAction,
  updateEntryAction,
  type ProgressState,
} from "@/lib/progress/actions";

/**
 * Per-entry controls on the history list (Stage 5): edit the recorded value,
 * date or note, and delete the entry — mirroring the tracker's EntryControls.
 */
export function WeightEntryControls({
  entryId,
  weightKg,
  measuredOn,
  note,
  locale,
  today,
}: {
  entryId: string;
  weightKg: number;
  measuredOn: string;
  note: string | null;
  locale: string;
  today: string;
}) {
  const t = useTranslations("progress");
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction] = useActionState<ProgressState, FormData>(
    updateEntryAction,
    {},
  );
  const [deleteState, deleteAction] = useActionState<ProgressState, FormData>(
    deleteEntryAction,
    {},
  );

  // Leave edit mode once the save succeeds; the page revalidates itself.
  useCloseOnSuccess(Boolean(updateState.ok), () => setEditing(false));

  if (editing) {
    return (
      <form action={updateAction} className="grid gap-(--space-2xs)">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="entryId" value={entryId} />
        <div className="grid gap-(--space-2xs) sm:grid-cols-3">
          <div>
            <label htmlFor={`weight-${entryId}`} className="sr-only">
              {t("form.weightLabel")}
            </label>
            <input
              id={`weight-${entryId}`}
              name="weight"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="25"
              max="300"
              defaultValue={weightKg}
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor={`date-${entryId}`} className="sr-only">
              {t("form.dateLabel")}
            </label>
            <input
              id={`date-${entryId}`}
              name="date"
              type="date"
              min="2000-01-01"
              max={today}
              defaultValue={measuredOn}
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor={`note-${entryId}`} className="sr-only">
              {t("form.noteLabel")}
            </label>
            <input
              id={`note-${entryId}`}
              name="note"
              type="text"
              maxLength={300}
              defaultValue={note ?? ""}
              className="field"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-(--space-2xs)">
          <SubmitButton>{t("history.save")}</SubmitButton>
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() => setEditing(false)}
          >
            {t("history.cancel")}
          </button>
        </div>
        {updateState.errorKey ? (
          <FormAlert errorKey={updateState.errorKey} namespace="progress" />
        ) : null}
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-(--space-2xs)">
      <button
        type="button"
        className="btn btn--quiet"
        onClick={() => setEditing(true)}
      >
        {t("history.edit")}
      </button>
      <form action={deleteAction}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="entryId" value={entryId} />
        <SubmitButton>{t("history.delete")}</SubmitButton>
      </form>
      {deleteState.errorKey ? (
        <FormAlert errorKey={deleteState.errorKey} namespace="progress" />
      ) : null}
    </div>
  );
}
