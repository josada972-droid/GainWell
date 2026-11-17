import { expect, test } from "@playwright/test";

import { guardConsole } from "./console-guard";

/**
 * Always-on Stage 5 checks: routing and responsive behavior that need no
 * Supabase project. Flow tests live in progress-flows.spec.ts, gated on a
 * real project like the other e2e suites.
 */
guardConsole();

test.describe("progress + recipes routing (always on)", () => {
  test("an unsigned visitor to the progress page is sent to log in", async ({
    page,
  }) => {
    await page.goto("/en/progress");
    await expect(page).toHaveURL(/\/(en|fr)\/login/, { timeout: 30_000 });
  });

  test("a visitor can browse recipes without signing in", async ({ page }) => {
    await page.goto("/en/recipes");
    await expect(
      page.getByRole("heading", { name: /Recipes for eating more/ }),
    ).toBeVisible();
    await expect(page.getByRole("list").first()).toBeVisible();
  });

  test("a recipe detail page renders its steps and the sign-in prompt", async ({
    page,
  }) => {
    await page.goto("/en/recipes/banana-oat-smoothie");
    await expect(
      page.getByRole("heading", { name: /Banana and oat smoothie/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Sign in to save favourites/ }),
    ).toBeVisible();
  });

  test("the French recipe library renders", async ({ page }) => {
    await page.goto("/fr/recipes");
    await expect(
      page.getByRole("heading", { name: /Des recettes pour manger plus/ }),
    ).toBeVisible();
  });

  for (const width of [320, 375, 768, 1440]) {
    test(`the recipe library has no horizontal overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en/recipes");
      const result = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(result).toBeLessThanOrEqual(1);
    });

    test(`a recipe detail page has no horizontal overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en/recipes/creamy-chicken-rice");
      const result = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(result).toBeLessThanOrEqual(1);
    });
  }
});
