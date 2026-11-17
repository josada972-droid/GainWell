import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

/**
 * Storage for weight progress and recipe favourites (Stage 5). Both tables
 * are fully user-owned and every operation here runs on the request-scoped
 * client under RLS — no privileged client anywhere in Stage 5 (0005 grants
 * ordinary roles all four operations, with column lists keeping ownership
 * and timestamps server-side). Identity always comes from the server-verified
 * session; RLS pins every row to auth.uid() independently.
 */

type WeightEntryRow = Database["public"]["Tables"]["weight_entries"]["Row"];
type FavoriteRow = Database["public"]["Tables"]["recipe_favorites"]["Row"];

export type WeightEntry = WeightEntryRow;

// ---------------------------------------------------------------------------
// Weight entries
// ---------------------------------------------------------------------------

/** The user's own measurements, newest first (the history's reading order). */
export async function listWeightEntries(
  userId: string,
): Promise<WeightEntry[]> {
  const client = await getSupabaseServerClient();
  if (!client) return [];
  const { data } = await client
    .from("weight_entries")
    .select("*")
    .eq("user_id", userId)
    .order("measured_on", { ascending: false });
  return data ?? [];
}

/**
 * One measurement per day (UNIQUE (user_id, measured_on)). The duplicate is
 * refused at the database, not guessed: a racing double submit still maps to
 * the same friendly key. Note is null when blank.
 */
export async function createWeightEntry(
  userId: string,
  measuredOn: string,
  weightKg: number,
  note: string | null,
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };
  const { error } = await client.from("weight_entries").insert({
    user_id: userId,
    measured_on: measuredOn,
    weight_kg: weightKg,
    note,
  });
  if (error) {
    return { ok: false, errorKey: mapEntryError(error.code) };
  }
  return { ok: true };
}

/**
 * Edit of the caller's own entry. Read under RLS first so "already gone" and
 * "someone else's row" get the same safe answer. The UPDATE grant excludes
 * user_id, so ownership cannot be rewritten even by a bug here.
 */
export async function updateWeightEntry(
  userId: string,
  entryId: string,
  measuredOn: string,
  weightKg: number,
  note: string | null,
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };

  const existing = await client
    .from("weight_entries")
    .select("id")
    .eq("id", entryId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!existing.data) return { ok: false, errorKey: "entryNotFound" };

  const { error } = await client
    .from("weight_entries")
    .update({ measured_on: measuredOn, weight_kg: weightKg, note })
    .eq("id", entryId)
    .eq("user_id", userId);
  if (error) return { ok: false, errorKey: mapEntryError(error.code) };
  return { ok: true };
}

export async function deleteWeightEntry(
  userId: string,
  entryId: string,
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };
  const existing = await client
    .from("weight_entries")
    .select("id")
    .eq("id", entryId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!existing.data) return { ok: false, errorKey: "entryNotFound" };
  const { error } = await client
    .from("weight_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId);
  if (error) return { ok: false, errorKey: "invalidInput" };
  return { ok: true };
}

/** Maps a Postgres error code onto a translated key; anything else is generic. */
function mapEntryError(code: string | undefined): string {
  if (code === "23505") return "duplicateDate";
  // CHECK violations (23514) are pre-validated by Zod; treat the rest as input
  // problems without exposing database text.
  return "invalidInput";
}

// ---------------------------------------------------------------------------
// Recipe favourites
// ---------------------------------------------------------------------------

/** The slugs the user saved (the static catalogue holds the rest). */
export async function listFavoriteSlugs(userId: string): Promise<string[]> {
  const client = await getSupabaseServerClient();
  if (!client) return [];
  const { data } = await client
    .from("recipe_favorites")
    .select("recipe_slug")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(
    (row: Pick<FavoriteRow, "recipe_slug">) => row.recipe_slug,
  );
}

/**
 * Adds a favourite. Duplicate (23505) is treated as success: the favourite
 * exists either way, and the unique constraint is the real guard. The slug
 * was allowlisted by the caller against the actual recipe list.
 */
export async function addFavorite(
  userId: string,
  recipeSlug: string,
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };
  const { error } = await client
    .from("recipe_favorites")
    .insert({ user_id: userId, recipe_slug: recipeSlug });
  if (error && error.code !== "23505") {
    return { ok: false, errorKey: "invalidInput" };
  }
  return { ok: true };
}

export async function removeFavorite(
  userId: string,
  recipeSlug: string,
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };
  const { error } = await client
    .from("recipe_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("recipe_slug", recipeSlug);
  if (error) return { ok: false, errorKey: "invalidInput" };
  // Deleting a favourite that is already gone is fine: the end state matches.
  return { ok: true };
}
