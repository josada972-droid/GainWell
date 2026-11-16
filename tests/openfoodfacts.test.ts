import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchOffProduct,
  fetchOffSearch,
  normalizeBarcode,
  normalizeOffProduct,
  normalizeQuery,
  OFF_USER_AGENT,
} from "@/lib/food/openfoodfacts";

/**
 * Open Food Facts client tests (Stage 4): controlled fixtures, mocked
 * network. No live API calls — the shapes below mirror the verified v3
 * product response and the Search-a-licious response (see the module doc
 * comment in src/lib/food/openfoodfacts.ts).
 */

const productFixture = {
  status: "success",
  result: { id: "product_found" },
  product: {
    code: "3017620422003",
    product_name: "Nutella",
    product_name_fr: "Nutella",
    brands: "Ferrero, Nutella",
    serving_quantity: 15,
    serving_size: "15 g",
    nutrition_data_per: "100g",
    nutriments: {
      "energy-kcal_100g": 539,
      proteins_100g: 6.3,
      carbohydrates_100g: 57.5,
      fat_100g: 30.9,
      fiber_100g: 0,
    },
  },
};

const searchFixture = {
  hits: [
    {
      code: "1",
      product_name: "Product one",
      nutrition_data_per: "100g",
      nutriments: { "energy-kcal_100g": 100, proteins_100g: 1 },
    },
    {
      code: "2",
      product_name: "Produit deux",
      nutrition_data_per: "serving",
      serving_quantity: 30,
      serving_size: "30 g",
      nutriments: { "energy-kcal_serving": 150, proteins_serving: 3 },
    },
    // duplicate code — must be dropped
    {
      code: "1",
      product_name: "Product one again",
      nutrition_data_per: "100g",
      nutriments: {},
    },
    // no name — must be dropped
    {
      code: "3",
      nutrition_data_per: "100g",
      nutriments: { "energy-kcal_100g": 5 },
    },
  ],
  count: 2,
  page: 1,
  page_size: 8,
  page_count: 1,
};

function jsonResponse(body: unknown, ok = true): Response {
  return new Response(JSON.stringify(body), {
    status: ok ? 200 : 500,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("normalizeQuery / normalizeBarcode", () => {
  it("folds case and whitespace", () => {
    expect(normalizeQuery("  Peanut   BUTTER ")).toBe("peanut butter");
  });

  it("accepts 8–14 digit barcodes, strips separators, rejects the rest", () => {
    expect(normalizeBarcode("3017620422003")).toBe("3017620422003");
    expect(normalizeBarcode("3017-6204 22003")).toBe("3017620422003");
    expect(normalizeBarcode("12345")).toBeNull();
    expect(normalizeBarcode("3017620422003X")).toBeNull();
    expect(normalizeBarcode("")).toBeNull();
  });
});

describe("normalizeOffProduct", () => {
  it("normalizes a complete per-100g product", () => {
    const result = normalizeOffProduct(productFixture.product);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("Nutella");
    expect(result!.brand).toBe("Ferrero, Nutella");
    expect(result!.basis).toBe("per_100g");
    expect(result!.values.kcal).toBe(539);
    expect(result!.values.proteinG).toBe(6.3);
    expect(result!.estimated).toBe(false);
    expect(result!.source.code).toBe("3017620422003");
    expect(result!.source.attribution).toContain("/product/3017620422003");
  });

  it("keeps the per-serving basis and values untouched", () => {
    const result = normalizeOffProduct(searchFixture.hits[1]);
    expect(result!.basis).toBe("per_serving");
    expect(result!.values.kcal).toBe(150);
    expect(result!.values.proteinG).toBe(3);
  });

  it("keeps missing nutrients as null (never zero)", () => {
    const result = normalizeOffProduct({
      code: "9",
      product_name: "Incomplete",
      nutrition_data_per: "100g",
      nutriments: { "energy-kcal_100g": 40 },
    });
    expect(result!.values.kcal).toBe(40);
    expect(result!.values.proteinG).toBeNull();
    expect(result!.values.fiberG).toBeNull();
  });

  it("derives kcal from kJ with the estimated flag when kcal is absent", () => {
    const result = normalizeOffProduct({
      code: "9",
      product_name: "KJ only",
      nutrition_data_per: "100g",
      nutriments: { "energy-kj_100g": 418.4 },
    });
    expect(result!.values.kcal).toBeCloseTo(100, 3);
    expect(result!.estimated).toBe(true);
  });

  it("drops products without a name or a barcode", () => {
    expect(normalizeOffProduct({ code: "9", nutriments: {} })).toBeNull();
    expect(
      normalizeOffProduct({ product_name: "No code", nutriments: {} }),
    ).toBeNull();
  });
});

describe("fetchOffProduct", () => {
  it("fetches with the documented User-Agent and v3 URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(productFixture));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchOffProduct("3017620422003");
    expect(result.ok).toBe(true);
    expect(fetchMock.mock.calls[0]![0]).toContain(
      "https://world.openfoodfacts.org/api/v3/product/3017620422003.json?fields=",
    );
    expect((fetchMock.mock.calls[0]![1] as RequestInit).headers).toEqual({
      "User-Agent": OFF_USER_AGENT,
    });
  });

  it("returns empty for a product-not-found response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          status: "failure",
          result: { id: "product_not_found" },
        }),
      ),
    );
    const result = await fetchOffProduct("9999999999999");
    expect(result).toEqual({ ok: false, reason: "empty" });
  });

  it("returns error on HTTP failures, timeouts and malformed bodies", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, false)));
    expect((await fetchOffProduct("1")).ok).toBe(false);

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("aborted")));
    expect((await fetchOffProduct("1")).ok).toBe(false);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html>not json</html>")),
    );
    expect((await fetchOffProduct("1")).ok).toBe(false);
  });
});

describe("fetchOffSearch", () => {
  it("parses hits, dedupes by code and drops unusable products", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(searchFixture));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchOffSearch("test");
    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toHaveLength(2);
    expect(result.ok && result.value[0]!.source.code).toBe("1");
    expect(result.ok && result.value[1]!.basis).toBe("per_serving");
    expect(fetchMock.mock.calls[0]![0]).toContain(
      "https://search.openfoodfacts.org/search?q=test",
    );
  });

  it("returns empty for an empty hit list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ hits: [], count: 0 })),
    );
    expect(await fetchOffSearch("zzz")).toEqual({ ok: true, value: [] });
  });

  it("treats a malformed-query errors array as a search failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ errors: ["q is required"], hits: [] }),
        ),
    );
    expect(await fetchOffSearch("")).toEqual({ ok: false, reason: "error" });
  });

  it("returns error on HTTP failure, network error and malformed JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, false)));
    expect((await fetchOffSearch("x")).ok).toBe(false);

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect((await fetchOffSearch("x")).ok).toBe(false);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("gateway timeout text")),
    );
    expect((await fetchOffSearch("x")).ok).toBe(false);
  });
});
