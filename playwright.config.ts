import { defineConfig } from "@playwright/test";

/** Runs against the production build (`npm run build && npm run test:e2e`). */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "npm run start",
    port: 3000,
    reuseExistingServer: true,
  },
});
