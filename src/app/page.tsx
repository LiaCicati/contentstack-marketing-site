/**
 * English Home Page (route: /)
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageByUrl, getLayoutData } from "@/lib/api";
import SectionRenderer from "@/components/sections/SectionRenderer";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import LivePreviewInit from "@/components/LivePreviewInit";
import { DEFAULT_LOCALE } from "@/lib/i18n";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const page = await getPageByUrl("/", DEFAULT_LOCALE, sp);
  if (!page) return {};

  return {
    title: page.seo?.meta_title ?? page.title,
    description: page.seo?.meta_description,
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const [page, { settings, navigation }] = await Promise.all([
    getPageByUrl("/", DEFAULT_LOCALE, sp),
    getLayoutData(DEFAULT_LOCALE, sp),
  ]);

  if (!page) notFound();

  return (
    <>
      {navigation && settings && (
        <Navigation
          navigation={navigation}
          siteName={settings.site_name}
          logo={settings.logo}
          locale={DEFAULT_LOCALE}
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
