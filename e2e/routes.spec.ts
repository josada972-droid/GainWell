import { expect, test } from "@playwright/test";

import { guardConsole } from "./console-guard";

guardConsole();

const routes = [
  "/",
  "/about",
  "/how-it-works",
  "/recipes",
  "/recipes/banana-oat-smoothie",
  "/guides",
  "/guides/calories-and-macros",
  "/privacy",
  "/terms",
];

for (const locale of ["en", "fr"]) {
  for (const route of routes) {
    test(`${locale}${route} renders`, async ({ page }) => {
      const response = await page.goto(`/${locale}${route}`);
      expect(response?.ok()).toBe(true);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator("header")).toHaveCount(1);
      await expect(page.locator("footer")).toHaveCount(1);
    });
  }
}

test("/ opens the default locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/en");
});

test("an unknown locale falls back to a 404 in English", async ({ page }) => {
  const response = await page.goto("/de");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "That page is not here",
  );
});

test("an unknown path under a supported locale shows the localized 404", async ({
  page,
}) => {
  const response = await page.goto("/fr/nappe");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Cette page n'est pas ici",
  );
});

test("an unknown recipe slug shows the recipe 404", async ({ page }) => {
  await page.goto("/en/recipes/hamburger-of-doom");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "That recipe does not exist",
  );
});

test("an unknown guide slug shows the guide 404 in French", async ({
  page,
}) => {
  await page.goto("/fr/guides/nappe");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Ce guide n'existe pas",
  );
});

test("every nav and footer link resolves", async ({ page }) => {
  await page.goto("/en");
  const hrefs = await page
    .locator("header nav a, footer nav a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

  for (const href of hrefs) {
    const response = await page.request.get(href ?? "/en");
    expect(response.ok(), `${href} should resolve`).toBe(true);
  }
});
