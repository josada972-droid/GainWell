import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";

import { routing, type Locale } from "@/i18n/routing";

/**
 * `getLocale()` is a plain string, but the seed data is keyed by the two supported
 * locales. `hasLocale` narrows it; the proxy already rejects anything else.
 */
export async function currentLocale(): Promise<Locale> {
  const locale = await getLocale();
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}
