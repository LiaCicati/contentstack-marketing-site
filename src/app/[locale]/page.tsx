/**
 * This route handles:
 *  - /it-it         → Italian homepage (locale="it-it")
 *  - /about         → English "about" page (locale="about", not a real locale)
 *  - /pricing       → English "pricing" page
 *
 * We check if [locale] is a valid locale code. If yes, render
 * the homepage for that locale. If not, treat it as an English
 * page slug.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageByUrl, getAllPageUrls, getLayoutData } from "@/lib/api";
import SectionRenderer from "@/components/sections/SectionRenderer";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import LivePreviewInit from "@/components/LivePreviewInit";
import { isValidLocale, DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/i18n";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateStaticParams() {
  const params: { locale: string }[] = [];

  // Non-default locale homepages: /it-it
  for (const loc of LOCALES) {
    if (loc !== DEFAULT_LOCALE) {
      params.push({ locale: loc });
    }
  }

  // English top-level pages: /about, /pricing, /contact
  const urls = await getAllPageUrls(DEFAULT_LOCALE);
  for (const url of urls) {
    if (url === "/") continue;
    const segments = url.replace(/^\//, "").split("/");
    if (segments.length === 1) {
      params.push({ locale: segments[0] });
    }
  }

  return params;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const sp = await searchParams;

  let locale: Locale;
  let url: string;

  if (isValidLocale(localeParam) && localeParam !== DEFAULT_LOCALE) {
    locale = localeParam;
    url = "/";
  } else {
    locale = DEFAULT_LOCALE;
    url = `/${localeParam}`;
  }

  const page = await getPageByUrl(url, locale, sp);
  if (!page) return {};

  return {
    title: page.seo?.meta_title ?? page.title,
    description: page.seo?.meta_description,
  };
}

export default async function LocalePage({ params, searchParams }: PageProps) {
  const { locale: localeParam } = await params;
  const sp = await searchParams;

  let locale: Locale;
  let url: string;

  if (isValidLocale(localeParam) && localeParam !== DEFAULT_LOCALE) {
    // e.g. /it-it → Italian homepage
    locale = localeParam;
    url = "/";
  } else {
    // e.g. /about → English page with slug "about"
    locale = DEFAULT_LOCALE;
    url = `/${localeParam}`;
  }

  const [page, { settings, navigation }] = await Promise.all([
    getPageByUrl(url, locale, sp),
    getLayoutData(locale, sp),
  ]);
  if (!page) notFound();

  return (
    <>
      {navigation && settings && (
        <Navigation
          navigation={navigation}
          siteName={settings.site_name}
          logo={settings.logo}
          locale={locale}
        />
      )}
      <main className="flex-1">
        <SectionRenderer sections={page.sections} editTags={page.$} />
      </main>
      {settings && <Footer settings={settings} />}
      <LivePreviewInit />
    </>
  );
}
