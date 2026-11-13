import { expect, test, type Page } from "@playwright/test";

import { guardConsole } from "./console-guard";

/**
 * Onboarding flows against a real (local) Supabase project, bilingual. Gated the
 * same way as auth-flows.spec.ts:
 *
 *   RUN_SUPABASE_E2E=1 SUPABASE_E2E_URL=http://127.0.0.1:54321 \
 *   SUPABASE_E2E_PUBLISHABLE_KEY=<publishable key> npm run test:e2e
 *
 * Without the flag the suite is skipped — no faked flows here. Serial because the
 * edit/resume scenarios reuse the accounts created earlier in the file.
 *
 * Expected numbers are worked out by hand from the documented equations
 * (docs/nutrition.md), not read back from the implementation.
 */
guardConsole();

const RUN = process.env.RUN_SUPABASE_E2E === "1";
const url = process.env.SUPABASE_E2E_URL;
const publishableKey = process.env.SUPABASE_E2E_PUBLISHABLE_KEY;

test.skip(
  !RUN || !url || !publishableKey,
  "requires RUN_SUPABASE_E2E=1 + credentials",
);

test.describe.configure({ mode: "serial" });

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const password = "correct-horse-battery";
const emailFor = (tag: string) => `onboarding-${tag}-${stamp}@example.com`;
type Locale = "en" | "fr";

/** Label text per language; number fields and radios are matched by prefix. */
const copy = {
  en: {
    createAccount: "Create account",
    continue: "Continue",
    finish: "Save and go to dashboard",
    notAnswered: "Not answered",
    stepTitle: "About you",
    age: /^age/i,
    height: /^height/i,
    weight: /^current weight/i,
    targetWeight: /^target weight/i,
    professionalKcal: /^daily calorie target/i,
    sexFemale: /^female/i,
    sexUnset: /^prefer not/i,
    moderate: /^moderate/i,
    sedentary: /^mostly sitting/i,
    light: /^light/i,
    regular: /^meals most days/i,
    skipped: /^meals get skipped/i,
    medium: /^medium/i,
    low: /^low/i,
    meals: /^usual meals/i,
    vegetarian: /^vegetarian/i,
    preferenceNone: /^no specific preference/i,
    notes: /^allergies/i,
    goalGradual: /^gain weight gradually/i,
    goalProfessional: /^follow a target/i,
    goalHabits: /^build healthier/i,
    estimateChip: "Estimate",
    professionalChip: "Professional target you entered",
    professionalLowNote: "A professional target this low is unusual",
    targetRow: "Daily target",
    goalRow: "Goal",
    gradualGoalText: "Gain weight gradually",
    incompleteTitle: "Nothing to show yet",
    minorTitle: "General guidance for you",
    proteinRow: "Protein",
    professionalKept: "A professional target you entered stays yours",
    sexNeeded: "Sex (the resting-energy equation needs it)",
    onboardingCta: "Set up your nutrition profile",
    editOnboarding: "Edit your onboarding answers",
    minorNotice:
      "You are under 18, so GainWell will show general guidance rather than personal calorie numbers.",
  },
  fr: {
    createAccount: "Créer le compte",
    continue: "Continuer",
    finish: "Enregistrer et aller au tableau de bord",
    notAnswered: "Sans réponse",
    stepTitle: "À propos de vous",
    age: /^âge/i,
    height: /^taille/i,
    weight: /^poids actuel/i,
    targetWeight: /^poids cible/i,
    professionalKcal: /^cible quotidienne/i,
    sexFemale: /^femme/i,
    sexUnset: /^je préfère/i,
    moderate: /^modéré/i,
    sedentary: /^assis/i,
    light: /^léger/i,
    regular: /^des repas la/i,
    skipped: /^des repas sont/i,
    medium: /^moyen/i,
    low: /^faible/i,
    meals: /^repas habituels/i,
    vegetarian: /^végétarien/i,
    preferenceNone: /^aucune préférence/i,
    notes: /^allergies/i,
    goalGradual: /^prendre du poids/i,
    goalProfessional: /^suivre une cible/i,
    goalHabits: /^prendre de meilleures/i,
    estimateChip: "Estimation",
    professionalChip: "Cible professionnelle que vous avez saisie",
    professionalLowNote:
      "Une cible professionnelle aussi basse est inhabituelle",
    targetRow: "Cible quotidienne",
    goalRow: "Objectif",
    gradualGoalText: "Prendre du poids progressivement",
    incompleteTitle: "Rien à afficher pour l'instant",
    minorTitle: "Des conseils généraux pour vous",
    proteinRow: "Protéines",
    professionalKept:
      "La cible professionnelle que vous avez saisie reste la vôtre",
    sexNeeded: "Sexe (l'équation d'énergie de repos en a besoin)",
    onboardingCta: "Compléter votre profil nutrition",
    editOnboarding: "Modifier vos réponses du profil",
  },
} as const;

async function createAccount(page: Page, locale: Locale, email: string) {
  await page.goto(`/${locale}/signup`);
  await page.getByLabel(/email|courriel/i).fill(email);
  await page.getByLabel(/^password|mot de passe$/i).fill(password);
  await page.getByRole("button", { name: copy[locale].createAccount }).click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/dashboard$`), {
    timeout: 30_000,
  });
}

async function signIn(page: Page, locale: Locale, email: string) {
  await page.goto(`/${locale}/login`);
  await page.getByLabel(/email|courriel/i).fill(email);
  await page.getByLabel(/^password|mot de passe$/i).fill(password);
  await page
    .getByRole("button", {
      name: locale === "en" ? "Log in" : "Se connecter",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/dashboard$`), {
    timeout: 30_000,
  });
}

/** No `step` means the flow resumes where the saved row stopped. */
async function gotoOnboarding(page: Page, locale: Locale, step?: number) {
  await page.goto(
    `/${locale}/onboarding${step === undefined ? "" : `?step=${step}`}`,
  );
}

async function continueStep(page: Page, locale: Locale) {
  await page.getByRole("button", { name: copy[locale].continue }).click();
}

/** Fills one step and saves it; the Server Action redirects to the next step. */
async function saveStep(
  page: Page,
  locale: Locale,
  step: number,
  values: Record<string, string>,
) {
  const c = copy[locale] as Record<string, string | RegExp>;
  if (step === 1) {
    if (values.age) await page.getByLabel(c.age).fill(values.age);
    if (values.height) await page.getByLabel(c.height).fill(values.height);
    if (values.weight) await page.getByLabel(c.weight).fill(values.weight);
    if (values.sex === "female") await page.getByLabel(c.sexFemale).check();
    if (values.sex === "unset") await page.getByLabel(c.sexUnset).check();
  } else if (step === 2) {
    if (values.activity) await page.getByLabel(c[values.activity]).check();
    await page.getByLabel(c[values.habits]).check();
    if (values.appetite) await page.getByLabel(c[values.appetite]).check();
    if (values.meals) await page.getByLabel(c.meals).fill(values.meals);
  } else if (step === 3) {
    await page.getByLabel(c[values.preference]).check();
    if (values.notes !== undefined)
      await page.getByLabel(c.notes).fill(values.notes);
  } else if (step === 4) {
    await page.getByLabel(c[values.goal]).check();
    if (values.targetWeight)
      await page.getByLabel(c.targetWeight).fill(values.targetWeight);
    if (values.professionalKcal) {
      await page.getByLabel(c.professionalKcal).fill(values.professionalKcal);
    }
  }
  await continueStep(page, locale);
}

async function noOverflow(page: Page): Promise<string[]> {
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
    return offenders;
  });
}

test("the English adult flow saves every step and shows estimates", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const email = emailFor("adult-en");
  await createAccount(page, "en", email);

  // A fresh account has nothing to show and says so, without inventing numbers.
  await expect(page.getByText(copy.en.incompleteTitle)).toBeVisible();
  await page.getByRole("link", { name: copy.en.onboardingCta }).click();
  await expect(page).toHaveURL(/\/en\/onboarding/);

  await expect(
    page.getByRole("heading", { level: 2, name: copy.en.stepTitle }),
  ).toBeVisible();
  await expect(page.getByText("Step 1 of 5")).toBeVisible();
  await saveStep(page, "en", 1, {
    age: "30",
    height: "165",
    weight: "60",
    sex: "female",
  });
  await expect(page).toHaveURL(/step=2/);

  await saveStep(page, "en", 2, {
    activity: "moderate",
    habits: "regular",
    appetite: "medium",
    meals: "3",
  });
  await expect(page).toHaveURL(/step=3/);

  await saveStep(page, "en", 3, {
    preference: "vegetarian",
    notes: "no dairy",
  });
  await expect(page).toHaveURL(/step=4/);

  await saveStep(page, "en", 4, { goal: "goalGradual", targetWeight: "68" });
  await expect(page).toHaveURL(/step=5/);

  // The review shows what was answered, including the allergy note.
  await expect(page.getByText("no dairy")).toBeVisible();
  await expect(page.getByText(copy.en.gradualGoalText)).toBeVisible();
  await page.getByRole("link", { name: "Edit step 1" }).click();
  await expect(page).toHaveURL(/step=1/);
  await expect(page.getByLabel(copy.en.weight)).toHaveValue("60");

  await gotoOnboarding(page, "en", 5);
  await page.getByRole("button", { name: copy.en.finish }).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/);

  // A fresh document: the redirect's streamed page can still overlap the review.
  await page.goto("/en/dashboard");

  // Female, 30 years, 165 cm, 60 kg, moderate: RMR 1320.25 → ×1.5 = 1980.375
  // → 1980 kcal maintenance, +200 kcal surplus = 2180 kcal target.
  await expect(
    page.getByText(copy.en.estimateChip, { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/1[,\s]?980 kcal/).first()).toBeVisible();
  await expect(page.getByText(/2[,\s]?180 kcal/).first()).toBeVisible();
  await expect(
    page.getByText(copy.en.targetRow, { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(copy.en.gradualGoalText)).toBeVisible();
  await expect(page.getByText(copy.en.editOnboarding)).toBeVisible();
});

test("the French adult flow translates every step and the dashboard", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const email = emailFor("adult-fr");
  await createAccount(page, "fr", email);

  await expect(page.getByText(copy.fr.incompleteTitle)).toBeVisible();
  await page.getByRole("link", { name: copy.fr.onboardingCta }).click();
  await expect(
    page.getByRole("heading", { level: 2, name: copy.fr.stepTitle }),
  ).toBeVisible();
  await expect(page.getByText("Étape 1 sur 5")).toBeVisible();

  await saveStep(page, "fr", 1, {
    age: "25",
    height: "168",
    weight: "58",
    sex: "female",
  });
  await expect(page).toHaveURL(/step=2/);
  await saveStep(page, "fr", 2, {
    activity: "sedentary",
    habits: "skipped",
    appetite: "low",
  });
  await expect(page).toHaveURL(/step=3/);
  await saveStep(page, "fr", 3, { preference: "preferenceNone", notes: "" });
  await expect(page).toHaveURL(/step=4/);
  await saveStep(page, "fr", 4, { goal: "goalHabits" });
  await expect(page).toHaveURL(/step=5/);
  // Meals, appetite and the optional numbers were left empty.
  await expect(page.getByText(copy.fr.notAnswered).first()).toBeVisible();

  await page.getByRole("button", { name: copy.fr.finish }).click();
  await expect(page).toHaveURL(/\/fr\/dashboard$/);

  // Female, 25 years, 168 cm, 58 kg, sedentary: RMR 1344 → ×1.2 = 1612.8
  // → 1610 kcal. A habits goal adds no surplus, so the target is maintenance.
  await expect(
    page.getByText(copy.fr.estimateChip, { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/1\s?610 kcal/).first()).toBeVisible();
  await expect(
    page.getByText(copy.fr.targetRow, { exact: true }),
  ).toBeVisible();
});

test("an unfinished onboarding resumes where the visitor stopped", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const email = emailFor("resume");
  await createAccount(page, "en", email);

  await gotoOnboarding(page, "en");
  await saveStep(page, "en", 1, {
    age: "32",
    height: "178",
    weight: "74",
    sex: "male",
  });
  await expect(page.getByText("Step 2 of 5")).toBeVisible();

  // A new page visit (no URL step) lands on the saved step, not on step 1.
  await gotoOnboarding(page, "en");
  await expect(page.getByText("Step 2 of 5")).toBeVisible();

  // Editing an earlier answer keeps the visitor at the furthest step reached.
  await gotoOnboarding(page, "en", 1);
  await saveStep(page, "en", 1, { weight: "76" });
  await expect(page.getByText("Step 2 of 5")).toBeVisible();

  // The dashboard still refuses to guess while answers are missing.
  await page.goto("/en/dashboard");
  await expect(page.getByText(copy.en.incompleteTitle)).toBeVisible();
  await expect(page.getByText(/kcal/)).toHaveCount(0);
});

test("editing a saved answer recalculates the estimates", async ({ page }) => {
  test.setTimeout(90_000);
  await signIn(page, "en", emailFor("adult-en"));

  await page.getByRole("link", { name: copy.en.editOnboarding }).click();
  await expect(page).toHaveURL(/step=1/);
  await saveStep(page, "en", 1, { weight: "65" });

  await gotoOnboarding(page, "en", 5);
  await page.getByRole("button", { name: copy.en.finish }).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/);

  // A fresh document: the redirect's streamed page can still overlap the review.
  await page.goto("/en/dashboard");

  // Same person, now 65 kg: RMR 1370.25 → ×1.5 = 2055.375 → 2060, +200 = 2260.
  await expect(page.getByText(/2[,\s]?260 kcal/).first()).toBeVisible();
  await expect(page.getByText(/2[,\s]?180 kcal/)).toHaveCount(0);
});

test("a professional target is kept as the answer, beside GainWell's suggestion", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const email = emailFor("professional");
  await createAccount(page, "en", email);

  await gotoOnboarding(page, "en", 1);
  await saveStep(page, "en", 1, {
    age: "30",
    height: "170",
    weight: "70",
    sex: "female",
  });
  await saveStep(page, "en", 2, { activity: "light", habits: "regular" });
  await saveStep(page, "en", 3, { preference: "preferenceNone", notes: "" });
  await saveStep(page, "en", 4, {
    goal: "goalProfessional",
    professionalKcal: "2500",
  });
  await expect(page.getByText(copy.en.professionalKept)).toBeVisible();

  await page.getByRole("button", { name: copy.en.finish }).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/);

  // Female, 30, 170 cm, 70 kg, light: RMR 700 + 1062.5 − 150 − 161 = 1451.5
  // → ×1.35 = 1960.025 → 1960 kcal. The professional 2500 kcal wins; 1960 is
  // shown only as GainWell's own number.
  await expect(
    page.getByText(copy.en.professionalChip, { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/2[,\s]?500 kcal/).first()).toBeVisible();
  await expect(page.getByText(/1[,\s]?960 kcal/).first()).toBeVisible();
});

test("a low professional target is shown verbatim, with a safety note", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const email = emailFor("professional-low");
  await createAccount(page, "en", email);

  await gotoOnboarding(page, "en", 1);
  await saveStep(page, "en", 1, {
    age: "30",
    height: "170",
    weight: "70",
    sex: "female",
  });
  await saveStep(page, "en", 2, { activity: "light", habits: "regular" });
  await saveStep(page, "en", 3, { preference: "preferenceNone", notes: "" });
  await saveStep(page, "en", 4, {
    goal: "goalProfessional",
    professionalKcal: "900",
  });

  await page.getByRole("button", { name: copy.en.finish }).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/);
  await page.goto("/en/dashboard");

  // 900 kcal is shown exactly as entered — never raised — with the note that
  // GainWell does not validate professional numbers, and GainWell's own
  // suggestion (1960 kcal) stays beside it.
  await expect(
    page.getByText(copy.en.professionalChip, { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/9[,\s]?00 kcal/).first()).toBeVisible();
  await expect(page.getByText(/1[,\s]?960 kcal/).first()).toBeVisible();
  await expect(page.getByText(copy.en.professionalLowNote)).toBeVisible();
});

test("an under-18 account gets education and never a number", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const email = emailFor("minor");
  await createAccount(page, "en", email);

  await gotoOnboarding(page, "en", 1);
  await saveStep(page, "en", 1, {
    age: "17",
    height: "165",
    weight: "55",
    sex: "female",
  });
  await saveStep(page, "en", 2, { activity: "moderate", habits: "regular" });
  await saveStep(page, "en", 3, { preference: "preferenceNone", notes: "" });

  // The adult-only numeric fields are not offered to a minor at all.
  await expect(page.getByLabel(copy.en.targetWeight)).toHaveCount(0);
  await expect(page.getByLabel(copy.en.professionalKcal)).toHaveCount(0);

  await saveStep(page, "en", 4, { goal: "goalHabits" });
  await expect(page.getByText(copy.en.minorNotice)).toBeVisible();
  await page.getByRole("button", { name: copy.en.finish }).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/);

  await expect(page.getByText(copy.en.minorTitle)).toBeVisible();
  // No personal numbers: no kcal anywhere, and no estimate rows. The guidance
  // text may mention protein in words, so only the row labels are checked.
  await expect(page.getByText(/kcal/)).toHaveCount(0);
  await expect(page.getByText(copy.en.targetRow, { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByText(copy.en.proteinRow, { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByText("talk with a parent or guardian")).toBeVisible();
});

test("a missing sex answer explains itself instead of being guessed", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const email = emailFor("no-sex");
  await createAccount(page, "en", email);

  await gotoOnboarding(page, "en", 1);
  await saveStep(page, "en", 1, {
    age: "40",
    height: "175",
    weight: "78",
    sex: "unset",
  });
  await saveStep(page, "en", 2, { activity: "sedentary", habits: "regular" });
  await saveStep(page, "en", 3, { preference: "preferenceNone", notes: "" });
  await saveStep(page, "en", 4, { goal: "goalHabits" });
  await page.getByRole("button", { name: copy.en.finish }).click();
  await expect(page).toHaveURL(/\/en\/dashboard$/);

  await expect(page.getByText(copy.en.incompleteTitle)).toBeVisible();
  await expect(page.getByText(copy.en.sexNeeded)).toBeVisible();
  await expect(page.getByText(/kcal/)).toHaveCount(0);
});

for (const width of [320, 375, 768, 1440]) {
  test(`onboarding and the adult dashboard fit ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await signIn(page, "en", emailFor("adult-en"));
    await page.setViewportSize({ width, height: 900 });

    await gotoOnboarding(page, "en", 2);
    expect(await noOverflow(page)).toEqual([]);
    await gotoOnboarding(page, "en", 4);
    expect(await noOverflow(page)).toEqual([]);
    await gotoOnboarding(page, "en", 5);
    expect(await noOverflow(page)).toEqual([]);

    // The personalized dashboard is the page the review's "Edit" links lead to.
    await page.goto("/en/dashboard");
    expect(await noOverflow(page)).toEqual([]);
    await expect(
      page.getByRole("link", { name: copy.en.editOnboarding }),
    ).toBeVisible();
  });
}
