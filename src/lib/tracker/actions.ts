"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { localeSchema } from "@/lib/auth/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { type Food } from "@/lib/nutrition/food";
import {
  fetchOffProduct,
  fetchOffSearch,
  normalizeBarcode,
  normalizeQuery,
} from "@/lib/food/openfoodfacts";
import { takeOffRateLimit } from "@/lib/food/off-rate-limit";
import {
  getCachedProduct,
  getCachedSearch,
  putCachedProduct,
  putCachedSearch,
} from "@/lib/food/off-cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  addMealEntry,
  applySavedMeal,
  createCustomFood,
  createSavedMeal,
  deleteMealEntry,
  deleteSavedMeal,
  foodFromCustomFood,
  getOrCreateMeal,
  updateCustomFood,
  updateMealEntryQuantity,
  updateSavedMeal,
} from "@/lib/tracker/store";
import {
  barcodeSchema,
  customFoodSchema,
  entryIdSchema,
  mealDateSchema,
  mealTypeSchema,
  quantitySchema,
  quantityUnitSchema,
  savedMealIdSchema,
  savedMealSchema,
  searchQuerySchema,
} from "@/lib/tracker/schema";

/**
 * Tracker Server Actions (Stage 4). Identity always comes from the
 * server-verified session, never from a form field; ownership is enforced
 * again by RLS. Errors are message keys in the `tracker` namespace — never
 * database text (AGENTS.md §14). The tracker lives at /{locale}/tracker;
 * after a mutation the validated locale drives revalidation.
 */

export type TrackerState = { errorKey?: string; ok?: boolean };

/** Form-field parse: returns the key on failure instead of throwing. */
function readField<T>(
  schema: z.ZodType<T>,
  value: FormDataEntryValue | null,
): { value: T } | { errorKey: string } {
  const parsed = schema.safeParse(value);
  return parsed.success ? { value: parsed.data } : { errorKey: "invalidInput" };
}

/** The locale with a safe fallback, matching the auth actions' behavior. */
function readLocale(formData: FormData): string {
  return localeSchema.parse(formData.get("locale"));
}

function revalidateTracker(locale: string): void {
  revalidatePath(`/${locale}/tracker`);
  revalidatePath(`/${locale}/dashboard`);
}

/**
 * A food chosen from search travels to the add action as a hidden JSON
 * field. It is re-validated here: the shape must be a well-formed Food, and
 * the trust boundary is the user's own meal (a forged payload could only
 * pollute the forger's own diary — RLS keeps every row owner-scoped).
 * Custom foods never travel: their id is read back server-side under
 * ownership.
 */
const hiddenFoodSchema: z.ZodType<Food> = z.object({
  name: z.string().min(1).max(120),
  brand: z.string().max(80).nullable(),
  basis: z.enum(["per_100g", "per_100ml", "per_serving"]),
  values: z.object({
    kcal: z.number().min(0).max(100000).nullable(),
    proteinG: z.number().min(0).max(100000).nullable(),
    carbsG: z.number().min(0).max(100000).nullable(),
    fatG: z.number().min(0).max(100000).nullable(),
    fiberG: z.number().min(0).max(100000).nullable(),
  }),
  servingQuantity: z.number().min(0).max(100000).nullable(),
  servingUnit: z.enum(["g", "ml", "serving"]).nullable(),
  estimated: z.boolean(),
  source: z.object({
    kind: z.enum(["open_food_facts", "custom"]),
    code: z.string().max(40).nullable(),
    attribution: z.string().max(400).nullable(),
  }),
});

const hiddenFoodFieldSchema = z
  .string()
  .transform((value, ctx) => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "entryNotFound" });
      return z.NEVER;
    }
  })
  .pipe(hiddenFoodSchema);

// ---------------------------------------------------------------------------
// Food search (called directly from the client component, not a form action)
// ---------------------------------------------------------------------------

export type FoodSearchResult =
  { ok: true; foods: Food[] } | { ok: false; errorKey: string };

/** Open Food Facts text search: cache-first, then rate-limited live fetch. */
export async function searchOffFoodsAction(
  rawQuery: string,
): Promise<FoodSearchResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, errorKey: "sessionExpired" };
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };

  const parsed = searchQuerySchema.safeParse(rawQuery);
  if (!parsed.success) return { ok: false, errorKey: "searchTooShort" };
  const query = normalizeQuery(parsed.data);

  const cached = await getCachedSearch(query);
  if (cached) return { ok: true, foods: cached };

  // Fail closed: no shared budget token (or no privileged client), no
  // outbound request.
  if (!(await takeOffRateLimit("search"))) {
    return { ok: false, errorKey: "rateLimited" };
  }
  const result = await fetchOffSearch(query);
  if (!result.ok) {
    return {
      ok: false,
      errorKey: result.reason === "empty" ? "noResults" : "searchFailed",
    };
  }
  await putCachedSearch(query, result.value);
  return { ok: true, foods: result.value };
}

/** The user's own custom foods, filtered case-insensitively in memory. */
export async function searchCustomFoodsAction(
  rawQuery: string,
): Promise<FoodSearchResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, errorKey: "sessionExpired" };
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };

  const parsed = searchQuerySchema.safeParse(rawQuery);
  if (!parsed.success) return { ok: false, errorKey: "searchTooShort" };
  const needle = normalizeQuery(parsed.data);

  const { data } = await client
    .from("custom_foods")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  const foods = (data ?? [])
    .filter((row) => row.name.toLowerCase().includes(needle))
    .map(foodFromCustomFood);
  return { ok: true, foods };
}

/** Barcode lookup: same cache + rate-limit safeguards as text search. */
export async function lookupBarcodeAction(
  rawBarcode: string,
): Promise<FoodSearchResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, errorKey: "sessionExpired" };
  const client = await getSupabaseServerClient();
  if (!client) return { ok: false, errorKey: "config" };

  const parsed = barcodeSchema.safeParse(rawBarcode.trim());
  if (!parsed.success) return { ok: false, errorKey: "invalidBarcode" };
  const barcode = normalizeBarcode(parsed.data);
  if (!barcode) return { ok: false, errorKey: "invalidBarcode" };

  const cached = await getCachedProduct(barcode);
  if (cached) return { ok: true, foods: [cached] };

  if (!(await takeOffRateLimit("product"))) {
    return { ok: false, errorKey: "rateLimited" };
  }
  const result = await fetchOffProduct(barcode);
  if (!result.ok) {
    return {
      ok: false,
      errorKey: result.reason === "empty" ? "noResults" : "searchFailed",
    };
  }
  await putCachedProduct(result.value);
  return { ok: true, foods: [result.value] };
}

// ---------------------------------------------------------------------------
// Meal entry mutations (useActionState form actions)
// ---------------------------------------------------------------------------

/** Adds a food to a meal (creating the meal container on first use). */
export async function addEntryAction(
  _prev: TrackerState,
  formData: FormData,
): Promise<TrackerState> {
  const locale = readLocale(formData);
  const user = await getCurrentUser();
  if (!user) return { errorKey: "sessionExpired" };

  const mealDate = readField(mealDateSchema, formData.get("mealDate"));
  if ("errorKey" in mealDate) return mealDate;
  const mealType = readField(mealTypeSchema, formData.get("mealType"));
  if ("errorKey" in mealType) return { errorKey: "mealType" };
  const quantity = readField(quantitySchema, formData.get("quantity"));
  if ("errorKey" in quantity) return { errorKey: "quantity" };
  const unit = readField(quantityUnitSchema, formData.get("unit"));
  if ("errorKey" in unit) return { errorKey: "quantityUnit" };
  const source = readField(z.enum(["off", "custom"]), formData.get("source"));
  if ("errorKey" in source) return { errorKey: "entryNotFound" };

  let food: Food;
  let customFoodId: string | null = null;
  if (source.value === "off") {
    const parsedFood = hiddenFoodFieldSchema.safeParse(formData.get("food"));
    if (!parsedFood.success) return { errorKey: "entryNotFound" };
    food = parsedFood.data;
  } else {
    // Custom foods are re-read server-side under the caller's ownership.
    const parsedId = readField(
      customFoodSchema.shape.customFoodId,
      formData.get("customFoodId"),
    );
    if ("errorKey" in parsedId || !parsedId.value) {
      return { errorKey: "entryNotFound" };
    }
    const client = await getSupabaseServerClient();
    if (!client) return { errorKey: "config" };
    const { data } = await client
      .from("custom_foods")
      .select("*")
      .eq("id", parsedId.value)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) return { errorKey: "notFound" };
    food = foodFromCustomFood(data);
    customFoodId = data.id;
  }

  const meal = await getOrCreateMeal(user.id, mealDate.value, mealType.value);
  if (!meal) return { errorKey: "config" };

  const result = await addMealEntry(
    user.id,
    meal.id,
    food,
    quantity.value,
    unit.value,
    customFoodId,
  );
  if (!result.ok) return { errorKey: result.errorKey };
  revalidateTracker(locale);
  return { ok: true };
}

/** Quantity edit: recalculates from the entry's stored source values only. */
export async function updateEntryQuantityAction(
  _prev: TrackerState,
  formData: FormData,
): Promise<TrackerState> {
  const locale = readLocale(formData);
  const user = await getCurrentUser();
  if (!user) return { errorKey: "sessionExpired" };

  const entryId = readField(entryIdSchema, formData.get("entryId"));
  if ("errorKey" in entryId) return { errorKey: "entryNotFound" };
  const quantity = readField(quantitySchema, formData.get("quantity"));
  if ("errorKey" in quantity) return { errorKey: "quantity" };
  const unit = readField(quantityUnitSchema, formData.get("unit"));
  if ("errorKey" in unit) return { errorKey: "quantityUnit" };

  const result = await updateMealEntryQuantity(
    user.id,
    entryId.value,
    quantity.value,
    unit.value,
  );
  if (!result.ok) return { errorKey: result.errorKey };
  revalidateTracker(locale);
  return { ok: true };
}

export async function deleteEntryAction(
  _prev: TrackerState,
  formData: FormData,
): Promise<TrackerState> {
  const locale = readLocale(formData);
  const user = await getCurrentUser();
  if (!user) return { errorKey: "sessionExpired" };

  const entryId = readField(entryIdSchema, formData.get("entryId"));
  if ("errorKey" in entryId) return { errorKey: "entryNotFound" };

  const result = await deleteMealEntry(user.id, entryId.value);
  if (!result.ok) return { errorKey: result.errorKey };
  revalidateTracker(locale);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Custom foods
// ---------------------------------------------------------------------------

export async function saveCustomFoodAction(
  _prev: TrackerState,
  formData: FormData,
): Promise<TrackerState> {
  const user = await getCurrentUser();
  if (!user) return { errorKey: "sessionExpired" };

  const parsed = customFoodSchema.safeParse({
    locale: formData.get("locale"),
    customFoodId: formData.get("customFoodId") || undefined,
    name: formData.get("name"),
    brand: formData.get("brand"),
    nutritionBasis: formData.get("nutritionBasis"),
    kcal: formData.get("kcal"),
    proteinG: formData.get("proteinG"),
    carbsG: formData.get("carbsG"),
    fatG: formData.get("fatG"),
    fiberG: formData.get("fiberG"),
  });
  if (!parsed.success) {
    return { errorKey: parsed.error.issues[0]?.message ?? "invalidInput" };
  }
  const food = parsed.data;
  const values = {
    name: food.name,
    brand: food.brand || null,
    kcal: food.kcal,
    proteinG: food.proteinG,
    carbsG: food.carbsG,
    fatG: food.fatG,
    fiberG: food.fiberG,
    nutritionBasis: food.nutritionBasis,
  };

  const result = food.customFoodId
    ? await updateCustomFood(user.id, food.customFoodId, values)
    : await createCustomFood(user.id, values);
  if (!result.ok) return { errorKey: result.errorKey };
  revalidateTracker(food.locale);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Saved meals
// ---------------------------------------------------------------------------

export async function createSavedMealAction(
  _prev: TrackerState,
  formData: FormData,
): Promise<TrackerState> {
  const locale = readLocale(formData);
  const user = await getCurrentUser();
  if (!user) return { errorKey: "sessionExpired" };

  const parsed = savedMealSchema.safeParse({
    locale,
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { errorKey: parsed.error.issues[0]?.message ?? "invalidInput" };
  }
  const entryIds = formData
    .getAll("entryId")
    .map(String)
    .filter((id) => entryIdSchema.safeParse(id).success);

  const result = await createSavedMeal(
    user.id,
    parsed.data.name,
    parsed.data.description || null,
    entryIds,
  );
  if (!result.ok) return { errorKey: result.errorKey };
  revalidateTracker(locale);
  return { ok: true };
}

export async function updateSavedMealAction(
  _prev: TrackerState,
  formData: FormData,
): Promise<TrackerState> {
  const locale = readLocale(formData);
  const user = await getCurrentUser();
  if (!user) return { errorKey: "sessionExpired" };

  const savedMealId = readField(savedMealIdSchema, formData.get("savedMealId"));
  if ("errorKey" in savedMealId) return { errorKey: "savedMealNotFound" };
  const parsed = savedMealSchema.safeParse({
    locale,
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { errorKey: parsed.error.issues[0]?.message ?? "invalidInput" };
  }
  const result = await updateSavedMeal(
    user.id,
    savedMealId.value,
    parsed.data.name,
    parsed.data.description || null,
  );
  if (!result.ok) return { errorKey: result.errorKey };
  revalidateTracker(locale);
  return { ok: true };
}

export async function deleteSavedMealAction(
  _prev: TrackerState,
  formData: FormData,
): Promise<TrackerState> {
  const locale = readLocale(formData);
  const user = await getCurrentUser();
  if (!user) return { errorKey: "sessionExpired" };

  const savedMealId = readField(savedMealIdSchema, formData.get("savedMealId"));
  if ("errorKey" in savedMealId) return { errorKey: "savedMealNotFound" };

  const result = await deleteSavedMeal(savedMealId.value);
  if (!result.ok) return { errorKey: result.errorKey };
  revalidateTracker(locale);
  return { ok: true };
}

/** Applies a saved meal to a date/type as independent new entries. */
export async function applySavedMealAction(
  _prev: TrackerState,
  formData: FormData,
): Promise<TrackerState> {
  const locale = readLocale(formData);
  const user = await getCurrentUser();
  if (!user) return { errorKey: "sessionExpired" };

  const savedMealId = readField(savedMealIdSchema, formData.get("savedMealId"));
  if ("errorKey" in savedMealId) return { errorKey: "savedMealNotFound" };
  const mealDate = readField(mealDateSchema, formData.get("mealDate"));
  if ("errorKey" in mealDate) return mealDate;
  const mealType = readField(mealTypeSchema, formData.get("mealType"));
  if ("errorKey" in mealType) return { errorKey: "mealType" };

  const result = await applySavedMeal(
    user.id,
    savedMealId.value,
    mealDate.value,
    mealType.value,
  );
  if (!result.ok) return { errorKey: result.errorKey };
  revalidateTracker(locale);
  return { ok: true };
}
