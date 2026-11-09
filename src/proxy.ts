import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Locale routing: `/` redirects to the best locale (saved NEXT_LOCALE cookie,
 * then Accept-Language, then English), and the cookie is refreshed on visit so
 * the choice persists. It only reads the request; no database access, because
 * the proxy also runs on prefetched routes (docs/ARCHITECTURE.md).
 */
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)"],
};
