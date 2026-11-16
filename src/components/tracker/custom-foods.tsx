"use client";

import { useActionState, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import { saveCustomFoodAction, type TrackerState } from "@/lib/tracker/actions";
import { useCloseOnSuccess } from "@/components/tracker/use-close-on-success";

/**
 * Custom foods (Stage 4): create and edit the user's own foods. Nutrient
 * fields are optional — an empty field stays unknown (never zero) in the
 * database and in every calculation built from it.
 */

export type CustomFoodSummary = {
  id: string;
  name: string;
  brand: string | null;
  nutritionBasis: string;
  kcal: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
};

const NUTRIENT_FIELDS = [
  ["kcal", "kcal"],
  ["proteinG", "g"],
  ["carbsG", "g"],
  ["fatG", "g"],
  ["fiberG", "g"],
] as const;

export function CustomFoodsSection({
  foods,
  locale,
}: {
  foods: CustomFoodSummary[];
  locale: string;
}) {
  const t = useTranslations("tracker");
  const [creating, setCreating] = useState(foods.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [state, formAction] = useActionState<TrackerState, FormData>(
    saveCustomFoodAction,
    {},
  );

  // Close whichever form was open once a save succeeds.
  useCloseOnSuccess(Boolean(state.ok), () => {
    setCreating(false);
    setEditingId(null);
  });

  return (
    <section
      aria-labelledby="custom-foods-heading"
      className="well hairline p-(--space-lg)"
    >
      <div className="flex flex-wrap items-center justify-between gap-(--space-3xs)">
        <h3 id="custom-foods-heading">{t("custom.title")}</h3>
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => setCreating((value) => !value)}
          aria-expanded={creating}
        >
          {t("custom.create")}
        </button>
      </div>

      {creating ? (
        <CustomFoodForm
          locale={locale}
          state={state}
          formAction={formAction}
          onCancel={() => setCreating(false)}
        />
      ) : null}

      {foods.length === 0 && !creating ? (
        <p className="text-(--color-ink-2)">{t("custom.empty")}</p>
      ) : (
        <ul className="list-none p-0 flex flex-col gap-(--space-3xs) pt-(--space-md)">
          {foods.map((food) =>
            editingId === food.id ? (
              <li key={food.id}>
                <CustomFoodForm
                  locale={locale}
                  state={state}
                  formAction={formAction}
                  food={food}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li
                key={food.id}
                className="hairline flex flex-wrap items-center justify-between gap-(--space-3xs) pt-(--space-3xs)"
              >
                <div>
                  <span className="font-medium">{food.name}</span>
                  {food.brand ? (
                    <span className="text-(--color-ink-2)">
                      {" "}
                      · {food.brand}
                    </span>
                  ) : null}
                  <span className="block text-(--color-ink-2)">
                    {t(`basis.${food.nutritionBasis}`)}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn--quiet"
                  onClick={() => setEditingId(food.id)}
                >
                  {t("custom.edit")}
                </button>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}

function CustomFoodForm({
  locale,
  state,
  formAction,
  food,
  onCancel,
}: {
  locale: string;
  state: TrackerState;
  formAction: (formData: FormData) => void;
  food?: CustomFoodSummary;
  onCancel: () => void;
}) {
  const t = useTranslations("tracker");
  const format = useFormatter();
  const id = (name: string) => `custom-${food?.id ?? "new"}-${name}`;

  return (
    <form
      action={formAction}
      className="flex flex-col gap-(--space-sm) pt-(--space-md)"
    >
      <input type="hidden" name="locale" value={locale} />
      {food ? (
        <input type="hidden" name="customFoodId" value={food.id} />
      ) : null}

      <div>
        <label htmlFor={id("name")}>{t("custom.nameLabel")}</label>
        <input
          id={id("name")}
          name="name"
          className="field w-full"
          defaultValue={food?.name ?? ""}
          maxLength={120}
          required
        />
      </div>
      <div>
        <label htmlFor={id("brand")}>{t("custom.brandLabel")}</label>
        <input
          id={id("brand")}
          name="brand"
          className="field w-full"
          defaultValue={food?.brand ?? ""}
          maxLength={80}
        />
      </div>

      <fieldset className="border-0 p-0">
        <legend>{t("custom.basisLabel")}</legend>
        <div className="flex gap-(--space-md) pt-(--space-3xs)">
          {(["per_100g", "per_serving"] as const).map((basis) => (
            <label key={basis} className="flex items-center gap-(--space-3xs)">
              <input
                type="radio"
                name="nutritionBasis"
                value={basis}
                defaultChecked={(food?.nutritionBasis ?? "per_100g") === basis}
                required
              />
              {t(`basis.${basis}`)}
            </label>
          ))}
        </div>
      </fieldset>

      {NUTRIENT_FIELDS.map(([field, unit]) => (
        <div key={field}>
          <label htmlFor={id(field)}>
            {t(`custom.${field}`)} ({t(`totals.units.${unit}`)})
          </label>
          <input
            id={id(field)}
            name={field}
            type="number"
            inputMode="decimal"
            step="0.001"
            min="0"
            max="100000"
            className="field"
            defaultValue={
              food && food[field] !== null
                ? format.number(food[field], { maximumFractionDigits: 3 })
                : ""
            }
            placeholder={t("custom.optional")}
          />
        </div>
      ))}

      <FormAlert errorKey={state.errorKey} namespace="tracker" />

      <div className="flex flex-wrap gap-(--space-3xs)">
        <SubmitButton>{t("custom.save")}</SubmitButton>
        <button type="button" className="btn btn--quiet" onClick={onCancel}>
          {t("entry.cancel")}
        </button>
      </div>
    </form>
  );
}
