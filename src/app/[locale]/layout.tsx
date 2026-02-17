/**
 * Locale Layout
 * ──────────────────────────────────────────────────────────
 * Thin wrapper — the actual Navigation, Footer, and
 * LivePreviewInit are rendered by each page component
 * so they have access to searchParams for Live Preview gating.
 */

interface Props {
  children: React.ReactNode;
}

export default function LocaleLayout({ children }: Props) {
  return children;
}
