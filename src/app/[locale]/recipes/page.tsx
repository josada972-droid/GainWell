import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { RecipeBrowser } from "@/components/recipe-browser";
import { SectionHeading } from "@/components/section-heading";
import { routing, type Locale } from "@/i18n/routing";
import { getRecipeList, recipeSlugs } from "@/lib/content/recipes";
import { getCurrentUser } from "@/lib/auth/session";
import { listFavoriteSlugs } from "@/lib/progress/store";
import { currentLocale } from "@/lib/locale";

export async function generateMetadata() {
  const t = await getTranslations("recipes");
  return {
    title: await t("title"),
    description: await t("lead", { count: recipeSlugs.length }),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RecipesPage() {
  const locale = await currentLocale();
  const t = await getTranslations("recipes");

  return (
    <section className="hairline py-(--section-gap)">
      <div className="container">
        <SectionHeading
          level={1}
          title={t("title")}
          lead={t("lead", { count: recipeSlugs.length })}
        />
        <div className="mt-(--space-xl)">
          {/* The session read (favourites) is the only dynamic part; the
              catalogue itself renders without it. The fallback is a skeleton,
              not a second copy of the browser: rendering the full list here
              used to send the whole catalogue twice. */}
          <Suspense fallback={<RecipeBrowserSkeleton />}>
            <RecipeLibrary locale={locale} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

async function RecipeLibrary({ locale }: { locale: Locale }) {
  const user = await getCurrentUser();
  const favoriteSlugs = user ? await listFavoriteSlugs(user.id) : [];

  return (
    <RecipeBrowser
      recipes={getRecipeList(locale)}
      favoriteSlugs={favoriteSlugs}
      signedIn={Boolean(user)}
      locale={locale}
    />
  );
}

/** Shape of the browser's chrome, without any recipe data. */
function RecipeBrowserSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="well h-12 w-full" />
      <div className="groove mt-(--space-md) h-12 w-full" />
      <div className="mt-(--space-md) grid gap-(--space-sm)">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="well h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
