import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { readSupabaseEnv } from "./env";
import type { Database } from "./types";

/**
 * Privileged server-only client (Stage 4). It exists for exactly two narrow
 * jobs, both of which ordinary roles are barred from by grants + RLS
 * (supabase/migrations/0004):
 * * reading and writing the shared Open Food Facts caches, which are backend
 *   implementation detail, not a user-facing API;
 * * writing meal/saved-meal entry snapshots, whose `calc_*` the database
 *   derives from the immutable `source_*` — a user must not be able to insert
 *   a fabricated snapshot or hand-edit calculated nutrition through the REST
 *   API.
 *
 * Rules (docs/supabase.md §9):
 * * never imported by a client component — `server-only` makes that a build
 *   error;
 * * the secret key is read from the validated env and never logged;
 * * every entry write is preceded by a session check (`getCurrentUser`) and
 *   an ownership read through the request-scoped client under RLS; the user id
 *   written is always the session id. This client is NOT a general-purpose
 *   replacement for authenticated user CRUD: reads, meal container creation,
 *   custom foods, saved-meal renames and deletions all stay on the
 *   request-scoped client;
 * * returns `null` when the secret is not configured. Cache writes are then
 *   skipped gracefully, cache reads fall through to a live fetch, and entry
 *   writes fail with the `config` message — tracker writes require this key.
 *
 * Caching a Supabase client instance across requests is safe here: unlike
 * the request client it holds no cookies and no user session.
 */
let cached: SupabaseClient<Database> | null | undefined;

export function getSupabaseAdminClient(): SupabaseClient<Database> | null {
  if (cached !== undefined) return cached;
  const env = readSupabaseEnv();
  cached = env?.secretKey
    ? createClient<Database>(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.secretKey,
        // auth: no session plumbing; this identity is server-to-DB only.
        { auth: { persistSession: false, autoRefreshToken: false } },
      )
    : null;
  return cached;
}
