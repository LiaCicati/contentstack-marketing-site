/**
 * CMS API Layer
 * ──────────────────────────────────────────────────────────
 * All Contentstack queries live here.  Components and pages
 * import these functions — they never touch the SDK directly.
 *
 * Benefits:
 *  • Single place to add caching, error handling, logging
 *  • Easy to swap CMS providers later (just rewrite this file)
 *  • Queries are typed end-to-end
 *
 * SDK notes (@contentstack/delivery-sdk v4):
 *  • includeReference() lives on Entry/Entries, not on Query
 *  • where() requires a QueryOperation enum as the 2nd arg
 *  • There is no findOne() — use find() and take the first entry
 *  • There is no toJSON() — entries are returned as plain objects
 */

import stack from "./contentstack-client";
import { QueryOperation } from "@contentstack/delivery-sdk";
import type {
  Page,
  Navigation,
  SiteSettings,
} from "@/types/contentstack";

// ─────────────────────────────────────────────────────────────
// Pages
// ─────────────────────────────────────────────────────────────

/**
 * Fetch a single page by its URL slug.
 * Resolves testimonial references one level deep.
 *
 * @example
 *   const page = await getPageByUrl("/solutions/enterprise");
 */
export async function getPageByUrl(url: string): Promise<Page | null> {
  try {
    const result = await stack
      .contentType("page")
      .entry()
      .includeReference(
        "sections.testimonials.testimonial_entries",
      )
      .query()
      .where("url", QueryOperation.EQUALS, url)
      .find();

    const entries = (result.entries ?? []) as unknown as Page[];
    return entries[0] ?? null;
  } catch {
    // Contentstack throws on 0 results — treat as "not found"
    return null;
  }
}

/**
 * Fetch all page entries — used to generate static paths
 * at build time (getStaticPaths / generateStaticParams).
 *
 * Only requests the `url` field to keep the response small.
 */
export async function getAllPageUrls(): Promise<string[]> {
  try {
    const result = await stack
      .contentType("page")
      .entry()
      .only(["url"])
      .query()
      .find();

    const entries = (result.entries ?? []) as unknown as Page[];
    return entries.map((e) => e.url);
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────

/**
 * Fetch the navigation singleton.
 * Resolves page references so we can read each page's `url`
 * field to build <Link href="..."> values.
 */
export async function getNavigation(): Promise<Navigation | null> {
  try {
    const result = await stack
      .contentType("navigation")
      .entry()
      .includeReference(
        "nav_items.page_reference",
        "nav_items.children.page_reference",
      )
      .query()
      .find();

    const entries = (result.entries ?? []) as unknown as Navigation[];
    return entries[0] ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Site Settings (global chrome)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch the site-settings singleton.
 * Resolves the main_navigation reference so we get the full
 * nav tree in a single API call from the layout.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const result = await stack
      .contentType("site_settings")
      .entry()
      .includeReference("main_navigation")
      .query()
      .find();

    const entries = (result.entries ?? []) as unknown as SiteSettings[];
    return entries[0] ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Combined layout data
// ─────────────────────────────────────────────────────────────

export interface LayoutData {
  settings: SiteSettings | null;
  navigation: Navigation | null;
}

/**
 * Fetch everything the layout shell needs in parallel.
 * Called once per request in the root layout (App Router)
 * or in getStaticProps (Pages Router).
 */
export async function getLayoutData(): Promise<LayoutData> {
  const [settings, navigation] = await Promise.all([
    getSiteSettings(),
    getNavigation(),
  ]);
  return { settings, navigation };
}
