/**
 * Contentstack SDK Client
 * ──────────────────────────────────────────────────────────
 * Single shared instance of the Contentstack Delivery SDK.
 * Imported by the API layer (./api.ts) — never used directly
 * in components.
 *
 * Environment variables are validated at startup so you get a
 * clear error message instead of a cryptic SDK failure.
 */

import contentstack, { Region } from "@contentstack/delivery-sdk";

// ── Validate required env vars ──────────────────────────────

const apiKey = process.env.CONTENTSTACK_API_KEY;
const deliveryToken = process.env.CONTENTSTACK_DELIVERY_TOKEN;
const environment = process.env.CONTENTSTACK_ENVIRONMENT;

if (!apiKey || !deliveryToken || !environment) {
  throw new Error(
    [
      "Missing required Contentstack environment variables.",
      "Ensure the following are set in .env.local:",
      "  CONTENTSTACK_API_KEY",
      "  CONTENTSTACK_DELIVERY_TOKEN",
      "  CONTENTSTACK_ENVIRONMENT",
    ].join("\n"),
  );
}

// ── Map region string to SDK enum ───────────────────────────

function resolveRegion(regionStr?: string): Region {
  const map: Record<string, Region> = {
    us: Region.US,
    eu: Region.EU,
    azure_na: Region.AZURE_NA,
    azure_eu: Region.AZURE_EU,
  };
  return map[regionStr?.toLowerCase() ?? "us"] ?? Region.US;
}

// ── Create and export the stack client ──────────────────────

const stack = contentstack.stack({
  apiKey,
  deliveryToken,
  environment,
  region: resolveRegion(process.env.CONTENTSTACK_REGION),
  ...(process.env.CONTENTSTACK_BRANCH && {
    branch: process.env.CONTENTSTACK_BRANCH,
  }),
});

export default stack;
