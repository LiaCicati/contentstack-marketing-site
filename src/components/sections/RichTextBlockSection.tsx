import type { RichTextBlockSection as RichTextData } from "@/types/contentstack";
import SectionHeading from "@/components/shared/SectionHeading";

interface Props {
  data: RichTextData;
}

/**
 * Renders a JSON Rich Text Editor (RTE) field from Contentstack.
 *
 * In production you'd use @contentstack/utils `jsonToHtml()` to
 * convert the JSON RTE AST into HTML, then render via
 * dangerouslySetInnerHTML with a sanitizer, or walk the AST
 * and render React elements.
 *
 * For this example we do a simplified recursive render.
 */
function renderRteNode(node: Record<string, unknown>, key: number): React.ReactNode {
  // Text leaf node
  if ("text" in node && typeof node.text === "string") {
    return <span key={key}>{node.text as string}</span>;
  }

  const children = (node.children as Record<string, unknown>[] | undefined)?.map(
    (child, i) => renderRteNode(child, i),
  );

  switch (node.type) {
    case "doc":
      return <div key={key}>{children}</div>;
    case "paragraph":
      return <p key={key} className="mt-4 text-gray-700 leading-relaxed">{children}</p>;
    case "heading":
      return <h3 key={key} className="mt-6 text-xl font-semibold text-gray-900">{children}</h3>;
    default:
      return <div key={key}>{children}</div>;
  }
}

export default function RichTextBlockSection({ data }: Props) {
  return (
    <section className="px-6 py-20 bg-white">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          data={data.section_header}
          center={false}
        />
        {data.body && renderRteNode(data.body as Record<string, unknown>, 0)}
      </div>
    </section>
  );
}
