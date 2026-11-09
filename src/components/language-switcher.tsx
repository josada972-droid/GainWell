"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Two stops pressed into cotton. Navigating to the other locale is what persists
 * the choice: src/proxy.ts refreshes the NEXT_LOCALE cookie on that request.
 */
export function LanguageSwitcher({
  layout = "row",
}: {
  layout?: "row" | "stack";
}) {
  const t = useTranslations("lang");
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "groove",
        layout === "row" ? "flex" : "flex-col gap-(--space-3xs)",
      )}
    >
      {routing.locales.map((option) => (
        <Link
          key={option}
          href={pathname}
          locale={option}
          aria-current={option === locale ? "true" : undefined}
          className={cn("groove__stop", layout === "stack" && "min-h-11")}
        >
          {t(option)}
        </Link>
      ))}
    </div>
  );
}
