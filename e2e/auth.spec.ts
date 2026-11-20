import { expect, test } from "@playwright/test";

import { guardConsole } from "./console-guard";

/**
 * Auth pages without a Supabase project configured: the UI renders, links
 * work, and an unauthenticated dashboard redirects to login. Flows that need
 * real credentials live in auth-flows.spec.ts (gated, not run here).
 */
guardConsole();

const locales = ["en", "fr"] as const;

for (const locale of locales) {
  test(`${locale} bar offers "log in" to a visitor`, async ({ page }) => {
    await page.goto(`/${locale}`);
    const nav = page.getByRole("navigation").first();
    await expect(
      nav.getByRole("link", {
        name: locale === "en" ? "Log in" : "Se connecter",
      }),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", {
        name: locale === "en" ? "Dashboard" : "Tableau de bord",
      }),
    ).toHaveCount(0);
  });

  test(`${locale} login page renders the sign-in form`, async ({ page }) => {
    await page.goto(`/${locale}/login`);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: locale === "en" ? "Log in" : "Connexion",
      }),
    ).toBeVisible();
    await expect(page.getByLabel(/email|courriel/i)).toBeVisible();
    await expect(page.getByLabel(/password|mot de passe/i)).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: locale === "en" ? "Log in" : "Se connecter",
      }),
    ).toBeVisible();
  });

  test(`${locale} signup page renders the create-account form`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/signup`);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: locale === "en" ? "Create your account" : "Créer un compte",
      }),
    ).toBeVisible();
    await expect(page.getByLabel(/display name|nom affiché/i)).toBeVisible();
  });

  test(`${locale} forgot-password page renders`, async ({ page }) => {
    await page.goto(`/${locale}/forgot-password`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      locale === "en" ? "password" : "mot de passe",
    );
    await expect(
      page.getByRole("button", {
        name:
          locale === "en"
            ? "Send recovery link"
            : "Envoyer le lien de récupération",
      }),
    ).toBeVisible();
  });
}

test("login links to signup and forgot-password in both languages", async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(`/${locale}/login`);
    await page
      .getByRole("link", {
        name: locale === "en" ? "Create one" : "Créez-en un",
      })
      .click();
    await expect(page).toHaveURL(`/${locale}/signup`);

    await page.goto(`/${locale}/login`);
    await page
      .getByRole("link", {
        name:
          locale === "en" ? "Forgot your password?" : "Mot de passe oublié ?",
      })
      .click();
    await expect(page).toHaveURL(`/${locale}/forgot-password`);
  }
});

test("an unauthenticated visit to the dashboard is redirected to login", async ({
  page,
}) => {
  for (const locale of locales) {
    await page.goto(`/${locale}/dashboard`);
    await expect(page).toHaveURL(
      new RegExp(`/${locale}/login\\?next=%2Fdashboard`),
    );
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("the header exposes the login destination on public pages", async ({
  page,
}) => {
  await page.goto("/en");
  await expect(
    page.getByRole("link", { name: "Log in" }).first(),
  ).toBeVisible();
  await page.goto("/fr");
  await expect(
    page.getByRole("link", { name: "Se connecter" }).first(),
  ).toBeVisible();
});

test("auth pages have no horizontal overflow on a phone", async ({ page }) => {
  for (const route of [
    "/en/login",
    "/fr/login",
    "/en/signup",
    "/fr/forgot-password",
  ]) {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(route);
    const result = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(result.scrollWidth, route).toBeLessThanOrEqual(result.clientWidth);
  }
});
