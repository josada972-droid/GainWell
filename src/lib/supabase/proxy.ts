import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import { readSupabasePublicEnv } from "./env";
import type { Database } from "./types";

export type SessionRefresh = {
  /** Auth cookies that must be copied onto the outgoing response. */
  cookies: Array<{ name: string; value: string; options: CookieOptions }>;
  /** Cache headers Supabase requires whenever auth cookies are set. */
  headers: Record<string, string>;
};

/**
 * Runs in the proxy (src/proxy.ts): asks Supabase to verify the session and
 * hand back any refreshed tokens, without touching the database. The caller
 * copies the result onto the next-intl response (including redirect
 * responses, so a redirect still carries refreshed cookies). No configuration
 * → nothing to do; every request is then treated as signed out.
 *
 * `auth.getClaims()` (not `getSession`) is the documented check here: it
 * verifies the JWT and refreshes it when close to expiry, while `getSession`
 * trusts the cookie without verifying.
 */
export async function refreshSupabaseSession(
  request: NextRequest,
): Promise<SessionRefresh> {
  const env = readSupabasePublicEnv();
  if (!env) return { cookies: [], headers: {} };

  const collected: SessionRefresh = { cookies: [], headers: {} };
  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet, headers) => {
          collected.cookies = cookiesToSet.map(({ name, value, options }) => ({
            name,
            value,
            options,
          }));
          collected.headers = headers;
        },
      },
    },
  );
  await supabase.auth.getClaims();
  return collected;
}

/**
 * Applies a session refresh to any outgoing proxy response, including the
 * redirect responses next-intl produces (cookies survive redirects).
 */
export function applySessionRefresh(
  response: NextResponse,
  refresh: SessionRefresh,
): NextResponse {
  for (const { name, value, options } of refresh.cookies) {
    response.cookies.set(name, value, options);
  }
  for (const [name, value] of Object.entries(refresh.headers)) {
    response.headers.set(name, value);
  }
  return response;
}
