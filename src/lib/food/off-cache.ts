import "server-only";

import { createHash } from "node:crypto";

import {
  type Food,
  type NutritionBasis,
  type QuantityUnit,
} from "@/lib/nutrition/food";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

/**
 * Server-side cache in front of Open Food Facts (Stage 4).
 *
 * Design (docs/supabase.md §9.4):
 * * Every cache read AND write goes through the privileged server-only client.
 *   The tables have no SELECT/INSERT/UPDATE/DELETE grant or policy for any
 *   ordinary role (supabase/migrations/0004), so a signed-in user cannot read
 *   cached products, enumerate cached normalized search queries, or poison a
 *   shared row. The cache is an implementation detail of the backend, not a
 *   user-facing database API.
 * * Product rows are stored per barcode with a 48 h TTL; search results are
 *   stored per normalized query (sha-256 of the normalized text) with the
 *   same TTL. Only normalized Food data is cached — never a raw response.
 * * Caches store only OFF-derived fields plus bookkeeping and are never
 *   mixed with user-created custom foods. Licensing note: OFF's database is
 *   ODbL 1.0 — a persistent derivative cache triggers share-alike
 *   obligations IF this database is ever distributed. Hosting it privately
 *   inside the app's own backend does not constitute redistribution; the
 *   per-row product URL keeps attribution intact. This is documented as a
 *   finding, not claimed as blanket compliance.
 * * Expired rows are cleaned opportunistically after a successful write,
 *   bounded to rows that expired before a cutoff — cache growth stays
 *   proportional to distinct queries/products actually searched.
 * * When no admin secret is configured, writes are skipped and reads fall
 *   through to live fetches (subject to the rate limiter).
 */

const PRODUCT_TTL_MS = 48 * 60 * 60 * 1000;
const SEARCH_TTL_MS = 48 * 60 * 60 * 1000;

/** sha-256 of the already-normalized query — the search cache key. */
function queryKey(normalizedQuery: string): string {
  return createHash("sha256").update(normalizedQuery).digest("hex");
}

function isValidCachedFood(value: unknown): value is Food {
  if (typeof value !== "object" || value === null) return false;
  const food = value as Food;
  return (
    typeof food.name === "string" &&
    (food.basis === "per_100g" ||
      food.basis === "per_100ml" ||
      food.basis === "per_serving") &&
    typeof food.source?.code === "string"
  );
}

/** A cached product row → the same Food shape the live fetch normalizes. */
function foodFromProductRow(
  row: Database["public"]["Tables"]["off_products_cache"]["Row"],
): Food {
  return {
    name: row.product_name ?? "",
    brand: row.brand,
    basis: row.nutrition_basis as NutritionBasis,
    values: {
      kcal: row.kcal_per_100g,
      proteinG: row.protein_per_100g,
      carbsG: row.carbs_per_100g,
      fatG: row.fat_per_100g,
      fiberG: row.fiber_per_100g,
    },
    servingQuantity: row.serving_quantity,
    servingUnit: row.serving_unit as QuantityUnit | null,
    estimated: false,
    source: {
      kind: "open_food_facts",
      code: row.barcode,
      attribution: row.off_url,
    },
  };
}

/**
 * Reads a product from cache. `null` = no fresh row, or no privileged client
 * configured (a write failure is indistinguishable from a miss by design —
 * callers then fetch live, subject to the rate limiter).
 */
export async function getCachedProduct(barcode: string): Promise<Food | null> {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("off_products_cache")
    .select("*")
    .eq("barcode", barcode)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return data ? foodFromProductRow(data) : null;
}

/** Writes one product into the shared cache (privileged; best-effort). */
export async function putCachedProduct(food: Food): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin || !food.source.code) return;
  const now = new Date();
  const { error } = await admin.from("off_products_cache").upsert(
    {
      barcode: food.source.code,
      product_name: food.name,
      brand: food.brand,
      kcal_per_100g: food.values.kcal,
      protein_per_100g: food.values.proteinG,
      carbs_per_100g: food.values.carbsG,
      fat_per_100g: food.values.fatG,
      fiber_per_100g: food.values.fiberG,
      nutrition_basis: food.basis,
      serving_quantity: food.servingQuantity,
      serving_unit: food.servingUnit,
      off_url: food.source.attribution ?? "",
      cached_at: now.toISOString(),
      expires_at: new Date(now.getTime() + PRODUCT_TTL_MS).toISOString(),
    },
    { onConflict: "barcode" },
  );
  if (error) return; // a failed cache write must never fail the search
  void cleanupExpired();
}

/** Reads a cached search result (fresh rows only; privileged read path). */
export async function getCachedSearch(
  normalizedQuery: string,
): Promise<Food[] | null> {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("off_search_cache")
    .select("results")
    .eq("query_hash", queryKey(normalizedQuery))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  const results: unknown = data?.results;
  return Array.isArray(results) && results.every(isValidCachedFood)
    ? (results as Food[])
    : null;
}

/** Writes a search result into the shared cache (privileged; best-effort). */
export async function putCachedSearch(
  normalizedQuery: string,
  foods: Food[],
): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  const now = new Date();
  const { error } = await admin.from("off_search_cache").upsert(
    {
      query_hash: queryKey(normalizedQuery),
      query: normalizedQuery,
      results: foods,
      cached_at: now.toISOString(),
      expires_at: new Date(now.getTime() + SEARCH_TTL_MS).toISOString(),
    },
    { onConflict: "query_hash" },
  );
  if (error) return;
  void cleanupExpired();
}

/**
 * Opportunistic bounded cleanup: rows are only deleted once they have been
 * expired for a full TTL, and only when a write succeeds — no dedicated
 * cron, growth stays proportional to real usage.
 */
async function cleanupExpired(): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin) return;
  const cutoff = new Date(Date.now() - PRODUCT_TTL_MS).toISOString();
  await Promise.all([
    admin.from("off_products_cache").delete().lt("expires_at", cutoff),
    admin.from("off_search_cache").delete().lt("expires_at", cutoff),
  ]);
}
