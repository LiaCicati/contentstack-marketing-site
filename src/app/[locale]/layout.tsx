/**
 * Locale Layout
 * ──────────────────────────────────────────────────────────
 * Handles both default locale (en-us, no prefix) and
 * non-default locales (e.g. /it-it/...).
 *
 * The [locale] segment captures:
 *  - "en-us" or "it-it" for locale homepages
 *  - The first slug segment for English pages (e.g. "about")
 *
 * We distinguish between them in the page components.
 */

import { getLayoutData } from "@/lib/api";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import LivePreviewInit from "@/components/LivePreviewInit";
import { isValidLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

export const revalidate = 60;

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: localeParam } = await params;

  // Determine the actual locale
  const locale: Locale = isValidLocale(localeParam) ? localeParam : DEFAULT_LOCALE;

  const { settings, navigation } = await getLayoutData(locale);

  return (
    <html lang={locale.split("-")[0]}>
      <body className="flex min-h-screen flex-col">
        {navigation && settings && (
          <Navigation
            navigation={navigation}
            siteName={settings.site_name}
            logo={settings.logo}
            locale={locale}
          />
        )}

        <main className="flex-1">{children}</main>

        {settings && <Footer settings={settings} />}
        <LivePreviewInit />
      </body>
    </html>
  );
}
