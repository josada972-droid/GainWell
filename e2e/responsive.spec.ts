import { expect, test } from "@playwright/test";

import { guardConsole } from "./console-guard";

guardConsole();

const widths = [320, 375, 390, 414, 533, 768, 1024, 1440];
const pages = [
  "/en",
  "/fr",
  "/en/recipes",
  "/fr/recipes",
  "/en/recipes/beef-ragu-pasta",
  // The French CTA is the longest label in the app; it used to force the
  // detail page 88 px wider than a 320 px phone.
  "/fr/recipes/accras",
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
  // Six destinations plus the two language stops the menu carries.
  await expect(page.locator("#site-menu").getByRole("link")).toHaveCount(8);
  await expect(
    page.locator("#site-menu").getByRole("group", { name: "Language" }),
  ).toBeVisible();

  await page
    .locator("#site-menu")
    .getByRole("link", { name: "Recipes" })
    .click();
  await expect(page).toHaveURL("/en/recipes");
});

test("the inline nav replaces the menu at wide-desktop width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en");

  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
  await expect(
    page.getByRole("navigation").first().getByRole("link", { name: "Recipes" }),
  ).toBeVisible();
  await expect(page.getByRole("group", { name: "Language" })).toBeVisible();
});

/** The hero stacks below the two-column breakpoint and sits side by side above it. */
const heroCases: Array<[number, boolean]> = [
  [320, true],
  [533, true],
  [768, true],
  [1024, false],
  [1440, false],
];

for (const [width, stacked] of heroCases) {
  test(`the hero ${stacked ? "stacks" : "splits"} at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en");
    const title = page.getByRole("heading", { level: 1 });
    const preview = page.locator('[data-slot="dashboard"]');
    await expect(title).toBeVisible();
    await expect(preview).toBeVisible();

    const titleBox = await title.boundingBox();
    const previewBox = await preview.boundingBox();
    expect(titleBox?.width).toBeGreaterThan(0);
    expect(previewBox?.width).toBeGreaterThan(0);
    if (stacked) {
      expect(previewBox!.y).toBeGreaterThan(titleBox!.y);
      expect(previewBox!.x).toBeLessThanOrEqual(titleBox!.x + 1);
    } else {
      expect(previewBox!.x).toBeGreaterThan(titleBox!.x + titleBox!.width - 1);
    }
  });
}

/** Nothing readable is smaller than 14px on a phone. */
test("phone body text never drops below 14px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 720 });
  await page.goto("/en");
  const small = await page.evaluate(() => {
    const small: string[] = [];
    for (const element of document.querySelectorAll(
      "p, li, a, span, button, h1, h2, h3, dd, dt, label",
    )) {
      if (!element.textContent?.trim()) continue;
      if (element.getBoundingClientRect().width === 0) continue;
      const size = Number.parseFloat(getComputedStyle(element).fontSize);
      if (size < 14) {
        small.push(
          `${element.tagName} ${size}px ${element.className}`.slice(0, 80),
        );
      }
    }
    return small;
  });
  expect(small, `small text: ${small.join(", ")}`).toEqual([]);
});

/** The preview is labelled as illustrative sample data, not a personal target. */
test("the preview states it is sample data", async ({ page }) => {
  await page.goto("/en");
  const preview = page.locator('[data-slot="dashboard"]');
  await expect(preview.getByText("Sample data")).toBeVisible();
  await expect(preview.getByText("Example day")).toBeVisible();
  await expect(preview.getByText(/sample values/i)).toBeVisible();
  await expect(preview.getByText(/^2,400 kcal$/)).toBeVisible();

  await page.goto("/fr");
  await expect(preview.getByText("Données d'exemple")).toBeVisible();
  await expect(preview.getByText("Journée d'exemple")).toBeVisible();
  await expect(preview.getByText(/valeurs d'exemple/i)).toBeVisible();
});
