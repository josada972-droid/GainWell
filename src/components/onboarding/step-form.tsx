"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { FormAlert } from "@/components/auth/form-alert";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  saveOnboardingStepAction,
  type OnboardingState,
} from "@/lib/onboarding/actions";

/**
 * One form per onboarding step, driven by a declarative field list. Values are
 * pre-filled from the saved answers so a visitor can edit them, and the field
 * markup is plain semantic HTML: labelled inputs, fieldset/legend radio groups,
 * hints wired with aria-describedby. Validation happens in the Server Action.
 */
export type StepField =
  | {
      kind: "number";
      name: string;
      labelKey: string;
      hintKey?: string;
      unitKey: string;
      min: number;
      max: number;
      integer?: boolean;
      optional?: boolean;
    }
  | {
      kind: "text";
      name: string;
      labelKey: string;
      hintKey?: string;
      maxLength: number;
    }
  | {
      kind: "radio";
      name: string;
      legendKey: string;
      hintKey?: string;
      options: Array<{ value: string; labelKey: string; hintKey?: string }>;
      optional?: boolean;
    };

/** Answers as strings, straight from the saved row ("" means "not answered"). */
export type SavedAnswers = Record<string, string>;

export function StepForm({
  step,
  fields,
  saved,
  locale,
}: {
  step: number;
  fields: StepField[];
  saved: SavedAnswers;
  locale: string;
}) {
  const t = useTranslations("onboarding");
  const [state, formAction] = useActionState(
    saveOnboardingStepAction,
    {} as OnboardingState,
  );

  return (
    <form action={formAction} className="grid gap-(--space-md)">
      <input type="hidden" name="step" value={String(step)} />
      <input type="hidden" name="locale" value={locale} />

      {fields.map((field) => (
        <Field key={field.name} field={field} saved={saved} t={t} />
      ))}

      <FormAlert errorKey={state?.errorKey} namespace="onboarding" />
      <SubmitButton>{t("continue")}</SubmitButton>
    </form>
  );
}

function Field({
  field,
  saved,
  t,
}: {
  field: StepField;
  saved: SavedAnswers;
  t: (key: string) => string;
}) {
  const id = `onboarding-${field.name}`;

  if (field.kind === "radio") {
    const describedBy = field.hintKey ? `${id}-hint` : undefined;
    return (
      <fieldset className="choice-group grid gap-(--space-3xs)">
        <legend className="text-sm font-medium">{t(field.legendKey)}</legend>
        {field.hintKey ? (
          <p id={describedBy} className="text-sm text-(--color-muted)">
            {t(field.hintKey)}
          </p>
        ) : null}
        <div className="grid gap-(--space-3xs)">
          {field.options.map((option) => (
            <label key={option.value} className="choice">
              <input
                type="radio"
                name={field.name}
                value={option.value}
                defaultChecked={saved[field.name] === option.value}
                required={!field.optional}
              />
              <span>
                {t(option.labelKey)}
                {option.hintKey ? (
                  <span className="block text-sm text-(--color-muted)">
                    {t(option.hintKey)}
                  </span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (field.kind === "text") {
    const describedBy = field.hintKey ? `${id}-hint` : undefined;
    return (
      <div className="grid gap-(--space-3xs)">
        <label htmlFor={id} className="text-sm font-medium">
          {t(field.labelKey)}
        </label>
        <textarea
          id={id}
          name={field.name}
          rows={3}
          maxLength={field.maxLength}
          defaultValue={saved[field.name] ?? ""}
          aria-describedby={describedBy}
          className="field w-full"
        />
        {field.hintKey ? (
          <p id={describedBy} className="text-sm text-(--color-muted)">
            {t(field.hintKey)}
          </p>
        ) : null}
      </div>
    );
  }

  const describedBy = field.hintKey ? `${id}-hint` : undefined;
  return (
    <div className="grid gap-(--space-3xs)">
      <label htmlFor={id} className="text-sm font-medium">
        {t(field.labelKey)} ({t(field.unitKey)})
      </label>
      <input
        id={id}
        name={field.name}
        type="number"
        inputMode="decimal"
        min={field.min}
        max={field.max}
        step={field.integer ? 1 : 0.1}
        required={!field.optional}
        defaultValue={saved[field.name] ?? ""}
        aria-describedby={describedBy}
        className="field w-full"
      />
      {field.hintKey ? (
        <p id={describedBy} className="text-sm text-(--color-muted)">
          {t(field.hintKey)}
        </p>
      ) : null}
    </div>
  );
}
