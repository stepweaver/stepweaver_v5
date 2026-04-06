export const metadata = { title: "Services", description: "What I build." };

const SIGNALS = [
  { title: "Shipped Systems", signal: "8+ projects", explanation: "Production systems across multiple domains", source: "Projects" },
  { title: "Technical Depth", signal: "Full-stack", explanation: "Architecture through deployment", source: "Capabilities" },
  { title: "Clean Architecture", signal: "TypeScript strict", explanation: "Typed boundaries, validated inputs", source: "Standards" },
];

const LANES = [
  {
    id: "automation",
    title: "Workflow Automation",
    description: "n8n workflows connecting your systems. Custom integrations, error handling, monitoring.",
    features: ["Custom n8n workflows", "System integrations", "Error handling with retry", "Execution monitoring"],
  },
  {
    id: "lead-systems",
    title: "Lead Systems",
    description: "Booking systems, contact forms, and lead capture that convert visitors into conversations.",
    features: ["Online booking integration", "Contact form wizards", "Lead capture pipelines", "CRM integration"],
  },
  {
    id: "web-platforms",
    title: "Web Platforms",
    description: "Full-stack web applications with clean architecture, terminal-forward identity, and strong UX.",
    features: ["Next.js App Router", "TypeScript strict mode", "Terminal experiences", "AI chat integration"],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Hero */}
        <div>
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">{"// SERVICES"}</div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-5xl text-[rgb(var(--text-color))] mb-4">What I Build</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm sm:text-base max-w-2xl">
            Three service lanes. Each backed by shipped work. Each with clear boundaries and honest scoping.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <a href="/contact" className="glitch-button glitch-button--primary">Start a Conversation</a>
            <a href="/brief" className="glitch-button">View Brief</a>
          </div>
        </div>

        {/* Signal Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          {SIGNALS.map((s) => (
            <div key={s.title} className="bg-[rgb(var(--panel))] p-6">
              <div className="text-[rgb(var(--neon))] font-[var(--font-ibm)] text-lg mb-1">{s.signal}</div>
              <div className="text-[rgb(var(--text-color))] text-sm mb-1">{s.title}</div>
              <div className="text-[rgb(var(--text-meta))] text-xs">{s.explanation}</div>
            </div>
          ))}
        </div>

        {/* Service Lanes */}
        <div className="space-y-px">
          {LANES.map((lane, i) => (
            <div key={lane.id} className="surface-panel p-6 sm:p-8">
              <div className="text-label mb-1">LANE {String(i + 1).padStart(2, "0")}</div>
              <h2 className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] mb-2">{lane.title}</h2>
              <p className="text-[rgb(var(--text-secondary))] text-sm mb-4">{lane.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {lane.features.map((f) => (
                  <div key={f} className="text-sm text-[rgb(var(--text-secondary))] flex gap-2">
                    <span className="text-[rgb(var(--neon))] shrink-0">▸</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <a href={`/services/${lane.id}`} className="text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors font-[var(--font-ocr)] tracking-wider">
                LEARN MORE →
              </a>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="surface-panel p-6 sm:p-8 text-center">
          <h2 className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] mb-2">Ready to Build?</h2>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-6">Tell me about your project. I will respond within 24 hours.</p>
          <a href="/contact" className="glitch-button glitch-button--primary">Get in Touch</a>
        </div>
      </div>
    </div>
  );
}
