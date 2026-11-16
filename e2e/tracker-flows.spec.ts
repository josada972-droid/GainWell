import { expect, test, type Page } from "@playwright/test";

import { guardConsole } from "./console-guard";

/**
 * Meal-tracking flows against a real (local) Supabase project, bilingual
 * (Stage 4). Gated like onboarding-flows.spec.ts:
 *
 *   RUN_SUPABASE_E2E=1 SUPABASE_E2E_URL=http://127.0.0.1:54321 \
 *   SUPABASE_E2E_PUBLISHABLE_KEY=<publishable key> npm run test:e2e
 *
 * No live Open Food Facts calls here: the OFF path is exercised only through
 * its empty/error states, so the suite never depends on an external service.
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
const password = "correct-horse-battery";

type Locale = "en" | "fr";

/** Copy per language, matched by role + text/prefix. */
const copy: Record<Locale, Record<string, string | RegExp>> = {
  en: {
    signup: "Create account",
    trackerHeading: "Meal tracker",
    summaryHeading: /Summary for/,
    breakfast: "Breakfast",
    addFood: "Add food",
    dialogHeading: /Add food to Breakfast/,
    searchLabel: "Search foods",
    modeCustom: "My foods",
    customTitle: "My foods",
    newFood: "New food",
    name: "Name",
    brand: /Brand/,
    per100g: /per 100 g/,
    calories: /^Calories/,
    protein: /^Protein/,
    carbs: /^Carbohydrate/,
    fat: /^Fat/,
    fiber: /^Fiber/,
    dateNavLabel: /selected day/i,
    saveFood: "Save food",
    addQuantity: /^Quantity/,
    addToMeal: "Add to meal",
    close: "Close",
    lunch: "Lunch",
    saveTemplate: "Save this meal as a template",
    templateName: /Template name/,
    saveTemplateAction: "Save template",
    savedTitle: "Saved meals",
    applyTo: /Add to which meal/,
    apply: "Add to meal",
    today: "Today",
    edit: "Edit",
    save: "Save",
    delete: "Delete",
    emptyMeal: /No food logged in this meal yet/,
    nextDay: /Next day/,
  },
  fr: {
    signup: "Créer un compte",
    trackerHeading: "Suivi des repas",
    summaryHeading: /Résumé du/,
    breakfast: "Petit-déjeuner",
    addFood: "Ajouter un aliment",
    dialogHeading: /Ajouter un aliment à/,
    searchLabel: "Rechercher des aliments",
    modeCustom: "Mes aliments",
    customTitle: "Mes aliments",
    newFood: "Nouvel aliment",
    name: "Nom",
    brand: /Marque/,
    per100g: /pour 100 g/,
    calories: /^Calories/,
    protein: /^Protéines/,
    carbs: /^Glucides/,
    fat: /^Lipides/,
    fiber: /^Fibres/,
    saveFood: "Enregistrer l'aliment",
    addQuantity: /^Quantité/,
    addToMeal: "Ajouter au repas",
    close: "Fermer",
    lunch: "Déjeuner",
    saveTemplate: "Enregistrer ce repas comme modèle",
    templateName: /Nom du modèle/,
    saveTemplateAction: "Enregistrer le modèle",
    savedTitle: "Repas enregistrés",
    applyTo: /Ajouter à quel repas/,
    apply: "Ajouter au repas",
    today: "Aujourd'hui",
    edit: "Modifier",
    save: "Enregistrer",
    delete: "Supprimer",
    emptyMeal: /Aucun aliment noté dans ce repas/,
    nextDay: /Jour suivant/,
    prevDay: /Jour précédent/,
    dateNavLabel: /jour sélectionné/,
  },
};

const emailFor = (tag: string) => `tracker-${tag}-${stamp}@example.com`;

async function createAccount(page: Page, locale: Locale, email: string) {
  await page.goto(`/${locale}/signup`);
  await page.getByLabel(/email|courriel/i).fill(email);
  await page.getByLabel(/^password|mot de passe$/i).fill(password);
  await page.getByRole("button", { name: copy[locale].signup }).click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/dashboard$`), {
    timeout: 30_000,
  });
}

async function openTracker(page: Page, locale: Locale) {
  await page.goto(`/${locale}/tracker`);
  await expect(
    page.getByRole("heading", { name: copy[locale].trackerHeading }),
  ).toBeVisible();
}

/**
 * A tracker block by its heading. Every tracker block is a named `<section>`,
 * which ARIA exposes as a region; matching sections by "contains this heading"
 * would also match the page-level section that wraps them all.
 */
const region = (page: Page, name: string | RegExp) =>
  page.getByRole("region", { name });

/**
 * A logged entry row inside a meal block. A closed native `<dialog>` keeps its
 * content in the DOM, so text assertions must not scan the whole section: the
 * entries list is the only `<ul>` that is a direct child of a meal section.
 */
const entryRows = (page: Page, mealName: string | RegExp) =>
  region(page, mealName).locator(":scope > ul > li");

/** Opens the add-food dialog in custom-foods mode and creates one food. */
async function createCustomFood(
  page: Page,
  locale: Locale,
  name: string,
): Promise<void> {
  await page
    .getByRole("button", { name: copy[locale].addFood })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("tab", { name: copy[locale].modeCustom }).click();
  await dialog
    .getByLabel(copy[locale].searchLabel, { exact: false })
    .fill(name);
  // No match yet — the dialog offers creation via the custom-foods section.
  await expect(
    dialog.getByText(/No foods found|Aucun aliment trouvé/),
  ).toBeVisible();
  await dialog.getByRole("button", { name: copy[locale].close }).click();
  await expect(dialog).toBeHidden();

  // When no foods exist yet the create form is already open; otherwise
  // open it via the toggle button.
  const nameField = page.getByLabel(copy[locale].name);
  if (!(await nameField.isVisible())) {
    await page.getByRole("button", { name: copy[locale].newFood }).click();
  }
  await nameField.fill(name);
  await page.getByLabel(copy[locale].calories).fill("120");
  await page.getByLabel(copy[locale].protein).fill("4");
  await page.getByLabel(copy[locale].carbs).fill("20");
  await page.getByLabel(copy[locale].fat).fill("2");
  await page.getByLabel(copy[locale].fiber).fill("3");
  await page.getByRole("button", { name: copy[locale].saveFood }).click();
  await expect(page.getByText(name).first()).toBeVisible();
}

/** Adds the custom food to breakfast with the given quantity. */
async function addCustomFoodToBreakfast(
  page: Page,
  locale: Locale,
  name: string,
  quantity: string,
): Promise<void> {
  await page
    .getByRole("button", { name: copy[locale].addFood })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("tab", { name: copy[locale].modeCustom }).click();
  await dialog
    .getByLabel(copy[locale].searchLabel, { exact: false })
    .fill(name);
  await dialog.getByRole("button", { name }).first().click();
  await dialog
    .getByLabel(copy[locale].addQuantity, { exact: false })
    .fill(quantity);
  await dialog.getByRole("button", { name: copy[locale].addToMeal }).click();
  await expect(dialog).toBeHidden({ timeout: 30_000 });
}

test.describe("meal tracking flows (gated)", () => {
  let email: string;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    email = emailFor("main");
    await createAccount(page, "en", email);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("creates a custom food via the dialog + foods section", async () => {
    await openTracker(page, "en");
    await createCustomFood(page, "en", "Test oat bowl");
  });

  test("adds the food to breakfast, then edits and deletes the entry", async () => {
    await openTracker(page, "en");
    await expect(page.getByText(/Nothing logged for this day/)).toBeVisible();

    await addCustomFoodToBreakfast(page, "en", "Test oat bowl", "250");
    const breakfast = region(page, copy.en.breakfast);
    const row = entryRows(page, copy.en.breakfast);
    await expect(row.getByText("Test oat bowl")).toBeVisible();
    // 120 kcal/100g × 250 g = 300 kcal; 20 g carbs/100 g → 50 g carbs.
    await expect(row.getByText(/300/)).toBeVisible();
    await expect(row.getByText(/250 g/)).toBeVisible();

    // Edit the quantity: 100 g → 120 kcal.
    await row.getByRole("button", { name: copy.en.edit, exact: true }).click();
    await row.getByLabel(copy.en.addQuantity).fill("100");
    await row.getByRole("button", { name: copy.en.save, exact: true }).click();
    await expect(row.getByText(/120/)).toBeVisible();

    // Delete the entry.
    await row
      .getByRole("button", { name: copy.en.delete, exact: true })
      .click();
    await expect(breakfast.getByText(copy.en.emptyMeal)).toBeVisible();
  });

  test("saves a meal as a template and applies it to another day", async () => {
    await openTracker(page, "en");
    await addCustomFoodToBreakfast(page, "en", "Test oat bowl", "100");

    const breakfast = region(page, copy.en.breakfast);
    await breakfast.getByRole("button", { name: copy.en.saveTemplate }).click();
    await breakfast.getByLabel(copy.en.templateName).fill("Oat routine");
    await breakfast
      .getByRole("button", { name: copy.en.saveTemplateAction })
      .click();
    await expect(
      region(page, copy.en.savedTitle).getByText("Oat routine").first(),
    ).toBeVisible();

    // Navigate to tomorrow and apply the template to lunch there.
    await page
      .getByRole("navigation", { name: /selected day/i })
      .getByRole("link", { name: copy.en.nextDay })
      .click();
    await expect(page).toHaveURL(/date=\d{4}-\d{2}-\d{2}/);
    const saved = region(page, copy.en.savedTitle);
    await saved
      .getByLabel(copy.en.applyTo as string)
      .selectOption({ label: copy.en.lunch as string });
    await saved.getByRole("button", { name: copy.en.apply }).click();
    await expect(
      entryRows(page, copy.en.lunch).getByText("Test oat bowl"),
    ).toBeVisible();
    await expect(entryRows(page, copy.en.lunch).getByText(/120/)).toBeVisible();

    // Back to today: the original breakfast entry is still there.
    await page
      .getByRole("navigation", { name: /selected day/i })
      .getByRole("link", { name: copy.en.today })
      .click();
    await expect(
      entryRows(page, copy.en.breakfast).getByText("Test oat bowl"),
    ).toBeVisible();
  });

  test("shows the search empty state without any network call", async () => {
    // Custom mode searches only the user's own rows (local DB): a gibberish
    // query legitimately finds nothing. The OFF empty/error states are
    // covered by mocked unit tests; e2e makes no live Open Food Facts calls.
    await openTracker(page, "en");
    await page.getByRole("button", { name: copy.en.addFood }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("tab", { name: copy.en.modeCustom }).click();
    await dialog
      .getByLabel(copy.en.searchLabel, { exact: false })
      .fill("zzzznothingzzz");
    await expect(dialog.getByText(/No foods found/)).toBeVisible();
    await dialog.getByRole("button", { name: copy.en.close }).click();
  });

  test("renders the tracker in French with the same functionality", async () => {
    await openTracker(page, "fr");
    await expect(
      page.getByRole("heading", { name: copy.fr.summaryHeading }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: copy.fr.breakfast }),
    ).toBeVisible();
    // The French session created in EN still shows the shared foods list.
    await expect(page.getByText("Test oat bowl").first()).toBeVisible();
    // Date navigation in French.
    await page
      .getByRole("navigation", { name: copy.fr.dateNavLabel })
      .getByRole("link", { name: copy.fr.prevDay })
      .click();
    await expect(page).toHaveURL(/date=\d{4}-\d{2}-\d{2}/);
  });
});
