import Link from "next/link";
import { MESHTASTIC_FIELD_NOTES } from "@/lib/data/meshtastic-content";

export const metadata = { title: "Field Notes", description: "Meshtastic field operations log." };

export default function FieldNotesPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          href="/meshtastic"
          className="text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors font-[var(--font-ocr)] tracking-wider mb-6 block"
        >
          BACK TO MESHTASTIC
        </Link>
        <div className="mb-8">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
            {"// FIELD NOTES"}
          </div>
          <h1 className="font-[var(--font-ibm)] text-3xl text-[rgb(var(--text-color))] mb-4">Field Notes</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm">
            Operational logs from Meshtastic field deployments. Add entries in{" "}
            <code className="text-[rgb(var(--neon))]">lib/data/meshtastic-content.ts</code> or wire Notion with{" "}
            <code className="text-[rgb(var(--neon))]">NOTION_MESHTASTIC_DOCS_DB_ID</code>.
          </p>
        </div>
        <div className="space-y-4">
          {MESHTASTIC_FIELD_NOTES.map((note) => (
            <article key={note.id} className="surface-panel p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                <time className="font-mono text-xs text-[rgb(var(--text-meta))]" dateTime={note.date}>
                  {note.date}
                </time>
                <h2 className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))]">{note.title}</h2>
              </div>
              <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">{note.summary}</p>
              {note.bullets?.length ? (
                <ul className="mt-3 list-disc pl-5 text-[rgb(var(--text-secondary))] text-sm space-y-1">
                  {note.bullets!.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
