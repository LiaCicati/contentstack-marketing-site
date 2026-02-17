/**
 * Browser-side Contentstack Stack instance
 * ──────────────────────────────────────────────────────────
 * Used by client components for CSR Live Preview.
 * The Live Preview SDK needs a reference to this stack's
 * internal state so it can update the live_preview hash
 * when the editor makes changes.
 */

import contentstack, { Region } from "@contentstack/delivery-sdk";

const apiKey = process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY!;
const deliveryToken = process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN!;
const environment = process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT!;
const previewToken = process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN ?? "";
const regionStr = (process.env.NEXT_PUBLIC_CONTENTSTACK_REGION ?? "us").toLowerCase();

function resolveRegion(r: string): Region {
  const map: Record<string, Region> = {
    us: Region.US,
    eu: Region.EU,
    azure_na: Region.AZURE_NA,
    azure_eu: Region.AZURE_EU,
  };
  return map[r] ?? Region.US;
}

function previewHost(r: string): string {
  const map: Record<string, string> = {
    us: "rest-preview.contentstack.com",
    eu: "eu-rest-preview.contentstack.com",
    azure_na: "azure-na-rest-preview.contentstack.com",
    azure_eu: "azure-eu-rest-preview.contentstack.com",
  };
  return map[r] ?? "rest-preview.contentstack.com";
}

const browserStack = contentstack.stack({
  apiKey,
  deliveryToken,
  environment,
  region: resolveRegion(regionStr),
  live_preview: {
    enable: true,
    preview_token: previewToken,
    host: previewHost(regionStr),
  },
});

export default browserStack;
