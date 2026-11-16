import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Shared outbound-request budget for Open Food Facts (Stage 4).
 *
 * The official limits are per IP: 15 req/min for product lookups, 10 req/min
 * for search. A local in-memory bucket cannot coordinate a serverless
 * deployment — several instances each keep their own memory — so the budget
 * lives in Postgres and is spent through one SECURITY DEFINER RPC
 * (`off_rate_limit_take(bucket)`), whose single INSERT … ON CONFLICT DO
 * UPDATE … RETURNING statement is atomic: concurrent instances serialize on
 * the (bucket, window_start) primary key and can never share one token.
 *
 * The limits and the window are configured INSIDE the database function
 * (supabase/migrations/0004): search 6/min, product 10/min. The RPC takes a
 * bucket name only, so no caller — including a user hitting the REST API with
 * their own session — can pick a bucket, raise a limit or widen a window. The
 * function is executable by service_role alone, which means only this module
 * can spend the budget.
 *
 * Fail closed: `true` is the only answer that permits an outbound request. An
 * error, `false`, `null`, or a missing privileged client all deny it. There is
 * no retry of the limiter itself; the user-visible behavior is a polite "try
 * again soon" (the next attempt takes a fresh token). This is the documented
 * policy (docs/supabase.md §9.4).
 */

export type OffBucket = "search" | "product";

/**
 * Attempts to take one token from the shared budget. `true` = the outbound
 * request may proceed; anything else = refused (fail closed).
 */
export async function takeOffRateLimit(bucket: OffBucket): Promise<boolean> {
  const admin = getSupabaseAdminClient();
  if (!admin) return false; // no privileged client: fail closed
  try {
    const { data, error } = await admin.rpc("off_rate_limit_take", {
      p_bucket: bucket,
    });
    if (error) return false;
    return data === true; // never treat NULL as permission
  } catch {
    return false;
  }
}
