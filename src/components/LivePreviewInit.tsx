"use client";

import { useEffect } from "react";
import ContentstackLivePreview from "@contentstack/live-preview-utils";

/**
 * Client component that initialises the Contentstack Live
 * Preview SDK in CSR mode. Content updates happen in-place
 * via onEntryChange (no page reload).
 */
export default function LivePreviewInit() {
  useEffect(() => {
    ContentstackLivePreview.init({
      enable: true,
      ssr: false, // CSR mode — in-place updates via onEntryChange
      editButton: {
        enable: true,
        position: "top-right",
      },
      stackDetails: {
        apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY!,
        environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT!,
      },
      clientUrlParams: {
        protocol: "https",
        host: "eu-app.contentstack.com", // EU region
        port: 443,
      },
    });
  }, []);

  return null;
}
