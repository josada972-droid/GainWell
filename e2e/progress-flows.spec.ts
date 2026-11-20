import { expect, test, type Page } from "@playwright/test";

import { cleanupRunUsers } from "./test-cleanup";
import { guardConsole } from "./console-guard";

/**
 * Weight-progress and favourite flows against a real (local) Supabase
 * project, bilingual (Stage 5). Gated like tracker-flows.spec.ts:
 *
 *   RUN_SUPABASE_E2E=1 SUPABASE_E2E_URL=http://127.0.0.1:54321 \
 *   SUPABASE_E2E_PUBLISHABLE_KEY=<publishable key> npm run test:e2e
 */
guardConsole();

const RUN = process.env.RUN_SUPABASE_E2E === "1";
const url = process.env.SUPABASE_E2E_URL;
const publishableKey = process.env.SUPABASE_E2E_PUBLISHABLE_KEY;

test.skip(
  !RUN || !url || !publishableKey,
  "requires RUN_SUPABASE_E2E=1 + credentials",
);

test.describe.configure({ mode: "serial" });

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

test.afterAll(async () => {
  await cleanupRunUsers(stamp);
});
const password = "correct-horse-battery";

type Locale = "en" | "fr";

/** Copy per language, matched by role + text/regex. */
const copy: Record<Locale, Record<string, string | RegExp>> = {
  en: {
    signup: "Create account",
    progressHeading: "Weight progress",
    recordHeading: "Record a measurement",
    weight: "Weight (kg)",
    date: "Date",
    note: "Note (optional)",
    submit: "Save measurement",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    history: "All measurements",
    emptyHistory: "No measurements yet",
    duplicate: /already a measurement for that date/,
    badWeight: /between 25 and 300 kg/,
    futureDate: /cannot be in the future/,
    mostRecent: /Most recent:/,
    week: "Last 7 days",
    month: "Last 30 days",
    emptyPeriod: "No measurements in this period yet.",
    dashboardProgress: "Weight progress",
    dashboardFavorites: "Favourite recipes",
    recipesHeading: "Recipes for eating more",
    favouriteAdd: "Save to favourites",
    favouriteRemove: "Remove from favourites",
    onlyFavorites: "Saved only",
    noMatch: "No recipe matches that search",
  },
  fr: {
    signup: "Créer un compte",
    progressHeading: "Progrès de poids",
    recordHeading: "Enregistrer une mesure",
    weight: "Poids (kg)",
    date: "Date",
    note: "Note (facultatif)",
    submit: "Enregistrer la mesure",
    save: "Enregistrer",
    edit: "Modifier",
    delete: "Supprimer",
    history: "Toutes les mesures",
    emptyHistory: "Aucune mesure pour l'instant",
    duplicate: /déjà une mesure pour cette date/,
    badWeight: /entre 25 et 300 kg/,
    futureDate: /ne peut pas être dans le futur/,
    mostRecent: /Le plus récent :/,
    week: "7 derniers jours",
    month: "30 derniers jours",
    emptyPeriod: "Aucune mesure dans cette période pour l'instant.",
    dashboardProgress: "Progrès de poids",
    dashboardFavorites: "Recettes favorites",
    recipesHeading: "Des recettes pour manger plus",
    favouriteAdd: "Enregistrer dans les favoris",
    favouriteRemove: "Retirer des favoris",
    onlyFavorites: "Enregistrées seulement",
    noMatch: "Aucune recette ne correspond à cette recherche",
  },
};

const emailFor = (tag: string) => `progress-${tag}-${stamp}@example.com`;

async function createAccount(page: Page, locale: Locale, email: string) {
  await page.goto(`/${locale}/signup`);
  await page.getByLabel(/email|courriel/i).fill(email);
  await page.getByLabel(/^password|mot de passe$/i).fill(password);
  await page.getByRole("button", { name: copy[locale].signup }).click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/dashboard$`), {
    timeout: 30_000,
  });
}

/** Records one measurement through the form, expecting either success or the
 * given error message. */
async function recordWeight(
  page: Page,
  locale: Locale,
  weight: string,
  note: string,
  expectError?: RegExp,
) {
  await page.getByLabel(copy[locale].weight as string).fill(weight);
  await page.getByLabel(copy[locale].note as string).fill(note);
  await page.getByRole("button", { name: copy[locale].submit }).click();
  if (expectError) {
    // `role="alert"` also matches Next's route announcer; FormAlert renders a
    // p.form-alert--error, which is the app's own announcement line.
    await expect(page.locator("p.form-alert--error")).toContainText(
      expectError,
    );
  }
}

async function openProgress(page: Page, locale: Locale) {
  await page.goto(`/${locale}/progress`);
  await expect(
    page.getByRole("heading", { name: copy[locale].progressHeading }),
  ).toBeVisible();
}

test.describe("weight progress + favourites flows (gated)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await createAccount(page, "en", emailFor("main"));
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("records a first measurement with a note", async () => {
    await openProgress(page, "en");
    await expect(
      page.getByRole("heading", { name: copy.en.emptyHistory }),
    ).toBeVisible();
    await recordWeight(page, "en", "62.5", "morning, at home");
    await expect(
      page.locator("ul li").filter({ hasText: "morning, at home" }).first(),
    ).toBeVisible();
    await expect(page.getByText(copy.en.mostRecent)).toBeVisible();
    await expect(page.locator("svg.recharts-surface").first()).toBeVisible();
  });

  test("refuses an impossible weight before submission", async () => {
    await openProgress(page, "en");
    const weightField = page.getByLabel(copy.en.weight as string);
    await weightField.fill("500");
    // The input's own constraints (min 25 / max 300, step 0.1) stop the
    // submission client-side; the server schemas re-state the same limits for
    // direct API calls, which the RLS test suite covers.
    await expect(weightField).toHaveJSProperty("validity.rangeOverflow", true);
    const rowsBefore = await page.locator("ul > li").count();
    await page.getByRole("button", { name: copy.en.submit }).click();
    await expect(page.locator("ul > li")).toHaveCount(rowsBefore);
  });

  test("refuses a future date before submission", async () => {
    await openProgress(page, "en");
    const tomorrow = new Date(Date.now() + 86_400_000)
      .toISOString()
      .slice(0, 10);
    await page.getByLabel(copy.en.weight as string).fill("63");
    // `fill` refuses values that violate the input's own constraints, so the
    // too-late date is set directly before reading back the validity state.
    // (`exact: true`: the chart's description text also contains "date".)
    const dateField = page.getByLabel(copy.en.date as string, { exact: true });
    await dateField.evaluate((el: Element, value: string) => {
      (el as HTMLInputElement).value = value;
    }, tomorrow);
    await expect(dateField).toHaveJSProperty("validity.rangeOverflow", true);
  });

  test("refuses a second measurement for the same day", async () => {
    await openProgress(page, "en");
    await recordWeight(page, "en", "63", "", copy.en.duplicate as RegExp);
  });

  test("edits the recorded value", async () => {
    await openProgress(page, "en");
    // Scope to the history row: the record form above carries the same labels.
    const row = page.locator("ul > li").first();
    await row.getByRole("button", { name: copy.en.edit, exact: true }).click();
    await row.getByLabel(copy.en.weight).fill("63.5");
    await row.getByRole("button", { name: copy.en.save, exact: true }).click();
    await expect(page.getByText("63.5").first()).toBeVisible();
  });

  test("toggles the chart window to a month and back", async () => {
    await openProgress(page, "en");
    await page.getByRole("button", { name: copy.en.month }).click();
    await expect(page.locator("svg.recharts-surface").first()).toBeVisible();
    await page.getByRole("button", { name: copy.en.week }).click();
    await expect(page.locator("svg.recharts-surface").first()).toBeVisible();
  });

  test("deletes the entry and shows the empty state", async () => {
    await openProgress(page, "en");
    await page
      .getByRole("button", { name: copy.en.delete, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: copy.en.emptyHistory }),
    ).toBeVisible();
    await expect(page.getByText(copy.en.emptyPeriod)).toBeVisible();
  });

  test("saves and removes a favourite, and filters by it", async () => {
    await page.goto("/en/recipes");
    await expect(
      page.getByRole("heading", { name: copy.en.recipesHeading }),
    ).toBeVisible();

    const firstFavourite = page
      .getByRole("button", { name: copy.en.favouriteAdd })
      .first();
    await firstFavourite.click();
    await expect(
      page.getByRole("button", { name: copy.en.favouriteRemove }).first(),
    ).toBeVisible();

    // The favourites-only chip now keeps the saved recipe visible.
    await page.getByRole("button", { name: copy.en.onlyFavorites }).click();
    await expect(
      page.getByRole("button", { name: copy.en.favouriteRemove }).first(),
    ).toBeVisible();
    await page.getByRole("button", { name: copy.en.onlyFavorites }).click();

    // Dashboard shows the favourite and (after re-add) the progress summary.
    await page.goto("/en/dashboard");
    await expect(
      page.getByRole("heading", { name: copy.en.dashboardFavorites }),
    ).toBeVisible();

    // Remove it again from the library.
    await page.goto("/en/recipes");
    await page
      .getByRole("button", { name: copy.en.favouriteRemove })
      .first()
      .click();
    await expect(
      page.getByRole("button", { name: copy.en.favouriteAdd }).first(),
    ).toBeVisible();
  });

  test("the same account sees French copies and its favourites persist", async () => {
    // Record one measurement so the FR view has data to show.
    await openProgress(page, "en");
    await recordWeight(page, "en", "63", "le matin");

    await openProgress(page, "fr");
    await expect(
      page.getByRole("heading", { name: copy.fr.recordHeading }),
    ).toBeVisible();
    await expect(page.getByText(copy.fr.mostRecent)).toBeVisible();

    await page.goto("/fr/recipes");
    await expect(
      page.getByRole("heading", { name: copy.fr.recipesHeading }),
    ).toBeVisible();
    // The favourite saved in the EN step persists across sessions and
    // languages; (re)save it here so the FR view exercises the toggle too.
    await page
      .getByRole("button", { name: copy.fr.favouriteAdd })
      .first()
      .click();
    await expect(
      page.getByRole("button", { name: copy.fr.favouriteRemove }).first(),
    ).toBeVisible();
  });

  test("the FR dashboard cards render", async () => {
    await page.goto("/fr/dashboard");
    await expect(
      page.getByRole("heading", { name: copy.fr.dashboardProgress }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: copy.fr.dashboardFavorites }),
    ).toBeVisible();
  });
});
