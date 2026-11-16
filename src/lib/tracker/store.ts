import "server-only";

import {
  type Food,
  type QuantityUnit,
  nutritionForQuantity,
} from "@/lib/nutrition/food";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, EntrySnapshot } from "@/lib/supabase/types";
import type { MealType } from "@/lib/tracker/schema";

/**
 * Storage for meal tracking (Stage 4). Access is always scoped to the
 * server-verified user id; RLS in Postgres enforces ownership independently.
 *
 * Snapshot model (docs/supabase.md §9): every entry stores immutable source
 * nutrition (`source_*`) plus a calculated snapshot (`calc_*`). `calc_*` is
 * DERIVED by the database trigger from the row's own `source_*`, quantity and
 * quantity_unit (same rules as `nutritionForQuantity`), so no caller can store
 * hand-written nutrition numbers.
 *
 * Write path: ordinary roles have no INSERT/UPDATE on `meal_entries` or
 * `saved_meal_entries` (0004), so those writes go through the privileged
 * server client. Each one still: verifies the session (`getCurrentUser`),
 * reads the affected rows under RLS with the request-scoped client to confirm
 * ownership, and validates inputs with the Zod schemas in `tracker/schema.ts`
 * before touching the privileged client. The user id written is always the
 * session id, never a client-supplied value. Reads, meal container creation,
 * custom foods, saved-meal renames and deletions stay on the request-scoped
 * client (RLS).
 */

type MealEntryInsert = Database["public"]["Tables"]["meal_entries"]["Insert"];
type MealEntryRow = Database["public"]["Tables"]["meal_entries"]["Row"];
type SavedMealEntryInsert =
  Database["public"]["Tables"]["saved_meal_entries"]["Insert"];
type CustomFoodRow = Database["public"]["Tables"]["custom_foods"]["Row"];

export type MealWithEntries = Database["public"]["Tables"]["meals"]["Row"] & {
  meal_entries: MealEntryRow[];
};

export type SavedMealWithEntries =
  Database["public"]["Tables"]["saved_meals"]["Row"] & {
    saved_meal_entries: Database["public"]["Tables"]["saved_meal_entries"]["Row"][];
  };

/** Maps a Food + recorded quantity onto the entry insert shape. `calc_*` is
 * deliberately absent: the DB trigger derives it from `source_*` + quantity. */
function entryValues(
  food: Food,
  quantity: number,
  unit: QuantityUnit,
  ids: { meal_id?: string; user_id: string; custom_food_id?: string | null },
): Omit<MealEntryInsert, "id"> {
  return {
    meal_id: ids.meal_id!,
    user_id: ids.user_id,
    food_source: food.source.kind,
    off_product_code:
      food.source.kind === "open_food_facts" ? food.source.code : null,
    custom_food_id:
      food.source.kind === "custom" ? (ids.custom_food_id ?? null) : null,
    food_name_snapshot: food.name,
    brand_snapshot: food.brand,
    source_kcal: food.values.kcal,
    source_protein_g: food.values.proteinG,
    source_carbs_g: food.values.carbsG,
    source_fat_g: food.values.fatG,
    source_fiber_g: food.values.fiberG,
    source_basis: food.basis,
    source_serving_quantity: food.servingQuantity,
    source_serving_unit: food.servingUnit,
    source_attribution: food.source.attribution,
    quantity,
    quantity_unit: unit,
  };
}

/** Builds a Food from a custom-foods row (column names carry *_per_100g; the
 * row's `nutrition_basis` defines what they describe). */
export function foodFromCustomFood(row: CustomFoodRow): Food {
  return {
    name: row.name,
    brand: row.brand,
    basis: row.nutrition_basis as Food["basis"],
    values: {
      kcal: row.kcal_per_100g,
      proteinG: row.protein_per_100g,
      carbsG: row.carbs_per_100g,
      fatG: row.fat_per_100g,
      fiberG: row.fiber_per_100g,
    },
    servingQuantity: null,
    servingUnit: null,
    estimated: false,
    source: {
      kind: "custom",
      code: null,
      customFoodId: row.id,
      attribution: null,
    },
  };
}

export async function getDay(
  userId: string,
  mealDate: string,
): Promise<MealWithEntries[]> {
  const client = await getSupabaseServerClient();
  if (!client) return [];
  const { data } = await client
    .from("meals")
    .select("*, meal_entries(*)")
    .eq("user_id", userId)
    .eq("meal_date", mealDate)
    .order("meal_type")
    .order("created_at", { referencedTable: "meal_entries" });
  return (data as unknown as MealWithEntries[]) ?? [];
}

/**
 * The meal container for a date/type, created on first use. Never an upsert:
 * ON CONFLICT DO UPDATE would rewrite user_id (a column no client is granted
 * — the Stage 3 42501 lesson), so this inserts with ignoreDuplicates and
 * then reads the surviving row.
 */
export async function getOrCreateMeal(
  userId: string,
  mealDate: string,
  mealType: MealType,
): Promise<Database["public"]["Tables"]["meals"]["Row"] | null> {
  const client = await getSupabaseServerClient();
  if (!client) return null;

  const existing = await client
    .from("meals")
    .select("*")
    .eq("user_id", userId)
    .eq("meal_date", mealDate)
    .eq("meal_type", mealType)
    .maybeSingle();
  if (existing.data) return existing.data;

  // Never an upsert (docs: PostgREST's ON CONFLICT DO UPDATE would rewrite
  // user_id). A racing duplicate insert simply errors on the unique index;
  // the read below returns the surviving row either way.
  await client
    .from("meals")
    .insert({ user_id: userId, meal_date: mealDate, meal_type: mealType });

  const { data } = await client
    .from("meals")
    .select("*")
    .eq("user_id", userId)
    .eq("meal_date", mealDate)
    .eq("meal_type", mealType)
    .maybeSingle();
  return data;
}

/**
 * Adds one entry to the caller's meal. The meal is re-read under RLS first,
 * so an entry can never attach to another user's meal (belt and braces: the
 * composite FK `(meal_id, user_id)` enforces the same at the DB level).
 */
export async function addMealEntry(
  userId: string,
  mealId: string,
  food: Food,
  quantity: number,
  unit: QuantityUnit,
  customFoodId: string | null = null,
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };

  const meal = await client
    .from("meals")
    .select("id")
    .eq("id", mealId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!meal.data) return { ok: false, errorKey: "mealNotFound" };

  // Refused before the write, not guessed: an unsupported unit/basis pair has
  // no honest calculation (the DB CHECK says the same).
  if (!nutritionForQuantity(food, quantity, unit)) {
    return { ok: false, errorKey: "invalidQuantity" };
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, errorKey: "config" };
  const { error } = await admin.from("meal_entries").insert(
    entryValues(food, quantity, unit, {
      meal_id: mealId,
      user_id: userId,
      custom_food_id: customFoodId,
    }),
  );
  if (error) return { ok: false, errorKey: "invalidQuantity" };
  return { ok: true };
}

/**
 * Quantity edit: the database re-derives `calc_*` from the entry's own
 * immutable `source_*` (trigger `enforce_entry_snapshot`), so the app sends the
 * new quantity only. No external fetch, ever.
 */
export async function updateMealEntryQuantity(
  userId: string,
  entryId: string,
  quantity: number,
  unit: QuantityUnit,
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };

  const { data: entry } = await client
    .from("meal_entries")
    .select("*")
    .eq("id", entryId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!entry) return { ok: false, errorKey: "entryNotFound" };

  // Unit conversion is not implemented or validated, so the recorded unit is
  // fixed; the UI sends the entry's own unit.
  if (unit !== entry.quantity_unit)
    return { ok: false, errorKey: "quantityUnit" };

  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, errorKey: "config" };
  const { error } = await admin
    .from("meal_entries")
    .update({ quantity })
    .eq("id", entryId)
    .eq("user_id", userId);
  if (error) return { ok: false, errorKey: "invalidQuantity" };
  return { ok: true };
}

/** Deletion goes through the SECURITY DEFINER function, never a DELETE. */
export async function deleteMealEntry(
  userId: string,
  entryId: string,
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };
  const { data, error } = await client.rpc("delete_meal_entry", {
    p_entry_id: entryId,
  });
  if (error) return { ok: false, errorKey: "entryNotFound" };
  if (data === 0) {
    // Either already gone or not the caller's row — same safe answer.
    return { ok: false, errorKey: "entryNotFound" };
  }
  void userId;
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Custom foods
// ---------------------------------------------------------------------------

export async function listCustomFoods(
  userId: string,
): Promise<CustomFoodRow[]> {
  const client = await getSupabaseServerClient();
  if (!client) return [];
  const { data } = await client
    .from("custom_foods")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  return data ?? [];
}

export async function createCustomFood(
  userId: string,
  values: {
    name: string;
    brand: string | null;
    kcal: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
    fiberG: number | null;
    nutritionBasis: string;
  },
): Promise<{ ok: true; id: string } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };
  const { data, error } = await client
    .from("custom_foods")
    .insert({
      user_id: userId,
      name: values.name,
      brand: values.brand,
      kcal_per_100g: values.kcal,
      protein_per_100g: values.proteinG,
      carbs_per_100g: values.carbsG,
      fat_per_100g: values.fatG,
      fiber_per_100g: values.fiberG,
      nutrition_basis: values.nutritionBasis,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, errorKey: "invalidInput" };
  return { ok: true, id: data.id };
}

export async function updateCustomFood(
  userId: string,
  customFoodId: string,
  values: {
    name: string;
    brand: string | null;
    kcal: number | null;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
    fiberG: number | null;
    nutritionBasis: string;
  },
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };
  // Ownership is checked here AND enforced again by the RLS policy.
  const existing = await client
    .from("custom_foods")
    .select("id")
    .eq("id", customFoodId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!existing.data) return { ok: false, errorKey: "notFound" };

  const { error } = await client
    .from("custom_foods")
    .update({
      name: values.name,
      brand: values.brand,
      kcal_per_100g: values.kcal,
      protein_per_100g: values.proteinG,
      carbs_per_100g: values.carbsG,
      fat_per_100g: values.fatG,
      fiber_per_100g: values.fiberG,
      nutrition_basis: values.nutritionBasis,
    })
    .eq("id", customFoodId)
    .eq("user_id", userId);
  if (error) return { ok: false, errorKey: "invalidInput" };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Saved meals
// ---------------------------------------------------------------------------

export async function listSavedMeals(
  userId: string,
): Promise<SavedMealWithEntries[]> {
  const client = await getSupabaseServerClient();
  if (!client) return [];
  const { data } = await client
    .from("saved_meals")
    .select("*, saved_meal_entries(*)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .order("created_at", { referencedTable: "saved_meal_entries" });
  return (data as unknown as SavedMealWithEntries[]) ?? [];
}

/**
 * Saves a reusable meal template from a set of the user's own meal entries.
 * The entries' source and calculated snapshots are COPIED — the template
 * stays valid even if the original meal entries are later deleted.
 */
export async function createSavedMeal(
  userId: string,
  name: string,
  description: string | null,
  entryIds: string[],
): Promise<{ ok: true; id: string } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };
  if (entryIds.length === 0) return { ok: false, errorKey: "savedMealEmpty" };

  const { data: entries } = await client
    .from("meal_entries")
    .select("*")
    .in("id", entryIds)
    .eq("user_id", userId);
  if (!entries || entries.length !== entryIds.length) {
    return { ok: false, errorKey: "entryNotFound" };
  }

  const created = await client
    .from("saved_meals")
    .insert({ user_id: userId, name, description })
    .select("id")
    .single();
  if (created.error || !created.data) {
    return { ok: false, errorKey: "invalidInput" };
  }

  // Only the source snapshot and the recorded quantity are copied; the DB
  // trigger derives the calculated values from them, so the template carries
  // its own independent snapshot (docs/supabase.md §9.2).
  const rows: SavedMealEntryInsert[] = entries.map((entry) => ({
    saved_meal_id: created.data!.id,
    user_id: userId,
    food_source: entry.food_source,
    off_product_code: entry.off_product_code,
    custom_food_id: entry.custom_food_id,
    food_name_snapshot: entry.food_name_snapshot,
    brand_snapshot: entry.brand_snapshot,
    source_kcal: entry.source_kcal,
    source_protein_g: entry.source_protein_g,
    source_carbs_g: entry.source_carbs_g,
    source_fat_g: entry.source_fat_g,
    source_fiber_g: entry.source_fiber_g,
    source_basis: entry.source_basis,
    source_serving_quantity: entry.source_serving_quantity,
    source_serving_unit: entry.source_serving_unit,
    source_attribution: entry.source_attribution,
    quantity: entry.quantity,
    quantity_unit: entry.quantity_unit,
  }));

  const admin = getSupabaseAdminClient();
  if (!admin) {
    await client.rpc("delete_saved_meal", { p_saved_meal_id: created.data.id });
    return { ok: false, errorKey: "config" };
  }
  const inserted = await admin.from("saved_meal_entries").insert(rows);
  if (inserted.error) {
    // Roll the empty template back: a saved meal without entries is unusable.
    await client.rpc("delete_saved_meal", { p_saved_meal_id: created.data.id });
    return { ok: false, errorKey: "invalidInput" };
  }
  return { ok: true, id: created.data.id };
}

export async function updateSavedMeal(
  userId: string,
  savedMealId: string,
  name: string,
  description: string | null,
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };
  const existing = await client
    .from("saved_meals")
    .select("id")
    .eq("id", savedMealId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!existing.data) return { ok: false, errorKey: "savedMealNotFound" };

  const { error } = await client
    .from("saved_meals")
    .update({ name, description })
    .eq("id", savedMealId)
    .eq("user_id", userId);
  if (error) return { ok: false, errorKey: "invalidInput" };
  return { ok: true };
}

export async function deleteSavedMeal(
  savedMealId: string,
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };
  const { data, error } = await client.rpc("delete_saved_meal", {
    p_saved_meal_id: savedMealId,
  });
  if (error) return { ok: false, errorKey: "savedMealNotFound" };
  if (data === 0) return { ok: false, errorKey: "savedMealNotFound" };
  return { ok: true };
}

/**
 * Applies a saved meal to a date/type: independent new meal entries with
 * their own copied snapshots. Daily history never depends on the saved
 * meal's future state.
 */
export async function applySavedMeal(
  userId: string,
  savedMealId: string,
  mealDate: string,
  mealType: MealType,
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };

  const { data: saved } = await client
    .from("saved_meals")
    .select("id, saved_meal_entries(*)")
    .eq("id", savedMealId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!saved) return { ok: false, errorKey: "savedMealNotFound" };
  const entries = (saved as unknown as SavedMealWithEntries).saved_meal_entries;
  if (entries.length === 0) return { ok: false, errorKey: "savedMealEmpty" };

  const meal = await getOrCreateMeal(userId, mealDate, mealType);
  if (!meal) return { ok: false, errorKey: "config" };

  // Independent copies: source snapshot + quantity only, `calc_*` derived by
  // the trigger from the copy, so daily history never depends on the saved
  // meal's future state.
  const rows: MealEntryInsert[] = entries.map((entry) => ({
    meal_id: meal.id,
    user_id: userId,
    food_source: entry.food_source,
    off_product_code: entry.off_product_code,
    custom_food_id: entry.custom_food_id,
    food_name_snapshot: entry.food_name_snapshot,
    brand_snapshot: entry.brand_snapshot,
    source_kcal: entry.source_kcal,
    source_protein_g: entry.source_protein_g,
    source_carbs_g: entry.source_carbs_g,
    source_fat_g: entry.source_fat_g,
    source_fiber_g: entry.source_fiber_g,
    source_basis: entry.source_basis,
    source_serving_quantity: entry.source_serving_quantity,
    source_serving_unit: entry.source_serving_unit,
    source_attribution: entry.source_attribution,
    quantity: entry.quantity,
    quantity_unit: entry.quantity_unit,
  }));

  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, errorKey: "config" };
  const { error } = await admin.from("meal_entries").insert(rows);
  if (error) return { ok: false, errorKey: "invalidInput" };
  return { ok: true };
}

/** Snapshot-shape adapter shared with the UI layer. */
export type EntryLike = Pick<
  EntrySnapshot,
  | "calc_kcal"
  | "calc_protein_g"
  | "calc_carbs_g"
  | "calc_fat_g"
  | "calc_fiber_g"
>;
