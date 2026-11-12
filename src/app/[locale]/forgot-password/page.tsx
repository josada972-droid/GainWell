import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("auth.forgot");
  return { title: t("title"), description: t("lead") };
}

export default async function ForgotPasswordPage({
  searchParams,
}: PageProps<"/[locale]/forgot-password">) {
  const t = await getTranslations("auth");
  return (
    <section className="desk hairline py-(--section-gap)">
      <div className="container">
        <SectionHeading
          level={1}
          title={t("forgot.title")}
          lead={t("forgot.lead")}
        />
        <AuthCard>
          <Suspense fallback={<AuthCardFallback />}>
            <ForgotPasswordPanel searchParams={searchParams} />
          </Suspense>
        </AuthCard>
      </div>
    </section>
  );
}

/**
 * A failed confirmation link lands here with `?confirm=failed` (see
 * src/app/auth/confirm/route.ts), and the notice replaces the form so no
 * expired token can be retried silently.
 */
async function ForgotPasswordPanel({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations("auth");
  const params = await searchParams;
  const confirmFailed = params.confirm === "failed";
  const locale = await getLocale();

  return (
    <>
      {confirmFailed ? (
        <>
          <p role="alert" className="form-alert form-alert--error">
            {t("notices.confirmFailed")}
          </p>
          <p className="mt-(--space-sm) text-sm">
            <Link className="underline" href="/login">
              {t("forgot.backToLogin")}
            </Link>
          </p>
        </>
      ) : (
        <>
          <ForgotPasswordForm locale={locale} />
          <p className="hairline mt-(--space-md) pt-(--space-md) text-sm">
            <Link className="underline" href="/login">
              {t("forgot.backToLogin")}
            </Link>
          </p>
        </>
      )}
    </>
  );
}

function AuthCardFallback() {
  return <div className="well h-56 animate-pulse" aria-hidden="true" />;
}
