import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/lib/supabase/types";

/**
 * Adversarial RLS tests for the Stage 5 tables (supabase/migrations/0005).
 * These attack the database boundary directly with REAL authenticated
 * sessions and ordinary REST calls — not UI assertions — against the actual
 * local Supabase.
 *
 * Gated: needs SUPABASE_TEST_URL + SUPABASE_TEST_PUBLISHABLE_KEY (+ the
 * secret key only for cleanup); without them the suite is skipped, not
 * "passed".
 */

const TEST_URL = process.env.SUPABASE_TEST_URL;
const TEST_KEY = process.env.SUPABASE_TEST_PUBLISHABLE_KEY;
const TEST_SECRET = process.env.SUPABASE_TEST_SECRET_KEY;
const RUN = Boolean(TEST_URL && TEST_KEY);

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const password = "correct-horse-battery";
const today = new Date().toISOString().slice(0, 10);

let authA: SupabaseClient<Database>;
let authB: SupabaseClient<Database>;
let anon: SupabaseClient<Database>;
let admin: SupabaseClient<Database> | null = null;
let idA = "";
let idB = "";

async function signUp(client: SupabaseClient<Database>, email: string) {
  const { data, error } = await client.auth.signUp({ email, password });
  expect(error, error ? error.message : undefined).toBeNull();
  if (!data.session) throw new Error("signup must return a session");
  return data.user!.id;
}

beforeAll(async () => {
  if (!RUN) return;
  authA = createClient<Database>(TEST_URL!, TEST_KEY!);
  authB = createClient<Database>(TEST_URL!, TEST_KEY!);
  anon = createClient<Database>(TEST_URL!, TEST_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  idA = await signUp(authA, `prog-a-${stamp}@example.com`);
  idB = await signUp(authB, `prog-b-${stamp}@example.com`);
  if (TEST_SECRET) {
    admin = createClient<Database>(TEST_URL!, TEST_SECRET, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
});

afterAll(async () => {
  if (!admin) return;
  for (const id of [idA, idB]) {
    if (id) await admin.auth.admin.deleteUser(id);
  }
});

describe.skipIf(!RUN)("recipe_favorites RLS (direct REST)", () => {
  it("lets a user add and read their own favourite", async () => {
    const { error } = await authA
      .from("recipe_favorites")
      .insert({ user_id: idA, recipe_slug: "banana-oat-smoothie" });
    expect(error?.message ?? undefined).toBeUndefined();

    const { data, error: readError } = await authA
      .from("recipe_favorites")
      .select("*")
      .eq("user_id", idA);
    expect(readError?.message ?? undefined).toBeUndefined();
    expect(data).toHaveLength(1);
    expect(data![0]!.recipe_slug).toBe("banana-oat-smoothie");
  });

  it("refuses a duplicate (user, slug) pair", async () => {
    const { error } = await authA
      .from("recipe_favorites")
      .insert({ user_id: idA, recipe_slug: "banana-oat-smoothie" });
    expect(error?.code).toBe("23505");
  });

  it("refuses an insert whose user_id forges another user", async () => {
    const { error } = await authA
      .from("recipe_favorites")
      .insert({ user_id: idB, recipe_slug: "tuna-rice-bowl" });
    // RLS WITH CHECK rejects the row; a caller cannot create favourite rows
    // pointing at someone else's user_id.
    expect(error).not.toBeNull();
    const { data } = await authB
      .from("recipe_favorites")
      .select("*")
      .eq("user_id", idB);
    expect(data).toHaveLength(0);
  });

  it("hides user A's favourites from user B (and vice versa)", async () => {
    const { data: seenByB } = await authB
      .from("recipe_favorites")
      .select("*")
      .eq("user_id", idA);
    expect(seenByB).toHaveLength(0);

    // User B's own list is empty: A's row does not leak into it either.
    const { data: ownList } = await authB.from("recipe_favorites").select("*");
    expect(ownList).toHaveLength(0);
  });

  it("lets a user delete only their own favourite", async () => {
    // B tries to delete A's row by id — zero rows match under RLS.
    const { data: aRow } = await authA
      .from("recipe_favorites")
      .select("id")
      .eq("user_id", idA)
      .single();
    const { error } = await authB
      .from("recipe_favorites")
      .delete()
      .eq("id", aRow!.id);
    expect(error?.message ?? undefined).toBeUndefined(); // delete by id is allowed but matches nothing
    const { data: stillThere } = await authA
      .from("recipe_favorites")
      .select("id")
      .eq("user_id", idA);
    expect(stillThere).toHaveLength(1);
  });

  it("gives anonymous callers nothing: select is empty and insert is refused", async () => {
    const { data } = await anon.from("recipe_favorites").select("*");
    // 0005 revokes SELECT from anon outright: either the call errors or it
    // returns nothing — but never rows.
    expect(data === null || (Array.isArray(data) && data.length === 0)).toBe(
      true,
    );

    const { error: insertError } = await anon
      .from("recipe_favorites")
      .insert({ user_id: idA, recipe_slug: "banana-oat-smoothie" });
    expect(insertError).not.toBeNull();
  });

  it("rejects a slug shape the app never writes", async () => {
    const { error } = await authA
      .from("recipe_favorites")
      .insert({ user_id: idA, recipe_slug: "Not A Slug!" });
    expect(error?.code).toBe("23514");
  });

  it("allows only real recipe slugs through the unique constraint check", async () => {
    // The DB checks the shape, not the catalogue; the app allowlists. A
    // well-shaped fake slug still inserts — so the app-level allowlist is
    // what keeps junk out; this test documents the boundary.
    const { error } = await authA
      .from("recipe_favorites")
      .insert({ user_id: idA, recipe_slug: "fake-recipe-slug" });
    expect(error?.message ?? undefined).toBeUndefined();
    await authA
      .from("recipe_favorites")
      .delete()
      .eq("recipe_slug", "fake-recipe-slug");
  });
});

describe.skipIf(!RUN)("weight_entries RLS (direct REST)", () => {
  it("accepts a valid entry and returns it to its owner", async () => {
    const { error } = await authA
      .from("weight_entries")
      .insert({ user_id: idA, measured_on: today, weight_kg: 62.5 });
    expect(error?.message ?? undefined).toBeUndefined();

    const { data } = await authA
      .from("weight_entries")
      .select("*")
      .eq("user_id", idA);
    expect(data).toHaveLength(1);
    expect(data![0]!.weight_kg).toBe(62.5);
  });

  it("refuses a second entry for the same day", async () => {
    const { error } = await authA
      .from("weight_entries")
      .insert({ user_id: idA, measured_on: today, weight_kg: 63 });
    expect(error?.code).toBe("23505");
  });

  it("refuses CHECK violations a crafted API call could try", async () => {
    for (const weight of [24.9, 300.1, 0, -5]) {
      const { error } = await authA.from("weight_entries").insert({
        user_id: idA,
        measured_on: "2020-01-05",
        weight_kg: weight,
      });
      expect(error?.code).toBe("23514");
    }
    // Future date
    const { error } = await authA.from("weight_entries").insert({
      user_id: idA,
      measured_on: "2999-01-01",
      weight_kg: 70,
    });
    expect(error?.code).toBe("23514");
    // Over-length note
    const { error: noteError } = await authA.from("weight_entries").insert({
      user_id: idA,
      measured_on: "2020-01-05",
      weight_kg: 70,
      note: "x".repeat(301),
    });
    expect(noteError?.code).toBe("23514");
  });

  it("refuses a forged user_id on insert", async () => {
    const { error } = await authA
      .from("weight_entries")
      .insert({ user_id: idB, measured_on: "2020-01-06", weight_kg: 70 });
    expect(error).not.toBeNull();
    const { data } = await authB
      .from("weight_entries")
      .select("*")
      .eq("user_id", idB);
    expect(data).toHaveLength(0);
  });

  it("hides user A's history from user B", async () => {
    const { data } = await authB.from("weight_entries").select("*");
    expect(data).toHaveLength(0);
  });

  it("lets the owner update their own entry but not rewrite ownership", async () => {
    const { data: row } = await authA
      .from("weight_entries")
      .select("id")
      .eq("user_id", idA)
      .single();

    const { error } = await authA
      .from("weight_entries")
      .update({ weight_kg: 63.5, note: "morning" })
      .eq("id", row!.id);
    expect(error?.message ?? undefined).toBeUndefined();

    const { data: after } = await authA
      .from("weight_entries")
      .select("*")
      .eq("id", row!.id)
      .single();
    expect(after!.weight_kg).toBe(63.5);
    expect(after!.note).toBe("morning");

    // The column grant excludes user_id: a client-side attempt to rewrite
    // ownership fails with a permission error, not a silent transfer.
    const { error: ownershipError } = await authA
      .from("weight_entries")
      .update({ user_id: idB })
      .eq("id", row!.id);
    expect(ownershipError).not.toBeNull();
    expect(ownershipError?.code).toBe("42501");
  });

  it("blocks user B from updating or deleting user A's entry", async () => {
    const { data: row } = await authA
      .from("weight_entries")
      .select("id")
      .eq("user_id", idA)
      .single();

    const { data: updated, error } = await authB
      .from("weight_entries")
      .update({ weight_kg: 999 })
      .eq("id", row!.id)
      .select();
    expect(error?.message ?? undefined).toBeUndefined();
    expect(updated).toHaveLength(0); // RLS matched nothing

    const { error: deleteError } = await authB
      .from("weight_entries")
      .delete()
      .eq("id", row!.id);
    expect(deleteError?.message ?? undefined).toBeUndefined();
    const { data: stillThere } = await authA
      .from("weight_entries")
      .select("id")
      .eq("user_id", idA);
    expect(stillThere).toHaveLength(1);
  });

  it("gives anonymous callers nothing", async () => {
    const { data } = await anon.from("weight_entries").select("*");
    expect(data ?? []).toHaveLength(0);
    const { error } = await anon
      .from("weight_entries")
      .insert({ user_id: idA, measured_on: "2020-01-07", weight_kg: 70 });
    expect(error).not.toBeNull();
  });

  it("lets the owner delete their own entry", async () => {
    const { data: row } = await authA
      .from("weight_entries")
      .select("id")
      .eq("user_id", idA)
      .single();
    const { error } = await authA
      .from("weight_entries")
      .delete()
      .eq("id", row!.id);
    expect(error?.message ?? undefined).toBeUndefined();
    const { data } = await authA
      .from("weight_entries")
      .select("*")
      .eq("user_id", idA);
    expect(data).toHaveLength(0);
  });
});
