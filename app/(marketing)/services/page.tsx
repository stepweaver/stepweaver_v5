export const metadata = {
  title: "Services",
  description:
    "Precise systems that fit how you work—not bloated platforms. Custom solutions for small businesses; pay for what you use.",
};

const SIGNALS = [
  { title: "Shipped Systems", signal: "20 case studies", explanation: "Full catalog on /projects, builds and service lines", source: "Projects" },
  { title: "Technical Depth", signal: "Full-stack", explanation: "Architecture through deployment", source: "Capabilities" },
  { title: "Clean Architecture", signal: "TypeScript strict", explanation: "Typed boundaries, validated inputs", source: "Standards" },
];

const LANES = [
  {
    id: "reviews",
    title: "Review & Reputation Systems",
    description: "Automated review requests and follow-ups after the moments that matter (appointments, jobs, deliveries).",
    features: ["Review requests after key events", "Follow-up flows and reminders", "Simple reputation tracking", "Owner-friendly reporting"],
  },
  {
    id: "follow-up",
    title: "Lead Capture & Follow-up",
    description: "Intake, routing, and first-response systems that turn inquiries into real conversations.",
    features: ["Forms and booking flows", "Routing to the right inbox/person", "Fast first-response automation", "Simple pipeline visibility"],
  },
  {
    id: "ops",
    title: "Reporting & Admin Relief",
    description: "Small internal systems that remove manual busywork and make the numbers usable.",
    features: ["Recurring reports that actually help", "Dashboards for one operator", "Workflow automations", "Error-proof handoffs"],
  },
  {
    id: "web-intake",
    title: "Fit-for-purpose Web + Intake",
    description: "Not platform bloat. A simple site and intake flow built around how the business actually works.",
    features: ["Clear offer + conversion path", "Intake wizards and scheduling", "Clean UX on mobile", "Simple content updates"],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Hero */}
        <div>
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">{"// SERVICES"}</div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-5xl text-[rgb(var(--text-color))] mb-4">
            You do not need a big, complex platform. You need a system that actually fits the way you work.
          </h1>
          <div className="space-y-3 text-[rgb(var(--text-secondary))] text-sm sm:text-base max-w-3xl">
            <p>
              Big SaaS companies build for scale. That usually means one-size-fits-most products, broad feature sets, and entire customer segments that
              get left behind. What is too small or too specific to matter to them may be exactly what matters to your business.
            </p>
            <p>
              A lot of small businesses are paying for software they barely use. Maybe it comes with marketing automation, lead scoring, CRM workflows, and
              email campaigns, but what you really need is one thing that works properly, like an automatic review request after each appointment. That
              pattern shows up everywhere.
            </p>
            <p>
              I build smaller, more precise systems for operators who need the right tool, not the biggest one. I am a small business too, so I understand
              the difference between paying for features you do not need and investing in something that actually solves the problem. I build custom
              solutions around the way you work, so you are only paying for what you use, and it works the way you want it to.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <a href="/contact" className="glitch-button glitch-button--primary">Start a Conversation</a>
            <a href="/brief" className="glitch-button">View Brief</a>
          </div>
        </div>

        {/* Positioning Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          {[
            { label: "Build for scale", value: "Segments left behind", detail: "Broad platforms often skip what is specific to you." },
            { label: "Barely used", value: "One thing right", detail: "Review request, intake, follow-up—whatever actually fits." },
            { label: "Small business too", value: "Pay for what you use", detail: "Custom around your workflow, not shelf-ware." },
          ].map((s) => (
            <div key={s.label} className="bg-[rgb(var(--panel))] p-6">
              <div className="text-[rgb(var(--neon))] font-[var(--font-ibm)] text-lg mb-1">{s.value}</div>
              <div className="text-[rgb(var(--text-color))] text-sm mb-1">{s.label}</div>
              <div className="text-[rgb(var(--text-meta))] text-xs">{s.detail}</div>
            </div>
          ))}
        </div>

        {/* Offers */}
        <div className="space-y-px">
          {LANES.map((lane, i) => (
            <div key={lane.id} className="surface-panel p-6 sm:p-8">
              <div className="text-label mb-1">OFFER {String(i + 1).padStart(2, "0")}</div>
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
              <a
                href={`/services/${lane.id}`}
                className="text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors font-[var(--font-ocr)] tracking-wider"
              >
                LEARN MORE →
              </a>
            </div>
          ))}
        </div>

        {/* Why this works + proof */}
        <div className="surface-panel p-6 sm:p-8">
          <div className="text-label mb-3">WHY THIS WORKS</div>
          <div className="space-y-3 text-sm text-[rgb(var(--text-secondary))] max-w-4xl">
            <p>
              Most operators are paying for software that almost fits. They use a fraction of it and work around the rest. The gap between the broad
              platform and the real workflow is where precise systems win.
            </p>
            <p>
              The goal is not a bigger stack. It is one problem that stops happening: reviews go out reliably, leads do not disappear, handoffs do not
              break, and the numbers get readable—without paying for a shelf of features you will never touch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)] mt-6">
            {SIGNALS.map((s) => (
              <div key={s.title} className="bg-[rgb(var(--panel))] p-6">
                <div className="text-[rgb(var(--neon))] font-[var(--font-ibm)] text-lg mb-1">{s.signal}</div>
                <div className="text-[rgb(var(--text-color))] text-sm mb-1">{s.title}</div>
                <div className="text-[rgb(var(--text-meta))] text-xs">{s.explanation}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Not a fit */}
        <div className="surface-panel p-6 sm:p-8 border-[rgb(var(--warn)/0.2)]">
          <div className="text-label mb-4 text-[rgb(var(--warn))]">NOT A FIT</div>
          <div className="space-y-2">
            {[
              "Enterprise rollout, multi-region governance, or committee-driven procurement.",
              "Replacing a full ERP or building a net-new all-in-one platform from scratch.",
              "Anything that requires access you cannot provide (APIs, exports, admin permissions).",
            ].map((l) => (
              <div key={l} className="text-sm text-[rgb(var(--text-meta))] flex gap-2">
                <span className="text-[rgb(var(--warn))] shrink-0">✕</span>
                <span>{l}</span>
              </div>
            ))}
          </div>
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
