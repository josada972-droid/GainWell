import { expect, test } from "@playwright/test";

import { guardConsole } from "./console-guard";

/**
 * Onboarding page without a configured backend session: the gate redirects an
 * unsigned visitor to login, and both languages render. The flows that need real
 * accounts live in onboarding-flows.spec.ts (gated, not run here).
 */
guardConsole();

const locales = ["en", "fr"] as const;

for (const locale of locales) {
  test(`${locale} onboarding sends an unsigned visitor to login`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/onboarding`);
    await expect(page).toHaveURL(
      new RegExp(`/${locale}/login\\?next=%2Fonboarding$`),
    );
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: locale === "en" ? "Log in" : "Connexion",
      }),
    ).toBeVisible();
  });

  test(`${locale} onboarding fits a 320px screen`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(`/${locale}/login?next=%2Fonboarding`);
    const offenders = await page.evaluate(() => {
      const width = window.innerWidth;
      const list: string[] = [];
      for (const element of document.querySelectorAll("body *")) {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0) continue;
        if (rect.right > width + 1 || rect.left < -1) {
          list.push(`${element.tagName} ${element.className}`.slice(0, 80));
        }
      }
      return list;
    });
    expect(offenders).toEqual([]);
  });
}
