import { Suspense } from "react";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { RequireSignedIn } from "@/components/auth/session-gate";
import { DashboardSummary } from "@/components/tracker/dashboard-summary";
import { FavoritesCard } from "@/components/progress/favorites-card";
import { ProgressCard } from "@/components/progress/progress-card";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/lib/auth/actions";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { answersNeedReconfirm } from "@/lib/nutrition/eligibility";
import { estimateNutritionProfile, type NutritionPlan } from "@/lib/nutrition";
import { DEFAULT_SURPLUS_POLICY } from "@/lib/nutrition/goals";
import { missingMessages } from "@/lib/nutrition/format";
import { getNutritionProfile } from "@/lib/onboarding/store";

export async function generateMetadata() {
  const t = await getTranslations("auth.dashboard");
  return { title: t("title"), description: t("lead") };
}

/**
 * The personalized dashboard (Stage 3). The numbers come from the nutrition
 * engine, which decides eligibility itself: an adult with complete inputs gets
 * estimates, a minor gets education, anything missing gets an invitation — the
 * page never invents a value and never shows adult numbers it should not.
 */
export default async function DashboardPage() {
  const t = await getTranslations("auth.dashboard");
  return (
    <section className="desk hairline py-(--section-gap)">
      <div className="container">
        <SectionHeading level={1} title={t("title")} lead={t("lead")} />
        <AuthCard>
          <Suspense fallback={<DashboardFallback />}>
            <DashboardPanel />
          </Suspense>
        </AuthCard>
      </div>
    </section>
  );
}

async function DashboardPanel() {
  const t = await getTranslations("auth.dashboard");
  const locale = await getLocale();

  // Protection first: without a session the visitor is redirected to login.
  await RequireSignedIn({ next: "/dashboard" });

  const user = await getCurrentUser();
  const profile = await getCurrentProfile();
  const nutritionRow = user ? await getNutritionProfile(user.id) : null;
  const plan = estimateNutritionProfile(nutritionRow);

  return (
    <div className="grid gap-(--space-md)">
      <p
        data-testid="dashboard-signed-in-as"
        className="text-sm text-(--color-ink-2)"
      >
        {profile?.display_name
          ? t("signedInAsName", { name: profile.display_name })
          : t("signedInAsGeneric")}
      </p>

      {/* Age answers are a snapshot: after a year the dashboard asks for a
          reconfirmation instead of trusting them silently (no birth date is
          ever stored). */}
      {nutritionRow &&
      answersNeedReconfirm(nutritionRow.updated_at, new Date()) ? (
        <p className="text-sm text-(--color-ink-2)">
          {t("reconfirmNote")}{" "}
          <Link className="underline" href="/onboarding?step=1">
            {t("editOnboarding")}
          </Link>
        </p>
      ) : null}

      {plan.status === "minor" ? (
        <MinorGuidance />
      ) : plan.status === "incomplete" ? (
        <IncompleteInvitation plan={plan} />
      ) : (
        <AdultEstimate plan={plan} />
      )}

      {/* What was actually logged today (Stage 4). Shown for everyone,
          including minors — facts only, no targets or comparisons. */}
      <DashboardSummary />

      {/* Stage 5: the weight record and the recipe favourites, same factual
          register — counts and latest readings, never verdicts. */}
      <ProgressCard />
      <FavoritesCard />

      <form action={signOutAction}>
        <input type="hidden" name="locale" value={locale} />
        <button type="submit" className="btn btn--quiet">
          {t("signOut")}
        </button>
      </form>
    </div>
  );
}

/** Eligible adults: the estimates, labelled as estimates, plus their assumptions. */
async function AdultEstimate({
  plan,
}: {
  plan: Extract<NutritionPlan, { status: "estimated" }>;
}) {
  const t = await getTranslations("auth.dashboard");
  const tOn = await getTranslations("onboarding");
  const format = await getFormatter();
  const kcal = (value: number) => `${format.number(value)} ${tOn("unit.kcal")}`;
  const grams = (value: number) => `${format.number(value)} g`;

  return (
    <div className="well grid gap-(--space-md) p-(--space-md)">
      <div className="grid gap-(--space-3xs)">
        <p className="chip--sample">
          {plan.targetSource === "professional"
            ? t("professionalChip")
            : t("estimateChip")}
        </p>
        <dl className="grid gap-(--space-3xs)">
          <Row
            label={t("goalRow")}
            value={
              plan.goal ? tOn(`goal.${plan.goal}.label`) : tOn("notAnswered")
            }
          />
          <Row
            label={t("weightRow")}
            value={`${format.number(plan.weightKg)} ${tOn("unit.kg")}`}
          />
          <Row label={t("maintenanceRow")} value={kcal(plan.maintenanceKcal)} />
          <Row label={t("targetRow")} value={kcal(plan.targetKcal)} />
          {plan.surplusKcal > 0 ? (
            <Row
              label={t("surplusRow")}
              value={`+${format.number(plan.surplusKcal)} ${tOn("unit.kcal")}`}
            />
          ) : null}
          <Row label={t("proteinRow")} value={grams(plan.macros.proteinG)} />
          <Row label={t("carbsRow")} value={grams(plan.macros.carbohydrateG)} />
          <Row label={t("fatRow")} value={grams(plan.macros.fatG)} />
        </dl>
      </div>

      {plan.belowFloor ? (
        <p className="text-sm text-(--color-ink-2)">{t("lowEstimateNote")}</p>
      ) : null}
      {plan.activityLevel === "high" ? (
        <p className="text-sm text-(--color-ink-2)">{t("highActivityNote")}</p>
      ) : null}

      <p className="hairline pt-(--space-md) text-sm text-(--color-muted)">
        {t("macrosNote")}
      </p>
      {plan.targetSource === "professional" ? (
        <div className="grid gap-(--space-3xs)">
          <p className="text-sm text-(--color-muted)">
            {t("professionalNote", {
              kcal: format.number(plan.gainwellSuggestedKcal),
            })}
          </p>
          {plan.targetKcal < DEFAULT_SURPLUS_POLICY.minTargetKcal ? (
            <p className="text-sm text-(--color-ink-2)">
              {t("professionalLowNote")}
            </p>
          ) : null}
        </div>
      ) : null}
      <p className="text-sm text-(--color-muted)">{t("assumptions")}</p>
      <Link className="btn btn--quiet" href="/onboarding?step=1">
        {t("editOnboarding")}
      </Link>
    </div>
  );
}

/** Under 18: supportive education, no personal numbers anywhere on the page. */
async function MinorGuidance() {
  const t = await getTranslations("auth.dashboard");
  return (
    <div className="well grid gap-(--space-md) p-(--space-md)">
      <div className="grid gap-(--space-3xs)">
        <h2 className="text-title">{t("minorTitle")}</h2>
        <p className="text-sm">{t("minorBody")}</p>
        <p className="text-sm">{t("minorTalkTo")}</p>
      </div>
      <div className="flex flex-wrap gap-(--space-sm)">
        <Link className="btn btn--quiet" href="/guides">
          {t("minorGuidesLink")}
        </Link>
        <Link className="btn btn--quiet" href="/recipes">
          {t("minorRecipesLink")}
        </Link>
      </div>
    </div>
  );
}

/** Missing or unusable answers: say what is needed, show nothing invented. */
async function IncompleteInvitation({
  plan,
}: {
  plan: Extract<NutritionPlan, { status: "incomplete" }>;
}) {
  const t = await getTranslations("auth.dashboard");
  const needed = missingMessages([...plan.missing, ...plan.invalid]);

  return (
    <div className="well grid gap-(--space-md) p-(--space-md)">
      <div className="grid gap-(--space-3xs)">
        <h2 className="text-title">{t("incompleteTitle")}</h2>
        <p className="text-sm">{t("incompleteBody")}</p>
        {needed.length > 0 ? (
          <div className="grid gap-(--space-3xs)">
            <p className="text-sm text-(--color-muted)">{t("missingTitle")}</p>
            <ul className="grid list-disc gap-(--space-3xs) pl-(--space-lg) text-sm">
              {needed.map((key) => (
                <li key={key}>{t(`missing.${key}`)}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <Link className="btn btn--primary" href="/onboarding">
        {t("onboardingCta")}
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="preview-row">
      <dt className="text-sm text-(--color-ink-2)">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

function DashboardFallback() {
  return <div className="well h-56 animate-pulse" aria-hidden="true" />;
}
