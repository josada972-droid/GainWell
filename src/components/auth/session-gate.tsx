import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/auth/redirect";

/**
 * Session gates. Both read the authoritative session (`getUser()`), so they
 * must sit inside a Suspense boundary on cache-components pages. They render
 * nothing themselves: a gate either redirects or lets the page below it show.
 */

/** For login and signup: an already signed-in visitor goes to the dashboard. */
export async function RedirectIfSignedIn() {
  const user = await getCurrentUser();
  if (user) redirect({ href: "/dashboard", locale: await getLocale() });
  return null;
}

/** For the dashboard: a signed-out visitor goes to login with a return path. */
export async function RequireSignedIn({ next }: { next: string }) {
  const user = await getCurrentUser();
  if (!user) {
    const target = safeRedirectPath(next) ?? "/dashboard";
    redirect({
      href: `/login?next=${encodeURIComponent(target)}`,
      locale: await getLocale(),
    });
  }
  return null;
}
