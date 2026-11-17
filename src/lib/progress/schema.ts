import { z } from "zod";

/**
 * Weight-progress form validation (Stage 5, Zod at the trust boundary). Same
 * pattern as the tracker schemas: values arrive as strings from `<form>`,
 * numbers accept a French comma decimal. Error values are message keys the
 * UI translates (`progress.errors.*`).
 */

/** Kilograms, 25–300 (the DB CHECK range), at most one decimal. */
export const weightKgSchema = z
  .string()
  .transform((value) =>
    value.trim() === "" ? Number.NaN : Number(value.trim().replace(",", ".")),
  )
  .refine(
    (value) =>
      Number.isFinite(value) &&
      value >= 25 &&
      value <= 300 &&
      // One decimal at most: the column is numeric(5,1), so silently rounding
      // 60.25 to 60.3 would record something the user did not type.
      Math.round(value * 10) === value * 10,
    "weight",
  );

/** A real calendar date, YYYY-MM-DD, inside the DB CHECK's lower bound. */
export const weightDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value &&
      value >= "2000-01-01"
    );
  }, "date");

/** Optional note: blank means none; otherwise capped like the DB column. */
export const weightNoteSchema = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length <= 300, "note");

export const weightEntryIdSchema = z.string().uuid("entryNotFound");

/** One "record a measurement" form, minus the locale (read separately). */
export const weightEntrySchema = z.object({
  date: weightDateSchema,
  weightKg: weightKgSchema,
  note: weightNoteSchema,
});
