import Image from "next/image";
import type { FeatureGridSection as FeatureGridData } from "@/types/contentstack";
import SectionHeading from "@/components/shared/SectionHeading";

interface Props {
  data: FeatureGridData;
}

export default function FeatureGridSection({ data }: Props) {
  return (
    <section className="px-6 py-20 bg-white">
      <div className="mx-auto max-w-6xl">
        <SectionHeading data={data.section_header} />

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {data.features.map((feature, i) => (
            <div key={i} className="flex flex-col">
              {feature.icon?.url && (
                <Image
                  src={feature.icon.url}
                  alt={feature.title}
                  width={48}
                  height={48}
                  className="mb-4"
                />
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              {feature.description && (
                <p className="mt-2 text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
