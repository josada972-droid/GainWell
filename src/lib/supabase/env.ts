import { z } from "zod";

/**
 * Environment validation for the Supabase clients. Values are read lazily at
 * request time, never at import time, so the app still builds and runs its
 * public pages when no Supabase project is configured yet. A missing or
 * invalid configuration is reported as `null`; every caller must fail closed
 * (treat the visitor as signed out) instead of throwing during a render.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

/** Server-only secret; validated separately so public code never imports it. */
const secretKeySchema = z.string().min(1);

export type SupabasePublicEnv = z.infer<typeof publicEnvSchema>;

export type SupabaseEnv = SupabasePublicEnv & { secretKey?: string };

/** Thrown only by strict call sites (e.g. tests) that require a full config. */
export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

function parseEnv(): SupabaseEnv | null {
  const raw = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
  const parsed = publicEnvSchema.safeParse(raw);
  if (!parsed.success) return null;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  return {
    ...parsed.data,
    ...(secretKey ? { secretKey: secretKeySchema.parse(secretKey) } : {}),
  };
}

/** Public URL + publishable key, or `null` when not configured. */
export function readSupabasePublicEnv(): SupabasePublicEnv | null {
  const env = parseEnv();
  if (!env) return null;
  return {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

/**
 * Full config including the server-only secret, or `null`. The secret is
 * never required by the app this stage; it is validated for completeness.
 */
export function readSupabaseEnv(): SupabaseEnv | null {
  return parseEnv();
}
