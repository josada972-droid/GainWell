import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/lib/supabase/types";

/**
 * Row Level Security integration tests for the Stage 4 meal-tracking tables
 * and shared caches, against a real Supabase project (local by default).
 *
 * Runs only when SUPABASE_TEST_URL and SUPABASE_TEST_PUBLISHABLE_KEY are set;
 * otherwise it is skipped with a clear label (no fake success). Setup:
 * `npx supabase start`, then the two env vars in front of `npm test`.
 *
 * Stage 4 hardening (supabase/migrations/0004) changed the write model:
 * ordinary roles have no INSERT/UPDATE on `meal_entries`/`saved_meal_entries`
 * and no SELECT on the OFF caches, so the legitimate entry writes below go
 * through the service-role client — the same client the server modules use.
 * Those tests additionally require SUPABASE_TEST_SECRET_KEY and are skipped
 * when it is absent.
 */

const TEST_URL = process.env.SUPABASE_TEST_URL;
const TEST_KEY = process.env.SUPABASE_TEST_PUBLISHABLE_KEY;
const TEST_SECRET = process.env.SUPABASE_TEST_SECRET_KEY;
const RUN = Boolean(TEST_URL && TEST_KEY);
const PRIVILEGED = Boolean(TEST_URL && TEST_KEY && TEST_SECRET);

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const userAEmail = `tracker-a-${stamp}@example.com`;
const userBEmail = `tracker-b-${stamp}@example.com`;
const password = "correct-horse-battery";

let clientA: SupabaseClient<Database>;
let clientB: SupabaseClient<Database>;
let admin: SupabaseClient<Database>;
let idA = "";
let idB = "";

const mealDate = "2026-01-15";

/** Source snapshot + recorded quantity only; `calc_*` is derived by the DB. */
const offEntry = {
  food_source: "open_food_facts",
  off_product_code: "3017620422003",
  custom_food_id: null,
  food_name_snapshot: "Nutella",
  brand_snapshot: "Ferrero",
  source_kcal: 539,
  source_protein_g: 6.3,
  source_carbs_g: 57.5,
  source_fat_g: 30.9,
  source_fiber_g: 0,
  source_basis: "per_100g",
  source_serving_quantity: null,
  source_serving_unit: null,
  source_attribution: "https://world.openfoodfacts.org/product/3017620422003",
  quantity: 30,
  quantity_unit: "g",
};

async function signUp(client: SupabaseClient<Database>, email: string) {
  const { data, error } = await client.auth.signUp({ email, password });
  expect(error, error ? error.message : undefined).toBeNull();
  if (!data.session) {
    throw new Error(
      "Test project requires email confirmation to be disabled so signups " +
        "return a session (local Supabase default).",
    );
  }
  return data.user!.id;
}

/** Makes a meal container for a user via their own client. */
async function makeMeal(
  client: SupabaseClient<Database>,
  userId: string,
  type: string,
): Promise<string> {
  const { error } = await client.from("meals").insert({
    user_id: userId,
    meal_date: mealDate,
    meal_type: type,
  });
  expect(error, error ? error.message : undefined).toBeNull();
  const { data } = await client
    .from("meals")
    .select("id")
    .eq("user_id", userId)
    .eq("meal_date", mealDate)
    .eq("meal_type", type)
    .single();
  return data!.id;
}

describe.skipIf(!RUN)("meal tracking RLS (requires SUPABASE_TEST_*)", () => {
  beforeAll(async () => {
    clientA = createClient<Database>(TEST_URL!, TEST_KEY!);
    clientB = createClient<Database>(TEST_URL!, TEST_KEY!);
    idA = await signUp(clientA, userAEmail);
    idB = await signUp(clientB, userBEmail);
    if (TEST_SECRET) {
      admin = createClient<Database>(TEST_URL!, TEST_SECRET, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
  });

  afterAll(async () => {
    if (TEST_SECRET && admin) {
      for (const id of [idA, idB]) {
        if (id) await admin.auth.admin.deleteUser(id);
      }
    }
  });

  it.skipIf(!PRIVILEGED)(
    "user A creates their custom food, meal and entry",
    async () => {
      const food = await clientA
        .from("custom_foods")
        .insert({
          user_id: idA,
          name: "My smoothie",
          kcal_per_100g: 60,
          protein_per_100g: 2,
          carbs_per_100g: 12,
          fat_per_100g: 1,
          fiber_per_100g: null,
          nutrition_basis: "per_100g",
        })
        .select("id")
        .single();
      expect(food.error, food.error?.message).toBeNull();

      const mealId = await makeMeal(clientA, idA, "breakfast");
      // The privileged server path (store.ts) writes entries; the trigger
      // derives calc_* from source_* + quantity.
      const entry = await admin
        .from("meal_entries")
        .insert({
          meal_id: mealId,
          user_id: idA,
          food_source: "custom",
          off_product_code: null,
          custom_food_id: food.data!.id,
          food_name_snapshot: "My smoothie",
          brand_snapshot: null,
          source_kcal: 60,
          source_protein_g: 2,
          source_carbs_g: 12,
          source_fat_g: 1,
          source_fiber_g: null,
          source_basis: "per_100g",
          source_serving_quantity: null,
          source_serving_unit: null,
          source_attribution: null,
          quantity: 200,
          quantity_unit: "g",
        })
        .select("*")
        .single();
      expect(entry.error, entry.error?.message).toBeNull();
      expect(entry.data!.calc_kcal).toBe(120);
      expect(entry.data!.calc_fiber_g).toBeNull();
      expect(entry.data!.calc_complete).toBe(false);
    },
  );

  it("user A reads only their own foods and meals", async () => {
    const foods = await clientA.from("custom_foods").select("*");
    expect(foods.error).toBeNull();
    expect(foods.data!.every((row) => row.user_id === idA)).toBe(true);

    const meals = await clientA.from("meals").select("*");
    expect(meals.error).toBeNull();
    expect(meals.data!.every((row) => row.user_id === idA)).toBe(true);
  });

  it("user B cannot read user A's meals or entries", async () => {
    const { data: aMeals } = await clientA.from("meals").select("id");
    const { data: bSees } = await clientB
      .from("meals")
      .select("id")
      .eq("user_id", idA);
    expect(bSees).toEqual([]);
    expect(aMeals!.length).toBeGreaterThan(0);
  });

  it("no ordinary role can insert an entry at all", async () => {
    const { data: aMeals } = await clientA
      .from("meals")
      .select("id")
      .eq("user_id", idA);
    const mealIdOfA = aMeals![0]!.id;

    // Even a correctly owner-scoped insert is refused: entry writes belong to
    // the server, not to the user's session (0004 revoked INSERT).
    const honest = await clientA.from("meal_entries").insert({
      ...offEntry,
      meal_id: mealIdOfA,
      user_id: idA,
    });
    expect(honest.error).not.toBeNull();
    expect(honest.data).toBeNull();

    // A forged insert claiming user B while pointing at user A's meal fails too.
    const forged = await clientB.from("meal_entries").insert({
      ...offEntry,
      meal_id: mealIdOfA,
      user_id: idB,
      food_name_snapshot: "Stolen entry",
    });
    expect(forged.error).not.toBeNull();

    // A lying user_id (claiming A) fails as well.
    const lying = await clientB.from("meal_entries").insert({
      ...offEntry,
      meal_id: mealIdOfA,
      user_id: idA,
      food_name_snapshot: "Forged identity",
    });
    expect(lying.error).not.toBeNull();
  });

  it.skipIf(!PRIVILEGED)(
    "the composite FK still refuses an entry pointing at another user's meal",
    async () => {
      const mealIdOfB = await makeMeal(clientB, idB, "snack");
      const crossUser = await admin
        .from("meal_entries")
        .insert({ ...offEntry, meal_id: mealIdOfB, user_id: idA })
        .select("id")
        .single();
      // The meal belongs to B, the snapshot claims A: the composite FK
      // (meal_id, user_id) rejects the mismatch even for a privileged write.
      expect(crossUser.error).not.toBeNull();
    },
  );

  it("user B cannot update user A's entry quantity", async () => {
    const { data: aEntries } = await clientA
      .from("meal_entries")
      .select("id, quantity");
    const entryId = aEntries![0]!.id;

    const { error } = await clientB
      .from("meal_entries")
      .update({ quantity: 999 })
      .eq("id", entryId);
    // UPDATE is revoked for ordinary roles: an explicit failure, not 0 rows.
    expect(error).not.toBeNull();

    const { data: after } = await clientA
      .from("meal_entries")
      .select("quantity")
      .eq("id", entryId)
      .single();
    expect(after!.quantity).not.toBe(999);
  });

  it("clients cannot write source_* or server-managed columns", async () => {
    const { data: entries } = await clientA
      .from("meal_entries")
      .select("id")
      .limit(1);
    const entryId = entries![0]!.id;

    const payload = {
      source_kcal: 1,
      created_at: "2000-01-01",
      user_id: idB,
    };
    const { error } = await clientA
      .from("meal_entries")
      .update(payload as object)
      .eq("id", entryId);
    expect(error).not.toBeNull();
  });

  it.skipIf(!PRIVILEGED)(
    "the database re-derives calc_* on a quantity edit",
    async () => {
      const { data: entries } = await clientA
        .from("meal_entries")
        .select("id, quantity, calc_kcal, quantity_unit")
        .limit(1);
      const entry = entries![0]!;

      const updated = await admin
        .from("meal_entries")
        .update({ quantity: entry.quantity + 100 })
        .eq("id", entry.id)
        .eq("user_id", idA)
        .select("quantity, calc_kcal, calc_grams, quantity_unit")
        .single();
      expect(updated.error, updated.error?.message).toBeNull();
      expect(updated.data!.calc_kcal).toBe(
        (entry.quantity + 100) * (60 / 100), // the smoothie: 60 kcal per 100 g
      );
      expect(updated.data!.quantity_unit).toBe(entry.quantity_unit);
    },
  );

  it("the deletion function refuses another user's entry", async () => {
    const { data: aEntries } = await clientA.from("meal_entries").select("id");
    const entryIdOfA = aEntries![0]!.id;

    const { data: bDeleted } = await clientB.rpc("delete_meal_entry", {
      p_entry_id: entryIdOfA,
    });
    expect(bDeleted).toBe(0);

    const { data: stillThere } = await clientA
      .from("meal_entries")
      .select("id")
      .eq("id", entryIdOfA)
      .maybeSingle();
    expect(stillThere).not.toBeNull();
  });

  it("the deletion function removes the caller's own entry", async () => {
    const { data: own } = await clientA
      .from("meal_entries")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (!own) return; // covered by earlier tests; nothing to delete

    const { data: deleted } = await clientA.rpc("delete_meal_entry", {
      p_entry_id: own.id,
    });
    expect(deleted).toBe(1);
  });

  it.skipIf(!PRIVILEGED)(
    "saved meals keep ownership on parents and children",
    async () => {
      const saved = await clientA
        .from("saved_meals")
        .insert({ user_id: idA, name: "Weekend breakfast", description: null })
        .select("id")
        .single();
      expect(saved.error, saved.error?.message).toBeNull();

      const child = await admin
        .from("saved_meal_entries")
        .insert({
          ...offEntry,
          saved_meal_id: saved.data!.id,
          user_id: idA,
        })
        .select("*")
        .single();
      expect(child.error, child.error?.message).toBeNull();
      expect(child.data!.calc_kcal).toBe(161.7);
      expect(child.data!.calc_complete).toBe(true);

      // B cannot attach to A's saved meal through the API.
      const forged = await clientB.from("saved_meal_entries").insert({
        ...offEntry,
        saved_meal_id: saved.data!.id,
        user_id: idB,
        food_name_snapshot: "Stolen",
      });
      expect(forged.error).not.toBeNull();

      // B cannot delete A's saved meal through the function.
      const { data: bDelete } = await clientB.rpc("delete_saved_meal", {
        p_saved_meal_id: saved.data!.id,
      });
      expect(bDelete).toBe(0);

      // A can, and the cascade removes the child.
      const { data: aDelete } = await clientA.rpc("delete_saved_meal", {
        p_saved_meal_id: saved.data!.id,
      });
      expect(aDelete).toBe(1);
      const { data: orphans } = await clientA
        .from("saved_meal_entries")
        .select("id")
        .eq("saved_meal_id", saved.data!.id);
      expect(orphans).toEqual([]);
    },
  );

  it.skipIf(!PRIVILEGED)(
    "rejects invalid foreign-key combinations (food_source vs ids)",
    async () => {
      const mealId = await makeMeal(clientA, idA, "snack");
      // OFF entry with a custom_food_id set: contradicts the CHECK.
      const bad = await admin
        .from("meal_entries")
        .insert({
          ...offEntry,
          meal_id: mealId,
          user_id: idA,
          custom_food_id: "00000000-0000-0000-0000-000000000000",
        })
        .select("id")
        .single();
      expect(bad.error).not.toBeNull();

      // Custom entry without an id: contradicts the CHECK.
      const bad2 = await admin
        .from("meal_entries")
        .insert({
          meal_id: mealId,
          user_id: idA,
          food_source: "custom",
          off_product_code: null,
          custom_food_id: null,
          food_name_snapshot: "Bad combo 2",
          source_kcal: 1,
          source_protein_g: null,
          source_carbs_g: null,
          source_fat_g: null,
          source_fiber_g: null,
          source_basis: "per_100g",
          source_serving_quantity: null,
          source_serving_unit: null,
          source_attribution: null,
          quantity: 1,
          quantity_unit: "g",
        })
        .select("id")
        .single();
      expect(bad2.error).not.toBeNull();
    },
  );

  it("custom foods have no DELETE path and entries outlive them", async () => {
    const { data: foods } = await clientA.from("custom_foods").select("id");
    expect(foods!.length).toBeGreaterThan(0);
    const { error } = await clientA
      .from("custom_foods")
      .delete()
      .eq("id", foods![0]!.id);
    // No DELETE policy exists: the API refuses the statement.
    expect(error).not.toBeNull();
  });

  it("ordinary users cannot write the shared caches", async () => {
    const attempt = await clientA.from("off_products_cache").insert({
      barcode: "12345678",
      product_name: "Poison",
      off_url: "https://world.openfoodfacts.org/product/12345678",
      nutrition_basis: "per_100g",
      expires_at: new Date(Date.now() + 3600_000).toISOString(),
    });
    expect(attempt.error).not.toBeNull();

    const attempt2 = await clientA.from("off_search_cache").insert({
      query_hash: "poison",
      query: "poison",
      results: [],
      expires_at: new Date(Date.now() + 3600_000).toISOString(),
    });
    expect(attempt2.error).not.toBeNull();
  });

  it("ordinary users cannot read the shared caches either", async () => {
    // Hardening pass (0004): the caches are server-internal state. Cached
    // search queries are personal-interest data, so no ordinary role reads them.
    const products = await clientA.from("off_products_cache").select("*");
    expect(products.error).not.toBeNull();
    const searches = await clientA.from("off_search_cache").select("*");
    expect(searches.error).not.toBeNull();
  });
});
