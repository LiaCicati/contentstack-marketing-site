import Image from "next/image";
import type { LogoStripSection as LogoStripData } from "@/types/contentstack";

interface Props {
  data: LogoStripData;
}

export default function LogoStripSection({ data }: Props) {
  return (
    <section className="px-6 py-16 bg-gray-50">
      <div className="mx-auto max-w-6xl">
        {data.section_header?.heading && (
          <p
            className="text-center text-sm font-semibold uppercase tracking-wider text-gray-500 mb-8"
            {...data.section_header.$?.heading}
          >
            {data.section_header.heading}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {data.logos.map((logo) => (
            <Image
              key={logo.uid}
              src={logo.url}
              alt={logo.filename}
              width={120}
              height={40}
              className="h-8 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
