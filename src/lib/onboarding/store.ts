import "server-only";

import {
  STEP_COUNT,
  stepColumns,
  type StepPatch,
} from "@/lib/onboarding/schema";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, NutritionProfile } from "@/lib/supabase/types";

type NutritionInsert =
  Database["public"]["Tables"]["nutrition_profiles"]["Insert"];

/**
 * Parsed form answers (`ageYears`) → table columns (`age_years`). Anything not
 * in the map is dropped, so a stray form field never reaches the table.
 */
function columnPatch(step: number, patch: StepPatch): Partial<NutritionInsert> {
  const out: Record<string, unknown> = {};
  for (const [name, column] of Object.entries(stepColumns[step] ?? {})) {
    if (name in patch) out[column] = patch[name];
  }
  return out as Partial<NutritionInsert>;
}

/**
 * Storage for the onboarding answers. Access is always scoped to the
 * server-verified user id from `auth.getUser()`; RLS in Postgres enforces
 * ownership independently, so a caller cannot reach another user's row even if
 * this code were wrong.
 */
export async function getNutritionProfile(
  userId: string,
): Promise<NutritionProfile | null> {
  const client = await getSupabaseServerClient();
  if (!client) return null;
  const { data } = await client
    .from("nutrition_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data ?? null;
}

/**
 * Saves one step's answers. The row is created on first save, inserted under the
 * caller's own id, so onboarding can start at any step and resume later. The
 * stored `onboarding_step` is the step to continue at, and never moves
 * backwards: editing an earlier answer keeps the visitor's place.
 */
export async function saveNutritionStep(
  userId: string,
  patch: StepPatch,
  step: number,
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };

  const values = columnPatch(step, patch);
  const current = await getNutritionProfile(userId);
  // The stored step is the step to continue at, so a saved step 1 means step 2
  // is next; editing an earlier answer never moves the resume point backwards.
  const nextStep = Math.min(
    Math.max(step + 1, current?.onboarding_step ?? 1),
    STEP_COUNT,
  );

  if (!current) {
    const created = await client
      .from("nutrition_profiles")
      .insert({ ...values, user_id: userId, onboarding_step: nextStep });
    // No upsert: PostgREST's ON CONFLICT DO UPDATE also rewrites `user_id`, a
    // column no client is granted. Insert-then-update keeps ownership server-side.
    if (!created.error) return { ok: true };
    // A second save raced us, or a value slipped past validation: fall through
    // to the update path, which reports the constraint failure below.
  }

  const { error } = await client
    .from("nutrition_profiles")
    .update({ ...values, onboarding_step: nextStep })
    .eq("user_id", userId);

  // A constraint violation means a value slipped past form validation; the
  // caller gets a generic key, never the database message.
  if (error) return { ok: false, errorKey: "invalidInput" };
  return { ok: true };
}

/** Marks onboarding finished. Requires the fields the estimates depend on. */
export async function completeOnboarding(
  userId: string,
): Promise<{ ok: true } | { ok: false; errorKey: string }> {
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };

  const current = await getNutritionProfile(userId);
  if (
    !current ||
    current.age_years === null ||
    current.height_cm === null ||
    current.weight_kg === null ||
    current.activity_level === null ||
    current.eating_habits === null ||
    current.goal === null
  ) {
    return { ok: false, errorKey: "onboardingIncomplete" };
  }

  const { error } = await client
    .from("nutrition_profiles")
    .update({ onboarding_status: "completed", onboarding_step: 5 })
    .eq("user_id", userId);
  if (error) return { ok: false, errorKey: "invalidInput" };
  return { ok: true };
}
