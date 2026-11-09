import { Inter, Nunito } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { routing } from "@/i18n/routing";

import "@/app/globals.css";

// Nunito carries headings, Inter carries body text (AGENTS.md §7).
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-nunito",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata() {
  const t = await getTranslations("brand");
  return {
    title: { default: t("name"), template: "%s · GainWell" },
    description: t("tagline"),
  };
}

export default async function RootLayout({
  children,
}: LayoutProps<"/[locale]">) {
  // The locale comes from the [locale] segment through next-intl's request
  // config, which reads next/root-params. No prop drilling, no setRequestLocale.
  const locale = await getLocale();
  const t = await getTranslations("nav");

  return (
    <html
      lang={locale}
      className={`overflow-x-clip ${nunito.variable} ${inter.variable}`}
    >
      <body className="overflow-x-clip">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="visually-hidden focus:not-sr-only focus:absolute focus:top-(--space-xs) focus:left-(--space-xs) focus:z-(--z-sticky-nav) focus:rounded-(--radius-input) focus:bg-(--color-cotton) focus:px-(--space-md) focus:py-(--space-xs)"
          >
            {t("skipToContent")}
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// Cache Components needs a value for every root parameter, so both locales are
// pre-rendered. Locale detection and redirects happen in src/proxy.ts.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
