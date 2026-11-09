import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

/** Letter close: one line at reading size, then the real links, then the notes. */
export async function SiteFooter() {
  const t = await getTranslations("footer");

  const links = [
    { href: "/recipes", key: "recipes" },
    { href: "/guides", key: "guides" },
    { href: "/how-it-works", key: "howItWorks" },
    { href: "/about", key: "about" },
    { href: "/privacy", key: "privacy" },
    { href: "/terms", key: "terms" },
  ] as const;

  return (
    <footer className="hairline mt-(--section-gap) py-(--section-gap-s)">
      <div className="container">
        <p className="font-display text-section leading-tight text-(--color-ink)">
          {t("closing")}
        </p>

        <nav
          className="mt-(--space-xl) flex flex-wrap gap-(--space-sm)"
          aria-label={t("navLabel")}
        >
          {links.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-11 items-center rounded-(--radius-input) px-(--space-xs) whitespace-nowrap text-(--color-ink-2) hover:text-(--color-ink)"
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <p className="mt-(--space-lg) text-sm leading-relaxed text-(--color-muted)">
          {t("sampleNote")}
        </p>
        <p className="mt-(--space-xs) text-sm leading-relaxed text-(--color-muted)">
          {t("builtNote")}
        </p>
      </div>
    </footer>
  );
}
