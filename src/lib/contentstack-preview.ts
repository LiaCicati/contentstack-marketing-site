"use client";

/**
 * Client-side Contentstack SDK + Live Preview
 * ──────────────────────────────────────────────────────────
 * Used ONLY inside the Live Preview iframe. Creates a Stack
 * instance on the client and passes it to the Live Preview
 * Utils SDK so it can mutate the live_preview hash in-place
 * when content changes.
 *
 * This module is never imported on the server or in
 * production — it's only pulled in by PagePreview and
 * LivePreviewInit (both "use client" components).
 */

import contentstack, { Region } from "@contentstack/delivery-sdk";
import ContentstackLivePreview from "@contentstack/live-preview-utils";

// ── Region mappings ─────────────────────────────────────────

const regionStr = process.env.NEXT_PUBLIC_CONTENTSTACK_REGION ?? "us";

function resolveRegion(r: string): Region {
  const map: Record<string, Region> = {
    us: Region.US,
    eu: Region.EU,
    azure_na: Region.AZURE_NA,
    azure_eu: Region.AZURE_EU,
  };
  return map[r.toLowerCase()] ?? Region.US;
}

function previewHost(r: string): string {
  const map: Record<string, string> = {
    us: "rest-preview.contentstack.com",
    eu: "eu-rest-preview.contentstack.com",
    azure_na: "azure-na-rest-preview.contentstack.com",
    azure_eu: "azure-eu-rest-preview.contentstack.com",
  };
  return map[r.toLowerCase()] ?? "rest-preview.contentstack.com";
}

function appHost(r: string): string {
  const map: Record<string, string> = {
    us: "app.contentstack.com",
    eu: "eu-app.contentstack.com",
    azure_na: "azure-na-app.contentstack.com",
    azure_eu: "azure-eu-app.contentstack.com",
  };
  return map[r.toLowerCase()] ?? "app.contentstack.com";
}

// ── Client-side Stack with Live Preview enabled ─────────────

export const previewStack = contentstack.stack({
  apiKey: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY!,
  deliveryToken: process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN!,
  environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT!,
  region: resolveRegion(regionStr),
  live_preview: {
    enable: true,
    preview_token: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN!,
    host: previewHost(regionStr),
  },
});

// ── Initialize Live Preview Utils with stackSdk ─────────────

let initialized = false;

export function initLivePreview() {
  if (initialized) return;
  initialized = true;

  ContentstackLivePreview.init({
    // @ts-expect-error - SDK types differ but runtime is compatible
    stackSdk: previewStack,
    enable: true,
    ssr: false,
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
      host: appHost(regionStr),
      port: 443,
    },
  });
}

// ── Re-export onEntryChange ─────────────────────────────────

export const onEntryChange = ContentstackLivePreview.onEntryChange;
