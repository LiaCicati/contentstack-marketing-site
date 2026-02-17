/**
 * Contentstack SDK Client — Factory
 * ──────────────────────────────────────────────────────────
 * Creates a fresh Contentstack Delivery SDK instance per
 * request. This is required for Live Preview because the SDK
 * stores the preview hash internally — sharing an instance
 * across requests would leak preview state between users.
 *
 * For normal (non-preview) rendering a shared instance is
 * also exported for convenience (used by generateStaticParams).
 */

import contentstack, { Region } from "@contentstack/delivery-sdk";

// ── Validate required env vars ──────────────────────────────

const apiKey = process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY!;
const deliveryToken = process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN!;
const environment = process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT!;
const previewToken = process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN ?? "";
const regionStr = process.env.NEXT_PUBLIC_CONTENTSTACK_REGION ?? "us";

if (!apiKey || !deliveryToken || !environment) {
  throw new Error(
    [
      "Missing required Contentstack environment variables.",
      "Ensure the following are set in .env.local:",
      "  NEXT_PUBLIC_CONTENTSTACK_API_KEY",
      "  NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN",
      "  NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT",
    ].join("\n"),
  );
}

// ── Map region string to SDK enum ───────────────────────────

function resolveRegion(r: string): Region {
  const map: Record<string, Region> = {
    us: Region.US,
    eu: Region.EU,
    azure_na: Region.AZURE_NA,
    azure_eu: Region.AZURE_EU,
  };
  return map[r.toLowerCase()] ?? Region.US;
}

const region = resolveRegion(regionStr);

// ── Preview host per region ─────────────────────────────────

function previewHost(r: string): string {
  const map: Record<string, string> = {
    us: "rest-preview.contentstack.com",
    eu: "eu-rest-preview.contentstack.com",
    azure_na: "azure-na-rest-preview.contentstack.com",
    azure_eu: "azure-eu-rest-preview.contentstack.com",
  };
  return map[r.toLowerCase()] ?? "rest-preview.contentstack.com";
}

// ── Factory: new stack per request (for Live Preview) ───────

export function createStack() {
  return contentstack.stack({
    apiKey,
    deliveryToken,
    environment,
    region,
    live_preview: {
      enable: true,
      preview_token: previewToken,
      host: previewHost(regionStr),
    },
  });
}

// ── Shared singleton (for static generation helpers) ────────

const stack = contentstack.stack({
  apiKey,
  deliveryToken,
  environment,
  region,
});

export default stack;

// ── Re-export constants for client components ───────────────

export { apiKey, environment, regionStr };
