/**
 * English Home Page (route: /)
 * Redirects rendering to the locale-aware layout by fetching
 * with the default locale.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageByUrl, getLayoutData } from "@/lib/api";
import SectionRenderer from "@/components/sections/SectionRenderer";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { DEFAULT_LOCALE } from "@/lib/i18n";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByUrl("/", DEFAULT_LOCALE);
  if (!page) return {};

  return {
    title: page.seo?.meta_title ?? page.title,
    description: page.seo?.meta_description,
  };
}

export default async function HomePage() {
  const [page, { settings, navigation }] = await Promise.all([
    getPageByUrl("/", DEFAULT_LOCALE),
    getLayoutData(DEFAULT_LOCALE),
  ]);

  if (!page) notFound();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        {navigation && settings && (
          <Navigation
            navigation={navigation}
            siteName={settings.site_name}
            logo={settings.logo}
            locale={DEFAULT_LOCALE}
          />
        )}
        <main className="flex-1">
          <SectionRenderer sections={page.sections} />
        </main>
        {settings && <Footer settings={settings} />}
      </body>
    </html>
  );
}
