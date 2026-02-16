"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  type Locale,
} from "@/lib/i18n";

interface Props {
  currentLocale: Locale;
}

export default function LanguageSwitcher({ currentLocale }: Props) {
  const pathname = usePathname();

  function buildHref(targetLocale: Locale): string {
    // Strip current locale prefix from pathname
    let path = pathname;
    for (const loc of LOCALES) {
      if (loc !== DEFAULT_LOCALE && path.startsWith(`/${loc}`)) {
        path = path.slice(`/${loc}`.length) || "/";
        break;
      }
    }

    // Add target locale prefix (none for default)
    if (targetLocale === DEFAULT_LOCALE) return path;
    return `/${targetLocale}${path === "/" ? "" : path}`;
  }

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={buildHref(locale)}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            locale === currentLocale
              ? "bg-brand-600 text-white"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          {LOCALE_LABELS[locale]}
        </Link>
      ))}
    </div>
  );
}
