export const metadata = { title: "Start Here", description: "Find your path." };

const PATHWAYS = [
  {
    id: "hiring",
    label: "Hiring Manager",
    description: "Looking for a technical operator to join your team.",
    steps: ["Review the resume for background and experience", "Browse project case studies for technical depth", "Check capabilities for skill evidence"],
    ctas: [{ label: "View Resume", href: "/resume" }, { label: "Contact", href: "/contact" }],
  },
  {
    id: "founder",
    label: "Founder / Client",
    description: "Need systems built: automation, web platforms, or AI.",
    steps: ["Read the services overview for scope and boundaries", "Check the brief for a one-page summary", "Start a conversation about your project"],
    ctas: [{ label: "View Services", href: "/services" }, { label: "Get in Touch", href: "/contact" }],
  },
  {
    id: "engineer",
    label: "Fellow Engineer",
    description: "Curious about architecture, tooling, and approach.",
    steps: ["Launch the terminal for the full experience", "Browse the codex for technical writing", "Explore project case studies for architecture decisions"],
    ctas: [{ label: "Terminal", href: "/terminal" }, { label: "Codex", href: "/codex" }],
  },
];

export default function StartHerePage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">{"// START HERE"}</div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))] mb-4">Find Your Path</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm max-w-2xl">Where you start depends on what you are looking for.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          {PATHWAYS.map((p) => (
            <div key={p.id} className="bg-[rgb(var(--panel))] p-6">
              <div className="text-label mb-2">{p.label.toUpperCase()}</div>
              <p className="text-[rgb(var(--text-secondary))] text-sm mb-4">{p.description}</p>
              <div className="space-y-2 mb-6">
                {p.steps.map((s, i) => (
                  <div key={i} className="text-xs text-[rgb(var(--text-meta))] flex gap-2">
                    <span className="text-[rgb(var(--neon))] shrink-0">{i + 1}.</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {p.ctas.map((cta) => (
                  <a key={cta.href} href={cta.href} className="glitch-button text-xs w-full text-center">{cta.label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
