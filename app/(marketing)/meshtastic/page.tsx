import Link from "next/link";
import { MESHTASTIC_DOCS } from "@/lib/data/meshtastic-content";

export const metadata = { title: "Meshtastic", description: "Meshtastic documentation." };

export default function MeshtasticPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-64 shrink-0">
          <div className="surface-panel p-4 lg:sticky lg:top-24">
            <div className="text-label mb-3">ON THIS SITE</div>
            <nav className="space-y-1 font-[var(--font-ocr)] text-xs tracking-wider">
              {MESHTASTIC_DOCS.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/meshtastic/${doc.slug}`}
                  className="block py-1.5 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--neon))] border-l-2 border-transparent hover:border-[rgb(var(--neon)/0.5)] pl-2 -ml-0.5 transition-colors"
                >
                  {doc.title}
                </Link>
              ))}
              <Link
                href="/meshtastic/field-notes"
                className="block py-1.5 text-[rgb(var(--accent))] hover:text-[rgb(var(--neon))] border-l-2 border-transparent hover:border-[rgb(var(--neon)/0.5)] pl-2 -ml-0.5 transition-colors"
              >
                Field Notes
              </Link>
            </nav>
          </div>
        </aside>

        <div className="flex-1 min-w-0 max-w-3xl">
          <div className="mb-8">
            <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
              {"// MESHTASTIC"}
            </div>
            <h1 className="font-[var(--font-ibm)] text-3xl text-[rgb(var(--text-color))] mb-4">
              Meshtastic Documentation
            </h1>
            <p className="text-[rgb(var(--text-secondary))] text-sm max-w-2xl">
              Documentation for Meshtastic radio networks, hardware selection, and field operations.
            </p>
          </div>
          <div className="surface-panel p-6 sm:p-8">
            <div className="text-label mb-4">TABLE OF CONTENTS</div>
            <div className="space-y-4">
              {MESHTASTIC_DOCS.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/meshtastic/${doc.slug}`}
                  className="block text-[rgb(var(--text-color))] hover:text-[rgb(var(--neon))] transition-colors text-sm font-[var(--font-ibm)]"
                >
                  {doc.title} →
                </Link>
              ))}
              <Link
                href="/meshtastic/field-notes"
                className="block text-[rgb(var(--accent))] hover:text-[rgb(var(--neon))] transition-colors text-sm font-[var(--font-ibm)]"
              >
                Field Notes →
              </Link>
            </div>
          </div>
          <div className="mt-6 text-[rgb(var(--text-meta))] text-xs">
            Long-form pages can be wired to Notion when NOTION_MESHTASTIC_DOCS_DB_ID is set.
          </div>
        </div>
      </div>
    </div>
  );
}
