/**
 * Preview API Route
 * ──────────────────────────────────────────────────────────
 * Server-side endpoint that fetches page data using the
 * preview token. Called by the PagePreview client component
 * when Contentstack fires onEntryChange.
 *
 * GET /api/preview?url=/about&locale=en-us&live_preview=HASH&content_type_uid=page&entry_uid=blt...
 */

import { NextRequest, NextResponse } from "next/server";
import { createStack } from "@/lib/contentstack-client";
import { QueryOperation } from "@contentstack/delivery-sdk";
import type { Page } from "@/types/contentstack";
import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const url = searchParams.get("url") || "/";
  const localeParam = searchParams.get("locale") || DEFAULT_LOCALE;
  const locale: Locale = isValidLocale(localeParam) ? localeParam : DEFAULT_LOCALE;

  // Build the live preview query object from search params
  const livePreviewHash = searchParams.get("live_preview");

  try {
    const stack = createStack();

    if (livePreviewHash) {
      // Pass all relevant params for live preview
      const previewQuery: Record<string, string> = {
        live_preview: livePreviewHash,
      };
      const contentTypeUid = searchParams.get("content_type_uid");
      const entryUid = searchParams.get("entry_uid");
      if (contentTypeUid) previewQuery.content_type_uid = contentTypeUid;
      if (entryUid) previewQuery.entry_uid = entryUid;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stack.livePreviewQuery(previewQuery as any);
    }

    const result = await stack
      .contentType("page")
      .entry()
      .locale(locale)
      .includeReference("sections.testimonials.testimonial_entries")
      .query()
      .where("url", QueryOperation.EQUALS, url)
      .find();

    const entries = (result.entries ?? []) as unknown as Page[];
    const page = entries[0] ?? null;

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
