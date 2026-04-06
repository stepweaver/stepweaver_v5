/** One-page brief: factual substance ported from v3 `lib/briefData.js`, tightened for v5. */

export const briefData = {
  identity: {
    eyebrow: "λstepweaver // operator brief",
    name: "Stephen Weaver",
    roles: ["Full-Stack Developer", "Systems Builder", "Automation & AI Integration"] as const,
    statement:
      "I build operational web systems, automation, and AI-assisted tooling for businesses that have outgrown duct-tape workflows. Former business analyst, operations manager, and Air Force cryptologic linguist. 8+ years bridging how systems work and how people actually use them.",
  },
  roleFit: {
    title: "Where I fit",
    items: [
      "Full-stack engineering and implementation (Next.js, React, Node.js)",
      "Workflow automation and tool integration (n8n, APIs, webhooks)",
      "AI-assisted systems and LLM integration",
      "Internal tools, dashboards, and operational consoles",
      "Contract, sprint, and project-based work",
      "Legacy process cleanup and prototype-to-production builds",
    ] as const,
  },
  flagshipProjects: [
    {
      slug: "stepweaver-dev",
      label: "stepweaver.dev",
      type: "Multi-surface platform",
      summary:
        "Next.js 15 portfolio platform with terminal UX, AI chat, Notion-fed codex, route groups, and a shared protected API layer.",
      tags: ["Next.js", "Notion API", "Groq", "Tailwind CSS", "Vercel"] as const,
      href: "/projects/stepweaver-dev",
    },
    {
      slug: "silent-auction",
      label: "Silent Auction Platform",
      type: "Real-time operational app",
      summary:
        "Fundraising platform with real-time bidding state, Supabase Realtime, role-based access, and live event operations under pressure.",
      tags: ["Next.js", "Supabase", "Realtime", "Auth", "PostgreSQL"] as const,
      href: "/projects/silent-auction",
    },
    {
      slug: "lsigil-setup",
      label: "λsigil Lead Ops Runtime",
      type: "Lead ops runtime",
      summary:
        "Local-first lead ops for contractor prospecting: discovery, contact-path analysis, verification, approval-gated review, evidence, reporting, constrained drafts. NDJSON resolver, Next.js console, optional OpenRouter over evidence.",
      tags: ["Next.js", "NDJSON", "OpenRouter", "Node.js"] as const,
      href: "/projects/lsigil-setup",
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
    { label: "See All Projects", href: "/projects", variant: "secondary" as const },
    { label: "GitHub", href: "https://github.com/stepweaver", variant: "secondary" as const },
    { label: "Contact", href: "/contact", variant: "secondary" as const },
  ] as const,
};
