/**
 * Dynamic Catch-All Page  (route: /about, /pricing, /solutions/enterprise, etc.)
 * ──────────────────────────────────────────────────────────
 * This single route handles ALL marketing pages.
 *
 * How it works:
 *  1. `generateStaticParams` calls `getAllPageUrls()` at build time
 *     and pre-renders every page entry.
 *  2. At runtime, the slug segments are joined back into a URL
 *     (e.g. ["solutions", "enterprise"] → "/solutions/enterprise")
 *     and used to fetch the matching page entry.
 *  3. `SectionRenderer` maps the modular blocks to components.
 *
 * Adding a new page:
 *  • An editor creates a new Page entry in Contentstack with
 *    url="/new-page" and adds sections.
 *  • On next build (or ISR revalidation), the page appears
 *    automatically — no code change needed.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageByUrl, getAllPageUrls } from "@/lib/api";
import SectionRenderer from "@/components/sections/SectionRenderer";

// ISR: re-generate at most every 60 seconds
export const revalidate = 60;

// ── Static generation ────────────────────────────────────────

/**
 * Pre-render all known page URLs at build time.
 * Pages created after the build are handled by `fallback: "blocking"`
 * behavior (Next.js default in App Router with `dynamicParams = true`).
 */
export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const urls = await getAllPageUrls();

  return urls
    .filter((url) => url !== "/") // homepage is handled by /app/page.tsx
    .map((url) => ({
      slug: url.replace(/^\//, "").split("/"),
      // "/solutions/enterprise" → ["solutions", "enterprise"]
    }));
}

// ── Metadata ─────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const url = `/${slug.join("/")}`;
  const page = await getPageByUrl(url);
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

// ── Page component ───────────────────────────────────────────

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const url = `/${slug.join("/")}`;
  const page = await getPageByUrl(url);

  if (!page) notFound();

  return <SectionRenderer sections={page.sections} />;
}
