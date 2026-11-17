import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Translation parity (Stage 5 and every stage before it): en.json and fr.json
 * must expose exactly the same key tree, so no interface string can exist in
 * one language and fall back to a raw key in the other.
 */

type TreeNode = { [key: string]: TreeNode } | string;

function load(locale: string): TreeNode {
  return JSON.parse(
    readFileSync(
      new URL(`../messages/${locale}.json`, import.meta.url),
      "utf8",
    ),
  ) as TreeNode;
}

/** Every leaf path of a messages tree, e.g. `progress.errors.duplicateDate`. */
function leafPaths(node: TreeNode, prefix = ""): string[] {
  if (typeof node === "string") return [prefix];
  return Object.entries(node).flatMap(([key, value]) =>
    leafPaths(value, prefix ? `${prefix}.${key}` : key),
  );
}

describe("message files", () => {
  const en = leafPaths(load("en"));
  const fr = leafPaths(load("fr"));

  it("defines the same keys in English and French", () => {
    expect([...fr].sort()).toEqual([...en].sort());
  });

  it("leaves no empty string in either language", () => {
    for (const locale of ["en", "fr"] as const) {
      const tree = load(locale);
      for (const path of leafPaths(tree)) {
        let node: TreeNode = tree;
        for (const part of path.split(".")) node = (node as never)[part];
        expect(
          (node as string).trim().length,
          `${locale}:${path}`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("uses the same interpolation placeholders on both sides", () => {
    const enTree = load("en");
    const frTree = load("fr");
    for (const path of en) {
      let enNode: TreeNode = enTree;
      let frNode: TreeNode = frTree;
      for (const part of path.split(".")) {
        enNode = (enNode as never)[part];
        frNode = (frNode as never)[part];
      }
      if (typeof enNode !== "string" || typeof frNode !== "string") continue;
      const placeholders = (value: string) =>
        [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
      expect(placeholders(frNode), `fr:${path}`).toEqual(placeholders(enNode));
    }
  });
});
