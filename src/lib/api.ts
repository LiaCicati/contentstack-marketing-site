/**
 * CMS API Layer
 * ──────────────────────────────────────────────────────────
 * All Contentstack queries live here. Every function accepts
 * an optional `locale` parameter that defaults to "en-us".
 */

import stack from "./contentstack-client";
import { QueryOperation } from "@contentstack/delivery-sdk";
import type {
  Page,
  Navigation,
  SiteSettings,
} from "@/types/contentstack";
import { DEFAULT_LOCALE, type Locale } from "./i18n";

// ─────────────────────────────────────────────────────────────
// Pages
// ─────────────────────────────────────────────────────────────

export async function getPageByUrl(
  url: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Page | null> {
  try {
    const result = await stack
      .contentType("page")
      .entry()
      .locale(locale)
      .includeReference("sections.testimonials.testimonial_entries")
      .query()
      .where("url", QueryOperation.EQUALS, url)
      .find();

    const entries = (result.entries ?? []) as unknown as Page[];
    return entries[0] ?? null;
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
): Promise<Navigation | null> {
  try {
    const result = await stack
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
): Promise<SiteSettings | null> {
  try {
    const result = await stack
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
): Promise<LayoutData> {
  const [settings, navigation] = await Promise.all([
    getSiteSettings(locale),
    getNavigation(locale),
  ]);
  return { settings, navigation };
}
