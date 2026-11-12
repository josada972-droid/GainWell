import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { readSupabasePublicEnv, SupabaseConfigError } from "./env";
import type { Database } from "./types";

/**
 * Server client for request handlers (Server Actions, route handlers, RSC).
 * One instance per request, wired to next/headers cookies. Route handlers may
 * write cookies; during a render Next.js forbids it, so the set branch is
 * wrapped: Supabase only writes when a token is actually refreshed, and the
 * proxy (src/proxy.ts) already keeps cookies fresh for rendered requests.
 *
 * The secret key is deliberately never placed on this client: the browser and
 * server both talk to Supabase with the publishable key, and authorization is
 * enforced by RLS (supabase/migrations), not by a shared secret.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient<Database> | null> {
  // cookies() first, deliberately: it is the dynamic read that keeps session
  // checks per-request, even when no project is configured (otherwise the
  // fail-closed path would let pages prerender their signed-in state).
  const cookieStore = await cookies();
  const env = readSupabasePublicEnv();
  if (!env) return null;
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a render (Server Component): cookie writes are
            // forbidden here. The proxy refreshes sessions instead.
          }
        },
      },
    },
  );
}

/** Strict variant for code paths that must have a configured project. */
export async function requireSupabaseServerClient(): Promise<
  SupabaseClient<Database>
> {
  const client = await getSupabaseServerClient();
  if (!client) {
    throw new SupabaseConfigError(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the server environment " +
        "(see .env.example).",
    );
  }
  return client;
}
