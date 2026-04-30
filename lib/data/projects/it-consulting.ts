import type { Project } from "../projects.schema";

export const itConsulting: Project = {
  slug: "it-consulting",
  title: "IT Consulting",
  description:
    "Fractional IT and systems consulting for small businesses that need clearer tooling, cleaner workflows, and better technical decisions.",
  status: "live",
  tags: ["IT Consulting", "Systems Analysis", "Integration Planning", "Business Systems"],
  keywords: ["consulting", "systems", "integration", "operations"],
  imageUrl: "/images/it_consulting.png",
  githubRepo: "stepweaver/stepweaver_v5",
  builtFor: "Small businesses at the seams between tools and process",
  solved: "Duplicated work, unclear ownership, weak reporting, manual handoffs",
  delivered: [
    "Systems analysis, tool selection support, and process review grounded in business analysis work",
    "Implementation support when the right answer is a working system, not another recommendation deck",
  ],
  cardDescription:
    "IT consulting focused on operations, tool cleanup, and getting systems to match how the business actually works.",
  cardBuiltFor: "small businesses needing clearer tooling and workflows",
  cardSolved: "fragmented tools and unclear technical decisions",
  cardDelivered: [
    "Audits and process review grounded in how work actually moves",
    "Implementation support when the answer should be a working system",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Service entry, not a product. Work is systems analysis: tool audits, workflow mapping, reporting strategy, integration planning, and implementation guidance.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Small businesses rarely fail from one bad tool. Failure is usually at the seams: duplicate work, unclear ownership, weak reporting, manual handoffs",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Discovery and audit, current-state mapping, tool evaluation, reporting design, source-of-truth decisions, process cleanup, rollout guidance",
      ],
    },
    {
      id: "features",
      title: "Service Scope",
      type: "features",
      bullets: [
        "Technology and workflow audits grounded in how work moves today",
        "Tool and vendor evaluation with tradeoffs in plain language",
        "Integration planning to reduce duplicate entry",
        "Reporting and dashboard strategy for reliable business visibility",
        "Process cleanup before small inefficiencies become expensive",
        "Implementation guidance during migrations and rollouts",
      ],
    },
    {
      id: "engineering",
      title: "How It Shows Up Here",
      type: "engineering",
      bullets: [
        "Same data-driven `/projects/[slug]` case-study spine as build entries",
        "Metadata and SEO consistent with the rest of the portfolio",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Positions consulting as systems work, not generic technology advice",
        "Bridge between shipped builds and the decision layer behind them",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "No private client audits or migration plans in the public repo",
        "Proof is capability framing unless paired with sanitized examples",
      ],
    },
    {
      id: "tech-stack",
      title: "Typical Touchpoints",
      type: "tech-stack",
      techStack: [
        { name: "Stack-agnostic", category: "Engagements" },
        { name: "Integration planning", category: "Deliverable" },
        { name: "Reporting design", category: "Deliverable" },
      ],
    },
  ],
};
