import { notFound } from "next/navigation";
import Link from "next/link";
import { MESHTASTIC_DOC_BY_SLUG, MESHTASTIC_DOCS } from "@/lib/data/meshtastic-content";

export function generateStaticParams() {
  return MESHTASTIC_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = MESHTASTIC_DOC_BY_SLUG[slug];
  if (!doc) return { title: "Not Found" };
  return { title: doc.title };
}

export default async function MeshtasticDocPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const doc = MESHTASTIC_DOC_BY_SLUG[slug];
  if (!doc) notFound();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          href="/meshtastic"
          className="text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors font-[var(--font-ocr)] tracking-wider mb-6 block"
        >
          BACK TO MESHTASTIC
        </Link>
        <div className="surface-panel p-6 sm:p-8 space-y-5">
          <h1 className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))]">{doc.title}</h1>
          {doc.sections.map((section, i) =>
            section.type === "p" && section.text ? (
              <p key={i} className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">
                {section.text}
              </p>
            ) : section.type === "ul" && section.items?.length ? (
              <ul key={i} className="list-disc pl-5 text-[rgb(var(--text-secondary))] text-sm space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
