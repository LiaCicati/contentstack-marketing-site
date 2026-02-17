import type { SectionHeader } from "@/types/contentstack";

interface Props {
  data?: SectionHeader;
  /** Override heading tag (default: h2) */
  as?: "h1" | "h2" | "h3";
  /** Extra classes for the heading */
  headingClassName?: string;
  /** Extra classes for the subheading */
  subheadingClassName?: string;
  /** Center text (default: true) */
  center?: boolean;
}

export default function SectionHeading({
  data,
  as: Tag = "h2",
  headingClassName = "text-3xl font-bold text-gray-900",
  subheadingClassName = "mt-4 text-lg text-gray-600 max-w-2xl mx-auto",
  center = true,
}: Props) {
  if (!data?.heading) return null;

  return (
    <>
      <Tag
        className={`${headingClassName} ${center ? "text-center" : ""}`}
        {...data.$?.heading}
      >
        {data.heading}
      </Tag>
      {data.subheading && (
        <p
          className={`${subheadingClassName} ${center ? "text-center" : ""}`}
          {...data.$?.subheading}
        >
          {data.subheading}
        </p>
      )}
    </>
  );
}
