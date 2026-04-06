export const metadata = { title: "Field Notes", description: "Meshtastic field operations log." };

export default function FieldNotesPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">{"// FIELD NOTES"}</div>
          <h1 className="font-[var(--font-ibm)] text-3xl text-[rgb(var(--text-color))] mb-4">Field Notes</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm">Operational logs from Meshtastic field deployments.</p>
        </div>
        <div className="surface-panel p-6 sm:p-8">
          <p className="text-[rgb(var(--text-meta))] text-sm">No field notes yet. Content managed via Notion — not configured in this environment.</p>
        </div>
      </div>
    </div>
  );
}
