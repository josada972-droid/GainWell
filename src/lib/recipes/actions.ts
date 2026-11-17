"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { localeSchema } from "@/lib/auth/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { recipeSlugs } from "@/lib/content/recipes";
import { addFavorite, removeFavorite } from "@/lib/progress/store";

/**
 * Recipe-favourite Server Actions (Stage 5). Favourites live in the database
 * but reference the static catalogue's slugs, so every mutation allowlists
 * the slug against the actual recipe list before writing — only real recipes
 * can be favourited, whatever a client sends. Identity is the server-verified
 * session; RLS pins the row again. Errors are `recipes.errors`-style keys in
 * the `recipes` namespace.
 */

export type FavoriteState = {
  errorKey?: string;
  ok?: boolean;
  /** The end state, so the button can render the right icon immediately. */
  isFavorite?: boolean;
};

const favoriteSlugSchema = z
  .string()
  .refine((value) => (recipeSlugs as readonly string[]).includes(value));

const favoriteIntentSchema = z.enum(["add", "remove"]);

export async function toggleFavoriteAction(
  _prev: FavoriteState,
  formData: FormData,
): Promise<FavoriteState> {
  const locale = localeSchema.parse(formData.get("locale"));
  const user = await getCurrentUser();
  if (!user) return { errorKey: "favouriteSignIn" };

  const slug = favoriteSlugSchema.safeParse(formData.get("slug"));
  if (!slug.success) return { errorKey: "invalidInput" };
  const intent = favoriteIntentSchema.safeParse(formData.get("intent"));
  if (!intent.success) return { errorKey: "invalidInput" };

  const result =
    intent.data === "add"
      ? await addFavorite(user.id, slug.data)
      : await removeFavorite(user.id, slug.data);
  if (!result.ok) return { errorKey: result.errorKey };

  revalidatePath(`/${locale}/recipes`);
  revalidatePath(`/${locale}/dashboard`);
  return { ok: true, isFavorite: intent.data === "add" };
}
