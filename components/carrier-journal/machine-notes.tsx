const MACHINE_NOTES = [
  {
    label: "GAIT // WALK TALL",
    body: "When I'm tired I think about the mechanics instead of the fatigue. Head up. Torso stacked. Feet under me. Deliberate stride. I imagine the machine moving.",
  },
  {
    label: "CORE // STABILIZATION",
    body: "The big muscles can produce force. The little stabilizers are still catching up.",
  },
  {
    label: "FEET // CONTACT PATCH",
    body: "Hundreds of miles have made footwear feel less like clothing and more like a mechanical interface between me and the ground.",
  },
  {
    label: "HEAT // THERMAL LOAD",
    body: "Distance isn't distance. Ten miles at 70°F and ten miles at a triple-digit heat index are different workloads.",
  },
] as const;

export function MachineNotes() {
  return (
    <section id="machine-notes" className="scroll-mt-28 space-y-4">
      <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
        MACHINE NOTES
      </div>
      <p className="text-sm text-[rgb(var(--text-secondary))] max-w-2xl leading-relaxed">
        Observations from Stephen&apos;s machine, not fitness tips for everyone.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
        {MACHINE_NOTES.map((note) => (
          <div key={note.label} className="bg-[rgb(var(--panel))] p-5 sm:p-6">
            <div className="font-[var(--font-ocr)] text-[10px] tracking-[0.22em] text-[rgb(var(--neon))] mb-3">
              {note.label}
            </div>
            <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">{note.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
