import type { Locale } from "@/i18n/routing";
import type { Recipe } from "../recipes";

import { toRecipes } from "./build";
import { breakfast } from "./breakfast";
import { dinner } from "./dinner";
import { lunch } from "./lunch";
import { snacks } from "./snacks";

/**
 * The Stage 7G expansion: 93 bilingual recipes that widen the library without
 * touching the nine originals. Definitions live in one list here so the English
 * and French catalogues can never drift apart — both are derived from the same
 * array (docs/ARCHITECTURE.md, "recipe content").
 */
const definitions = [...breakfast, ...lunch, ...dinner, ...snacks];

export const expansionByLocale: Record<Locale, Recipe[]> = {
  en: toRecipes(definitions, "en"),
  fr: toRecipes(definitions, "fr"),
};
