"use client";

import { useEffect } from "react";
import ContentstackLivePreview from "@contentstack/live-preview-utils";

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
        host: "eu-app.contentstack.com", // EU region
        port: 443,
      },
    });
  }, []);

  return null;
}
