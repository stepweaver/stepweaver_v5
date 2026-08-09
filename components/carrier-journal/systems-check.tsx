const SYSTEMS = [
  {
    code: "FRAME",
    focus: "Posture / spinal alignment / load-bearing",
    note: "When the chassis starts collapsing, everything downstream gets louder. Head up. Torso stacked. Load through the skeleton, not the soft tissue.",
  },
  {
    code: "STABILIZATION",
    focus: "Core / TVA / hips / ankles",
    note: "The big muscles can produce force. The little stabilizers are still catching up — and they decide whether the frame stays honest under fatigue.",
  },
  {
    code: "DRIVE",
    focus: "Quads / glutes / calves",
    note: "Propulsion under load. When drive fades, the shuffle starts. Deliberate push, not just falling forward.",
  },
  {
    code: "CONTACT",
    focus: "Feet / footwear / terrain",
    note: "Hundreds of miles make footwear feel less like clothing and more like a mechanical interface between operator and ground.",
  },
  {
    code: "THERMAL",
    focus: "Heat / hydration / environmental load",
    note: "Distance isn't distance. Ten miles at 70°F and ten miles at a triple-digit heat index are different workloads.",
  },
  {
    code: "RECOVERY",
    focus: "Soreness / sleep / nutrition / adaptation",
    note: "The machine adapts between walks, not during them. Soreness is signal. Sleep and intake decide whether the signal becomes capacity.",
  },
] as const;

export function SystemsCheck() {
  return (
    <section id="systems-check" className="scroll-mt-28 space-y-4">
      <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
        SYSTEMS CHECK
      </div>
      <p className="text-sm text-[rgb(var(--text-secondary))] max-w-2xl leading-relaxed">
        Mental model of the machine under observation — not medical diagnoses, not lab
        measurements. The categories the operator is learning to feel.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
        {SYSTEMS.map((system) => (
          <div key={system.code} className="bg-[rgb(var(--panel))] p-5 sm:p-6">
            <div className="font-[var(--font-ocr)] text-[10px] tracking-[0.22em] text-[rgb(var(--neon))] mb-1">
              {system.code}
            </div>
            <p className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))] mb-3">
              {system.focus}
            </p>
            <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
              {system.note}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
