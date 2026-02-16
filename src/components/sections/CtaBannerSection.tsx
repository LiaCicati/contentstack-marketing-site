import Link from "next/link";
import type { CtaBannerSection as CtaBannerData } from "@/types/contentstack";

interface Props {
  data: CtaBannerData;
}

export default function CtaBannerSection({ data }: Props) {
  return (
    <section className="px-6 py-20 bg-brand-900">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-white">{data.heading}</h2>

        {data.body_text && (
          <p className="mt-4 text-lg text-brand-100">{data.body_text}</p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {data.primary_button?.label && data.primary_button?.url?.href && (
            <Link
              href={data.primary_button.url.href}
              className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-brand-900 shadow-sm hover:bg-gray-100 transition-colors"
            >
              {data.primary_button.label}
            </Link>
          )}

          {data.secondary_button?.label && data.secondary_button?.url?.href && (
            <Link
              href={data.secondary_button.url.href}
              className="rounded-lg border border-white/30 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              {data.secondary_button.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
