import { createHash } from "node:crypto";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  getCachedProduct,
  getCachedSearch,
  putCachedProduct,
  putCachedSearch,
} from "@/lib/food/off-cache";
import { normalizeQuery } from "@/lib/food/openfoodfacts";
import { type Food, nutritionForQuantity } from "@/lib/nutrition/food";
import { sumEntries } from "@/lib/nutrition/totals";
import type { Database } from "@/lib/supabase/types";

/**
 * Adversarial security tests for the Stage 4 hardening pass
 * (supabase/migrations/0004). These attack the database boundary directly with
 * REAL authenticated sessions and ordinary REST calls — not UI assertions —
 * plus the trusted privileged write path, against the actual local Supabase.
 *
 * Gated: needs SUPABASE_TEST_URL + SUPABASE_TEST_PUBLISHABLE_KEY. The
 * privileged-path groups additionally need SUPABASE_TEST_SECRET_KEY; without
 * it they are skipped rather than reported as passing.
 */

const TEST_URL = process.env.SUPABASE_TEST_URL;
const TEST_KEY = process.env.SUPABASE_TEST_PUBLISHABLE_KEY;
const TEST_SECRET = process.env.SUPABASE_TEST_SECRET_KEY;
const RUN = Boolean(TEST_URL && TEST_KEY);
const PRIVILEGED = Boolean(TEST_URL && TEST_KEY && TEST_SECRET);

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const password = "correct-horse-battery";
const mealDate = "2026-02-11";

let authA: SupabaseClient<Database>;
let authB: SupabaseClient<Database>;
let anon: SupabaseClient<Database>;
let admin: SupabaseClient<Database>;
let idA = "";
let idB = "";
let searchRowKey = "";

/** The app's privileged client reads the same env the server modules do. */
function configurePrivilegedEnv() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = TEST_URL!;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = TEST_KEY!;
  if (TEST_SECRET) process.env.SUPABASE_SECRET_KEY = TEST_SECRET;
}

async function signUp(client: SupabaseClient<Database>, email: string) {
  const { data, error } = await client.auth.signUp({ email, password });
  expect(error, error ? error.message : undefined).toBeNull();
  if (!data.session) throw new Error("signup must return a session");
  return data.user!.id;
}

/** A timestamp `ms` ago — used to expire cache rows (they check
 * `expires_at > cached_at`, so both timestamps move together). */
const past = (ms: number) => new Date(Date.now() - ms).toISOString();

/** A complete per-100g snapshot, exactly what the OFF path stores. */
const nutella = {
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
} as const;

const foodForNutella: Food = {
  name: "Nutella",
  brand: "Ferrero",
  basis: "per_100g",
  values: { kcal: 539, proteinG: 6.3, carbsG: 57.5, fatG: 30.9, fiberG: 0 },
  servingQuantity: null,
  servingUnit: null,
  estimated: false,
  source: {
    kind: "open_food_facts",
    code: "3017620422003",
    attribution: nutella.source_attribution,
  },
};

async function makeMeal(client: SupabaseClient<Database>, userId: string) {
  const { error } = await client
    .from("meals")
    .insert({ user_id: userId, meal_date: mealDate, meal_type: "lunch" });
  expect(error, error ? error.message : undefined).toBeNull();
  const { data } = await client
    .from("meals")
    .select("id")
    .eq("user_id", userId)
    .eq("meal_date", mealDate)
    .eq("meal_type", "lunch")
    .single();
  return data!.id;
}

beforeAll(async () => {
  if (!RUN) return;
  authA = createClient<Database>(TEST_URL!, TEST_KEY!);
  authB = createClient<Database>(TEST_URL!, TEST_KEY!);
  anon = createClient<Database>(TEST_URL!, TEST_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  idA = await signUp(authA, `hard-a-${stamp}@example.com`);
  idB = await signUp(authB, `hard-b-${stamp}@example.com`);
  if (TEST_SECRET) {
    configurePrivilegedEnv();
    admin = createClient<Database>(TEST_URL!, TEST_SECRET, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
});

afterAll(async () => {
  if (!TEST_SECRET || !admin) return;
  // Cache rows this suite created are server state, not user data.
  await admin.from("off_products_cache").delete().eq("barcode", "9000000001");
  if (searchRowKey) {
    await admin
      .from("off_search_cache")
      .delete()
      .eq("query_hash", searchRowKey);
  }
  for (const id of [idA, idB]) {
    if (id) await admin.auth.admin.deleteUser(id);
  }
  // Limiter windows this suite spent are shared bookkeeping, not user data.
  await admin
    .from("off_rate_limit")
    .delete()
    .in("bucket", ["search", "product"]);
});

describe.skipIf(!RUN)("limiter: ordinary roles cannot spend the budget", () => {
  it("an authenticated session cannot execute off_rate_limit_take", async () => {
    const { data, error } = await authA.rpc("off_rate_limit_take", {
      p_bucket: "search",
    });
    expect(error).not.toBeNull();
    expect(data).not.toBe(true);
  });

  it("an anonymous client cannot execute off_rate_limit_take", async () => {
    const { data, error } = await anon.rpc("off_rate_limit_take", {
      p_bucket: "search",
    });
    expect(error).not.toBeNull();
    expect(data).not.toBe(true);
  });

  it("caller-supplied limit/window arguments are not accepted", async () => {
    // The signature has no limit or window: a forged call must not admit.
    const forged = await authA.rpc("off_rate_limit_take", {
      p_bucket: "search",
      // Extra keys exist nowhere in the function signature.
      p_limit: 100000,
      p_window_seconds: 1,
    } as never);
    expect(forged.error).not.toBeNull();
    expect(forged.data).not.toBe(true);

    const unknownBucket = await authA.rpc("off_rate_limit_take", {
      p_bucket: "arbitrary-bucket",
    });
    expect(unknownBucket.error).not.toBeNull();
    expect(unknownBucket.data).not.toBe(true);
  });

  it("the limiter table stays invisible to ordinary roles", async () => {
    const { error } = await authA.from("off_rate_limit").select("*");
    expect(error).not.toBeNull();
    const anonRead = await anon.from("off_rate_limit").select("*");
    expect(anonRead.error).not.toBeNull();
  });
});

describe.skipIf(!RUN || !PRIVILEGED)(
  "limiter: the server path enforces limits",
  () => {
    /** Every live window row for a bucket: the limiter's own state. */
    async function windows(bucket: string) {
      const { data, error } = await admin
        .from("off_rate_limit")
        .select("window_start, used")
        .eq("bucket", bucket)
        .order("window_start", { ascending: false });
      expect(error, error ? error.message : undefined).toBeNull();
      return data ?? [];
    }

    async function take(bucket: string) {
      const { data, error } = await admin.rpc("off_rate_limit_take", {
        p_bucket: bucket,
      });
      expect(error, error ? error.message : undefined).toBeNull();
      return data;
    }

    it("search admits at most 6 per minute across all instances", async () => {
      // Start from a clean slate so the accounting is exact. Window rows are the
      // limiter's shared bookkeeping, not user data, and the function deletes
      // stale windows itself.
      await admin.from("off_rate_limit").delete().eq("bucket", "search");

      let admitted = 0;
      for (let i = 0; i < 12; i += 1) {
        const data = await take("search");
        if (data === true) admitted += 1;
        else expect(data).toBe(false); // refusal, never NULL
      }

      const rows = await windows("search");
      // A spent window stops counting: no counter ever exceeds the limit.
      expect(rows.every((row) => row.used <= 6)).toBe(true);
      if (rows.length === 1) {
        expect(admitted).toBe(6);
        expect(rows[0]!.used).toBe(6);
      } else {
        // The fixed minute boundary rolled over mid-loop, so the budget is
        // spread across two windows — still never above 6 in either.
        expect(admitted).toBeGreaterThan(6);
      }
    });

    it("product lookups admit at most 10, concurrently serialized", async () => {
      await admin.from("off_rate_limit").delete().eq("bucket", "product");
      const attempts = await Promise.all(
        Array.from({ length: 14 }, () => take("product")),
      );
      const admitted = attempts.filter((data) => data === true).length;
      expect(admitted).toBeLessThanOrEqual(10);
      expect(admitted).toBeGreaterThan(0);
      const rows = await windows("product");
      expect(rows.every((row) => row.used <= 10)).toBe(true);
      if (rows.length === 1) expect(admitted).toBe(10);
    });

    it("unknown buckets are refused and create no row", async () => {
      const { data, error } = await admin.rpc("off_rate_limit_take", {
        p_bucket: "poison-bucket",
      });
      expect(error, error ? error.message : undefined).toBeNull();
      expect(data).toBe(false);
      const rows = await admin
        .from("off_rate_limit")
        .select("bucket")
        .eq("bucket", "poison-bucket");
      expect(rows.data).toEqual([]);
    });
  },
);

describe.skipIf(!RUN)("OFF caches: no ordinary-role access path", () => {
  it("authenticated users cannot read either cache", async () => {
    const products = await authA.from("off_products_cache").select("*");
    expect(products.error).not.toBeNull();
    expect(products.data).toBeNull();

    const searches = await authA.from("off_search_cache").select("*");
    expect(searches.error).not.toBeNull();
    expect(searches.data).toBeNull();
  });

  it("authenticated users cannot enumerate cached search terms", async () => {
    const queries = await authA.from("off_search_cache").select("query");
    expect(queries.error).not.toBeNull();
    expect(queries.data).toBeNull();
  });

  it("anonymous clients cannot read either cache", async () => {
    const products = await anon.from("off_products_cache").select("*");
    expect(products.error).not.toBeNull();
    const searches = await anon.from("off_search_cache").select("*");
    expect(searches.error).not.toBeNull();
  });

  it("ordinary roles still cannot write the caches", async () => {
    const poison = await authA.from("off_search_cache").insert({
      query_hash: "poison-" + stamp,
      query: "poison",
      results: [],
      expires_at: new Date(Date.now() + 3600_000).toISOString(),
    });
    expect(poison.error).not.toBeNull();
  });
});

describe.skipIf(!RUN || !PRIVILEGED)(
  "OFF caches: the server implementation still works",
  () => {
    it("writes and reads a product, honoring the TTL", async () => {
      const food: Food = {
        ...foodForNutella,
        source: {
          kind: "open_food_facts",
          code: "9000000001",
          attribution: "https://world.openfoodfacts.org/product/9000000001",
        },
      };
      await putCachedProduct(food);
      const hit = await getCachedProduct("9000000001");
      expect(hit?.source.code).toBe("9000000001");
      expect(hit?.values.kcal).toBe(539);

      // An expired row must not be served. Both timestamps move into the past:
      // the table checks `expires_at > cached_at`.
      const expired = await admin
        .from("off_products_cache")
        .update({ cached_at: past(2000), expires_at: past(1000) })
        .eq("barcode", "9000000001")
        .select("expires_at");
      expect(expired.error, expired.error?.message).toBeNull();
      expect(expired.data?.length).toBe(1);
      expect(await getCachedProduct("9000000001")).toBeNull();
    });

    it("writes and reads a search result by normalized-query key", async () => {
      const query = "nutella " + stamp;
      // The module's key: sha-256 of the normalized query (see off-cache.ts).
      searchRowKey = createHash("sha256")
        .update(normalizeQuery(query))
        .digest("hex");
      await putCachedSearch(query, [foodForNutella]);
      const hit = await getCachedSearch(query);
      expect(hit?.length).toBe(1);
      expect(hit?.[0]?.name).toBe("Nutella");

      const row = await admin
        .from("off_search_cache")
        .select("query, query_hash")
        .eq("query_hash", searchRowKey)
        .maybeSingle();
      expect(row.data?.query).toBe(normalizeQuery(query));

      const expired = await admin
        .from("off_search_cache")
        .update({ cached_at: past(2000), expires_at: past(1000) })
        .eq("query_hash", searchRowKey)
        .select("expires_at");
      expect(expired.error, expired.error?.message).toBeNull();
      expect(expired.data?.length).toBe(1);
      expect(await getCachedSearch(query)).toBeNull();
    });

    it("users cannot read the rows the server cached", async () => {
      const products = await authA
        .from("off_products_cache")
        .select("*")
        .eq("barcode", "9000000001");
      expect(products.error).not.toBeNull();
    });
  },
);

describe.skipIf(!RUN)(
  "entry snapshots: direct authenticated writes are refused",
  () => {
    const fabricated = {
      ...nutella,
      user_id: idA,
      // Fabricated calculated nutrition — the whole point of the attack.
      calc_kcal: 1_000_000,
      calc_protein_g: 1_000_000,
      calc_carbs_g: 1_000_000,
      calc_fat_g: 1_000_000,
      calc_fiber_g: 1_000_000,
      calc_grams: 1_000_000,
      calc_complete: true,
    };
    const snapshotTampering = {
      source_kcal: 1,
      source_basis: "per_100ml",
      source_serving_quantity: 0,
      source_attribution: "rewritten",
      food_name_snapshot: "Rewritten",
      calc_kcal: 999,
      calc_complete: true,
      quantity_unit: "ml",
      quantity: 1,
    };

    it("INSERT into meal_entries is refused for a signed-in user", async () => {
      const forged = await authA.from("meal_entries").insert({
        ...fabricated,
        meal_id: "00000000-0000-0000-0000-000000000000",
      });
      expect(forged.error).not.toBeNull();
      expect(forged.data).toBeNull();
    });

    it("INSERT into saved_meal_entries is refused for a signed-in user", async () => {
      const forged = await authA.from("saved_meal_entries").insert({
        ...fabricated,
        saved_meal_id: "00000000-0000-0000-0000-000000000000",
      });
      expect(forged.error).not.toBeNull();
      expect(forged.data).toBeNull();
    });

    it("UPDATE of snapshot columns on meal_entries is refused", async () => {
      const { error } = await authA
        .from("meal_entries")
        .update(snapshotTampering as never)
        .eq("user_id", idA);
      expect(error).not.toBeNull();
    });

    it("UPDATE of snapshot columns on saved_meal_entries is refused", async () => {
      const { error } = await authA
        .from("saved_meal_entries")
        .update(snapshotTampering as never)
        .eq("user_id", idA);
      expect(error).not.toBeNull();
    });

    it("quantity alone cannot be written to meal_entries by an API caller", async () => {
      const { error } = await authA
        .from("meal_entries")
        .update({ quantity: 999 })
        .eq("user_id", idA);
      expect(error).not.toBeNull();
    });

    it("quantity alone cannot be written to saved_meal_entries by an API caller", async () => {
      const { error } = await authA
        .from("saved_meal_entries")
        .update({ quantity: 999 })
        .eq("user_id", idA);
      expect(error).not.toBeNull();
    });
  },
);

describe.skipIf(!RUN || !PRIVILEGED)(
  "entry snapshots: the trusted path stays consistent",
  () => {
    let mealId = "";
    let entryId = "";

    it("creates an entry with derived calc_* matching the engine", async () => {
      mealId = await makeMeal(authA, idA);
      const created = await admin
        .from("meal_entries")
        .insert({ ...nutella, meal_id: mealId, user_id: idA })
        .select("*")
        .single();
      expect(created.error, created.error?.message).toBeNull();
      entryId = created.data!.id;

      const expected = nutritionForQuantity(foodForNutella, 30, "g");
      expect(created.data!.calc_kcal).toBeCloseTo(expected!.kcal!, 3);
      expect(created.data!.calc_protein_g).toBeCloseTo(expected!.proteinG!, 3);
      expect(created.data!.calc_carbs_g).toBeCloseTo(expected!.carbsG!, 3);
      expect(created.data!.calc_fat_g).toBeCloseTo(expected!.fatG!, 3);
      expect(created.data!.calc_fiber_g).toBeCloseTo(expected!.fiberG!, 3);
      expect(created.data!.calc_grams).toBe(30);
      expect(created.data!.calc_complete).toBe(true);
    });

    it("hand-written calc values are overwritten by the derivation", async () => {
      const created = await admin
        .from("meal_entries")
        .insert({
          ...nutella,
          meal_id: mealId,
          user_id: idA,
          quantity: 50,
          calc_kcal: 12345,
          calc_complete: true,
        })
        .select("*")
        .single();
      expect(created.error, created.error?.message).toBeNull();
      expect(created.data!.calc_kcal).toBe(269.5); // 539 * 0.5
      expect(created.data!.calc_protein_g).toBe(3.15);
      expect(created.data!.calc_grams).toBe(50);
      // The fabricated 12345 is gone.
      const read = await authA
        .from("meal_entries")
        .select("calc_kcal, calc_complete")
        .eq("id", created.data!.id)
        .single();
      expect(read.data!.calc_kcal).toBe(269.5);
    });

    it("unknown nutrients stay NULL and calc_complete is exact", async () => {
      const created = await admin
        .from("meal_entries")
        .insert({
          ...nutella,
          meal_id: mealId,
          user_id: idA,
          source_fiber_g: null,
          calc_complete: true, // claimed complete; the trigger must correct it
        })
        .select("*")
        .single();
      expect(created.error, created.error?.message).toBeNull();
      expect(created.data!.calc_fiber_g).toBeNull();
      expect(created.data!.calc_complete).toBe(false);
    });

    it("a quantity edit recalculates every derived field", async () => {
      const updated = await admin
        .from("meal_entries")
        .update({ quantity: 60 })
        .eq("id", entryId)
        .eq("user_id", idA)
        .select("*")
        .single();
      expect(updated.error, updated.error?.message).toBeNull();
      const expected = nutritionForQuantity(foodForNutella, 60, "g");
      expect(updated.data!.calc_kcal).toBeCloseTo(expected!.kcal!, 3);
      expect(updated.data!.calc_protein_g).toBeCloseTo(expected!.proteinG!, 3);
      expect(updated.data!.calc_grams).toBe(60);
      expect(updated.data!.quantity_unit).toBe("g");

      // Meal totals follow the recalculated values.
      const rows = await authA
        .from("meal_entries")
        .select("*")
        .eq("meal_id", mealId)
        .eq("user_id", idA);
      const totals = sumEntries(
        rows.data!.map((row) => ({
          kcal: row.calc_kcal,
          proteinG: row.calc_protein_g,
          carbsG: row.calc_carbs_g,
          fatG: row.calc_fat_g,
          fiberG: row.calc_fiber_g,
        })),
      );
      expect(totals.entryCount).toBe(rows.data!.length);
      expect(totals.kcal.value).toBeGreaterThanOrEqual(269.5);
    });

    it("UPDATE cannot rewrite the source snapshot, unit, or owner", async () => {
      for (const payload of [
        { source_kcal: 1 },
        { source_basis: "per_100ml" },
        { source_serving_quantity: 10, source_serving_unit: "g" },
        { source_attribution: "rewritten" },
        { food_name_snapshot: "Rewritten" },
        { quantity_unit: "ml" },
        { user_id: idB },
      ]) {
        const { error } = await admin
          .from("meal_entries")
          .update(payload as never)
          .eq("id", entryId)
          .eq("user_id", idA);
        expect(error, JSON.stringify(payload)).not.toBeNull();
      }
    });

    it("negative nutrients and bad quantities are rejected", async () => {
      for (const payload of [
        { source_kcal: -1 },
        { source_protein_g: -5 },
        { source_serving_quantity: 0, source_serving_unit: "g" },
        { quantity: 0 },
        { quantity: -30 },
      ]) {
        const { error } = await admin
          .from("meal_entries")
          .insert({ ...nutella, ...payload, meal_id: mealId, user_id: idA })
          .select("id")
          .single();
        expect(error, JSON.stringify(payload)).not.toBeNull();
      }
    });

    it("invalid basis/unit combinations are rejected", async () => {
      for (const payload of [
        { source_basis: "per_100g", quantity_unit: "ml" },
        { source_basis: "per_100ml", quantity_unit: "g" },
        { source_basis: "per_serving", quantity_unit: "g" },
        { source_basis: "per_100g", quantity_unit: "serving" },
      ]) {
        const { error } = await admin
          .from("meal_entries")
          .insert({ ...nutella, ...payload, meal_id: mealId, user_id: idA })
          .select("id")
          .single();
        expect(error, JSON.stringify(payload)).not.toBeNull();
      }
    });

    it("saved-meal copies carry their own snapshot", async () => {
      const saved = await authA
        .from("saved_meals")
        .insert({ user_id: idA, name: "Hardened lunch", description: null })
        .select("id")
        .single();
      expect(saved.error, saved.error?.message).toBeNull();

      const copied = await admin
        .from("saved_meal_entries")
        .insert({
          saved_meal_id: saved.data!.id,
          user_id: idA,
          food_source: nutella.food_source,
          off_product_code: nutella.off_product_code,
          custom_food_id: null,
          food_name_snapshot: nutella.food_name_snapshot,
          brand_snapshot: nutella.brand_snapshot,
          source_kcal: nutella.source_kcal,
          source_protein_g: nutella.source_protein_g,
          source_carbs_g: nutella.source_carbs_g,
          source_fat_g: nutella.source_fat_g,
          source_fiber_g: nutella.source_fiber_g,
          source_basis: nutella.source_basis,
          source_serving_quantity: null,
          source_serving_unit: null,
          source_attribution: nutella.source_attribution,
          quantity: 40,
          quantity_unit: "g",
        })
        .select("*")
        .single();
      expect(copied.error, copied.error?.message).toBeNull();
      expect(copied.data!.calc_kcal).toBeCloseTo(539 * 0.4, 3);
      expect(copied.data!.calc_complete).toBe(true);
    });

    it("user B cannot read, forge or delete user A's rows", async () => {
      const aEntries = await authA
        .from("meal_entries")
        .select("id")
        .eq("user_id", idA);
      expect(aEntries.data!.length).toBeGreaterThan(0);

      const seenByB = await authB
        .from("meal_entries")
        .select("id")
        .eq("user_id", idA);
      expect(seenByB.data).toEqual([]);

      const forgedByB = await authB.from("meal_entries").insert({
        ...nutella,
        meal_id: mealId,
        user_id: idB,
      });
      expect(forgedByB.error).not.toBeNull();

      const deletedByB = await authB.rpc("delete_meal_entry", {
        p_entry_id: aEntries.data![0]!.id,
      });
      expect(deletedByB.data).toBe(0);
      const stillThere = await authA
        .from("meal_entries")
        .select("id")
        .eq("id", aEntries.data![0]!.id)
        .maybeSingle();
      expect(stillThere.data).not.toBeNull();

      // A deletes their own row through the scoped function.
      const deletedByA = await authA.rpc("delete_meal_entry", {
        p_entry_id: aEntries.data![0]!.id,
      });
      expect(deletedByA.data).toBe(1);
    });
  },
);
