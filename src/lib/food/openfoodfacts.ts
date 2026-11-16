import "server-only";

import {
  type Food,
  type NutritionBasis,
  type QuantityUnit,
} from "@/lib/nutrition/food";

/**
 * Open Food Facts integration (Stage 4). Server-side only: React components
 * never call OFF, and no privileged configuration reaches the browser.
 *
 * Sources verified at implementation time (2026-11-13):
 * * Product lookup — API v3 (current, v2 deprecated):
 *     GET https://world.openfoodfacts.org/api/v3/product/<barcode>.json?fields=…
 *   Success response shape: { status: "success", result: { id: "product_found" },
 *   product: { code, product_name, product_name_fr?, brands?, nutriments,
 *   nutrition_data_per, serving_quantity?, serving_size? } } (live-checked).
 * * Full-text search — the legacy /cgi/search.pl is deprecated and v2/v3
 *   server APIs have no full-text search; the official dedicated service is
 *   Search-a-licious (GET https://search.openfoodfacts.org/search?q=…&page_size=…).
 *   Response: { hits: [...], count, page, page_size, page_count }.
 * * Rate limits (official docs): 15 req/min/IP for product GETs, 10 req/min/IP
 *   for search. GainWell runs below both (see off-rate-limit.ts).
 * * User-Agent (official docs): `AppName/Version (Contact)`; contact email via
 *   OPENFOODFACTS_CONTACT when set.
 * * Licensing: ODbL 1.0 (database, share-alike for derivative databases),
 *   DbCL (individual contents), CC BY-SA (images — never used here).
 *   Attribution per product row: the product page URL.
 *
 * Normalization rules: preserve the source basis; never fill missing values
 * with zero; never assume 1 ml = 1 g; kJ→kcal is a defined physical
 * conversion and marks the food as `estimated`.
 */

const OFF_BASE = "https://world.openfoodfacts.org";
const SEARCH_BASE = "https://search.openfoodfacts.org";

/** Fields requested from both endpoints — the only ones we normalize. */
const FIELDS = [
  "code",
  "product_name",
  "product_name_fr",
  "brands",
  "serving_quantity",
  "serving_size",
  "nutriments",
  "nutrition_data_per",
].join(",");

export const OFF_USER_AGENT = process.env.OPENFOODFACTS_CONTACT
  ? `GainWell/0.1.0 (${process.env.OPENFOODFACTS_CONTACT})`
  : "GainWell/0.1.0";

const SEARCH_PAGE_SIZE = 8;
const FETCH_TIMEOUT_MS = 10_000;

export type OffFetchResult<T> =
  { ok: true; value: T } | { ok: false; reason: "empty" | "error" };

/** Barcode normalization per OFF's Barcode Normalization reference: digits only. */
export function normalizeBarcode(raw: string): string | null {
  const digits = raw.replace(/[\s-]/g, "");
  return /^\d{8,14}$/.test(digits) ? digits : null;
}

/** Normalized search query: trimmed, folded whitespace, lowercased. */
export function normalizeQuery(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

type OffProduct = {
  code?: string;
  product_name?: string;
  product_name_fr?: string;
  brands?: string;
  serving_quantity?: number;
  serving_size?: string;
  nutriments?: Record<string, unknown>;
  nutrition_data_per?: string;
};

function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function text(value: unknown): string | null {
  const raw = typeof value === "string" ? value.trim() : "";
  return raw === "" ? null : raw;
}

/**
 * Reads one nutrient off an OFF `nutriments` object for the product's basis.
 * OFF stores per-100g values under `<key>_100g` and per-serving values under
 * `<key>_serving` (older records under the bare `<key>`). Only kcal and the
 * four GainWell nutrients are read; nothing else is kept.
 */
function nutrient(
  nutriments: Record<string, unknown>,
  key: string,
  per: "100g" | "serving",
): number | null {
  const suffixed = per === "100g" ? `${key}_100g` : `${key}_serving`;
  return number(nutriments[suffixed]) ?? number(nutriments[key]);
}

const KJ_PER_KCAL = 4.184;

function kcalFrom(
  nutriments: Record<string, unknown>,
  per: "100g" | "serving",
) {
  const direct = nutrient(nutriments, "energy-kcal", per);
  if (direct !== null) return { value: direct, estimated: false };
  // No kcal but kJ present: a defined physical conversion, flagged as
  // estimated (the product did not state kcal itself).
  const kj = nutrient(nutriments, "energy-kj", per);
  if (kj !== null) {
    return {
      value: Math.round((kj / KJ_PER_KCAL) * 1000) / 1000,
      estimated: true,
    };
  }
  return { value: null, estimated: false };
}

/** OFF's `nutrition_data_per` mapped onto GainWell's basis vocabulary. */
function basisFrom(per: string | null): NutritionBasis {
  if (per === "serving") return "per_serving";
  // OFF states nutrition per 100 g even for liquids; no per-100ml basis
  // exists in OFF data, so nothing is invented for them.
  return "per_100g";
}

/** Normalizes one OFF product record into GainWell's Food representation. */
export function normalizeOffProduct(raw: OffProduct): Food | null {
  const code = text(raw.code);
  const name = text(raw.product_name) ?? text(raw.product_name_fr);
  const nutriments = raw.nutriments;
  if (!code || !name || !nutriments) return null;

  const per: "100g" | "serving" =
    raw.nutrition_data_per === "serving" ? "serving" : "100g";
  const energy = kcalFrom(nutriments, per);

  const servingQuantity = number(raw.serving_quantity);
  const servingSize = text(raw.serving_size);

  return {
    name,
    brand: text(raw.brands),
    basis: basisFrom(per),
    values: {
      kcal: energy.value,
      proteinG: nutrient(nutriments, "proteins", per),
      carbsG: nutrient(nutriments, "carbohydrates", per),
      fatG: nutrient(nutriments, "fat", per),
      fiberG: nutrient(nutriments, "fiber", per),
    },
    // serving_quantity is OFF's numeric serving size; its unit is not stated
    // reliably, so it is carried as metadata only and never used to convert
    // a mass.
    servingQuantity: servingQuantity,
    servingUnit:
      servingQuantity !== null && servingSize?.match(/\((\d+\.?\d*)\s*ml\)/i)
        ? "ml"
        : servingQuantity !== null
          ? "g"
          : null,
    estimated: energy.estimated,
    source: {
      kind: "open_food_facts",
      code,
      attribution: `${OFF_BASE}/product/${code}`,
    },
  };
}

type OffProductResponse = {
  status?: string;
  result?: { id?: string };
  product?: OffProduct;
};

/** GET one product by barcode. Never called without the limiter's consent. */
export async function fetchOffProduct(
  barcode: string,
): Promise<OffFetchResult<Food>> {
  const url = `${OFF_BASE}/api/v3/product/${barcode}.json?fields=${FIELDS}`;
  let json: OffProductResponse;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": OFF_USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false, reason: "error" };
    json = (await response.json()) as OffProductResponse;
  } catch {
    return { ok: false, reason: "error" };
  }

  if (
    json.status !== "success" ||
    json.result?.id !== "product_found" ||
    !json.product
  ) {
    return { ok: false, reason: "empty" };
  }
  const food = normalizeOffProduct(json.product);
  return food ? { ok: true, value: food } : { ok: false, reason: "empty" };
}

type OffSearchResponse = {
  hits?: OffProduct[];
  errors?: unknown;
};

/** Full-text search via Search-a-licious. Never called without the limiter. */
export async function fetchOffSearch(
  query: string,
): Promise<OffFetchResult<Food[]>> {
  const url =
    `${SEARCH_BASE}/search?q=${encodeURIComponent(query)}` +
    `&page_size=${SEARCH_PAGE_SIZE}&page=1&fields=${FIELDS}&langs=en,fr`;
  let json: OffSearchResponse;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": OFF_USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false, reason: "error" };
    json = (await response.json()) as OffSearchResponse;
  } catch {
    return { ok: false, reason: "error" };
  }

  // Search-a-licious signals malformed queries with an `errors` array.
  if (Array.isArray(json.errors) && json.errors.length > 0) {
    return { ok: false, reason: "error" };
  }
  const hits = Array.isArray(json.hits) ? json.hits : [];
  const foods: Food[] = [];
  const seen = new Set<string>();
  for (const hit of hits) {
    const food = normalizeOffProduct(hit);
    if (food && !seen.has(food.source.code!)) {
      seen.add(food.source.code!);
      foods.push(food);
    }
  }
  return { ok: true, value: foods };
}

/** The quantity unit a food's basis accepts. */
export function defaultUnitFor(basis: NutritionBasis): QuantityUnit {
  if (basis === "per_serving") return "serving";
  return basis === "per_100ml" ? "ml" : "g";
}
