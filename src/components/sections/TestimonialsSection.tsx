import Image from "next/image";
import type { TestimonialsSection as TestimonialsData } from "@/types/contentstack";
import SectionHeading from "@/components/shared/SectionHeading";

interface Props {
  data: TestimonialsData;
}

export default function TestimonialsSection({ data }: Props) {
  return (
    <section className="px-6 py-20 bg-gray-50">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          data={data.section_header}
          headingClassName="text-3xl font-bold text-gray-900 mb-14"
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.testimonial_entries.map((t) => (
            <blockquote
              key={t.uid}
              className="flex flex-col rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100"
            >
              <p className="flex-1 text-gray-700 leading-relaxed italic" {...t.$?.quote}>
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3">
                {t.avatar?.url && (
                  <Image
                    src={t.avatar.url}
                    alt={t.author_name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900" {...t.$?.author_name}>
                    {t.author_name}
                  </p>
                  {(t.author_title || t.company) && (
                    <p className="text-sm text-gray-500" {...t.$?.author_title}>
                      {[t.author_title, t.company]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
