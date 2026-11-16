import { z } from "zod";

import { localeSchema } from "@/lib/auth/schemas";

/**
 * Tracker form validation (Stage 4, Zod at the trust boundary). Same pattern
 * as the onboarding schemas: values arrive as strings from `<form>`, numbers
 * are coerced (French comma decimals accepted), empty optional fields mean
 * "unknown" — never 0. Error values are message keys the UI translates.
 */

export const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof mealTypes)[number];

export const mealTypeSchema = z
  .string()
  .refine(
    (value) => (mealTypes as readonly string[]).includes(value),
    "mealType",
  )
  .pipe(z.enum(mealTypes));

export const quantityUnits = ["g", "ml", "serving"] as const;
export type QuantityUnitSchema = (typeof quantityUnits)[number];

export const quantityUnitSchema = z
  .string()
  .refine(
    (value) => (quantityUnits as readonly string[]).includes(value),
    "quantityUnit",
  )
  .pipe(z.enum(quantityUnits));

/** Positive finite quantity with a hard ceiling (mirrors the DB check). */
export const quantitySchema = z
  .string()
  .transform((value) =>
    value.trim() === "" ? Number.NaN : Number(value.trim().replace(",", ".")),
  )
  .refine(
    (value) => Number.isFinite(value) && value > 0 && value <= 100000,
    "quantity",
  );

export const mealDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "mealDate")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value &&
      value >= "2000-01-01" &&
      value <= "2100-12-31"
    );
  }, "mealDate");

export const searchQuerySchema = z
  .string()
  .transform((value) => value.trim().slice(0, 80))
  .refine((value) => value.length >= 2, "searchTooShort");

export const barcodeSchema = z
  .string()
  .trim()
  .refine((value) => /^\d{8,14}$/.test(value), "invalidBarcode");

export const nutritionBases = ["per_100g", "per_serving"] as const;

/** Non-negative optional nutrient value; blank stays null (unknown). */
function optionalNutrient(max: number) {
  return z
    .string()
    .transform((value) =>
      value.trim() === "" ? null : Number(value.trim().replace(",", ".")),
    )
    .refine(
      (value) =>
        value === null ||
        (Number.isFinite(value) && value >= 0 && value <= max),
      "nutrientRange",
    );
}

/** One food name: non-empty after trimming, capped like the DB column. */
export const foodNameSchema = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length >= 1 && value.length <= 120, "foodName");

export const brandSchema = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value === "" || value.length <= 80, "brand");

export const customFoodSchema = z
  .object({
    locale: localeSchema,
    customFoodId: z.string().uuid().optional(),
    name: foodNameSchema,
    brand: brandSchema,
    nutritionBasis: z
      .string()
      .refine(
        (value) => (nutritionBases as readonly string[]).includes(value),
        "nutritionBasis",
      )
      .pipe(z.enum(nutritionBases)),
    kcal: optionalNutrient(100000),
    proteinG: optionalNutrient(100000),
    carbsG: optionalNutrient(100000),
    fatG: optionalNutrient(100000),
    fiberG: optionalNutrient(100000),
  })
  .refine(
    (food) =>
      food.kcal !== null ||
      food.proteinG !== null ||
      food.carbsG !== null ||
      food.fatG !== null ||
      food.fiberG !== null,
    "oneNutrient",
  );

/** Saved meals: a name, an optional description, and the entries to capture. */
export const savedMealSchema = z.object({
  locale: localeSchema,
  savedMealId: z.string().uuid().optional(),
  name: z
    .string()
    .transform((value) => value.trim())
    .refine(
      (value) => value.length >= 1 && value.length <= 120,
      "savedMealName",
    ),
  description: z
    .string()
    .transform((value) => value.trim())
    .refine(
      (value) => value === "" || value.length <= 300,
      "savedMealDescription",
    ),
});

export const entryIdSchema = z.string().uuid("entryNotFound");
export const savedMealIdSchema = z.string().uuid("savedMealNotFound");
export const mealIdSchema = z.string().uuid("mealNotFound");
