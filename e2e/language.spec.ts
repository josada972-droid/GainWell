import { expect, test } from "@playwright/test";

import { guardConsole } from "./console-guard";

guardConsole();

/** The switcher holds one link per locale, labelled in the visitor's language. */
const stop = (label: string) => (page: import("@playwright/test").Page) =>
  page.getByRole("link", { name: label, exact: true }).click();

const toFrench = stop("Français");
const toEnglish = stop("English");

test("the selector switches the page and saves the choice", async ({
  page,
}) => {
  await page.goto("/en/recipes");
  await toFrench(page);

  await expect(page).toHaveURL("/fr/recipes");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Des recettes pour manger plus",
  );
  const cookie = await page.evaluate(() => document.cookie);
  expect(cookie).toMatch(/NEXT_LOCALE=fr/);
});

test("the saved language is used on the next visit", async ({ page }) => {
  await page.goto("/en");
  await toFrench(page);
  await page.goto("/guides");

  await expect(page).toHaveURL("/fr/guides");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Guides pour une prise de poids saine",
  );
});

test("switching language on a recipe detail keeps the recipe", async ({
  page,
}) => {
  await page.goto("/fr/recipes/banana-oat-smoothie");
  await toEnglish(page);

  await expect(page).toHaveURL("/en/recipes/banana-oat-smoothie");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Banana and oat smoothie",
  );
});

test("switching language on a guide detail keeps the guide", async ({
  page,
}) => {
  await page.goto("/en/guides/eating-with-low-appetite");
  await toFrench(page);

  await expect(page).toHaveURL("/fr/guides/eating-with-low-appetite");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Manger quand l'appétit est petit",
  );
});
