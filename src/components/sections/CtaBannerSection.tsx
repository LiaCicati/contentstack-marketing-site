import type { CtaBannerSection as CtaBannerData } from "@/types/contentstack";
import SectionHeading from "@/components/shared/SectionHeading";
import CtaButton from "@/components/shared/CtaButton";

interface Props {
  data: CtaBannerData;
}

export default function CtaBannerSection({ data }: Props) {
  return (
    <section className="px-6 py-20 bg-brand-900">
      <div className="mx-auto max-w-3xl text-center">
        <SectionHeading
          data={data.section_header}
          headingClassName="text-3xl font-bold text-white"
        />

        {data.body_text && (
          <p className="mt-4 text-lg text-brand-100">{data.body_text}</p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <CtaButton
            data={data.primary_cta}
            className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-brand-900 shadow-sm hover:bg-gray-100 transition-colors"
          />
          <CtaButton
            data={data.secondary_cta}
            className="rounded-lg border border-white/30 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
          />
        </div>
      </div>
    </section>
  );
}
