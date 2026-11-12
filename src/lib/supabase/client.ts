import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { readSupabasePublicEnv, SupabaseConfigError } from "./env";
import type { Database } from "./types";

/**
 * Browser client (publishable key only, cookie session storage). Created once
 * per page load; the globalThis hop keeps the single GoTrueClient alive
 * through Fast Refresh. Returns `null` when no project is configured — the
 * app must treat that as "signed out", never crash.
 */
let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (typeof window === "undefined") return null;
  const env = readSupabasePublicEnv();
  if (!env) return null;
  if (!browserClient) {
    const g = globalThis as typeof globalThis & {
      __gainwellSupabase?: SupabaseClient<Database>;
    };
    browserClient =
      g.__gainwellSupabase ??
      createBrowserClient<Database>(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      );
    g.__gainwellSupabase = browserClient;
  }
  return browserClient;
}

/** Strict variant for code paths that must have a configured project. */
export function requireSupabaseBrowserClient(): SupabaseClient<Database> {
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new SupabaseConfigError(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example).",
    );
  }
  return client;
}
