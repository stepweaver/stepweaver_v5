import type { Project } from "../projects.schema";

export const websiteRefreshes: Project = {
  slug: "website-refreshes",
  title: "Website Refreshes & Technical Cleanup",
  description:
    "Modern website rebuilds and technical cleanup for businesses stuck with outdated sites, Facebook-only presence, weak lead capture, or disconnected tools.",
  status: "live",
  tags: ["Website Refresh", "Lead Capture", "Local SEO", "Technical Cleanup", "Next.js", "Analytics"],
  keywords: ["refresh", "rebuild", "seo", "lead-capture", "small-business"],
  builtFor: "Businesses that outgrew their first web setup",
  solved: "Sites that exist but no longer support how the business actually works",
  delivered: [
    "Rebuilds focused on practical problems: weak mobile UX, buried CTAs, poor inquiry flow, disconnected tools",
    "Technical cleanup that turns a stale web presence into a usable business asset instead of a placeholder",
  ],
  cardDescription:
    "Rebuilds and cleanup for outdated sites, Facebook-only presence, weak lead capture, or disconnected tools.",
  cardBuiltFor: "small businesses past their first DIY setup",
  cardSolved: "digital presence that no longer matches operations",
  cardDelivered: [
    "Clearer mobile UX, CTAs, and inquiry flow",
    "Metadata, forms, and integrations where they remove manual work",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Rebuilds outdated sites and cleans up surrounding technical systems. Typical triggers: old site vs current business, weak mobile UX, buried CTAs, broken inquiry paths, missing or useless analytics, over-reliance on Facebook or directories, fragmented tools.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "No clean break point to modernize: patched sites, social as main presence, unclear ownership, manual handoffs",
        "Symptoms: unclear service explanation, no obvious next step, poor mobile layout, weak lead capture, no actionable measurement",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Practical rebuild, not branding for its own sake",
        "Goals: easier to understand, obvious next step, reliable lead capture, easier maintenance",
        "May include page restructuring, mobile cleanup, CTAs, forms, analytics, SEO structure, integrations",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Stack follows the business: Next.js when it fits, lighter stacks when they fit",
        "GA4 tied to real actions, forms, CRM or inbox routing, lightweight automation where useful",
      ],
    },
    {
      id: "features",
      title: "Service Scope",
      type: "features",
      bullets: [
        "Refreshes for outdated or underperforming sites",
        "Mobile-first cleanup for navigation, layout, CTAs",
        "Lead-capture improvements and form handling",
        "Technical cleanup for brittle or inconsistent setups",
        "Basic local SEO, metadata, page organization",
        "GA4 refinement tied to business actions",
        "Optional integrations for intake and follow-up",
        "Support moving beyond Facebook-only or directory-dependent presence",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Digital system that better matches the current business",
        "Easier to trust, navigate, measure, and use as an operating asset",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "Service line, not a single anonymized engagement; public proof is capability framing unless URLs/metrics are added",
        "Each engagement scoped individually",
        "Deep branding retainers or ongoing marketing out of scope unless explicit",
      ],
    },
    {
      id: "tech-stack",
      title: "Typical Touchpoints",
      type: "tech-stack",
      techStack: [
        { name: "Next.js", category: "Common" },
        { name: "GA4", category: "Measurement" },
        { name: "Forms / automation", category: "Ops" },
      ],
    },
  ],
};
