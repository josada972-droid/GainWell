import { mkdirSync } from "node:fs";

import { expect, test } from "@playwright/test";

const dir = "docs/screenshots";

test("homepage screenshots at desktop and phone widths", async ({ page }) => {
  mkdirSync(dir, { recursive: true });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.screenshot({ path: `${dir}/home-en-desktop.png`, fullPage: true });

  await page.goto("/fr");
  await page.screenshot({ path: `${dir}/home-fr-desktop.png`, fullPage: true });

  await page.setViewportSize({ width: 375, height: 720 });
  await page.goto("/en");
  await page.screenshot({ path: `${dir}/home-en-mobile.png`, fullPage: true });

  await page.goto("/fr");
  await page.screenshot({ path: `${dir}/home-fr-mobile.png`, fullPage: true });
});
