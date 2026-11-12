import { expect, test, type APIRequestContext } from "@playwright/test";

import { guardConsole } from "./console-guard";

/**
 * Full authentication flows against a real (local) Supabase project. Gated:
 * set RUN_SUPABASE_E2E=1 plus SUPABASE_E2E_URL and SUPABASE_E2E_PUBLISHABLE_KEY
 * (and make sure the .env used by `npm run start` carries the same project).
 * Local Supabase also serves Mailpit (config default port 54324); recovery and
 * confirmation emails are read from it, so the whole round-trip is real.
 *
 *   RUN_SUPABASE_E2E=1 SUPABASE_E2E_URL=http://127.0.0.1:54321 \
 *   SUPABASE_E2E_PUBLISHABLE_KEY=<publishable key> npm run test:e2e
 *
 * Without the flag the suite is skipped — no faked flows here.
 */
guardConsole();

const RUN = process.env.RUN_SUPABASE_E2E === "1";
const url = process.env.SUPABASE_E2E_URL;
const publishableKey = process.env.SUPABASE_E2E_PUBLISHABLE_KEY;
const mailpit =
  process.env.SUPABASE_E2E_MAILPIT_URL ?? "http://127.0.0.1:54324";

test.skip(
  !RUN || !url || !publishableKey,
  "requires RUN_SUPABASE_E2E=1 + credentials",
);

// The tests share one freshly created account; run them strictly in order.
test.describe.configure({ mode: "serial" });

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const email = `e2e-${stamp}@example.com`;
const password = "correct-horse-battery";
const newPassword = "better-horse-battery-2";

/** Pulls the newest /auth/confirm link of the given type out of Mailpit. */
async function confirmLink(
  request: APIRequestContext,
  type: "email" | "recovery",
): Promise<string> {
  const inbox = await request.get(`${mailpit}/api/v1/messages?limit=25`);
  const { messages } = (await inbox.json()) as {
    messages?: Array<{ ID: string }>;
  };
  for (const message of messages ?? []) {
    const detail = await request.get(`${mailpit}/api/v1/message/${message.ID}`);
    const body = (await detail.json()) as { HTML?: string };
    const href = (body.HTML ?? "")
      .replaceAll("&amp;", "&")
      .match(
        /href="(http[^"]*\/auth\/confirm\?[^"]*token_hash=[^"]*&type=(?:email|recovery)[^"]*)"/,
      )?.[1];
    if (href && href.includes(`type=${type}`)) return href;
  }
  throw new Error(`no ${type} email with an /auth/confirm link in Mailpit`);
}

test("signup lands on the dashboard, signout returns home, signin works again", async ({
  page,
}) => {
  test.setTimeout(60_000);

  // Sign up
  await page.goto("/en/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel(/^Password$/).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  // Email confirmation enabled: the notice shows, then the real email (read
  // from Mailpit) completes the signup through /auth/confirm.
  const notice = page.getByText(
    "Check your inbox: we sent a confirmation link",
  );
  if (await notice.isVisible()) {
    const link = await confirmLink(page.request, "email");
    await page.goto(link.replace("127.0.0.1:3000", "localhost:3000"));
    await expect(page).toHaveURL(/\/en\/dashboard$/, { timeout: 30_000 });
  } else {
    // Email confirmation disabled (local default) → straight into the
    // signed-in dashboard.
    await expect(page).toHaveURL(/\/en\/dashboard$/, { timeout: 30_000 });
  }
  await expect(
    page.getByRole("heading", { level: 1, name: "Your dashboard" }),
  ).toBeVisible();
  await expect(page.getByText("You are signed in.")).toBeVisible();

  // Session persists across a hard reload.
  await page.reload();
  await expect(page).toHaveURL(/\/en\/dashboard$/);
  await expect(page.getByText("You are signed in.")).toBeVisible();

  // Signed-in visitors are bounced off the login page.
  await page.goto("/en/login");
  await expect(page).toHaveURL(/\/en\/dashboard$/);

  // Sign out
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/en$/);

  // Sign in
  await page.goto("/en/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel(/^Password$/).fill(password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/, { timeout: 30_000 });

  // Bad password shows the generic credential error, never a server detail.
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/en$/);
  await page.goto("/en/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel(/^Password$/).fill("wrong-password-1");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("alert").first()).toContainText(
    "Email or password is not correct",
  );
});

test("the French dashboard greets in French", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/fr/login");
  await page.getByLabel(/courriel/i).fill(email);
  await page.getByLabel(/^Mot de passe$/).fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/fr\/dashboard$/, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", { level: 1, name: "Votre tableau de bord" }),
  ).toBeVisible();
  await expect(page.getByText("Vous êtes connecté.")).toBeVisible();
});

test("password recovery issues a real email and a new password works", async ({
  page,
}) => {
  test.setTimeout(90_000);

  // Sign out and request recovery for the account created above.
  await page.goto("/en/forgot-password");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send recovery link" }).click();
  await expect(
    page.getByText(
      "Check your inbox: if an account exists for this address, a recovery link is on its way",
    ),
  ).toBeVisible();

  // Unknown addresses get the same notice (non-enumeration).
  await page.goto("/en/forgot-password");
  await page.getByLabel("Email").fill(`nobody-${stamp}@example.com`);
  await page.getByRole("button", { name: "Send recovery link" }).click();
  await expect(
    page.getByText(
      "Check your inbox: if an account exists for this address, a recovery link is on its way",
    ),
  ).toBeVisible();

  // Open the recovery email and follow its /auth/confirm link.
  const link = await confirmLink(page.request, "recovery");
  await page.goto(link.replace("127.0.0.1:3000", "localhost:3000"));

  // The recovery session lands on the reset-password page.
  await expect(page).toHaveURL(/\/en\/reset-password$/, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", { level: 1, name: "Choose a new password" }),
  ).toBeVisible();

  await page.getByLabel(/^New password$/).fill(newPassword);
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/, { timeout: 30_000 });

  // The old password no longer works; the new one does.
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/en$/);

  await page.goto("/en/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel(/^Password$/).fill(password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("alert").first()).toContainText(
    "Email or password is not correct",
  );

  await page.getByLabel("Email").fill(email);
  await page.getByLabel(/^Password$/).fill(newPassword);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/, { timeout: 30_000 });
});
