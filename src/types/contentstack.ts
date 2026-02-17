// ─────────────────────────────────────────────────────────────
// TypeScript types that mirror the Contentstack content models.
// Generated manually from the schemas in /cms-schemas.
// In larger projects you'd auto-generate these from the
// Content Management API or a code-gen tool.
// ─────────────────────────────────────────────────────────────

/** Edit tag object injected by addEditableTags() from @contentstack/utils */
export type CslpTag = { "data-cslp": string };

/** The `$` object added to entries/fields by addEditableTags() */
export type EditTags = Record<string, CslpTag>;

/** Contentstack asset (image / file) */
export interface CmsAsset {
  uid: string;
  url: string;
  filename: string;
  title?: string;
  content_type?: string;
  $?: EditTags;
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
// Service Card (reusable entry with non-localizable icon)
// ─────────────────────────────────────────────────────────────
export interface ServiceCard {
  uid: string;
  title: string;
  description?: string;
  icon?: CmsAsset;
}

// ─────────────────────────────────────────────────────────────
// Global Fields — shared across multiple sections
// ─────────────────────────────────────────────────────────────

/** Matches the section_header global field */
export interface SectionHeader {
  heading?: string;
  subheading?: string;
  $?: EditTags;
}

/** Matches the cta_button global field */
export interface CtaButton {
  label?: string;
  url?: CmsLink;
  $?: EditTags;
}

// ─────────────────────────────────────────────────────────────
// Page — Modular Blocks (Section types)
// ─────────────────────────────────────────────────────────────

export interface HeroSection {
  headline: string;
  sub_headline?: string;
  background_image?: CmsAsset;
  cta?: CtaButton;
  $?: EditTags;
}

export interface Feature {
  title: string;
  description?: string;
  icon?: CmsAsset;
  $?: EditTags;
}

export interface FeatureGridSection {
  section_header?: SectionHeader;
  features: Feature[];
  $?: EditTags;
}

export interface CtaBannerSection {
  section_header?: SectionHeader;
  body_text?: string;
  primary_cta?: CtaButton;
  secondary_cta?: CtaButton;
  $?: EditTags;
}

export interface TestimonialsSection {
  section_header?: SectionHeader;
  /** After .includeReference() these are resolved Testimonial objects */
  testimonial_entries: Testimonial[];
  $?: EditTags;
}

export interface RichTextBlockSection {
  section_header?: SectionHeader;
  body: Record<string, unknown>; // Contentstack JSON RTE
  $?: EditTags;
}

export interface LogoStripSection {
  section_header?: SectionHeader;
  logos: CmsAsset[];
  $?: EditTags;
}

export interface ServiceCardsSection {
  section_header?: SectionHeader;
  /** After .includeReference() these are resolved ServiceCard objects */
  cards: ServiceCard[];
  $?: EditTags;
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
  | { logo_strip: LogoStripSection }
  | { service_cards: ServiceCardsSection };

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
  $?: EditTags;
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
  & { service_cards: unknown }
);

export function getSectionType(section: PageSection): SectionBlockType {
  return Object.keys(section)[0] as SectionBlockType;
}

export function getSectionData<T>(section: PageSection): T {
  const key = Object.keys(section)[0];
  return (section as Record<string, unknown>)[key] as T;
}
