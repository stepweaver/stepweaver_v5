import type { Project } from "../projects.schema";

export const n8nAutomations: Project = {
  slug: "n8n-automations",
  title: "n8n Automations",
  description:
    "Automation service for event-driven workflows, data movement, business rules, and failure-aware integrations built around n8n.",
  status: "live",
  tags: ["Automation", "n8n", "Integration Architecture", "Systems Design"],
  keywords: ["automation", "n8n", "workflows", "integration"],
  imageUrl: "/images/n8n_automations.png",
  builtFor: "Teams with the right tools but broken handoffs between them",
  solved: "Inbox routing, duplicate entry, drift between systems, silent failures",
  delivered: [
    "Move data between apps with documented n8n workflows",
    "Replace repetitive copy-paste work with automations that can be monitored and maintained later",
  ],
  cardDescription: "n8n automation work that connects tools and removes repeat manual steps.",
  cardBuiltFor: "business operations",
  cardSolved: "manual process gaps between systems",
  cardDelivered: [
    "Move data between apps with documented n8n workflows",
    "Replace repetitive copy-paste with monitored, maintainable automations",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Service entry, not a public n8n product. The value is workflow design: triggers, validation, branching, retries, alerts, and handoff.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Teams often own the right tools; what breaks is the process between them: inbox handoffs, duplicate entry, drift, silent failures",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "n8n as orchestration for intake routing, CRM updates, approval flows, reporting, and cross-system sync",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Event-driven delivery: trigger, validate, normalize, route, persist or notify, retry or alert on failure",
        "In the portfolio, modeled as structured data in the same slug-driven case-study system as builds",
      ],
    },
    {
      id: "features",
      title: "Service Scope",
      type: "features",
      bullets: [
        "Workflow mapping from the real business process, not only the app list",
        "Multi-step, branching, stateful processes in n8n",
        "Webhook and API integrations across existing tools",
        "Data transformation and validation between systems",
        "Retries, fallbacks, and visible failure alerts",
        "Documentation and handoff so workflows do not become black boxes",
      ],
    },
    {
      id: "engineering",
      title: "How It Shows Up",
      type: "engineering",
      bullets: [
        "Idempotent design, boundary validation, failure visibility, maintainable workflow ownership",
        "Same site baseline as the rest of λstepweaver: CSP, headers, caching, import optimization",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Designed to reduce manual copy-and-paste between systems",
        "Designed to surface workflow state instead of hiding it in email and memory",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "No public workflow exports or deployment manifests in this repo; framing proves the service more than a concrete export",
        "Real automation touches private systems and secrets, limiting client-specific public detail",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "n8n", category: "Orchestration" },
        { name: "REST / Webhooks", category: "Integration" },
        { name: "Node.js", category: "Runtime" },
      ],
    },
  ],
};
