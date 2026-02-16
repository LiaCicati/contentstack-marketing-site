/**
 * Home Page  (route: /)
 * ──────────────────────────────────────────────────────────
 * Fetches the page entry whose URL is "/" and renders its
 * modular sections. Uses the same SectionRenderer as every
 * other page — the home page has no special treatment.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageByUrl } from "@/lib/api";
import SectionRenderer from "@/components/sections/SectionRenderer";

// ISR: re-generate at most every 60 seconds
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByUrl("/");
  if (!page) return {};

  return {
    title: page.seo?.meta_title ?? page.title,
    description: page.seo?.meta_description,
    openGraph: {
      title: page.seo?.meta_title ?? page.title,
      description: page.seo?.meta_description ?? undefined,
      images: page.seo?.og_image?.url ? [page.seo.og_image.url] : undefined,
    },
  };
}

export default async function HomePage() {
  const page = await getPageByUrl("/");
  if (!page) notFound();

  return <SectionRenderer sections={page.sections} />;
}
