import Image from "next/image";
import type { ServiceCardsSection as ServiceCardsData } from "@/types/contentstack";
import SectionHeading from "@/components/shared/SectionHeading";

interface Props {
  data: ServiceCardsData;
}

export default function ServiceCardsSection({ data }: Props) {
  return (
    <section className="px-6 py-20 bg-gray-50">
      <div className="mx-auto max-w-6xl">
        <SectionHeading data={data.section_header} />

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {data.cards.map((card, i) => (
            <div
              key={card.uid || i}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {card.icon?.url && (
                <Image
                  src={card.icon.url}
                  alt={card.title}
                  width={48}
                  height={48}
                  className="mb-5"
                />
              )}
              <h3 className="text-lg font-semibold text-gray-900" {...card.$?.title}>
                {card.title}
              </h3>
              {card.description && (
                <p className="mt-3 text-gray-600 leading-relaxed" {...card.$?.description}>
                  {card.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
