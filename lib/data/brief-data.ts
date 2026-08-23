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
      type: "Last-mile ops prototype",
      summary:
        "Field-aware last-mile delivery workflow tooling grounded in sequencing pressure and ops constraints.",
      tags: ["React", "Express", "SQLite", "Socket.io"] as const,
      href: "/work/parcel-sweep",
    },
    {
      slug: "silent-auction",
      label: "Silent Auction Platform",
      type: "Real-time operational app",
      summary:
        "Fundraising platform with real-time bidding state, Supabase Realtime, role-based access, and live event operations under pressure.",
      tags: ["Next.js", "Supabase", "Realtime", "Auth", "PostgreSQL"] as const,
      href: "/work/silent-auction",
    },
    {
      slug: "ai-integrations",
      label: "AI Integrations",
      type: "Guarded AI systems",
      summary:
        "Portfolio-native AI with shared protected backends, rate limits, sanitization, and explicit trust boundaries.",
      tags: ["Next.js", "Groq", "OpenAI", "Vercel KV"] as const,
      href: "/work/ai-integrations",
    },
    {
      slug: "carrier-journal",
      label: "Field Journal",
      type: "Personal fitness systems product",
      summary:
        "Walking and fitness journal with KPI/dashboard artifact: miles, hydration, weather, recovery.",
      tags: ["Next.js", "Notion API", "Zod", "TypeScript"] as const,
      href: "/work/carrier-journal",
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
