"use client";

/**
 * Client-side Live Preview Integration
 * ──────────────────────────────────────────────────────────
 * The live-preview-utils SDK expects a `stackSdk` object with
 * a mutable `live_preview` property at the top level. When
 * content changes, it writes the preview hash, content type
 * UID, and entry UID into `stackSdk.live_preview`.
 *
 * We create a plain object that satisfies this contract, then
 * read the mutated values when onEntryChange fires to pass
 * them to our /api/preview server route.
 */

import ContentstackLivePreview from "@contentstack/live-preview-utils";

const regionStr = process.env.NEXT_PUBLIC_CONTENTSTACK_REGION ?? "us";

function appHost(r: string): string {
  const map: Record<string, string> = {
    us: "app.contentstack.com",
    eu: "eu-app.contentstack.com",
    azure_na: "azure-na-app.contentstack.com",
    azure_eu: "azure-eu-app.contentstack.com",
  };
  return map[r.toLowerCase()] ?? "app.contentstack.com";
}

// ── Mutable stackSdk object ─────────────────────────────────
// The live-preview-utils SDK writes preview hash and UIDs here

export const stackSdkProxy = {
  live_preview: {
    enable: true,
    hash: "",
    live_preview: "",
    content_type_uid: "",
    entry_uid: "",
  } as Record<string, unknown>,
  environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT!,
};

// ── Initialize Live Preview Utils ───────────────────────────

let initialized = false;

export function initLivePreview() {
  if (initialized) return;
  initialized = true;

  ContentstackLivePreview.init({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stackSdk: stackSdkProxy as any,
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

// ── Helper to get current preview hash ──────────────────────

export function getPreviewHash(): string {
  return (stackSdkProxy.live_preview.live_preview as string) ||
         (stackSdkProxy.live_preview.hash as string) ||
         "";
}

export function getPreviewContentTypeUid(): string {
  return (stackSdkProxy.live_preview.content_type_uid as string) || "";
}

export function getPreviewEntryUid(): string {
  return (stackSdkProxy.live_preview.entry_uid as string) || "";
}

// ── Re-export onEntryChange ─────────────────────────────────

export const onEntryChange = ContentstackLivePreview.onEntryChange;
