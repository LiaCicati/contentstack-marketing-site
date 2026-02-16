"use client";

import { useEffect } from "react";
import { initLivePreview } from "@/lib/contentstack-preview";

/**
 * Client component that initialises the Contentstack Live
 * Preview SDK in CSR mode. Must be rendered on any page
 * that uses PagePreview.
 */
export default function LivePreviewInit() {
  useEffect(() => {
    initLivePreview();
  }, []);

  return null;
}
