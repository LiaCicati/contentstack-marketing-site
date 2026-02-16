/**
 * SectionRenderer
 * ──────────────────────────────────────────────────────────
 * Maps Contentstack modular blocks to React components.
 *
 * This is the heart of the page-builder pattern:
 *  1. The CMS entry contains an ordered array of section blocks.
 *  2. Each block has exactly one key (the block UID).
 *  3. This component looks up the key in a registry and renders
 *     the matching component, passing the block data as props.
 *
 * Adding a new section type is a two-step process:
 *  1. Create the React component in /components/sections/
 *  2. Add it to the SECTION_COMPONENTS map below.
 */

import type {
  PageSection,
  HeroSection as HeroData,
  FeatureGridSection as FeatureGridData,
  CtaBannerSection as CtaBannerData,
  TestimonialsSection as TestimonialsData,
  RichTextBlockSection as RichTextData,
  LogoStripSection as LogoStripData,
} from "@/types/contentstack";

import HeroSection from "./HeroSection";
import FeatureGridSection from "./FeatureGridSection";
import CtaBannerSection from "./CtaBannerSection";
import TestimonialsSection from "./TestimonialsSection";
import RichTextBlockSection from "./RichTextBlockSection";
import LogoStripSection from "./LogoStripSection";
import ServiceCardsSection from "./ServiceCardsSection";

// ── Block-type → Component registry ─────────────────────────

const SECTION_COMPONENTS: Record<string, React.ComponentType<{ data: any }>> = {
  hero: HeroSection,
  feature_grid: FeatureGridSection,
  cta_banner: CtaBannerSection,
  testimonials: TestimonialsSection,
  rich_text_block: RichTextBlockSection,
  logo_strip: LogoStripSection,
  service_cards: ServiceCardsSection,
};

// ── Renderer ─────────────────────────────────────────────────

interface Props {
  sections: PageSection[];
}

export default function SectionRenderer({ sections }: Props) {
  return (
    <>
      {sections.map((section, index) => {
        // Each modular block object has exactly one key
        const blockType = Object.keys(section)[0];
        const blockData = (section as Record<string, unknown>)[blockType];
        const Component = SECTION_COMPONENTS[blockType];

        if (!Component) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[SectionRenderer] Unknown block type: "${blockType}". ` +
              `Register it in SECTION_COMPONENTS.`,
            );
          }
          return null;
        }

        return <Component key={`${blockType}-${index}`} data={blockData} />;
      })}
    </>
  );
}
