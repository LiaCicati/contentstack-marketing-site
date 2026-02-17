/**
 * CMS API Layer
 * ──────────────────────────────────────────────────────────
 * All Contentstack queries live here. Every function accepts
 * an optional `locale` parameter that defaults to "en-us"
 * and an optional `searchParams` for Live Preview support.
 */

import stack, { createStack } from "./contentstack-client";
import { QueryOperation } from "@contentstack/delivery-sdk";
import { addEditableTags } from "@contentstack/utils";
import type {
  Page,
  Navigation,
  SiteSettings,
} from "@/types/contentstack";
import { DEFAULT_LOCALE, type Locale } from "./i18n";

// ── Search params type ────────────────────────────────────────
type SearchParams = { [key: string]: string | string[] | undefined };

/**
 * Returns a stack instance configured for the current request.
 * When searchParams contain a live_preview hash, the SDK will
 * automatically fetch from the Preview API instead of Delivery.
 */
function getStack(searchParams?: SearchParams) {
  if (searchParams && searchParams.live_preview) {
    const s = createStack();
    // The SDK expects LivePreviewQuery but the runtime shape from
    // Next.js searchParams is compatible — cast to satisfy TS.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    s.livePreviewQuery(searchParams as any);
    return s;
  }
  return stack;
}

// ─────────────────────────────────────────────────────────────
// Pages
// ─────────────────────────────────────────────────────────────

export async function getPageByUrl(
  url: string,
  locale: Locale = DEFAULT_LOCALE,
  searchParams?: SearchParams,
): Promise<Page | null> {
  try {
    const s = getStack(searchParams);
    const result = await s
      .contentType("page")
      .entry()
      .locale(locale)
      .includeReference(
        "sections.testimonials.testimonial_entries",
        "sections.service_cards.cards",
      )
      .query()
      .where("url", QueryOperation.EQUALS, url)
      .find();

    const entries = (result.entries ?? []) as unknown as Page[];
    const page = entries[0] ?? null;
    if (page && searchParams?.live_preview) {
      addEditableTags(page, "page", true, locale);
    }
    return page;
  } catch {
    return null;
  }
}

export async function getAllPageUrls(
  locale: Locale = DEFAULT_LOCALE,
): Promise<string[]> {
  try {
    const result = await stack
      .contentType("page")
      .entry()
      .locale(locale)
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

export async function getNavigation(
  locale: Locale = DEFAULT_LOCALE,
  searchParams?: SearchParams,
): Promise<Navigation | null> {
  try {
    const s = getStack(searchParams);
    const result = await s
      .contentType("navigation")
      .entry()
      .locale(locale)
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
// Site Settings
// ─────────────────────────────────────────────────────────────

export async function getSiteSettings(
  locale: Locale = DEFAULT_LOCALE,
  searchParams?: SearchParams,
): Promise<SiteSettings | null> {
  try {
    const s = getStack(searchParams);
    const result = await s
      .contentType("site_settings")
      .entry()
      .locale(locale)
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

export async function getLayoutData(
  locale: Locale = DEFAULT_LOCALE,
  searchParams?: SearchParams,
): Promise<LayoutData> {
  const [settings, navigation] = await Promise.all([
    getSiteSettings(locale, searchParams),
    getNavigation(locale, searchParams),
  ]);
  return { settings, navigation };
}
