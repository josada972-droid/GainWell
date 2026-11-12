import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocale } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("auth.reset");
  return { title: t("title"), description: t("lead") };
}

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth");
  return (
    <section className="desk hairline py-(--section-gap)">
      <div className="container">
        <SectionHeading
          level={1}
          title={t("reset.title")}
          lead={t("reset.lead")}
        />
        <AuthCard>
          <Suspense fallback={<AuthCardFallback />}>
            <ResetPasswordPanel />
          </Suspense>
        </AuthCard>
      </div>
    </section>
  );
}

/**
 * The recovery session was established by /auth/confirm before this page
 * opened. Without it there is nothing to reset: instead of a redirect loop,
 * the visitor is told to request a fresh recovery email.
 */
async function ResetPasswordPanel() {
  const t = await getTranslations("auth");
  const locale = await getLocale();
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="grid gap-(--space-md)">
        <p role="alert" className="form-alert form-alert--error">
          {t("notices.recoveryExpired")}
        </p>
        <p className="text-sm">
          <Link className="underline" href="/forgot-password">
            {t("reset.backToForgot")}
          </Link>
        </p>
      </div>
    );
  }

  return <ResetPasswordForm locale={locale} />;
}

function AuthCardFallback() {
  return <div className="well h-56 animate-pulse" aria-hidden="true" />;
}
