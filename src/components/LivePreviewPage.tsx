"use client";

import { useState, useEffect, useCallback } from "react";
import ContentstackLivePreview from "@contentstack/live-preview-utils";
import { addEditableTags } from "@contentstack/utils";
import { QueryOperation } from "@contentstack/delivery-sdk";
import browserStack from "@/lib/contentstack-client-browser";
import SectionRenderer from "@/components/sections/SectionRenderer";
import type { Page, PageSection, EditTags } from "@/types/contentstack";
import type { Locale } from "@/lib/i18n";

interface Props {
  initialSections: PageSection[];
  initialEditTags?: EditTags;
  url: string;
  locale: Locale;
  contentTypeUid?: string;
}

/**
 * Client-side wrapper that handles CSR Live Preview updates.
 *
 * On mount, renders the server-fetched initial data.
 * When the editor changes content in the CMS, the SDK calls
 * onEntryChange → we re-fetch via the browser stack (which
 * has the updated live_preview hash) → re-render with new data.
 */
export default function LivePreviewPage({
  initialSections,
  initialEditTags,
  url,
  locale,
  contentTypeUid = "page",
}: Props) {
  const [sections, setSections] = useState<PageSection[]>(initialSections);
  const [editTags, setEditTags] = useState<EditTags | undefined>(initialEditTags);

  const fetchPage = useCallback(async () => {
    try {
      const result = await browserStack
        .contentType(contentTypeUid)
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
      const page = entries[0];
      if (page) {
        addEditableTags(page, contentTypeUid, true, locale);
        setSections(page.sections);
        setEditTags(page.$);
      }
    } catch (err) {
      console.error("[LivePreviewPage] Failed to fetch:", err);
    }
  }, [url, locale, contentTypeUid]);

  useEffect(() => {
    const cbUid = ContentstackLivePreview.onEntryChange(fetchPage);
    return () => {
      ContentstackLivePreview.unsubscribeOnEntryChange(cbUid);
    };
  }, [fetchPage]);

  return <SectionRenderer sections={sections} editTags={editTags} />;
}
