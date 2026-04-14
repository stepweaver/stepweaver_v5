import { notFound } from "next/navigation";
import Link from "next/link";

const LANE_DATA: Record<string, { title: string; description: string; problems: string[]; capabilities: string[]; limits: string[]; projects: string[] }> = {
  reviews: {
    title: "Review & Reputation Systems",
    description: "Automated review requests and follow-ups after the moments that matter (appointments, jobs, deliveries).",
    problems: [
      "You know reviews matter, but asking manually is inconsistent",
      "Customers leave happy, then you never hear from them again",
      "Review links, templates, and timing live in someone’s head",
      "You cannot tell what is working without a simple view of outcomes",
    ],
    capabilities: [
      "Event-triggered review request emails/SMS (after appointment, after job completion, after delivery)",
      "Lightweight follow-up sequence (one reminder, then stop)",
      "Routing rules (send the right message for the right service type/location/provider)",
      "Simple reporting (send rate, response rate, review count over time)",
      "Guardrails to prevent spammy behavior and protect your domain reputation",
    ],
    limits: [
      "Not a full marketing platform or multi-channel campaign manager",
      "Requires access to your scheduling/CRM/export or a reliable source of completed-appointment events",
      "If review sites restrict automation, the workflow will adapt to what is allowed (no brittle scraping)",
    ],
    projects: ["service-business-demo", "n8n-automations", "google-analytics"],
  },
  "follow-up": {
    title: "Lead Capture & Follow-up",
    description: "Intake, routing, and first-response systems that turn inquiries into real conversations.",
    problems: [
      "Leads land in an inbox and quietly die",
      "You respond late because you are also running the business",
      "The first question is always the same, but you still type it every time",
      "Scheduling is a back-and-forth thread instead of a clean flow",
    ],
    capabilities: [
      "High-signal intake forms (the questions you actually need, not a generic template)",
      "Routing and notifications (to the right person, with the right context)",
      "Fast first-response automation (confirmation + expectations + next step)",
      "Scheduling integration or lightweight booking flow (when it fits the business)",
      "Pipeline visibility that is owner-friendly (no enterprise CRM complexity)",
    ],
    limits: [
      "Not an enterprise CRM implementation or multi-team sales ops program",
      "Deliverability and SMS sending depend on your provider and consent requirements",
      "If the business needs complex quoting/estimating, that becomes a separate scoped system",
    ],
    projects: ["service-business-demo", "mishawaka-shower-booking"],
  },
  ops: {
    title: "Reporting & Admin Relief",
    description: "Small internal systems that remove manual busywork and make the numbers usable.",
    problems: [
      "You are exporting CSVs and stitching reports together by hand",
      "Nobody trusts the numbers because the process is fragile",
      "You spend time moving data between tools instead of running the business",
      "You need a simple operational view, not a chain-grade analytics suite",
    ],
    capabilities: [
      "Recurring reports delivered where you work (email, Slack, dashboard)",
      "Dashboards built for a single operator (the 5–10 numbers that matter)",
      "Automation for common admin workflows (handoffs, reminders, reconciliation)",
      "Monitoring and alerts so failures do not stay silent",
    ],
    limits: [
      "Not a data-warehouse program or multi-department BI initiative",
      "If your tools have no exports/APIs, data access becomes the limiting factor",
      "Real-time analytics can be done, but it requires additional infrastructure and scope",
    ],
    projects: ["bill-planner", "n8n-automations", "google-analytics"],
  },
  "web-intake": {
    title: "Fit-for-purpose Web + Intake",
    description: "Not platform bloat. A simple site and intake flow built around how the business actually works.",
    problems: [
      "The website exists, but it does not move people to the next step",
      "Mobile UX is clunky, so leads bounce",
      "Your actual workflow (intake, booking, handoff) is missing from the site",
      "Updating content is annoying, so it never happens",
    ],
    capabilities: [
      "Conversion-first structure (clear offer, trust, and next step)",
      "Intake wizards and booking embedded into the workflow",
      "Fast performance and clean UX on mobile",
      "Simple content editing approach that fits your reality (not a heavy CMS)",
    ],
    limits: [
      "Not a full e-commerce platform beyond basic checkout without separate scope",
      "Not a rebrand engagement; this is workflow-first, not a design agency retainer",
      "If the business needs complex member portals, that becomes a separate platform build",
    ],
    projects: ["stepweaver-dev", "portfolio-terminal", "soap-stache"],
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
