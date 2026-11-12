import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { safeRedirectPath } from "@/lib/auth/redirect";
import { readSupabasePublicEnv } from "@/lib/supabase/env";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Email confirmation and password-recovery landing point, linked from the
 * Supabase email templates as
 * `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email|recovery&next=/...`.
 * Only PKCE token-hash links are accepted (no raw `code=` exchange URLs), and
 * `next` is whitelisted to in-app paths. Unlike page requests this route is
 * allowed to write cookies, so the recovered session lands directly in the
 * browser's auth cookies.
 */
function localeFromRequest(request: NextRequest): Locale {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  return routing.locales.includes(cookie as Locale)
    ? (cookie as Locale)
    : routing.defaultLocale;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const token_hash = params.get("token_hash");
  const type = params.get("type");
  const next = safeRedirectPath(params.get("next"));
  const locale = localeFromRequest(request);

  const failHref =
    type === "recovery"
      ? `/${locale}/forgot-password?confirm=failed`
      : `/${locale}/login?confirm=failed`;

  if (!token_hash || (type !== "email" && type !== "recovery")) {
    redirect(failHref);
  }

  const env = readSupabasePublicEnv();
  if (!env) redirect(failHref);

  const cookieStore = await cookies();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error) redirect(failHref);

  redirect(
    next ??
      (type === "recovery"
        ? `/${locale}/reset-password`
        : `/${locale}/dashboard`),
  );
}
