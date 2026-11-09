import * as rootParams from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

/**
 * The locale comes from the `[locale]` root segment via `next/root-params`, so
 * next-intl works under Cache Components without `setRequestLocale`.
 * Unknown locales (e.g. /de/recipes) fall through to a 404 instead of rendering
 * with a locale that has no messages.
 */
export default getRequestConfig(async () => {
  const requested = await rootParams.locale();
  if (!hasLocale(routing.locales, requested)) notFound();

  return {
    locale: requested,
    messages: (await import(`../../messages/${requested}.json`)).default,
  };
});
