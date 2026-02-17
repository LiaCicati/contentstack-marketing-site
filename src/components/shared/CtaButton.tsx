import Link from "next/link";
import type { CtaButton as CtaButtonData } from "@/types/contentstack";

interface Props {
  data?: CtaButtonData;
  className?: string;
}

export default function CtaButton({ data, className }: Props) {
  if (!data?.label || !data?.url?.href) return null;

  return (
    <Link href={data.url.href} className={className} {...data.$?.label}>
      {data.label}
    </Link>
  );
}
