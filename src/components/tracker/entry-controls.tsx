"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";

import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  deleteEntryAction,
  updateEntryQuantityAction,
  type TrackerState,
} from "@/lib/tracker/actions";
import { useCloseOnSuccess } from "@/components/tracker/use-close-on-success";

/**
 * Per-entry controls (Stage 4): edit the recorded quantity and delete the
 * entry. The unit stays the entry's own — a unit switch could be an
 * unsupported basis pair, and the engine refuses to guess conversions.
 */
export function EntryControls({
  entryId,
  quantity,
  unit,
  locale,
}: {
  entryId: string;
  quantity: number;
  unit: string;
  locale: string;
}) {
  const t = useTranslations("tracker");
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction] = useActionState<TrackerState, FormData>(
    updateEntryQuantityAction,
    {},
  );
  const [deleteState, deleteAction] = useActionState<TrackerState, FormData>(
    deleteEntryAction,
    {},
  );

  // Leave edit mode once the save succeeds; the page revalidates itself.
  useCloseOnSuccess(Boolean(updateState.ok), () => setEditing(false));

  if (editing) {
    return (
      <form
        action={updateAction}
        className="flex flex-wrap items-end gap-(--space-3xs)"
      >
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="entryId" value={entryId} />
        <input type="hidden" name="unit" value={unit} />
        <div>
          <label htmlFor={`quantity-${entryId}`} className="sr-only">
            {t("entry.quantityLabel")}
          </label>
          <input
            id={`quantity-${entryId}`}
            name="quantity"
            type="number"
            inputMode="decimal"
            step="0.001"
            min="0.001"
            max="100000"
            defaultValue={quantity}
            className="field"
            required
          />
        </div>
        <SubmitButton>{t("entry.save")}</SubmitButton>
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => setEditing(false)}
        >
          {t("entry.cancel")}
        </button>
        {updateState.errorKey ? (
          <FormAlert errorKey={updateState.errorKey} namespace="tracker" />
        ) : null}
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-(--space-3xs)">
      <button
        type="button"
        className="btn btn--quiet"
        onClick={() => setEditing(true)}
      >
        {t("entry.edit")}
      </button>
      <form action={deleteAction}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="entryId" value={entryId} />
        <SubmitButton>{t("entry.delete")}</SubmitButton>
      </form>
      {deleteState.errorKey ? (
        <FormAlert errorKey={deleteState.errorKey} namespace="tracker" />
      ) : null}
    </div>
  );
}
