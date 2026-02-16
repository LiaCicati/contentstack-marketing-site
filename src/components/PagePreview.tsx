"use client";

import { useState, useEffect, useCallback } from "react";
import ContentstackLivePreview from "@contentstack/live-preview-utils";
import SectionRenderer from "@/components/sections/SectionRenderer";
import type { PageSection } from "@/types/contentstack";

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
 * field, this component re-fetches the page via /api/preview
 * and updates the sections in-place — no page reload.
 */
export default function PagePreview({ initialSections, pageUrl, locale }: Props) {
  const [sections, setSections] = useState<PageSection[]>(initialSections);

  const fetchPage = useCallback(async () => {
    try {
      // Grab the current URL's search params (contains live_preview hash etc.)
      const params = new URLSearchParams(window.location.search);
      params.set("url", pageUrl);
      params.set("locale", locale);

      const res = await fetch(`/api/preview?${params.toString()}`);
      if (!res.ok) return;

      const data = await res.json();
      if (data.page?.sections) {
        setSections(data.page.sections);
      }
    } catch (err) {
      console.error("[PagePreview] Failed to fetch preview data:", err);
    }
  }, [pageUrl, locale]);

  useEffect(() => {
    // Subscribe to content changes — fires on every field edit
    ContentstackLivePreview.onEntryChange(fetchPage);
  }, [fetchPage]);

  return <SectionRenderer sections={sections} />;
}
