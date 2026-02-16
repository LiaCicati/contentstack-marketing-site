/**
 * Root Layout (App Router)
 * ──────────────────────────────────────────────────────────
 * Fetches global layout data (site settings + navigation)
 * once and wraps every page with the header and footer.
 *
 * This is a Server Component — the CMS call happens on the
 * server (or at build time with ISR). The Navigation
 * component is a Client Component for interactivity.
 */

import type { Metadata } from "next";
import { getLayoutData } from "@/lib/api";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import type { Navigation as NavData } from "@/types/contentstack";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acme Platform",
  description: "Build faster, scale smarter.",
};

// Revalidate layout data every 60 seconds (ISR)
export const revalidate = 60;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings, navigation } = await getLayoutData();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        {/* ── Header ──────────────────────────────────── */}
        {navigation && settings && (
          <Navigation
            navigation={navigation}
            siteName={settings.site_name}
            logo={settings.logo}
          />
        )}

        {/* ── Page content ────────────────────────────── */}
        <main className="flex-1">{children}</main>

        {/* ── Footer ──────────────────────────────────── */}
        {settings && <Footer settings={settings} />}
      </body>
    </html>
  );
}
