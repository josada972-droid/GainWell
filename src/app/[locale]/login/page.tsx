import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { RedirectIfSignedIn } from "@/components/auth/session-gate";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { safeRedirectPath } from "@/lib/auth/redirect";

export async function generateMetadata() {
  const t = await getTranslations("auth.login");
  return { title: t("title"), description: t("lead") };
}

export default async function LoginPage({
  searchParams,
}: PageProps<"/[locale]/login">) {
  const t = await getTranslations("auth");
  return (
    <section className="desk hairline py-(--section-gap)">
      <div className="container">
        <SectionHeading
          level={1}
          title={t("login.title")}
          lead={t("login.lead")}
        />
        <AuthCard>
          <Suspense fallback={<AuthCardFallback />}>
            <LoginPanel searchParams={searchParams} />
          </Suspense>
        </AuthCard>
      </div>
    </section>
  );
}

/**
 * Reads searchParams and the session, so it streams in behind Suspense
 * (cache-components): the shell above renders immediately either way.
 */
async function LoginPanel({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations("auth");
  const params = await searchParams;
  const confirmFailed = params.confirm === "failed";
  const next = safeRedirectPath(params.next) ?? undefined;
  const locale = await getLocale();

  return (
    <>
      <RedirectIfSignedIn />
      {confirmFailed ? (
        <p role="alert" className="form-alert form-alert--error">
          {t("notices.confirmFailed")}
        </p>
      ) : null}
      <LoginForm next={next} locale={locale} />
      <nav className="hairline mt-(--space-md) grid gap-(--space-3xs) pt-(--space-md) text-sm">
        <p>
          {t("login.noAccount")}{" "}
          <Link className="underline" href={signupHref(next)}>
            {t("login.createAccountLink")}
          </Link>
        </p>
        <Link className="underline" href="/forgot-password">
          {t("login.forgotLink")}
        </Link>
      </nav>
    </>
  );
}

/** Cross-links keep the validated `next` so the post-login destination survives. */
function signupHref(next: string | undefined): string {
  return next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";
}

function AuthCardFallback() {
  return <div className="well h-56 animate-pulse" aria-hidden="true" />;
}
