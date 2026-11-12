import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import {
  applySessionRefresh,
  refreshSupabaseSession,
} from "./lib/supabase/proxy";

/**
 * One proxy pass that does two things, in this order:
 *
 * 1. Supabase session refresh — `auth.getClaims()` verifies the JWT and, when
 *    it is close to expiry, hands back rotated cookies plus the no-cache
 *    headers auth responses require. No database access happens here
 *    (docs/ARCHITECTURE.md): tokens come straight from the auth service.
 * 2. Locale routing — next-intl's middleware redirects `/` to the best locale
 *    and refreshes the NEXT_LOCALE cookie. The refreshed auth cookies and
 *    cache headers are copied onto that response, redirects included, so a
 *    locale redirect never drops a fresh session.
 *
 * `auth/confirm` is excluded from the matcher: it is a bare route handler
 * (outside [locale]) that must not be redirected to a locale prefix, and it
 * manages its own cookie writes.
 */
export default async function proxy(request: NextRequest) {
  const refresh = await refreshSupabaseSession(request);
  const response = createMiddleware(routing)(request);
  return applySessionRefresh(response, refresh);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|favicon.ico|auth/|.*\\..*).*)"],
};
