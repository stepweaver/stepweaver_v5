/** About / operator dossier content. */

import { ABOUT_STATEMENT, LEARNING_LAB, ROLES } from "./identity";

export const briefData = {
  identity: {
    eyebrow: "λstepweaver // about",
    name: "Stephen Weaver",
    roles: ROLES,
    statement: ABOUT_STATEMENT,
  },
  learningLab: LEARNING_LAB,
  roleFit: {
    title: "Where I fit",
    items: [
      "Full-stack implementation across TypeScript, JavaScript, React, Node.js, and the stack the problem requires",
      "Custom data workflows, automation, and tool integration (n8n, APIs, webhooks)",
      "AI-assisted systems with explicit guardrails",
      "Internal tools, dashboards, and operational consoles",
      "Product-minded roles on operations-heavy or logistics-adjacent teams",
      "Work that requires entering an unfamiliar domain or technology and shipping a working system",
      "Contract, sprint, and project-based engagements when the fit is clear",
    ] as const,
  },
  flagshipProjects: [
    {
      slug: "parcel-sweep",
      label: "Parcel Sweep",
      type: "Full-stack ops system",
      summary:
        "Operational workflow modeling + full-stack architecture. Last-mile delivery tooling from intake through dispatch.",
      tags: ["React", "Express", "SQLite", "Socket.io"] as const,
      href: "/work/parcel-sweep",
    },
    {
      slug: "silent-auction",
      label: "Silent Auction Platform",
      type: "Production realtime app",
      summary:
        "Production app + realtime + users + business rules. Live fundraising operations under event pressure.",
      tags: ["Next.js", "Supabase", "Realtime", "Auth", "PostgreSQL"] as const,
      href: "/work/silent-auction",
    },
    {
      slug: "lsigil-setup",
      label: "λsigil",
      type: "Guarded automation runtime",
      summary:
        "Business automation + deterministic systems + AI boundaries. Evidence, qualification, and human approval gates.",
      tags: ["TypeScript", "Next.js", "Lead ops"] as const,
      href: "/work/lsigil-setup",
    },
    {
      slug: "bill-planner",
      label: "λledger",
      type: "Product / data application",
      summary:
        "Product thinking + data modeling + application UX. Paycheck-window cashflow as a structured app.",
      tags: ["Next.js", "PostgreSQL", "Drizzle", "Auth.js"] as const,
      href: "/work/bill-planner",
    },
    {
      slug: "mishawaka-shower-booking",
      label: "Mishawaka Shower Booking",
      type: "Internal process tool",
      summary:
        "Process analysis → practical internal tool. An informal real-world process turned into a booking system.",
      tags: ["Next.js", "TypeScript"] as const,
      href: "/work/mishawaka-shower-booking",
    },
    {
      slug: "portfolio-terminal",
      label: "Terminal",
      type: "Interface + AI systems",
      summary:
        "Technical creativity + AI integration + frontend systems. Command router, APIs, and a shared AI backend.",
      tags: ["Next.js", "TypeScript", "LLM"] as const,
      href: "/work/portfolio-terminal",
    },
  ] as const,
  stackSnapshot: {
    title: "Working stack",
    categories: [
      { label: "Frontend", items: ["Next.js", "React", "Tailwind CSS", "TypeScript"] as const },
      { label: "Backend", items: ["Node.js", "Next.js API routes", "PostgreSQL", "Supabase"] as const },
      { label: "Automation", items: ["n8n", "REST APIs", "Webhooks", "OpenRouter"] as const },
      { label: "Infra", items: ["Vercel", "Neon", "GitHub", "Notion API"] as const },
    ] as const,
  },
  ctas: [
    { label: "View Resume", href: "/resume", variant: "primary" as const },
    { label: "See Work", href: "/work", variant: "secondary" as const },
    { label: "GitHub", href: "https://github.com/stepweaver", variant: "secondary" as const },
    { label: "Contact", href: "/contact?intent=hire", variant: "secondary" as const },
  ] as const,
};
