"use client";

import { useEffect } from "react";
import ContentstackLivePreview from "@contentstack/live-preview-utils";

const REGION_HOST: Record<string, string> = {
  us: "app.contentstack.com",
  eu: "eu-app.contentstack.com",
  azure_na: "azure-na-app.contentstack.com",
  azure_eu: "azure-eu-app.contentstack.com",
};

/**
 * Client component that initialises the Contentstack Live
 * Preview SDK. Renders nothing — just sets up the
 * communication channel between Contentstack UI and the
 * preview iframe.
 *
 * Always rendered on every page but only initialises the SDK
 * when inside an iframe (i.e. the CMS preview panel). This
 * ensures edit buttons never appear on the public site while
 * remaining fully functional inside the CMS — even after SSR
 * reloads that strip query parameters.
 */
export default function LivePreviewInit() {
  useEffect(() => {
    // Only init when loaded inside the CMS preview iframe.
    // On the public site (top-level window) we skip entirely
    // so no edit button or SDK UI appears.
    if (typeof window !== "undefined" && window.self === window.top) {
      return;
    }

    const region = (process.env.NEXT_PUBLIC_CONTENTSTACK_REGION ?? "us").toLowerCase();

    ContentstackLivePreview.init({
      enable: true,
      ssr: true,
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
        host: REGION_HOST[region] ?? REGION_HOST.us,
        port: 443,
      },
    });
  }, []);

  return null;
}
