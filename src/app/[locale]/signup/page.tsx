import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { RedirectIfSignedIn } from "@/components/auth/session-gate";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("auth.signup");
  return { title: t("title"), description: t("lead") };
}

export default async function SignupPage() {
  const t = await getTranslations("auth");
  return (
    <section className="desk hairline py-(--section-gap)">
      <div className="container">
        <SectionHeading
          level={1}
          title={t("signup.title")}
          lead={t("signup.lead")}
        />
        <AuthCard>
          <Suspense fallback={<AuthCardFallback />}>
            <SignupPanel />
          </Suspense>
        </AuthCard>
      </div>
    </section>
  );
}

async function SignupPanel() {
  const t = await getTranslations("auth");
  const locale = await getLocale();
  return (
    <>
      <RedirectIfSignedIn />
      <SignupForm locale={locale} />
      <nav className="hairline mt-(--space-md) grid gap-(--space-3xs) pt-(--space-md) text-sm">
        <p>
          {t("signup.haveAccount")}{" "}
          <Link className="underline" href="/login">
            {t("signup.signInLink")}
          </Link>
        </p>
      </nav>
    </>
  );
}

function AuthCardFallback() {
  return <div className="well h-56 animate-pulse" aria-hidden="true" />;
}
