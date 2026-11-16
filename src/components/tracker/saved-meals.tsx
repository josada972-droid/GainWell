"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";

import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  applySavedMealAction,
  deleteSavedMealAction,
  updateSavedMealAction,
  type TrackerState,
} from "@/lib/tracker/actions";
import { useCloseOnSuccess } from "@/components/tracker/use-close-on-success";

/**
 * Saved meals (Stage 4): reusable templates. Applying one copies the
 * entries' snapshots into new daily entries — nothing later edited in the
 * template can reach into past days.
 */

export type SavedMealSummary = {
  id: string;
  name: string;
  description: string | null;
  entryCount: number;
  /** Display-ready totals line computed on the server ("At least …"). */
  kcalText: string;
};

export function SavedMealsSection({
  savedMeals,
  mealDate,
  locale,
}: {
  savedMeals: SavedMealSummary[];
  mealDate: string;
  locale: string;
}) {
  const t = useTranslations("tracker");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameState, renameAction] = useActionState<TrackerState, FormData>(
    updateSavedMealAction,
    {},
  );
  const [deleteState, deleteAction] = useActionState<TrackerState, FormData>(
    deleteSavedMealAction,
    {},
  );
  const [applyState, applyAction] = useActionState<TrackerState, FormData>(
    applySavedMealAction,
    {},
  );

  useCloseOnSuccess(Boolean(renameState.ok), () => setRenamingId(null));

  return (
    <section
      aria-labelledby="saved-meals-heading"
      className="well hairline p-(--space-lg)"
    >
      <h3 id="saved-meals-heading">{t("saved.title")}</h3>
      {savedMeals.length === 0 ? (
        <p className="text-(--color-ink-2)">{t("saved.empty")}</p>
      ) : (
        <ul className="list-none p-0 flex flex-col gap-(--space-md) pt-(--space-md)">
          {savedMeals.map((saved) => (
            <li key={saved.id} className="hairline pt-(--space-sm)">
              {renamingId === saved.id ? (
                <form
                  action={renameAction}
                  className="flex flex-col gap-(--space-sm)"
                >
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="savedMealId" value={saved.id} />
                  <div>
                    <label
                      htmlFor={`saved-name-${saved.id}`}
                      className="sr-only"
                    >
                      {t("saved.nameLabel")}
                    </label>
                    <input
                      id={`saved-name-${saved.id}`}
                      name="name"
                      className="field w-full"
                      defaultValue={saved.name}
                      maxLength={120}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`saved-desc-${saved.id}`}
                      className="sr-only"
                    >
                      {t("saved.descriptionLabel")}
                    </label>
                    <input
                      id={`saved-desc-${saved.id}`}
                      name="description"
                      className="field w-full"
                      defaultValue={saved.description ?? ""}
                      maxLength={300}
                      placeholder={t("custom.optional")}
                    />
                  </div>
                  {renameState.errorKey ? (
                    <FormAlert
                      errorKey={renameState.errorKey}
                      namespace="tracker"
                    />
                  ) : null}
                  <div className="flex flex-wrap gap-(--space-3xs)">
                    <SubmitButton>{t("entry.save")}</SubmitButton>
                    <button
                      type="button"
                      className="btn btn--quiet"
                      onClick={() => setRenamingId(null)}
                    >
                      {t("entry.cancel")}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <span className="font-medium">{saved.name}</span>
                    {saved.description ? (
                      <span className="block text-(--color-ink-2)">
                        {saved.description}
                      </span>
                    ) : null}
                    <span className="block text-(--color-ink-2)">
                      {t("saved.entryCount", { count: saved.entryCount })} ·{" "}
                      {saved.kcalText}
                    </span>
                  </div>

                  <form
                    action={applyAction}
                    className="flex flex-wrap items-end gap-(--space-3xs) pt-(--space-3xs)"
                  >
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="savedMealId" value={saved.id} />
                    <input type="hidden" name="mealDate" value={mealDate} />
                    <div>
                      <label
                        htmlFor={`saved-meal-${saved.id}`}
                        className="sr-only"
                      >
                        {t("saved.applyTo")}
                      </label>
                      <select
                        id={`saved-meal-${saved.id}`}
                        name="mealType"
                        className="field"
                        defaultValue="breakfast"
                      >
                        {(
                          ["breakfast", "lunch", "dinner", "snack"] as const
                        ).map((type) => (
                          <option key={type} value={type}>
                            {t(`mealTypes.${type}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <SubmitButton>{t("saved.apply")}</SubmitButton>
                    {applyState.errorKey ? (
                      <FormAlert
                        errorKey={applyState.errorKey}
                        namespace="tracker"
                      />
                    ) : null}
                  </form>

                  <div className="flex flex-wrap gap-(--space-3xs) pt-(--space-3xs)">
                    <button
                      type="button"
                      className="btn btn--quiet"
                      onClick={() => setRenamingId(saved.id)}
                    >
                      {t("saved.rename")}
                    </button>
                    <form action={deleteAction}>
                      <input type="hidden" name="locale" value={locale} />
                      <input
                        type="hidden"
                        name="savedMealId"
                        value={saved.id}
                      />
                      <SubmitButton>{t("saved.delete")}</SubmitButton>
                    </form>
                    {deleteState.errorKey ? (
                      <FormAlert
                        errorKey={deleteState.errorKey}
                        namespace="tracker"
                      />
                    ) : null}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
