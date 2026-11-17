import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { RecipeBrowser } from "@/components/recipe-browser";
import { SectionHeading } from "@/components/section-heading";
import { routing, type Locale } from "@/i18n/routing";
import { getRecipes } from "@/lib/content/recipes";
import { getCurrentUser } from "@/lib/auth/session";
import { listFavoriteSlugs } from "@/lib/progress/store";
import { currentLocale } from "@/lib/locale";

export async function generateMetadata() {
  const t = await getTranslations("recipes");
  return { title: await t("title"), description: await t("lead") };
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
        <SectionHeading level={1} title={t("title")} lead={t("lead")} />
        <div className="mt-(--space-xl)">
          {/* The session read (favourites) is the only dynamic part; the
              catalogue itself renders without it. */}
          <Suspense
            fallback={
              <RecipeBrowser
                recipes={getRecipes(locale)}
                favoriteSlugs={[]}
                signedIn={false}
                locale={locale}
              />
            }
          >
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
      recipes={getRecipes(locale)}
      favoriteSlugs={favoriteSlugs}
      signedIn={Boolean(user)}
      locale={locale}
    />
  );
}
