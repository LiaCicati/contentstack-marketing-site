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
  PageSection,
  Navigation,
  SiteSettings,
  TestimonialsSection,
  ServiceCardsSection,
} from "@/types/contentstack";
import { DEFAULT_LOCALE, type Locale } from "./i18n";

// ── Search params type ────────────────────────────────────────
type SearchParams = { [key: string]: string | string[] | undefined };

function isPreview(sp?: SearchParams): boolean {
  return !!sp?.live_preview;
}

/**
 * Tag referenced entries inside page sections (testimonials, service cards).
 * These are separate content types so they need their own addEditableTags call.
 */
function tagReferencedEntries(page: Page, locale: string) {
  for (const section of page.sections) {
    const key = Object.keys(section)[0];
    const data = (section as Record<string, unknown>)[key];
    if (key === "testimonials") {
      const ts = data as TestimonialsSection;
      ts.testimonial_entries?.forEach((t) => {
        addEditableTags(t, "testimonial", true, locale);
      });
    } else if (key === "service_cards") {
      const sc = data as ServiceCardsSection;
      sc.cards?.forEach((c) => {
        addEditableTags(c, "service_card", true, locale);
      });
    }
  }
}

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
    if (page) {
      addEditableTags(page, "page", true, locale);
      tagReferencedEntries(page, locale);
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
    const nav = entries[0] ?? null;
    if (nav) {
      addEditableTags(nav, "navigation", true, locale);
    }
    return nav;
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
    const settings = entries[0] ?? null;
    if (settings) {
      addEditableTags(settings, "site_settings", true, locale);
    }
    return settings;
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
