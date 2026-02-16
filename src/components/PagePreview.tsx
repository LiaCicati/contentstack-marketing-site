"use client";

import { useState, useEffect, useCallback } from "react";
import {
  onEntryChange,
  initLivePreview,
  getPreviewHash,
  getPreviewContentTypeUid,
  getPreviewEntryUid,
} from "@/lib/contentstack-preview";
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
 * field, the live-preview-utils SDK updates the hash in our
 * stackSdkProxy, then fires this callback. We read the
 * mutated hash and pass it to /api/preview which fetches
 * draft content server-side.
 */
export default function PagePreview({ initialSections, pageUrl, locale }: Props) {
  const [sections, setSections] = useState<PageSection[]>(initialSections);

  const fetchPage = useCallback(async () => {
    try {
      const hash = getPreviewHash();
      const contentTypeUid = getPreviewContentTypeUid();
      const entryUid = getPreviewEntryUid();

      // Build query params for the server-side preview route
      const params = new URLSearchParams();
      params.set("url", pageUrl);
      params.set("locale", locale);
      if (hash) params.set("live_preview", hash);
      if (contentTypeUid) params.set("content_type_uid", contentTypeUid);
      if (entryUid) params.set("entry_uid", entryUid);

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
    // Ensure Live Preview SDK is initialized before subscribing
    initLivePreview();
    // Subscribe to content changes — fires on every field edit
    onEntryChange(fetchPage);
  }, [fetchPage]);

  return <SectionRenderer sections={sections} />;
}
