import { expect, test } from "@playwright/test";

import { guardConsole } from "./console-guard";

/**
 * Always-on tracker checks (Stage 4): routing and responsive behavior that
 * need no Supabase project. Flow tests live in tracker-flows.spec.ts, gated
 * on a real project like the other e2e suites.
 */
guardConsole();

test.describe("tracker routing (always on)", () => {
  test("an unsigned visitor is sent to log in", async ({ page }) => {
    await page.goto("/en/tracker");
    await expect(page).toHaveURL(/\/(en|fr)\/login/, { timeout: 30_000 });
  });

  test("the tracker is reachable from the main navigation", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(
      page.getByRole("navigation").getByText("Meal tracker"),
    ).toBeVisible();
  });

  for (const width of [320, 375, 768, 1440]) {
    test(`dashboard has no horizontal overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en/dashboard");
      // Unsigned visitors land on the login page; the sign-in gate now streams,
      // so wait for that redirect before measuring (otherwise evaluate() races
      // the navigation and the context is destroyed).
      await page.waitForURL(/\/(en|fr)\/login/, { timeout: 30_000 });
      const result = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth);
    });
  }
});
