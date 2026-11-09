import { notFound } from "next/navigation";

/**
 * Any unmatched path under a supported locale falls into [locale]/not-found.tsx,
 * so the 404 page keeps the visitor's language and the site chrome. Real routes
 * take priority over this catch-all.
 */
export default function CatchAll() {
  notFound();
}
