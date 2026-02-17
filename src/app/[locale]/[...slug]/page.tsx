/**
 * Handles:
 *  - /it-it/about              → Italian about page
 *  - /it-it/solutions/enterprise → Italian enterprise page
 *  - /solutions/enterprise     → English enterprise page (locale="solutions", slug=["enterprise"])
 *
 * When [locale] is not a valid locale code, we prepend it to
 * the slug to reconstruct the full English URL.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageByUrl, getAllPageUrls } from "@/lib/api";
import SectionRenderer from "@/components/sections/SectionRenderer";
import LivePreviewInit from "@/components/LivePreviewInit";
import { isValidLocale, DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/i18n";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ locale: string; slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateStaticParams() {
  const params: { locale: string; slug: string[] }[] = [];

  // Non-default locale pages: /it-it/about, /it-it/solutions/enterprise
  for (const loc of LOCALES) {
    if (loc === DEFAULT_LOCALE) continue;
    const urls = await getAllPageUrls(loc);
    for (const url of urls) {
      if (url === "/") continue;
      const segments = url.replace(/^\//, "").split("/");
      params.push({ locale: loc, slug: segments });
    }
  }

  // English multi-segment pages: /solutions/enterprise, /solutions/startups
  const enUrls = await getAllPageUrls(DEFAULT_LOCALE);
  for (const url of enUrls) {
    if (url === "/") continue;
    const segments = url.replace(/^\//, "").split("/");
    if (segments.length >= 2) {
      // [locale] captures first segment, [...slug] captures the rest
      params.push({ locale: segments[0], slug: segments.slice(1) });
    }
  }

  return params;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const sp = await searchParams;

  let locale: Locale;
  let url: string;

  if (isValidLocale(localeParam) && localeParam !== DEFAULT_LOCALE) {
    locale = localeParam;
    url = `/${slug.join("/")}`;
  } else {
    locale = DEFAULT_LOCALE;
    url = `/${localeParam}/${slug.join("/")}`;
  }

  const page = await getPageByUrl(url, locale, sp);
  if (!page) return {};

  return {
    title: page.seo?.meta_title ?? page.title,
    description: page.seo?.meta_description,
  };
}

export default async function LocaleSlugPage({ params, searchParams }: PageProps) {
  const { locale: localeParam, slug } = await params;
  const sp = await searchParams;

  let locale: Locale;
  let url: string;

  if (isValidLocale(localeParam) && localeParam !== DEFAULT_LOCALE) {
    // e.g. /it-it/about → locale=it-it, url=/about
    locale = localeParam;
    url = `/${slug.join("/")}`;
  } else {
    // e.g. /solutions/enterprise → locale=solutions (not valid), reconstruct url
    locale = DEFAULT_LOCALE;
    url = `/${localeParam}/${slug.join("/")}`;
  }

  const isPreview = !!sp?.live_preview;
  const page = await getPageByUrl(url, locale, sp);
  if (!page) notFound();

  return (
    <>
      <SectionRenderer sections={page.sections} editTags={page.$} />
      {isPreview && <LivePreviewInit />}
    </>
  );
}
