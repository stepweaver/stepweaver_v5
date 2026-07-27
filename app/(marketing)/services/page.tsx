import Link from "next/link";

export const metadata = {
  title: "Services",
  description:
    "Selective consulting: custom data workflows, systems discovery, AI-assisted ops tools, and technical cleanup for teams where the fit is right.",
};

const OFFERS = [
  {
    id: "discovery",
    title: "Systems Discovery Sprint",
    description:
      "Workflow mapping, current-state audit, failure analysis, and a priority roadmap. Useful when you know something is broken but not what to build first.",
    fit: "Founders, PMs, ops leads",
  },
  {
    id: "workflows",
    title: "Custom Data Workflows & Automation",
    description:
      "n8n flows, API handoffs, intake/routing, reporting, and data movement shaped around how your team actually works, not shelf-ware.",
    fit: "Ops-heavy teams with brittle handoffs",
  },
  {
    id: "ai-ops",
    title: "AI-Assisted Ops Tools",
    description:
      "Guardrailed assistants, approval-gated drafting, retrieval-lite features, and provider routing with explicit trust boundaries.",
    fit: "Teams that want AI inside real workflows",
  },
  {
    id: "cleanup",
    title: "Technical Cleanup & Rationalization",
    description:
      "Platform cleanup, form/analytics hygiene, content architecture, and migration planning when the stack no longer matches the business.",
    fit: "Product teams stuck in accidental complexity",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <div>
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
            {"// SERVICES"}
          </div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-5xl text-[rgb(var(--text-color))] mb-4">
            Selective consulting for the right fit
          </h1>
          <div className="space-y-3 text-[rgb(var(--text-secondary))] text-sm sm:text-base max-w-3xl">
            <p>
              Hiring is the primary path. I also build custom data workflows and ops systems when I meet the right
              people, we vibe, and there is a need I can get passionate about.
            </p>
            <p>
              This is not an agency menu and not volume consulting. If you are looking for a partner who maps how work
              actually moves, then ships software, automation, or AI-assisted tools with clear boundaries, start a
              conversation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/contact?intent=consult" className="glitch-button glitch-button--primary">
              Start a Conversation
            </Link>
            <Link href="/work" className="glitch-button">
              See Proof
            </Link>
            <Link href="/about" className="glitch-button">
              About
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          {[
            { label: "Not volume", value: "Fit first", detail: "Right people, right problem, real passion." },
            { label: "Core craft", value: "Data workflows", detail: "Handoffs, sync, automation, reporting." },
            { label: "Primary path", value: "Hiring", detail: "Consulting is secondary and selective." },
          ].map((s) => (
            <div key={s.label} className="bg-[rgb(var(--panel))] p-6">
              <div className="text-[rgb(var(--neon))] font-[var(--font-ibm)] text-lg mb-1">{s.value}</div>
              <div className="text-label mb-2">{s.label}</div>
              <p className="text-[rgb(var(--text-secondary))] text-xs">{s.detail}</p>
            </div>
          ))}
        </div>

        <section>
          <div className="text-label mb-4">HOW I CAN HELP</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
            {OFFERS.map((offer) => (
              <div key={offer.id} id={offer.id} className="bg-[rgb(var(--panel))] p-6 scroll-mt-24">
                <h2 className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))] mb-2">{offer.title}</h2>
                <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed mb-3">{offer.description}</p>
                <p className="text-[rgb(var(--text-meta))] text-xs font-[var(--font-ocr)] tracking-wide">
                  Fit: {offer.fit}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="surface-panel p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-label mb-2">NEXT STEP</div>
            <p className="text-[rgb(var(--text-secondary))] text-sm max-w-xl">
              Tell me what is broken, what you are building, and why it matters. If it is a hire conversation, say that too.
            </p>
          </div>
          <Link href="/contact?intent=consult" className="glitch-button glitch-button--primary shrink-0">
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
