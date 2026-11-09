import { defineRouting } from "next-intl/routing";

/** English is the default; French is fully supported (AGENTS.md §14). */
export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
});

export type Locale = (typeof routing.locales)[number];
