import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { RequireSignedIn } from "@/components/auth/session-gate";
import { SectionHeading } from "@/components/section-heading";
import { signOutAction } from "@/lib/auth/actions";
import { getCurrentProfile } from "@/lib/auth/session";
import { getLocale } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("auth.dashboard");
  return { title: t("title"), description: t("lead") };
}

/**
 * The protected dashboard, Stage 2 edition: a signed-in welcome page. The
 * session check streams in behind Suspense; until it resolves the shell shows
 * and an unauthenticated visitor is then redirected to login with a return
 * path (no open redirect — the destination is a fixed, validated string).
 */
export default async function DashboardPage() {
  const t = await getTranslations("auth");
  return (
    <section className="desk hairline py-(--section-gap)">
      <div className="container">
        <SectionHeading
          level={1}
          title={t("dashboard.title")}
          lead={t("dashboard.lead")}
        />
        <AuthCard>
          <Suspense fallback={<AuthCardFallback />}>
            <DashboardPanel />
          </Suspense>
        </AuthCard>
      </div>
    </section>
  );
}

async function DashboardPanel() {
  const t = await getTranslations("auth");
  const locale = await getLocale();
  // Protection first: without a session the visitor is redirected to login.
  await RequireSignedIn({ next: "/dashboard" });
  const profile = await getCurrentProfile();

  return (
    <div className="grid gap-(--space-md)">
      <p
        data-slot="dashboard-signed-in-as"
        className="text-sm text-(--color-ink-2)"
      >
        {profile?.display_name
          ? t("dashboard.signedInAsName", { name: profile.display_name })
          : t("dashboard.signedInAsGeneric")}
      </p>
      <p className="hairline pt-(--space-md) text-sm text-(--color-muted)">
        {t("dashboard.stageNote")}
      </p>
      <form action={signOutAction}>
        <input type="hidden" name="locale" value={locale} />
        <button type="submit" className="btn btn--quiet">
          {t("dashboard.signOut")}
        </button>
      </form>
    </div>
  );
}

/**
 * The profile row may not exist yet (e.g. a user created before the trigger
 * was applied); in that case the greeting falls back to a generic line, and
 * the profile row can be repaired later rather than invented here.
 */
function AuthCardFallback() {
  return <div className="well h-56 animate-pulse" aria-hidden="true" />;
}
