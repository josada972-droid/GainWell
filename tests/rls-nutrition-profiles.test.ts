import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Row Level Security integration test for the Stage 3 nutrition table: two real
 * users against a real Supabase project (local or hosted).
 *
 * Runs only when SUPABASE_TEST_URL and SUPABASE_TEST_PUBLISHABLE_KEY are set;
 * otherwise it is skipped with a clear label (no fake success). Setup is the
 * same as tests/rls-profiles.test.ts: `npx supabase start`, `npx supabase db
 * reset`, then the two env vars in front of `npm test`.
 */

const TEST_URL = process.env.SUPABASE_TEST_URL;
const TEST_KEY = process.env.SUPABASE_TEST_PUBLISHABLE_KEY;
const TEST_SECRET = process.env.SUPABASE_TEST_SECRET_KEY; // optional, for cleanup
const RUN = Boolean(TEST_URL && TEST_KEY);

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const userAEmail = `nutrition-a-${stamp}@example.com`;
const userBEmail = `nutrition-b-${stamp}@example.com`;
const password = "correct-horse-battery";

let clientA: SupabaseClient;
let clientB: SupabaseClient;
let idA = "";
let idB = "";

async function signUp(client: SupabaseClient, email: string) {
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

const answers = {
  age_years: 30,
  sex: "female",
  height_cm: 165,
  weight_kg: 60,
  activity_level: "sedentary",
  eating_habits: "regular",
  goal: "gain_gradually",
  professional_kcal: 2000,
  onboarding_step: 4,
};

describe.skipIf(!RUN)(
  "nutrition_profiles RLS (requires SUPABASE_TEST_*)",
  () => {
    beforeAll(async () => {
      clientA = createClient(TEST_URL!, TEST_KEY!);
      clientB = createClient(TEST_URL!, TEST_KEY!);
      idA = await signUp(clientA, userAEmail);
      idB = await signUp(clientB, userBEmail);
    });

    afterAll(async () => {
      if (TEST_SECRET) {
        const admin = createClient(TEST_URL!, TEST_SECRET, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        for (const id of [idA, idB]) {
          if (id) await admin.auth.admin.deleteUser(id);
        }
      }
    });

    it("creates the user's own nutrition row", async () => {
      const { error } = await clientA
        .from("nutrition_profiles")
        .insert({ user_id: idA, ...answers });
      expect(error, error ? error.message : undefined).toBeNull();

      const { data } = await clientA
        .from("nutrition_profiles")
        .select("*")
        .eq("user_id", idA)
        .single();
      expect(data).toMatchObject({
        user_id: idA,
        age_years: 30,
        professional_kcal: 2000,
        onboarding_status: "in_progress",
        onboarding_step: 4,
      });
    });

    it("rejects an insert carrying another user's id", async () => {
      // The client cannot write for someone else: RLS's WITH CHECK refuses it.
      const { error } = await clientA
        .from("nutrition_profiles")
        .insert({ user_id: idB, ...answers });
      expect(error).not.toBeNull();

      const { data } = await clientB.from("nutrition_profiles").select("*");
      expect(data).toEqual([]);
    });

    it("lets a user read and update their own row", async () => {
      const { error } = await clientA
        .from("nutrition_profiles")
        .update({ weight_kg: 62.5, onboarding_step: 5 })
        .eq("user_id", idA);
      expect(error).toBeNull();

      const { data } = await clientA
        .from("nutrition_profiles")
        .select("weight_kg, onboarding_step, updated_at")
        .eq("user_id", idA)
        .single();
      expect(Number(data?.weight_kg)).toBeCloseTo(62.5, 1);
      expect(data?.onboarding_step).toBe(5);
    });

    it("refuses an upsert that would rewrite the owner column", async () => {
      // PostgREST's ON CONFLICT DO UPDATE rewrites every payload column, including
      // `user_id`, which no client is granted — so the app inserts, then updates.
      const { error } = await clientA
        .from("nutrition_profiles")
        .upsert({ user_id: idA, age_years: 31 }, { onConflict: "user_id" });
      expect(error).not.toBeNull();
    });

    it("keeps a professional target through later edits", async () => {
      const { error } = await clientA
        .from("nutrition_profiles")
        .update({ goal: "healthier_habits", target_weight_kg: 68 })
        .eq("user_id", idA);
      expect(error).toBeNull();

      const { data } = await clientA
        .from("nutrition_profiles")
        .select("goal, professional_kcal")
        .eq("user_id", idA)
        .single();
      expect(data?.goal).toBe("healthier_habits");
      expect(data?.professional_kcal).toBe(2000); // never overwritten
    });

    it("clears optional dietary notes on request", async () => {
      await clientA
        .from("nutrition_profiles")
        .update({ dietary_notes: "no dairy" })
        .eq("user_id", idA);
      const { data } = await clientA
        .from("nutrition_profiles")
        .update({ dietary_notes: null })
        .eq("user_id", idA)
        .select("dietary_notes")
        .single();
      expect(data?.dietary_notes).toBeNull();
    });

    it("hides another user's row from a read", async () => {
      const { data, error } = await clientA
        .from("nutrition_profiles")
        .select("*")
        .eq("user_id", idB);
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it("blocks updates to another user's row", async () => {
      await clientB
        .from("nutrition_profiles")
        .insert({ user_id: idB, age_years: 30, weight_kg: 80 });

      const { data, error } = await clientA
        .from("nutrition_profiles")
        .update({ weight_kg: 120 })
        .eq("user_id", idB)
        .select();
      expect(error).toBeNull();
      expect(data).toEqual([]); // RLS matches no rows for the caller

      const { data: victim } = await clientB
        .from("nutrition_profiles")
        .select("weight_kg")
        .eq("user_id", idB)
        .single();
      expect(Number(victim?.weight_kg)).toBeCloseTo(80, 1);
    });

    it("denies writes to server-managed columns", async () => {
      for (const column of ["user_id", "created_at", "updated_at"] as const) {
        const value =
          column === "user_id" ? crypto.randomUUID() : "2000-01-01T00:00:00Z";
        const { error } = await clientA
          .from("nutrition_profiles")
          .update({ [column]: value })
          .eq("user_id", idA);
        expect(error, `column ${column} should not be writable`).not.toBeNull();
      }
    });

    it("rejects values that break the table constraints", async () => {
      const bad: Array<[string, unknown]> = [
        ["age_years", 200],
        ["height_cm", 300],
        ["weight_kg", 5],
        ["meals_per_day", 40],
        ["dietary_preference", "carnivore"],
        ["goal", "lose_weight_fast"],
        ["professional_kcal", 9000],
        ["onboarding_step", 6],
        ["onboarding_status", "done"],
        ["dietary_notes", "x".repeat(400)],
      ];
      for (const [column, value] of bad) {
        const { error } = await clientA
          .from("nutrition_profiles")
          .update({ [column]: value })
          .eq("user_id", idA);
        expect(error, `${column}=${value} should be rejected`).not.toBeNull();
      }
    });

    it("removes nothing through a delete (no DELETE policy)", async () => {
      const remove = await clientA
        .from("nutrition_profiles")
        .delete()
        .eq("user_id", idA);
      expect(remove.error).toBeNull(); // RLS matches 0 rows, so nothing is deleted
      const { data } = await clientA
        .from("nutrition_profiles")
        .select("user_id")
        .eq("user_id", idA)
        .single();
      expect(data?.user_id).toBe(idA);
    });
  },
);

if (!RUN) {
  describe("nutrition_profiles RLS (skipped)", () => {
    it("is skipped without SUPABASE_TEST_URL / SUPABASE_TEST_PUBLISHABLE_KEY", () => {
      expect(true).toBe(true);
    });
  });
}
