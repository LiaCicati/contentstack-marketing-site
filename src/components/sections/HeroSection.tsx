import type { HeroSection as HeroData } from "@/types/contentstack";
import CtaButton from "@/components/shared/CtaButton";

interface Props {
  data: HeroData;
}

export default function HeroSection({ data }: Props) {
  const bgStyle = data.background_image?.url
    ? { backgroundImage: `url(${data.background_image.url})` }
    : undefined;

  return (
    <section
      className="relative flex items-center justify-center px-6 py-28 text-center bg-cover bg-center"
      style={bgStyle}
    >
      {/* overlay for background images */}
      {data.background_image && (
        <div className="absolute inset-0 bg-brand-900/60" />
      )}

      <div className="relative z-10 mx-auto max-w-3xl">
        <h1
          className={`text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl ${
            data.background_image ? "text-white" : "text-gray-900"
          }`}
          {...data.$?.headline}
        >
          {data.headline}
        </h1>

        {data.sub_headline && (
          <p
            className={`mt-6 text-lg leading-8 ${
              data.background_image ? "text-gray-200" : "text-gray-600"
            }`}
            {...data.$?.sub_headline}
          >
            {data.sub_headline}
          </p>
        )}

        <div className="mt-10">
          <CtaButton
            data={data.cta}
            className="rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          />
        </div>
      </div>
    </section>
  );
}
