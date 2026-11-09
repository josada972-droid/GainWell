import { expect, test } from "@playwright/test";

import { guardConsole } from "./console-guard";

guardConsole();

test("the skip link is the first keyboard stop", async ({ page }) => {
  await page.goto("/en");
  await page.keyboard.press("Tab");

  const active = await page.evaluate(() => {
    const element = document.activeElement as HTMLAnchorElement;
    return { href: element.getAttribute("href"), text: element.textContent };
  });
  expect(active.href).toBe("#main");
  expect(active.text).toBe("Skip to content");
});

test("keyboard focus draws a visible ring", async ({ page }) => {
  await page.goto("/en/recipes");
  await page.keyboard.press("Tab");

  const ring = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement as HTMLElement);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(ring.style).toBe("solid");
  expect(parseFloat(ring.width)).toBeGreaterThan(0);
});

test("the FAQ accordion opens with the keyboard", async ({ page }) => {
  await page.goto("/en");
  const first = page.locator(".faq details").first();
  await page.locator(".faq summary").first().press("Enter");
  await expect(first).toHaveAttribute("open", "");
});

test("the page exposes named landmarks", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("navigation").first()).toHaveAttribute(
    "aria-label",
    "Menu",
  );
  await expect(page.getByRole("navigation").last()).toHaveAttribute(
    "aria-label",
    "Site links",
  );
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("group", { name: "Language" })).toHaveCount(1);
});

test("recipe figures carry their labels", async ({ page }) => {
  await page.goto("/en/recipes/banana-oat-smoothie");
  await expect(page.getByRole("table")).toHaveCount(1);
  await expect(
    page.getByRole("columnheader", { name: "Per serving" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Total for 1 serving" }),
  ).toBeVisible();
});
