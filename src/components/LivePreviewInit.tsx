"use client";

import { useEffect } from "react";
import ContentstackLivePreview from "@contentstack/live-preview-utils";
import browserStack from "@/lib/contentstack-client-browser";

const REGION_HOST: Record<string, string> = {
  us: "app.contentstack.com",
  eu: "eu-app.contentstack.com",
  azure_na: "azure-na-app.contentstack.com",
  azure_eu: "azure-eu-app.contentstack.com",
};

/**
 * Client component that initialises the Contentstack Live
 * Preview SDK in CSR mode. Renders nothing — just sets up
 * the communication channel between Contentstack UI and the
 * preview iframe.
 *
 * In CSR mode the SDK patches content client-side via
 * onEntryChange without reloading the page, enabling
 * Visual Builder inline editing.
 */
export default function LivePreviewInit() {
  useEffect(() => {
    const region = (process.env.NEXT_PUBLIC_CONTENTSTACK_REGION ?? "us").toLowerCase();

    ContentstackLivePreview.init({
      enable: true,
      ssr: false,
      mode: "builder",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stackSdk: browserStack.config as any,
      stackDetails: {
        apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY!,
        environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT!,
      },
      editButton: {
        enable: true,
        position: "top-right",
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
