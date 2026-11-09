import { expect, test } from "@playwright/test";

import { guardConsole } from "./console-guard";

guardConsole();

const widths = [320, 375, 768, 1024, 1440];
const pages = [
  "/en",
  "/fr/recipes",
  "/en/recipes/beef-ragu-pasta",
  "/fr/guides/weight-gain-basics",
  "/en/how-it-works",
];

function noHorizontalOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const width = window.innerWidth;
    const offenders: string[] = [];
    for (const element of document.querySelectorAll("body *")) {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0) continue;
      if (rect.right > width + 1 || rect.left < -1) {
        offenders.push(`${element.tagName} ${element.className}`.slice(0, 80));
      }
    }
    return {
      offenders,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
}

for (const width of widths) {
  for (const route of pages) {
    test(`${route} has no horizontal overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      const result = await noHorizontalOverflow(page);
      expect(
        result.offenders,
        `overflowing elements: ${result.offenders.join(", ")}`,
      ).toEqual([]);
      expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth);
    });
  }
}

test("the phone menu opens, navigates and stays touch-sized", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 720 });
  await page.goto("/en");

  const menuButton = page.getByRole("button", { name: "Menu" });
  await expect(menuButton).toBeVisible();
  const box = await menuButton.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);

  await expect(page.locator("#site-menu")).toHaveCount(0);
  await menuButton.click();
  await expect(page.locator("#site-menu")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Close menu" }),
  ).toHaveAttribute("aria-expanded", "true");
  // Four destinations plus the two language stops the menu carries.
  await expect(page.locator("#site-menu").getByRole("link")).toHaveCount(6);
  await expect(
    page.locator("#site-menu").getByRole("group", { name: "Language" }),
  ).toBeVisible();

  await page
    .locator("#site-menu")
    .getByRole("link", { name: "Recipes" })
    .click();
  await expect(page).toHaveURL("/en/recipes");
});

test("the inline nav replaces the menu at tablet width", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/en");

  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
  await expect(
    page.getByRole("navigation").first().getByRole("link", { name: "Recipes" }),
  ).toBeVisible();
  await expect(page.getByRole("group", { name: "Language" })).toBeVisible();
});
