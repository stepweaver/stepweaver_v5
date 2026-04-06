import { notFound } from "next/navigation";
import Link from "next/link";

const LANE_DATA: Record<string, { title: string; description: string; problems: string[]; capabilities: string[]; limits: string[]; projects: string[] }> = {
  automation: {
    title: "Workflow Automation",
    description: "Custom n8n workflows connecting your systems with error handling and monitoring.",
    problems: ["Manual repetitive tasks wasting hours", "Disconnected systems requiring manual data entry", "No visibility into workflow failures", "Fragile integrations that break silently"],
    capabilities: ["Custom n8n workflow design", "Multi-system integrations (APIs, webhooks, databases)", "Error handling with automatic retry", "Execution monitoring and alerting", "Custom webhook endpoints"],
    limits: ["Does not cover enterprise ERP integration", "Requires API access to target systems", "Complex business logic may need custom code"],
    projects: ["n8n-automations", "lcerebro"],
  },
  "lead-systems": {
    title: "Lead Systems",
    description: "Booking systems, contact forms, and lead capture that convert visitors into conversations.",
    problems: ["Visitors leaving without converting", "Manual appointment scheduling", "Lost leads in email inbox", "No follow-up automation"],
    capabilities: ["Online booking integration (Calendly, custom)", "Contact form wizards with validation", "Lead capture pipelines", "CRM integration", "Automated follow-up sequences"],
    limits: ["Does not include CRM setup from scratch", "Email deliverability depends on your provider", "Payment processing requires separate integration"],
    projects: ["service-business-demo", "ai-integrations"],
  },
  "web-platforms": {
    title: "Web Platforms",
    description: "Full-stack web applications with clean architecture, terminal-forward identity, and strong UX.",
    problems: ["Outdated technology stack", "Poor mobile experience", "Slow load times hurting conversions", "No interactive differentiation"],
    capabilities: ["Next.js App Router with TypeScript", "Terminal-forward visual identity", "AI chat integration", "Interactive experiences (terminal, games)", "Notion-backed CMS"],
    limits: ["Does not cover native mobile apps", "E-commerce beyond basic checkout requires separate scope", "Real-time features need additional infrastructure"],
    projects: ["portfolio-terminal", "soap-stache", "bill-planner"],
  },
};

export function generateStaticParams() {
  return Object.keys(LANE_DATA).map((lane) => ({ lane }));
}

export async function generateMetadata({ params }: { params: Promise<{ lane: string }> }) {
  const { lane } = await params;
  const data = LANE_DATA[lane];
  if (!data) return { title: "Service Not Found" };
  return { title: data.title, description: data.description };
}

export default async function ServiceLanePage({ params }: { params: Promise<{ lane: string }> }) {
  const { lane } = await params;
  const laneData = LANE_DATA[lane];
  if (!laneData) notFound();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/services" className="text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors font-[var(--font-ocr)] tracking-wider mb-6 block">
          BACK TO SERVICES
        </Link>

        <div className="surface-panel p-6 sm:p-8 mb-8">
          <h1 className="font-[var(--font-ibm)] text-3xl text-[rgb(var(--text-color))] mb-4">{laneData.title}</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-6">{laneData.description}</p>
          <a href="/contact?intent=brief&source=services" className="glitch-button glitch-button--primary">Request a Brief</a>
        </div>

        <div className="surface-panel p-6 sm:p-8 mb-8">
          <div className="text-label mb-4">THE PROBLEM</div>
          <div className="space-y-3">
            {laneData.problems.map((p, i) => (
              <div key={i} className="text-sm text-[rgb(var(--text-secondary))] flex gap-3">
                <span className="text-[rgb(var(--red))] font-[var(--font-ocr)] shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel p-6 sm:p-8 mb-8">
          <div className="text-label mb-4">WHAT IT COVERS</div>
          <div className="space-y-2">
            {laneData.capabilities.map((c, i) => (
              <div key={i} className="text-sm text-[rgb(var(--text-secondary))] flex gap-2">
                <span className="text-[rgb(var(--neon))] shrink-0">▸</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel p-6 sm:p-8 mb-8 border-[rgb(var(--warn)/0.2)]">
          <div className="text-label mb-4 text-[rgb(var(--warn))]">WHAT IT DOES NOT COVER</div>
          <div className="space-y-2">
            {laneData.limits.map((l, i) => (
              <div key={i} className="text-sm text-[rgb(var(--text-meta))] flex gap-2">
                <span className="text-[rgb(var(--warn))] shrink-0">✕</span>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel p-6 sm:p-8">
          <div className="text-label mb-4">RELATED PROJECTS</div>
          <div className="flex flex-wrap gap-2">
            {laneData.projects.map((slug) => (
              <Link key={slug} href={`/projects/${slug}`} className="text-sm text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors border border-[rgb(var(--border)/0.3)] px-3 py-1">
                {slug.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
