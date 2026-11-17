import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listFavoriteSlugs } from "@/lib/progress/store";

/**
 * The favourites entry point on the dashboard (Stage 5): the count plus the
 * path into the recipe library. Slugs are resolved against the static
 * catalogue at the destination, so a favourite for a recipe removed from the
 * content simply never shows up — nothing breaks.
 */
export async function FavoritesCard(): Promise<React.ReactNode> {
  const t = await getTranslations("auth.dashboard");

  const user = await getCurrentUser();
  if (!user) return null;

  const slugs = await listFavoriteSlugs(user.id);

  return (
    <div className="well hairline grid gap-(--space-3xs) p-(--space-md)">
      <div className="flex flex-wrap items-center justify-between gap-(--space-3xs)">
        <h3 className="font-medium">{t("favoritesTitle")}</h3>
        <Link href="/recipes" className="btn btn--quiet">
          {t("favoritesCta")}
        </Link>
      </div>
      <p>
        {slugs.length === 0
          ? t("favoritesEmpty")
          : t("favoritesCount", { count: slugs.length })}
      </p>
    </div>
  );
}
