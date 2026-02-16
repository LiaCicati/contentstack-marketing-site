"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type {
  Navigation as NavData,
  NavItem,
  NavChild,
  Page,
  CmsAsset,
} from "@/types/contentstack";

// ── Helpers ──────────────────────────────────────────────────

/**
 * Resolve the URL for a navigation item.
 *
 * Priority:
 *  1. Internal page reference (page_reference[0].url)
 *  2. External URL (external_url.href)
 *  3. "#" fallback (parent-only items with children)
 */
function resolveHref(item: NavItem | NavChild): string {
  if (item.page_reference && item.page_reference.length > 0) {
    const ref = item.page_reference[0] as Page;
    if (ref.url) return ref.url;
  }
  if (item.external_url?.href) return item.external_url.href;
  return "#";
}

function isExternal(item: NavItem | NavChild): boolean {
  return !!item.external_url?.href && !item.page_reference?.length;
}

// ── Component ────────────────────────────────────────────────

interface Props {
  navigation: NavData;
  siteName: string;
  logo?: CmsAsset;
}

export default function Navigation({ navigation, siteName, logo }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* ── Logo / site name ─────────────────────────── */}
        <Link href="/" className="flex items-center gap-2">
          {logo?.url && (
            <Image src={logo.url} alt={siteName} width={32} height={32} />
          )}
          <span className="text-lg font-bold text-gray-900">{siteName}</span>
        </Link>

        {/* ── Desktop nav ──────────────────────────────── */}
        <ul className="hidden md:flex items-center gap-1">
          {navigation.nav_items.map((item) => {
            const hasChildren = item.children && item.children.length > 0;

            return (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() => hasChildren && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={resolveHref(item)}
                  {...(isExternal(item) && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                  className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                  {hasChildren && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {/* ── Dropdown ──────────────────────────── */}
                {hasChildren && openDropdown === item.label && (
                  <div className="absolute left-0 top-full w-52 pt-2">
                    <ul className="rounded-lg bg-white py-2 shadow-lg ring-1 ring-gray-200">
                      {item.children!.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={resolveHref(child)}
                            {...(isExternal(child) && {
                              target: "_blank",
                              rel: "noopener noreferrer",
                            })}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* ── Mobile hamburger ─────────────────────────── */}
        <button
          className="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* ── Mobile menu ──────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4">
          <ul className="space-y-1">
            {navigation.nav_items.map((item) => (
              <li key={item.label}>
                <Link
                  href={resolveHref(item)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>

                {item.children && item.children.length > 0 && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={resolveHref(child)}
                          className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
