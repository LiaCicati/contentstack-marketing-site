"use client";

import { useState, useEffect, useCallback } from "react";
import { QueryOperation } from "@contentstack/delivery-sdk";
import { previewStack, onEntryChange, initLivePreview } from "@/lib/contentstack-preview";
import SectionRenderer from "@/components/sections/SectionRenderer";
import type { Page, PageSection } from "@/types/contentstack";

interface Props {
  /** Initial sections from the server render */
  initialSections: PageSection[];
  /** CMS url field value, e.g. "/about" */
  pageUrl: string;
  /** Contentstack locale code */
  locale: string;
}

/**
 * Client wrapper around SectionRenderer that subscribes to
 * Contentstack's onEntryChange. When the editor modifies a
 * field, the SDK updates the preview hash on the shared
 * previewStack instance, then this callback re-fetches the
 * page and React re-renders the sections in-place.
 */
export default function PagePreview({ initialSections, pageUrl, locale }: Props) {
  const [sections, setSections] = useState<PageSection[]>(initialSections);

  const fetchPage = useCallback(async () => {
    try {
      const result = await previewStack
        .contentType("page")
        .entry()
        .locale(locale)
        .includeReference("sections.testimonials.testimonial_entries")
        .query()
        .where("url", QueryOperation.EQUALS, pageUrl)
        .find();

      const entries = (result.entries ?? []) as unknown as Page[];
      if (entries[0]?.sections) {
        setSections(entries[0].sections);
      }
    } catch (err) {
      console.error("[PagePreview] Failed to fetch preview data:", err);
    }
  }, [pageUrl, locale]);

  useEffect(() => {
    // Ensure Live Preview SDK is initialized before subscribing
    initLivePreview();
    // Subscribe to content changes — fires on every field edit
    onEntryChange(fetchPage);
  }, [fetchPage]);

  return <SectionRenderer sections={sections} />;
}
