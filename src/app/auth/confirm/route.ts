import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { safeRedirectPath } from "@/lib/auth/redirect";
import { readSupabasePublicEnv } from "@/lib/supabase/env";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Email confirmation and password-recovery landing point. Supabase links land
 * here in one of two shapes, depending on the project's email templates:
 *
 * - `?token_hash=...&type=email|recovery` — templates that use `{{ .TokenHash }}`
 *   (needs a custom SMTP provider, since editing templates is not available on
 *   the free tier with the built-in mailer). Works from any browser.
 * - `?code=...` — the default templates' `{{ .ConfirmationURL }}` verified by
 *   GoTrue, which then redirects here with a single-use PKCE code. Exchanging it
 *   needs the code-verifier cookie set when the flow started, so this shape only
 *   completes in the browser that began the signup or reset.
 *
 * Both are verified server-side; no token is ever read by client JavaScript.
 * `next` is whitelisted to in-app paths, and a refused or expired link is
 * reported through the localized failure page instead of a raw error.
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
  const code = params.get("code");
  const type = params.get("type");
  const next = safeRedirectPath(params.get("next"));
  const locale = localeFromRequest(request);

  const isRecovery = type === "recovery";
  const failHref = isRecovery
    ? `/${locale}/forgot-password?confirm=failed`
    : `/${locale}/login?confirm=failed`;

  // GoTrue reports a refused or expired link as query parameters, never a token.
  if (params.get("error") || params.get("error_code")) redirect(failHref);

  if (!token_hash && !code) redirect(failHref);

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

  if (token_hash) {
    if (type !== "email" && type !== "recovery") redirect(failHref);
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (error) redirect(failHref);
  } else {
    const { error } = await supabase.auth.exchangeCodeForSession(
      code as string,
    );
    if (error) redirect(failHref);
  }

  redirect(
    next ?? (isRecovery ? `/${locale}/reset-password` : `/${locale}/dashboard`),
  );
}
