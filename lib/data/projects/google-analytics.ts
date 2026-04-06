import type { Project } from "../projects.schema";

export const googleAnalytics: Project = {
  slug: "google-analytics",
  title: "Google Analytics & Measurement Strategy",
  description:
    "Measurement strategy for websites that need clean events, useful reporting, and instrumentation tied to business questions.",
  status: "live",
  tags: ["Measurement Strategy", "GA4", "Event Design", "Next.js", "SEO"],
  keywords: ["analytics", "ga4", "events", "measurement", "seo"],
  githubRepo: "stepweaver/stepwever_v3",
  builtFor: "Businesses that need useful measurement, not only traffic totals",
  solved: "Analytics present on the page but not wired to real business questions",
  delivered: [
    "Analytics setup oriented to practical questions: sources, page performance, conversion actions",
    "Clean implementation, useful events, reporting for decisions instead of vanity metrics",
  ],
  cardDescription:
    "GA4 setup for businesses that need useful measurement, not just traffic totals, with events tied to leads, pages, and conversion actions.",
  cardBuiltFor: "businesses needing actionable measurement",
  cardSolved: "analytics that does not answer real questions",
  cardDelivered: [
    "Event design tied to leads, pages, and conversion actions",
    "Implementation and reporting aimed at decisions, not vanity metrics",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Service page backed by a real implementation pattern in the portfolio: analytics isolated, mounted once, allowed explicitly through the app security model.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Many sites “have analytics” and still cannot answer basic questions. Usually the event model is wrong, not the script tag",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Treat analytics as application design: define what matters, instrument deliberately, keep tracking separate from UI internals",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Client-only analytics wrapper mounted from root layout",
        "Nonce-based CSP so third-party script loading stays explicit",
        "Route metadata and structured data as measurement baseline",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Service case study inside the same slug-driven project system as builds",
        "Measurement-aware portfolio: dedicated client analytics wrapper",
        "Security headers and nonce handling for third-party scripts",
        "Framing that ties analytics to SEO, reporting, and optimization work",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Measurement strategy visible in the service stack, not implied",
        "Honest public proof: architecture and patterns, not confidential client dashboards",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "No public GA4 property, GTM container, or dashboard screenshots in repo",
        "Credibility ceiling rises with a published event map or implementation snippet",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js", category: "App" },
        { name: "Vercel Analytics", category: "Portfolio" },
        { name: "CSP / nonces", category: "Security" },
      ],
    },
  ],
};

export default googleAnalytics;
