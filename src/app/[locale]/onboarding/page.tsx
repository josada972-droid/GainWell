import { Suspense } from "react";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { z } from "zod";

import { AuthCard } from "@/components/auth/auth-card";
import { RequireSignedIn } from "@/components/auth/session-gate";
import { FinishForm } from "@/components/onboarding/finish-form";
import { StepForm, type StepField } from "@/components/onboarding/step-form";
import { StepProgress } from "@/components/onboarding/step-progress";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ageEligibility } from "@/lib/nutrition/eligibility";
import { stepColumns } from "@/lib/onboarding/schema";
import { getNutritionProfile } from "@/lib/onboarding/store";
import type { NutritionProfile } from "@/lib/supabase/types";

export async function generateMetadata() {
  const t = await getTranslations("onboarding");
  return { title: t("title"), description: t("lead") };
}

/** An unknown step never breaks the flow: it falls back to step 1. */
const stepParam = z.coerce.number().int().min(1).max(5).catch(1);

export default async function OnboardingPage({
  searchParams,
}: PageProps<"/[locale]/onboarding">) {
  const t = await getTranslations("onboarding");
  return (
    <section className="desk hairline py-(--section-gap)">
      <div className="container">
        <SectionHeading level={1} title={t("title")} lead={t("lead")} />
        <AuthCard>
          <Suspense fallback={<CardFallback />}>
            <OnboardingPanel searchParams={searchParams} />
          </Suspense>
        </AuthCard>
      </div>
    </section>
  );
}

/**
 * The step lives in the URL, so the URL is the resume point: leaving mid-flow
 * and returning lands on `?step=n`. With no param the visitor continues where
 * their saved row stopped.
 */
async function OnboardingPanel({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  await RequireSignedIn({ next: "/onboarding" });

  const user = await getCurrentUser();
  const profile = user ? await getNutritionProfile(user.id) : null;

  const raw = (await searchParams).step;
  // The stored step is the step to continue at, so a saved step 1 means step 2.
  const resume = Math.max(profile?.onboarding_step ?? 1, 1);
  // A URL step is the visitor's chosen place (forward or back); no param means
  // "continue where the saved row stopped".
  const step = raw === undefined ? resume : stepParam.parse(raw);

  return (
    <div className="grid gap-(--space-md)">
      <StepProgress step={step} />
      <StepCopy step={step} />
      {step === 5 ? (
        <Review profile={profile} />
      ) : (
        <StepForm
          step={step}
          fields={fieldsFor(
            step,
            ageEligibility(profile?.age_years ?? null) === "adult",
          )}
          saved={savedAnswers(profile, step)}
          locale={locale}
        />
      )}
      <StepNav step={step} />
    </div>
  );
}

async function StepCopy({ step }: { step: number }) {
  const t = await getTranslations("onboarding");
  return (
    <div className="grid gap-(--space-3xs)">
      <h2 className="text-title">{t(`step${step}.title`)}</h2>
      <p className="text-sm text-(--color-ink-2)">{t(`step${step}.lead`)}</p>
    </div>
  );
}

/** Field specs per step: data, not logic, so one form component covers all of them. */
function fieldsFor(step: number, adult: boolean): StepField[] {
  if (step === 1) {
    return [
      {
        kind: "number",
        name: "ageYears",
        labelKey: "age.label",
        hintKey: "age.hint",
        unitKey: "unit.years",
        min: 1,
        max: 120,
        integer: true,
      },
      {
        kind: "number",
        name: "heightCm",
        labelKey: "height.label",
        hintKey: "height.hint",
        unitKey: "unit.cm",
        min: 90,
        max: 250,
      },
      {
        kind: "number",
        name: "weightKg",
        labelKey: "weight.label",
        hintKey: "weight.hint",
        unitKey: "unit.kg",
        min: 25,
        max: 300,
      },
      {
        kind: "radio",
        name: "sex",
        legendKey: "sex.legend",
        hintKey: "sex.hint",
        optional: true,
        options: [
          { value: "female", labelKey: "sex.female" },
          { value: "male", labelKey: "sex.male" },
          { value: "", labelKey: "sex.unset" },
        ],
      },
    ];
  }
  if (step === 2) {
    return [
      {
        kind: "radio",
        name: "activityLevel",
        legendKey: "activity.legend",
        options: ["sedentary", "light", "moderate", "high"].map((value) => ({
          value,
          labelKey: `activity.${value}.label`,
          hintKey: `activity.${value}.hint`,
        })),
      },
      {
        kind: "radio",
        name: "eatingHabits",
        legendKey: "habits.legend",
        options: ["regular", "skipped_meals", "low_appetite", "varied"].map(
          (value) => ({
            value,
            labelKey: `habits.${value}.label`,
            hintKey: `habits.${value}.hint`,
          }),
        ),
      },
      {
        kind: "radio",
        name: "appetiteLevel",
        legendKey: "appetite.legend",
        hintKey: "appetite.hint",
        optional: true,
        options: ["low", "medium", "high"].map((value) => ({
          value,
          labelKey: `appetite.${value}.label`,
        })),
      },
      {
        kind: "number",
        name: "mealsPerDay",
        labelKey: "meals.label",
        hintKey: "meals.hint",
        unitKey: "unit.meals",
        min: 1,
        max: 12,
        integer: true,
        optional: true,
      },
    ];
  }
  if (step === 3) {
    return [
      {
        kind: "radio",
        name: "dietaryPreference",
        legendKey: "preference.legend",
        options: ["none", "vegetarian", "vegan", "pescatarian", "other"].map(
          (value) => ({ value, labelKey: `preference.${value}` }),
        ),
      },
      {
        kind: "text",
        name: "dietaryNotes",
        labelKey: "notes.label",
        hintKey: "notes.hint",
        maxLength: 300,
      },
    ];
  }
  // Step 4. Numeric targets are offered to eligible adults only: a minor sees
  // the goal choices and the supportive explanation, never a number field.
  const fields: StepField[] = [
    {
      kind: "radio",
      name: "goal",
      legendKey: "goal.legend",
      options: [
        "gain_gradually",
        "eating_consistency",
        "healthier_habits",
        "professional_guidance",
      ].map((value) => ({
        value,
        labelKey: `goal.${value}.label`,
        hintKey: `goal.${value}.hint`,
      })),
    },
  ];
  if (adult) {
    fields.push(
      {
        kind: "number",
        name: "targetWeightKg",
        labelKey: "targetWeight.label",
        hintKey: "targetWeight.hint",
        unitKey: "unit.kg",
        min: 25,
        max: 300,
        optional: true,
      },
      {
        kind: "number",
        name: "professionalKcal",
        labelKey: "professional.label",
        hintKey: "professional.hint",
        unitKey: "unit.kcal",
        min: 800,
        max: 8000,
        integer: true,
        optional: true,
      },
    );
  }
  return fields;
}

/** Saved answers for one step, as strings ("" = not answered). */
function savedAnswers(
  profile: NutritionProfile | null,
  step: number,
): Record<string, string> {
  if (!profile) return {};
  const out: Record<string, string> = {};
  for (const [name, column] of Object.entries(stepColumns[step] ?? {})) {
    const value = profile[column as keyof NutritionProfile];
    out[name] = value === null || value === undefined ? "" : String(value);
  }
  return out;
}

async function StepNav({ step }: { step: number }) {
  const t = await getTranslations("onboarding");
  const earlier = [1, 2, 3, 4].filter((n) => n < step);
  if (earlier.length === 0) return null;
  return (
    <nav
      className="hairline mt-(--space-md) grid gap-(--space-3xs) pt-(--space-md) text-sm"
      aria-label={t("stepNav.label")}
    >
      {earlier.map((n) => (
        <Link key={n} className="underline" href={`/onboarding?step=${n}`}>
          {t("stepNav.edit", { step: n })}
        </Link>
      ))}
    </nav>
  );
}

/** Step 5: the summary. Nothing new is computed here — only what was answered. */
async function Review({ profile }: { profile: NutritionProfile | null }) {
  const t = await getTranslations("onboarding");
  const format = await getFormatter();

  const missing =
    !profile ||
    profile.age_years === null ||
    profile.height_cm === null ||
    profile.weight_kg === null ||
    profile.activity_level === null ||
    profile.eating_habits === null ||
    profile.goal === null;
  const minor = profile ? ageEligibility(profile.age_years) === "minor" : false;

  const text = (value: string | number | null) =>
    value === null
      ? t("notAnswered")
      : typeof value === "number"
        ? format.number(value)
        : value;
  const unit = (value: number | null, unitKey: string) =>
    value === null ? t("notAnswered") : `${format.number(value)} ${t(unitKey)}`;
  const choice = (key: string, value: string | null) =>
    value === null ? t("notAnswered") : t(`${key}.${value}.label`);

  const rows: Array<[string, string]> = profile
    ? [
        [t("age.label"), text(profile.age_years)],
        [t("height.label"), unit(profile.height_cm, "unit.cm")],
        [t("weight.label"), unit(profile.weight_kg, "unit.kg")],
        [
          t("sex.legend"),
          profile.sex ? t(`sex.${profile.sex}`) : t("sex.unset"),
        ],
        [t("activity.legend"), choice("activity", profile.activity_level)],
        [t("habits.legend"), choice("habits", profile.eating_habits)],
        [t("appetite.legend"), choice("appetite", profile.appetite_level)],
        [t("meals.label"), text(profile.meals_per_day)],
        [t("preference.legend"), t(`preference.${profile.dietary_preference}`)],
        [t("notes.label"), text(profile.dietary_notes)],
        [t("goal.legend"), choice("goal", profile.goal)],
        [t("targetWeight.label"), unit(profile.target_weight_kg, "unit.kg")],
        [t("professional.label"), unit(profile.professional_kcal, "unit.kcal")],
      ]
    : [];

  return (
    <div className="grid gap-(--space-md)">
      {missing ? (
        <p role="alert" className="form-alert form-alert--error">
          {t("review.incomplete")}
        </p>
      ) : null}
      {minor ? <p className="form-alert">{t("review.minorNotice")}</p> : null}

      <dl className="grid gap-(--space-3xs)">
        {rows.map(([label, value]) => (
          <div key={label} className="preview-row">
            <dt className="text-sm text-(--color-ink-2)">{label}</dt>
            <dd className="text-sm">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-sm text-(--color-muted)">{t("review.calculates")}</p>
      <p className="text-sm text-(--color-muted)">
        {t("review.doesNotCalculate")}
      </p>
      {profile?.professional_kcal ? (
        <p className="text-sm text-(--color-muted)">
          {t("review.professionalKept")}
        </p>
      ) : null}

      <FinishForm disabled={missing} />
    </div>
  );
}

function CardFallback() {
  return <div className="well h-56 animate-pulse" aria-hidden="true" />;
}
