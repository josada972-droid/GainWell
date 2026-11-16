"use client";

import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils";

/** The real destinations of the public site, in reading order. */
const destinations = [
  { href: "/recipes", key: "recipes" },
  { href: "/guides", key: "guides" },
  { href: "/tracker", key: "tracker" },
  { href: "/how-it-works", key: "howItWorks" },
  { href: "/about", key: "about" },
  { href: "/login", key: "login" },
] as const;

/**
 * Three-part bar: wordmark, links, language selector. Below the wide-desktop
 * width (xl) the links and the language stops move behind a menu button, which
 * keeps the bar at two items on a 320 px screen and every target at 44 px.
 * Stage 4 added a sixth destination, so the six French labels no longer fit
 * at lg (1024 px); xl (1280 px) is where the inline nav takes over.
 */
export function SiteHeader() {
  const t = useTranslations("nav");
  const tBrand = useTranslations("brand");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const links = destinations.map(({ href, key }) => (
    <Link
      key={href}
      href={href}
      aria-current={isActive(href) ? "true" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center whitespace-nowrap rounded-(--radius-input) px-(--space-sm) text-(--color-ink-2)",
        isActive(href)
          ? "bg-(--color-sage) text-(--color-accent-ink)"
          : "hover:text-(--color-ink)",
      )}
    >
      {t(key)}
    </Link>
  ));

  return (
    <header className="sticky top-0 z-(--z-sticky-nav) border-b border-(--color-rule) bg-(--color-paper)">
      <div className="container flex min-h-16 items-center justify-between gap-(--space-sm)">
        <Link
          href="/"
          aria-label={t("homeAria")}
          className="inline-flex items-center gap-(--space-xs) font-display text-lg font-bold tracking-(--tracking-display) text-(--color-ink)"
        >
          <Leaf aria-hidden="true" className="size-5 text-(--color-green)" />
          {tBrand("name")}
        </Link>

        <nav
          className="hidden items-center gap-(--space-2xs) xl:flex"
          aria-label={t("menu")}
        >
          {links}
        </nav>

        <div className="flex items-center gap-(--space-sm)">
          <div className="hidden xl:block">
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-(--radius-input) border border-(--color-muted) text-(--color-ink) xl:hidden"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">
              {menuOpen ? t("closeMenu") : t("menu")}
            </span>
            {menuOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="site-menu"
          className="border-t border-(--color-rule) bg-(--color-paper-2) xl:hidden"
        >
          <nav
            className="container flex flex-col gap-(--space-2xs) py-(--space-sm)"
            aria-label={t("menu")}
          >
            {destinations.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "true" : undefined}
                onClick={() => setMenuOpen(false)}
                className="inline-flex min-h-11 items-center whitespace-nowrap rounded-(--radius-input) px-(--space-sm) text-(--color-ink-2) hover:text-(--color-ink)"
              >
                {t(key)}
              </Link>
            ))}
            <div className="pt-(--space-sm)">
              <LanguageSwitcher layout="stack" />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
