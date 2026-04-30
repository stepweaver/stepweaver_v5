import type { Project } from "../projects.schema";

export const stepweaverDev: Project = {
  slug: "stepweaver-dev",
  title: "stepweaver.dev",
  description:
    "A Next.js portfolio application with standard routes, a browser terminal, structured project pages, Notion-backed content, and a protected AI chat backend.",
  status: "live",
  tags: ["Next.js", "React", "App Router", "Terminal UI", "AI Chat", "Notion API", "Portfolio Platform", "Vercel"],
  keywords: ["portfolio", "platform", "terminal", "notion", "security"],
  imageUrl: "/images/stepweaver-dev.png",
  githubRepo: "stepweaver/stepweaver_v5",
  builtFor: "Visitors who want the whole system story, not a single UI trick",
  solved: "Treating the portfolio as a brochure when the repo is a small app platform",
  delivered: [
    "Multi-surface App Router app with reusable `/projects/[slug]` rendering and protected shared chat",
    "App Router surfaces (homepage, terminal, codex, project pages, APIs) driven by structured case-study data",
    "CSP nonce middleware, same-origin and rate-limited API routes, sanitization, dynamic imports for heavy client modules",
  ],
  cardDescription:
    "Custom Next.js portfolio: normal pages, command terminal, data-driven case studies, Notion-fed codex, one shared AI chat layer behind hardened APIs.",
  cardBuiltFor: "visitors who want the whole system story, not a single UI trick",
  cardSolved: "treating the portfolio as a brochure when the repo is a small app platform",
  cardDelivered: [
    "App Router surfaces with structured data driving case studies instead of one-off templates",
    "CSP nonce middleware, rate-limited APIs, sanitization, dynamic imports for heavy client modules",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "The portfolio is also the project that shows how I think. It evolved from a simple presence into a publishing system, case-study platform, command-driven interface, and place for technical and aesthetic ideas I care about. Not a generic template: a custom application meant to feel mine.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "A standard portfolio would have been easier but false to how I work: terminals, monospace type, systems thinking, deliberate interaction",
        "Needed a place for projects, notes, experiments, and technical writing without abandoning that taste",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Treated the site as an evolving system: static HTML to component frontends to Next.js, MDX, then Notion where flexible content mattered",
        "Terminal added because I like CLIs and wanted the portfolio to expose that part of how I think",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Next.js App Router base; route groups separate default chrome from console-style and embed-style pages",
        "Structured project data feeds reusable case-study rendering",
        "`withProtectedRoute`, internal APIs, middleware CSP nonces, shared hooks",
        "Layered iteration: some architecture from real requirements, some from learning over time",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Command-driven terminal with mode-aware input",
        "Reusable project-detail rendering from structured data",
        "Shared AI chat backend for terminal and chat widget",
        "Notion-backed codex via internal APIs with shared normalization",
        "Stateful flows: command history, weather selection, contact intake, local UI preferences",
        "Standard routes alongside terminal exploration",
        "Trust boundary on mutable routes: origin checks, Zod, bot/timing signals, KV rate limits in production",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Dynamic imports for client-heavy features",
        "CSP nonce middleware and explicit security headers",
        "`withProtectedRoute` composes method, origin/host, rate limit, parse, bot detection, validation, sanitization",
        "Production rate limiting uses Vercel KV; allowlisted `safeHref` for assistant links",
        "Shared dice engine as tested utility, not embedded in terminal UI only",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Frontend engineering, API design, interaction design, and content architecture in one codebase",
        "Reusable infrastructure for new case studies",
        "Room for experiments, writing, and tools without disconnected sections",
        "The portfolio itself is part of the work",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "Some large components (generic project page, terminal core)",
        "Test coverage strongest on security primitives and shared utilities, not every UI path",
        "Production depends on KV and origin allowlists; local dev more permissive",
        "Some live sections still sparse",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js 15", category: "Framework" },
        { name: "Notion API", category: "Content" },
        { name: "Tailwind CSS", category: "Styling" },
        { name: "Vercel", category: "Deploy" },
      ],
    },
  ],
};
