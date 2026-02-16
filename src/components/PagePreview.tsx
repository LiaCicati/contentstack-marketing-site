"use client";

import { useState, useEffect, useCallback } from "react";
import {
  onEntryChange,
  initLivePreview,
  getPreviewHash,
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
 * Read content_type_uid and entry_uid from the URL search
 * params. The Live Preview SDK's INIT handshake adds these
 * to the iframe URL. Our proxy object might not capture them
 * because deepSignal creates its own copy.
 */
function getUrlParam(key: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(key) || "";
}

/**
 * Client wrapper around SectionRenderer that subscribes to
 * Contentstack's onEntryChange. When the editor modifies a
 * field, the live-preview-utils SDK updates the hash, then
 * fires this callback. We pass the hash + content_type_uid
 * to /api/preview which fetches draft content server-side.
 */
export default function PagePreview({ initialSections, pageUrl, locale }: Props) {
  const [sections, setSections] = useState<PageSection[]>(initialSections);

  const fetchPage = useCallback(async () => {
    try {
      // Get hash from proxy (SDK writes it there on each change)
      const hash = getPreviewHash();
      // Get content_type_uid and entry_uid from URL params (set by SDK INIT)
      const contentTypeUid = getUrlParam("content_type_uid") || "page";
      const entryUid = getUrlParam("entry_uid");

      if (!hash) return;

      // Build query params for the server-side preview route
      const params = new URLSearchParams();
      params.set("url", pageUrl);
      params.set("locale", locale);
      params.set("live_preview", hash);
      params.set("content_type_uid", contentTypeUid);
      if (entryUid) params.set("entry_uid", entryUid);

      const res = await fetch(`/api/preview?${params.toString()}`);
      if (!res.ok) {
        console.error("[PagePreview] API returned", res.status);
        return;
      }

      const data = await res.json();
      if (data.page?.sections) {
        setSections(data.page.sections);
      }
    } catch (err) {
      console.error("[PagePreview] Failed to fetch preview data:", err);
    }
  }, [pageUrl, locale]);

  useEffect(() => {
    initLivePreview();
    onEntryChange(fetchPage);
  }, [fetchPage]);

  return <SectionRenderer sections={sections} />;
}
