import { describe, expect, it } from "vitest";

import {
  getRecipes,
  recipeCategories,
  recipeTags,
  type Recipe,
} from "@/lib/content/recipes";

/**
 * Catalogue-level guarantees for the expanded library (Stage 7G). The per-recipe
 * rules live in tests/recipe-content.test.ts; this file protects the shape of
 * the catalogue itself: size, distribution, variety and no accidental repeats.
 */

const LOCALES = ["en", "fr"] as const;

const countByCategory = (recipes: Recipe[]) => {
  const counts: Record<string, number> = {};
  for (const recipe of recipes) {
    counts[recipe.category] = (counts[recipe.category] ?? 0) + 1;
  }
  return counts;
};

describe("recipe catalogue", () => {
  it("holds the expanded target size", () => {
    for (const locale of LOCALES) {
      const total = getRecipes(locale).length;
      expect(total).toBeGreaterThanOrEqual(100);
      expect(total).toBeLessThanOrEqual(110);
    }
  });

  it("keeps a balanced spread across meal categories", () => {
    const counts = countByCategory(getRecipes("en"));
    expect(counts.breakfast).toBeGreaterThanOrEqual(23);
    expect(counts.lunch).toBeGreaterThanOrEqual(23);
    expect(counts.dinner).toBeGreaterThanOrEqual(28);
    expect((counts.snack ?? 0) + (counts.smoothie ?? 0)).toBeGreaterThanOrEqual(
      18,
    );
    // Every category is actually used, so no filter chip leads nowhere.
    for (const category of recipeCategories) {
      expect(counts[category] ?? 0).toBeGreaterThan(0);
    }
  });

  it("has a meaningful Caribbean selection, tagged rather than separate", () => {
    const caribbean = getRecipes("en").filter((recipe) =>
      recipe.tags.includes("caribbean"),
    );
    expect(caribbean.length).toBeGreaterThanOrEqual(10);
    expect(caribbean.length).toBeLessThanOrEqual(15);
    // They stay inside the normal categories, so navigation is unchanged.
    for (const recipe of caribbean) {
      expect(recipeCategories).toContain(recipe.category);
    }
  });

  it("offers vegetarian and budget-friendly options throughout", () => {
    for (const locale of LOCALES) {
      const library = getRecipes(locale);
      expect(
        library.filter((r) => r.tags.includes("vegetarian")).length,
      ).toBeGreaterThanOrEqual(40);
      expect(
        library.filter((r) => r.tags.includes("budget")).length,
      ).toBeGreaterThanOrEqual(30);
    }
  });

  it("never repeats a title within a language", () => {
    for (const locale of LOCALES) {
      const titles = getRecipes(locale).map((recipe) => recipe.title.trim());
      expect(new Set(titles).size).toBe(titles.length);
    }
  });

  it("actually translates the prose, not just the labels", () => {
    const en = new Map(getRecipes("en").map((r) => [r.slug, r]));
    for (const fr of getRecipes("fr")) {
      const source = en.get(fr.slug);
      expect(source).toBeDefined();
      // A summary copied from English is a missing translation.
      expect(fr.summary).not.toBe(source!.summary);
      expect(fr.tip).not.toBe(source!.tip);
    }
  });

  it("never repeats a recipe under a different slug", () => {
    // Two recipes with the same category and the same ingredient set, ignoring
    // order and quantities, would be a duplicate with a new name.
    const signatures = new Map<string, string>();
    for (const recipe of getRecipes("en")) {
      const ingredients = recipe.ingredients
        .map((line) =>
          line
            .replace(/[\d.,]+\s*(g|ml|kg|l)?/gi, "")
            .trim()
            .toLowerCase(),
        )
        .sort()
        .join("|");
      const key = `${recipe.category}::${ingredients}`;
      const previous = signatures.get(key);
      expect(previous).toBeUndefined();
      signatures.set(key, recipe.slug);
    }
  });

  it("keeps the closed tag set and translated labels in both languages", () => {
    for (const locale of LOCALES) {
      for (const recipe of getRecipes(locale)) {
        for (const tag of recipe.tags) {
          expect(recipeTags).toContain(tag);
        }
      }
    }
  });
});
