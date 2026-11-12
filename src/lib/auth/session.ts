import "server-only";

import type { User } from "@supabase/supabase-js";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

/**
 * Session readers for rendered pages. `getUser()` (not `getSession()`) is the
 * authoritative check: it validates the JWT with Supabase Auth. When Supabase
 * is not configured the answer is always "signed out" — fail closed, so the
 * app builds and its public pages work without a project.
 */
export async function getCurrentUser(): Promise<User | null> {
  const client = await getSupabaseServerClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user ?? null;
}

/** The signed-in user's own profile row (RLS restricts it to `auth.uid()`). */
export async function getCurrentProfile(): Promise<Profile | null> {
  const client = await getSupabaseServerClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await client
    .from("profiles")
    .select("id, display_name, preferred_language, created_at, updated_at")
    .eq("id", data.user.id)
    .maybeSingle();
  return profile ?? null;
}
