"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { localeSchema } from "@/lib/auth/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import {
  createWeightEntry,
  deleteWeightEntry,
  updateWeightEntry,
} from "@/lib/progress/store";
import {
  weightDateSchema,
  weightEntryIdSchema,
  weightKgSchema,
  weightNoteSchema,
} from "@/lib/progress/schema";

/**
 * Weight-progress Server Actions (Stage 5). Identity always comes from the
 * server-verified session, never a form field; ownership is enforced again by
 * RLS. Errors are message keys in the `progress` namespace — never database
 * text. A future date gets its own key so the message can be specific.
 */

export type ProgressState = { errorKey?: string; ok?: boolean };

/** Form-field parse: returns the key on failure instead of throwing. */
function readField<T>(
  schema: z.ZodType<T>,
  value: FormDataEntryValue | null,
): { value: T } | { errorKey: string } {
  const parsed = schema.safeParse(value);
  return parsed.success ? { value: parsed.data } : { errorKey: "invalidInput" };
}

/** The locale with a safe fallback, matching the other actions' behavior. */
function readLocale(formData: FormData): string {
  return localeSchema.parse(formData.get("locale"));
}

function revalidateProgress(locale: string): void {
  revalidatePath(`/${locale}/progress`);
  revalidatePath(`/${locale}/dashboard`);
}

/** Today's ISO date, for the "no measurements from the future" rule. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Reads one entry form (date, weight, note) and fails with the specific key —
 * futureDate before the generic date error, so the message can name the
 * actual problem.
 */
function readEntry(
  formData: FormData,
):
  | { date: string; weightKg: number; note: string | null }
  | { errorKey: string } {
  const date = readField(weightDateSchema, formData.get("date"));
  if ("errorKey" in date) return { errorKey: "date" };
  if (date.value > todayIso()) return { errorKey: "futureDate" };
  const weightKg = readField(weightKgSchema, formData.get("weight"));
  if ("errorKey" in weightKg) return { errorKey: "weight" };
  const note = readField(weightNoteSchema, formData.get("note"));
  if ("errorKey" in note) return { errorKey: "note" };
  return {
    date: date.value,
    weightKg: weightKg.value,
    note: note.value || null,
  };
}

export async function createEntryAction(
  _prev: ProgressState,
  formData: FormData,
): Promise<ProgressState> {
  const locale = readLocale(formData);
  const user = await getCurrentUser();
  if (!user) return { errorKey: "sessionExpired" };

  const entry = readEntry(formData);
  if ("errorKey" in entry) return { errorKey: entry.errorKey };

  const result = await createWeightEntry(
    user.id,
    entry.date,
    entry.weightKg,
    entry.note,
  );
  if (!result.ok) return { errorKey: result.errorKey };
  revalidateProgress(locale);
  return { ok: true };
}

export async function updateEntryAction(
  _prev: ProgressState,
  formData: FormData,
): Promise<ProgressState> {
  const locale = readLocale(formData);
  const user = await getCurrentUser();
  if (!user) return { errorKey: "sessionExpired" };

  const entryId = readField(weightEntryIdSchema, formData.get("entryId"));
  if ("errorKey" in entryId) return { errorKey: "entryNotFound" };
  const entry = readEntry(formData);
  if ("errorKey" in entry) return { errorKey: entry.errorKey };

  const result = await updateWeightEntry(
    user.id,
    entryId.value,
    entry.date,
    entry.weightKg,
    entry.note,
  );
  if (!result.ok) return { errorKey: result.errorKey };
  revalidateProgress(locale);
  return { ok: true };
}

export async function deleteEntryAction(
  _prev: ProgressState,
  formData: FormData,
): Promise<ProgressState> {
  const locale = readLocale(formData);
  const user = await getCurrentUser();
  if (!user) return { errorKey: "sessionExpired" };

  const entryId = readField(weightEntryIdSchema, formData.get("entryId"));
  if ("errorKey" in entryId) return { errorKey: "entryNotFound" };

  const result = await deleteWeightEntry(user.id, entryId.value);
  if (!result.ok) return { errorKey: result.errorKey };
  revalidateProgress(locale);
  return { ok: true };
}
