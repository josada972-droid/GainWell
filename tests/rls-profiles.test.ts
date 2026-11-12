import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Row Level Security integration test: two real users against a real
 * Supabase project (local or hosted).
 *
 * Runs only when SUPABASE_TEST_URL and SUPABASE_TEST_PUBLISHABLE_KEY are set;
 * otherwise it is skipped with a clear label (no fake success). The project
 * must have email confirmation disabled (local Supabase default) so test
 * signups get a session immediately.
 *
 * Setup:
 *   npx supabase start            # or point at a hosted project
 *   npx supabase db reset         # applies supabase/migrations
 *   SUPABASE_TEST_URL=http://127.0.0.1:54321 \
 *   SUPABASE_TEST_PUBLISHABLE_KEY=<anon|publishable key> \
 *   npm test
 */

const TEST_URL = process.env.SUPABASE_TEST_URL;
const TEST_KEY = process.env.SUPABASE_TEST_PUBLISHABLE_KEY;
const TEST_SECRET = process.env.SUPABASE_TEST_SECRET_KEY; // optional, for cleanup
const RUN = Boolean(TEST_URL && TEST_KEY);

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const userAEmail = `rls-a-${stamp}@example.com`;
const userBEmail = `rls-b-${stamp}@example.com`;
const password = "correct-horse-battery";

let clientA: SupabaseClient;
let clientB: SupabaseClient;
let idA = "";
let idB = "";

async function signUp(client: SupabaseClient, email: string, name: string) {
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { display_name: name, preferred_language: "fr" } },
  });
  expect(error, error ? error.message : undefined).toBeNull();
  if (!data.session) {
    throw new Error(
      "Test project requires email confirmation to be disabled so signups " +
        "return a session (local Supabase default).",
    );
  }
  return data.user!.id;
}

describe.skipIf(!RUN)("profiles RLS (requires SUPABASE_TEST_*)", () => {
  beforeAll(async () => {
    clientA = createClient(TEST_URL!, TEST_KEY!);
    clientB = createClient(TEST_URL!, TEST_KEY!);
    idA = await signUp(clientA, userAEmail, "User A");
    idB = await signUp(clientB, userBEmail, "User B");
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

  it("creates a profile automatically at signup", async () => {
    const { data, error } = await clientA
      .from("profiles")
      .select("*")
      .eq("id", idA)
      .single();
    expect(error).toBeNull();
    expect(data).toMatchObject({
      id: idA,
      display_name: "User A",
      preferred_language: "fr",
    });
    expect(typeof data!.created_at).toBe("string");
  });

  it("lets a user read and update their own profile", async () => {
    const { error } = await clientA
      .from("profiles")
      .update({ display_name: "User A renamed" })
      .eq("id", idA);
    expect(error).toBeNull();
    const { data } = await clientA
      .from("profiles")
      .select("display_name, updated_at")
      .eq("id", idA)
      .single();
    expect(data?.display_name).toBe("User A renamed");
  });

  it("hides other users' profiles from a read", async () => {
    const { data, error } = await clientA
      .from("profiles")
      .select("*")
      .eq("id", idB);
    expect(error).toBeNull();
    expect(data).toEqual([]); // RLS filters the row out silently
  });

  it("blocks updates to another user's profile", async () => {
    const { data, error } = await clientA
      .from("profiles")
      .update({ display_name: "hijacked" })
      .eq("id", idB)
      .select();
    expect(error).toBeNull();
    expect(data).toEqual([]); // RLS matches no rows for the caller
    const { data: victim } = await clientB
      .from("profiles")
      .select("display_name")
      .eq("id", idB)
      .single();
    expect(victim?.display_name).toBe("User B");
  });

  it("denies writes to server-managed columns (id, timestamps)", async () => {
    for (const column of ["id", "created_at", "updated_at"] as const) {
      const value =
        column === "id" ? crypto.randomUUID() : "2000-01-01T00:00:00Z";
      const { error } = await clientA
        .from("profiles")
        .update({ [column]: value })
        .eq("id", idA);
      expect(error, `column ${column} should not be writable`).not.toBeNull();
    }
  });

  it("denies inserting and deleting profile rows through the API", async () => {
    // No INSERT policy: PostgREST rejects the write outright.
    const insert = await clientA.from("profiles").insert({ id: idA });
    expect(insert.error).not.toBeNull();

    // No DELETE policy: RLS matches 0 rows, so the statement "succeeds"
    // while removing nothing — the row must still be there afterwards.
    const remove = await clientA.from("profiles").delete().eq("id", idA);
    expect(remove.error).toBeNull();
    const { data } = await clientA
      .from("profiles")
      .select("id")
      .eq("id", idA)
      .single();
    expect(data?.id).toBe(idA);
  });
});

if (!RUN) {
  describe("profiles RLS (skipped)", () => {
    it("is skipped without SUPABASE_TEST_URL / SUPABASE_TEST_PUBLISHABLE_KEY", () => {
      expect(true).toBe(true);
    });
  });
}
