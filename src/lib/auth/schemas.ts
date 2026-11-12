import { z } from "zod";

/**
 * Shared, server-side-validated shapes for every auth mutation. The same
 * schemas run in the Server Actions; forms rely on the server result only.
 * Password bounds follow Supabase Auth defaults: minimum 8 characters, and
 * bcrypt's 72-byte ceiling.
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "emailTooLong")
  .pipe(z.email("invalidEmail"));

export const passwordSchema = z
  .string()
  .min(8, "weakPassword")
  .max(72, "passwordTooLong");

export const displayNameSchema = z.string().trim().max(60, "invalidName");

/** Locale from the page's hidden field; unknown or missing values fall back to en. */
export const localeSchema = z.enum(["en", "fr"]).catch("en");

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema.optional().default(""),
  locale: localeSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "missingPassword").max(72, "passwordTooLong"),
  locale: localeSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  locale: localeSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  locale: localeSchema,
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
