import { expect, test } from "@playwright/test";

import { guardConsole } from "./console-guard";

guardConsole();

test("the library lists every recipe", async ({ page }) => {
  await page.goto("/en/recipes");
  await expect(page.getByText(/^9 recipes$/)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Beef ragu with pasta" }),
  ).toBeVisible();
});

test("search narrows the list by name or ingredient", async ({ page }) => {
  await page.goto("/en/recipes");
  await page.getByLabel("Search recipes").fill("oats");
  await expect(page.getByText(/^3 recipes$/)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Banana and oat smoothie" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Beef ragu with pasta" }),
  ).toHaveCount(0);
});

test("accents are folded so a plain query still matches French text", async ({
  page,
}) => {
  await page.goto("/fr/recipes");
  await page.getByLabel("Rechercher une recette").fill("cacahuete");
  await expect(page.getByText(/^2 recettes$/)).toBeVisible();
});

test("category chips filter the list", async ({ page }) => {
  await page.goto("/en/recipes");
  await page.getByRole("button", { name: "Dinners" }).click();
  await expect(page.getByText(/^2 recipes$/)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Creamy chicken with rice" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Banana and oat smoothie" }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "All" }).click();
  await expect(page.getByText(/^9 recipes$/)).toBeVisible();
});

test("a search with no match says so", async ({ page }) => {
  await page.goto("/en/recipes");
  await page.getByLabel("Search recipes").fill("zzzzzz");
  await expect(page.getByText(/^0 recipes$/)).toBeVisible();
  await expect(page.getByText("No recipe matches that search")).toBeVisible();
});

test("servings scale the ingredient quantities and the figures", async ({
  page,
}) => {
  await page.goto("/en/recipes/banana-oat-smoothie");
  await expect(page.getByText("350 ml whole milk")).toBeVisible();

  await page.getByRole("button", { name: "One serving more" }).click();
  await expect(page.getByText("700 ml whole milk")).toBeVisible();
  await expect(page.getByText("1,040").first()).toBeVisible();

  await page.getByRole("button", { name: "One serving fewer" }).click();
  await expect(page.getByText("350 ml whole milk")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "One serving fewer" }),
  ).toBeDisabled();
});

test("servings scale in French with French number formatting", async ({
  page,
}) => {
  await page.goto("/fr/recipes/beef-ragu-pasta");
  await expect(page.getByText("400 g de bœuf haché")).toBeVisible();

  await page.getByRole("button", { name: "Une portion de plus" }).click();
  await expect(page.getByText("533 g de bœuf haché")).toBeVisible();
  await expect(page.getByText(/2[\s\u00A0\u202F]800/).first()).toBeVisible();
});

test("sample content is labelled as sample", async ({ page }) => {
  await page.goto("/en/recipes/tuna-rice-bowl");
  await expect(
    page.getByText(
      "Sample recipe. The nutrition figures are hand-written estimates",
    ),
  ).toBeVisible();
});
