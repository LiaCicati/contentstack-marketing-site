// ─────────────────────────────────────────────────────────────
// TypeScript types that mirror the Contentstack content models.
// Generated manually from the schemas in /cms-schemas.
// In larger projects you'd auto-generate these from the
// Content Management API or a code-gen tool.
// ─────────────────────────────────────────────────────────────

/** Contentstack asset (image / file) */
export interface CmsAsset {
  uid: string;
  url: string;
  filename: string;
  title?: string;
  content_type?: string;
}

/** Contentstack link field */
export interface CmsLink {
  title: string;
  href: string;
}

/** Contentstack reference stub (before resolution) */
export interface CmsReference {
  uid: string;
  _content_type_uid: string;
}

// ─────────────────────────────────────────────────────────────
// Testimonial
// ─────────────────────────────────────────────────────────────
export interface Testimonial {
  uid: string;
  title: string;
  quote: string;
  author_name: string;
  author_title?: string;
  company?: string;
  avatar?: CmsAsset;
}

// ─────────────────────────────────────────────────────────────
// Page — Modular Blocks (Section types)
// ─────────────────────────────────────────────────────────────

export interface HeroSection {
  headline: string;
  sub_headline?: string;
  background_image?: CmsAsset;
  cta?: {
    label?: string;
    url?: CmsLink;
  };
}

export interface Feature {
  title: string;
  description?: string;
  icon?: CmsAsset;
}

export interface FeatureGridSection {
  heading?: string;
  subheading?: string;
  features: Feature[];
}

export interface CtaBannerSection {
  heading: string;
  body_text?: string;
  primary_button?: {
    label?: string;
    url?: CmsLink;
  };
  secondary_button?: {
    label?: string;
    url?: CmsLink;
  } | null;
}

export interface TestimonialsSection {
  heading?: string;
  /** After .includeReference() these are resolved Testimonial objects */
  testimonial_entries: Testimonial[];
}

export interface RichTextBlockSection {
  heading?: string;
  body: Record<string, unknown>; // Contentstack JSON RTE
}

export interface LogoStripSection {
  heading?: string;
  logos: CmsAsset[];
}

/**
 * A single modular block entry.
 * Exactly one key will be present — the block UID.
 */
export type PageSection =
  | { hero: HeroSection }
  | { feature_grid: FeatureGridSection }
  | { cta_banner: CtaBannerSection }
  | { testimonials: TestimonialsSection }
  | { rich_text_block: RichTextBlockSection }
  | { logo_strip: LogoStripSection };

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export interface PageSeo {
  meta_title?: string;
  meta_description?: string;
  og_image?: CmsAsset;
}

export interface Page {
  uid: string;
  title: string;
  url: string;
  seo?: PageSeo;
  sections: PageSection[];
}

// ─────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────

export interface NavChild {
  label: string;
  page_reference?: Page[] | CmsReference[];
  external_url?: CmsLink | null;
}

export interface NavItem {
  label: string;
  page_reference?: Page[] | CmsReference[];
  external_url?: CmsLink | null;
  children?: NavChild[];
}

export interface Navigation {
  uid: string;
  title: string;
  nav_items: NavItem[];
}

// ─────────────────────────────────────────────────────────────
// Site Settings
// ─────────────────────────────────────────────────────────────

export interface SocialLink {
  platform: string;
  url: CmsLink;
}

export interface SiteSettings {
  uid: string;
  title: string;
  site_name: string;
  logo?: CmsAsset;
  main_navigation?: Navigation[] | CmsReference[];
  footer?: {
    copyright_text?: string;
    social_links?: SocialLink[];
  };
}

// ─────────────────────────────────────────────────────────────
// Helper — identify which section block is present
// ─────────────────────────────────────────────────────────────

export type SectionBlockType = keyof (
  & { hero: unknown }
  & { feature_grid: unknown }
  & { cta_banner: unknown }
  & { testimonials: unknown }
  & { rich_text_block: unknown }
  & { logo_strip: unknown }
);

export function getSectionType(section: PageSection): SectionBlockType {
  return Object.keys(section)[0] as SectionBlockType;
}

export function getSectionData<T>(section: PageSection): T {
  const key = Object.keys(section)[0];
  return (section as Record<string, unknown>)[key] as T;
}
