import { expect, test } from "@playwright/test";

/** Fails any test whose page logs a console error or throws an uncaught error. */
export function guardConsole() {
  const problems: string[] = [];

  test.beforeEach(({ page }) => {
    page.on("console", (message) => {
      // A deliberate 404 page logs a resource error; uncaught JS errors do not.
      if (
        message.type() === "error" &&
        !message.text().startsWith("Failed to load resource")
      ) {
        problems.push(message.text());
      }
    });
    page.on("pageerror", (error) => problems.push(String(error)));
  });

  test.afterEach(() => {
    expect(problems).toEqual([]);
    problems.length = 0;
  });
}
