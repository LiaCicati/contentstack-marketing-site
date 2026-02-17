"use client";

import { useEffect } from "react";

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
 * The SDK is dynamically imported only when the page is
 * inside an iframe (the CMS preview panel). On the public
 * site the module is never loaded, so no edit UI appears.
 */
export default function LivePreviewInit() {
  useEffect(() => {
    // Only load + init inside the CMS preview iframe.
    if (window.self === window.top) return;

    const region = (process.env.NEXT_PUBLIC_CONTENTSTACK_REGION ?? "us").toLowerCase();

    import("@contentstack/live-preview-utils").then(({ default: ContentstackLivePreview }) => {
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
    });
  }, []);

  return null;
}
