import { describe, expect, it } from "vitest";

import {
  getRecipe,
  getRecipes,
  recipeSlugs,
  recipeTags,
  type Recipe,
} from "@/lib/content/recipes";

/**
 * The recipe content itself (Stage 5): one source of truth, two languages,
 * internally consistent nutrition. Favourites reference these slugs in the
 * database, so they must exist exactly once per locale and never drift.
 */

const LOCALES = ["en", "fr"] as const;

/** Recipes arrive as { measured fields } rows keyed per locale. */
function all(): Map<string, Recipe[]> {
  return new Map(LOCALES.map((locale) => [locale, getRecipes(locale)]));
}

/** kcal ≈ 4·protein + 4·carbs + 9·fat, within 8% (Atwater round-trip). */
function kcalError(recipe: Recipe): number {
  const { kcal, proteinG, carbsG, fatG } = recipe.perServing;
  const derived = 4 * proteinG + 4 * carbsG + 9 * fatG;
  return Math.abs(kcal - derived) / Math.max(derived, 1);
}

describe("recipe content", () => {
  it("has the same slugs in both languages, each exactly once", () => {
    const library = all();
    for (const locale of LOCALES) {
      const slugs = library.get(locale)!.map((recipe) => recipe.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      expect([...slugs].sort()).toEqual([...recipeSlugs].sort());
    }
  });

  it("keeps slugs URL- and database-safe", () => {
    for (const slug of recipeSlugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(slug.length).toBeLessThanOrEqual(80);
    }
  });

  it("carries the same closed-set tags per slug in both languages", () => {
    for (const slug of recipeSlugs) {
      const en = getRecipe("en", slug)!.tags;
      const fr = getRecipe("fr", slug)!.tags;
      for (const tags of [en, fr]) {
        for (const tag of tags) {
          expect(recipeTags).toContain(tag);
        }
      }
      expect(new Set(en)).toEqual(new Set(fr));
      // No tag listed twice on one recipe.
      expect(new Set(en).size).toBe(en.length);
    }
  });

  it("labels `quick` honestly: only recipes at or under 15 minutes", () => {
    const library = all();
    for (const locale of LOCALES) {
      for (const recipe of library.get(locale)!) {
        expect(recipe.tags.includes("quick")).toBe(recipe.prepMinutes <= 15);
      }
    }
  });

  it("labels `noCook` honestly: no stove time stated", () => {
    const library = all();
    for (const locale of LOCALES) {
      for (const recipe of library.get(locale)!) {
        expect(recipe.tags.includes("noCook")).toBe(
          recipe.cookMinutes === undefined,
        );
      }
    }
  });

  it("states nutrition consistent with its macros (estimate, ±8%)", () => {
    const library = all();
    for (const locale of LOCALES) {
      for (const recipe of library.get(locale)!) {
        expect(kcalError(recipe)).toBeLessThan(0.08);
      }
    }
  });

  it("has complete, non-empty content in both languages", () => {
    const library = all();
    for (const locale of LOCALES) {
      for (const recipe of library.get(locale)!) {
        expect(recipe.title.trim().length).toBeGreaterThan(0);
        expect(recipe.summary.trim().length).toBeGreaterThan(0);
        expect(recipe.tip.trim().length).toBeGreaterThan(0);
        expect(recipe.ingredients.length).toBeGreaterThan(0);
        expect(recipe.steps.length).toBeGreaterThan(0);
        expect(recipe.ingredients.every((line) => line.trim().length > 0)).toBe(
          true,
        );
        expect(recipe.steps.every((line) => line.trim().length > 0)).toBe(true);
        expect(recipe.baseServings).toBeGreaterThanOrEqual(1);
        expect(recipe.prepMinutes).toBeGreaterThan(0);
        expect(recipe.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (recipe.cookMinutes !== undefined) {
          expect(recipe.cookMinutes).toBeGreaterThan(0);
        }
      }
    }
  });

  it("translates: no recipe repeats the other language's title", () => {
    const library = all();
    const titles = new Set(library.get("fr")!.map((recipe) => recipe.title));
    for (const recipe of library.get("en")!) {
      expect(titles.has(recipe.title)).toBe(false);
    }
  });
});
