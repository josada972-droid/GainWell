import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Unit and integration tests for src/lib logic. The e2e suite (Playwright,
 * `*.spec.ts` under e2e/) is a separate runner and must stay out of this one.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules/**"],
  },
});
