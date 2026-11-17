"use client";

import { Heart } from "lucide-react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { toggleFavoriteAction } from "@/lib/recipes/actions";

/**
 * One favourite toggle (Stage 5). Signed in, it is a real Server Action form
 * button whose pressed state the server renders (favourites persist across
 * sessions); signed out, it is a link to login with this page as the return
 * path — browsing stays public, saving is the members-only part. Duplicate
 * adds are treated as success by the store, so a double click cannot error.
 */
export function FavoriteButton({
  slug,
  isFavorite,
  signedIn,
  locale,
  compact = false,
}: {
  slug: string;
  isFavorite: boolean;
  signedIn: boolean;
  locale: string;
  /** Icon-only form for the dense rows of the recipe list. */
  compact?: boolean;
}) {
  const t = useTranslations("recipes");
  const pathname = usePathname();
  const [state, action, pending] = useActionState(toggleFavoriteAction, {});

  // The action reports the end state; until revalidation lands it, the icon
  // follows it so rapid toggles do not flicker backwards.
  const shown = state.isFavorite ?? isFavorite;

  if (!signedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className="btn btn--quiet inline-flex items-center gap-(--space-2xs)"
        aria-label={t("favouriteSignIn")}
      >
        <Heart aria-hidden="true" className="size-4" />
        {compact ? null : t("favouriteSignIn")}
      </Link>
    );
  }

  const label = shown ? t("favouriteRemove") : t("favouriteAdd");

  return (
    <form action={action}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="intent" value={shown ? "remove" : "add"} />
      <button
        type="submit"
        disabled={pending}
        aria-pressed={shown}
        aria-label={label}
        title={label}
        className="btn btn--quiet inline-flex items-center gap-(--space-2xs)"
      >
        <Heart
          aria-hidden="true"
          className="size-4"
          fill={shown ? "currentColor" : "none"}
        />
        {compact ? null : label}
      </button>
    </form>
  );
}
