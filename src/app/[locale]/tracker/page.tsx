import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { z } from "zod";

import { AddFoodDialog } from "@/components/tracker/add-food-dialog";
import { CustomFoodsSection } from "@/components/tracker/custom-foods";
import { EntryControls } from "@/components/tracker/entry-controls";
import { SaveMealForm } from "@/components/tracker/save-meal-form";
import { SavedMealsSection } from "@/components/tracker/saved-meals";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { RequireSignedIn } from "@/components/auth/session-gate";
import { getCurrentUser } from "@/lib/auth/session";
import { sumEntries } from "@/lib/nutrition/totals";
import {
  getDay,
  listCustomFoods,
  listSavedMeals,
  type MealWithEntries,
} from "@/lib/tracker/store";
import { totalsSummary } from "@/lib/tracker/display";
import { mealTypes, type MealType } from "@/lib/tracker/schema";

export async function generateMetadata() {
  const t = await getTranslations("tracker");
  return { title: t("title"), description: t("lead") };
}

/** The selected date lives in the URL; an invalid or missing one is today. */
const dateParam = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  })
  .catch(() => new Date().toISOString().slice(0, 10));

function shiftDay(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default async function TrackerPage({
  searchParams,
}: PageProps<"/[locale]/tracker">) {
  const t = await getTranslations("tracker");

  return (
    <section className="desk hairline py-(--section-gap)">
      <div className="container">
        <SectionHeading level={1} title={t("title")} lead={t("lead")} />
        <Suspense fallback={null}>
          <TrackerPanel searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}

async function TrackerPanel({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations("tracker");
  const formatNumber = (await getFormatter()).number;
  const formatDateTime = (await getFormatter()).dateTime;
  await RequireSignedIn({ next: "/tracker" });
  const user = await getCurrentUser();
  const today = new Date().toISOString().slice(0, 10);
  const selected = dateParam.parse((await searchParams).date) || today;

  if (!user) {
    return <p>{t("sessionGate")}</p>;
  }

  const [meals, customFoods, savedMeals] = await Promise.all([
    getDay(user.id, selected),
    listCustomFoods(user.id),
    listSavedMeals(user.id),
  ]);

  const entriesByMeal = new Map<MealType, MealWithEntries["meal_entries"]>();
  for (const type of mealTypes) entriesByMeal.set(type, []);
  for (const meal of meals) {
    if ((mealTypes as readonly string[]).includes(meal.meal_type)) {
      entriesByMeal.set(meal.meal_type as MealType, meal.meal_entries ?? []);
    }
  }

  const dayEntries = mealTypes.flatMap((type) => entriesByMeal.get(type) ?? []);
  const dayTotals = sumEntries(
    dayEntries.map((entry) => ({
      kcal: entry.calc_kcal,
      proteinG: entry.calc_protein_g,
      carbsG: entry.calc_carbs_g,
      fatG: entry.calc_fat_g,
      fiberG: entry.calc_fiber_g,
    })),
  );
  const format = (value: number) =>
    formatNumber(value, { maximumFractionDigits: 1 });
  const selectedLabel = formatDateTime(new Date(`${selected}T12:00:00Z`), {
    dateStyle: "long",
  });

  const locale = (await getLocale()) ?? "en";
  const dayLink = (iso: string) => ({
    pathname: "/tracker",
    query: { date: iso },
  });

  return (
    <div className="flex flex-col gap-(--space-lg) pt-(--space-lg)">
      {/* Daily summary — factual, no pressure: totals describe what was logged. */}
      <section
        aria-labelledby="day-summary-heading"
        className="stock p-(--space-lg)"
      >
        <h2 id="day-summary-heading">
          {t("summary.title", { date: selectedLabel })}
        </h2>
        <p>
          {dayTotals.entryCount === 0
            ? t("summary.empty")
            : totalsSummary(t, dayTotals, format)}
        </p>
        <p className="text-(--color-ink-2)">{t("summary.note")}</p>
      </section>

      {/* Date navigation: previous / today / next, all real links. */}
      <nav
        aria-label={t("dateNav.label")}
        className="flex flex-wrap gap-(--space-3xs)"
      >
        <Link href={dayLink(shiftDay(selected, -1))} className="btn btn--quiet">
          {t("dateNav.prev")}
        </Link>
        <Link href={dayLink(today)} className="btn btn--quiet">
          {t("dateNav.today")}
        </Link>
        <Link href={dayLink(shiftDay(selected, 1))} className="btn btn--quiet">
          {t("dateNav.next")}
        </Link>
      </nav>

      {mealTypes.map((type) => {
        const entries = entriesByMeal.get(type) ?? [];
        const mealTotals = sumEntries(
          entries.map((entry) => ({
            kcal: entry.calc_kcal,
            proteinG: entry.calc_protein_g,
            carbsG: entry.calc_carbs_g,
            fatG: entry.calc_fat_g,
            fiberG: entry.calc_fiber_g,
          })),
        );
        return (
          <section
            key={type}
            aria-labelledby={`meal-${type}-heading`}
            className="well hairline p-(--space-lg)"
          >
            <div className="flex flex-wrap items-center justify-between gap-(--space-3xs)">
              <h3 id={`meal-${type}-heading`}>{t(`mealTypes.${type}`)}</h3>
              <AddFoodDialog
                mealDate={selected}
                mealType={type}
                mealLabel={t(`mealTypes.${type}`)}
                locale={locale}
              />
            </div>

            <p className="text-(--color-ink-2)">
              {mealTotals.entryCount === 0
                ? t("meals.empty")
                : totalsSummary(t, mealTotals, format)}
            </p>

            {entries.length > 0 ? (
              <ul className="list-none p-0 flex flex-col gap-(--space-md) pt-(--space-md)">
                {entries.map((entry) => (
                  <li key={entry.id} className="hairline pt-(--space-sm)">
                    <div className="flex flex-wrap items-baseline justify-between gap-(--space-3xs)">
                      <div>
                        <span className="font-medium">{entryName(entry)}</span>
                        {entry.brand_snapshot ? (
                          <span className="text-(--color-ink-2)">
                            {" "}
                            · {entry.brand_snapshot}
                          </span>
                        ) : null}
                        <span className="block text-(--color-ink-2)">
                          {format(entry.quantity)}{" "}
                          {t(`units.${entry.quantity_unit}`)}
                          {entry.calc_kcal !== null
                            ? ` · ${
                                entry.calc_complete
                                  ? `${format(entry.calc_kcal)} ${t("totals.units.kcal")}`
                                  : t("totals.atLeast", {
                                      value: `${format(entry.calc_kcal)} ${t("totals.units.kcal")}`,
                                    })
                              }`
                            : ""}
                        </span>
                        {entry.food_source === "open_food_facts" &&
                        entry.source_attribution ? (
                          <a
                            href={entry.source_attribution}
                            target="_blank"
                            rel="noreferrer"
                            className="text-(--color-ink-2)"
                          >
                            {t("entry.sourceOffLink")}
                          </a>
                        ) : null}
                      </div>
                      <EntryControls
                        entryId={entry.id}
                        quantity={entry.quantity}
                        unit={entry.quantity_unit}
                        locale={locale}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="pt-(--space-md)">
              <SaveMealForm
                entryOptions={entries.map((entry) => ({
                  id: entry.id,
                  label: `${entryName(entry)} (${format(entry.quantity)} ${t(`units.${entry.quantity_unit}`)})`,
                }))}
                locale={locale}
              />
            </div>
          </section>
        );
      })}

      <SavedMealsSection
        savedMeals={savedMeals.map((saved) => ({
          id: saved.id,
          name: saved.name,
          description: saved.description,
          entryCount: saved.saved_meal_entries?.length ?? 0,
          kcalText: totalsSummary(
            t,
            sumEntries(
              (saved.saved_meal_entries ?? []).map((entry) => ({
                kcal: entry.calc_kcal,
                proteinG: entry.calc_protein_g,
                carbsG: entry.calc_carbs_g,
                fatG: entry.calc_fat_g,
                fiberG: entry.calc_fiber_g,
              })),
            ),
            format,
          ),
          incomplete: (saved.saved_meal_entries ?? []).some(
            (entry) => !entry.calc_complete,
          ),
        }))}
        mealDate={selected}
        locale={locale}
      />

      <CustomFoodsSection
        foods={customFoods.map((food) => ({
          id: food.id,
          name: food.name,
          brand: food.brand,
          nutritionBasis: food.nutrition_basis,
          kcal: food.kcal_per_100g,
          proteinG: food.protein_per_100g,
          carbsG: food.carbs_per_100g,
          fatG: food.fat_per_100g,
          fiberG: food.fiber_per_100g,
        }))}
        locale={locale}
      />
    </div>
  );
}

/** The name a stored entry shows: the snapshot, not a live lookup. */
function entryName(entry: MealWithEntries["meal_entries"][number]): string {
  return entry.food_name_snapshot;
}
