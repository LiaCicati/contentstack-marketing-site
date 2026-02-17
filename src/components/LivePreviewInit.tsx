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
 * In SSR mode the SDK reloads the page on every content
 * change so the server component re-fetches fresh data.
 */
export default function LivePreviewInit() {
  useEffect(() => {
    const region = (process.env.NEXT_PUBLIC_CONTENTSTACK_REGION ?? "us").toLowerCase();

    ContentstackLivePreview.init({
      enable: true,
      ssr: true, // SSR mode — triggers full page reload on edit
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
