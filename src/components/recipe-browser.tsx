"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { RecipeRow, categoryKey } from "@/components/recipe-card";
import {
  recipeCategories,
  type Recipe,
  type RecipeCategory,
} from "@/lib/content/recipes";

type Filter = "all" | RecipeCategory;

const filterKey = (filter: Filter) =>
  filter === "all" ? "filterAll" : categoryKey[filter];

/** Accents are folded so "cafe" finds "cacahuète" in the French library. */
const fold = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function matches(recipe: Recipe, query: string) {
  if (!query) return true;
  const needle = fold(query);
  return [recipe.title, recipe.summary, ...recipe.ingredients].some((line) =>
    fold(line).includes(needle),
  );
}

/** Search and category filters over the local seed list. No server call. */
export function RecipeBrowser({ recipes }: { recipes: Recipe[] }) {
  const t = useTranslations("recipes");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Filter>("all");

  const visible = recipes.filter(
    (recipe) =>
      (category === "all" || recipe.category === category) &&
      matches(recipe, query),
  );

  return (
    <div>
      <div className="flex items-center gap-(--space-sm)">
        <Search
          aria-hidden="true"
          className="size-5 shrink-0 text-(--color-muted)"
        />
        <input
          type="search"
          aria-label={t("searchLabel")}
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="field w-full min-w-0"
        />
      </div>

      <div
        role="group"
        aria-label={t("filtersLabel")}
        className="groove mt-(--space-md) flex-wrap"
      >
        {(["all", ...recipeCategories] as Filter[]).map((filter) => (
          <button
            key={filter}
            type="button"
            className="groove__stop"
            aria-pressed={category === filter}
            onClick={() => setCategory(filter)}
          >
            {t(filterKey(filter))}
          </button>
        ))}
      </div>

      <p
        aria-live="polite"
        className="num mt-(--space-md) text-sm text-(--color-muted)"
      >
        {t("resultCount", { count: visible.length })}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-(--space-xs) list-none">
          {visible.map((recipe) => (
            <RecipeRow key={recipe.slug} recipe={recipe} />
          ))}
        </ul>
      ) : (
        <div className="well mt-(--space-sm) p-(--space-md)">
          <h3>{t("emptyTitle")}</h3>
          <p className="mt-(--space-xs) text-(--color-muted)">
            {t("emptyBody")}
          </p>
        </div>
      )}
    </div>
  );
}
