import type { Project } from "../projects.schema";

export const aiIntegrations: Project = {
  slug: "ai-integrations",
  title: "AI Integrations",
  description:
    "A service-facing AI integration case study anchored by a shipped build: λlambda, a shared chat backend used by the widget, page chat, and terminal.",
  status: "live",
  tags: ["AI Integration", "Next.js", "LLM UX", "Prompt Engineering", "API Security"],
  keywords: ["ai", "chat", "agent", "lambda", "groq", "openai"],
  imageUrl: "/images/ai_integrations.png",
  link: "/terminal",
  builtFor: "Teams that need practical AI wiring without science-project stacks",
  solved: "Calling an LLM is easy; one coherent assistant across surfaces without exposed prompts is harder",
  delivered: [
    "Design and build AI-assisted workflows, agents, and internal tools around real business inputs and outputs",
    "Connect model APIs to existing systems without turning the stack into a science project",
  ],
  cardDescription:
    "AI integration work for teams that need practical automation, agents, or AI features wired into existing systems.",
  cardBuiltFor: "teams that need practical automation and agents",
  cardSolved: "LLM demos that never reach production-shaped boundaries",
  cardDelivered: [
    "AI-assisted workflows and internal tools around real inputs and outputs",
    "Model APIs connected to existing systems without unnecessary stack sprawl",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "This page should read as proof of a real AI integration pattern, not a generic AI pitch. The concrete example on this site is λlambda: one shared `/api/chat` route; the floating widget, page chat, and terminal `chat` command share that backend with channel-aware prompting, server-owned instructions, curated project knowledge, and optional `[[CITE:…]]` markers rendered into a citation rail on the web surfaces.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Generic chatbots lack portfolio-specific context",
        "Single-provider APIs create cost and reliability risk",
        "Bot spam and rate abuse are constant threats",
        "Terminal and web surfaces need different response shapes",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Shared `/api/chat` route as single source of truth; web uses a shared hook, terminal uses the same JSON contract",
        "Groq primary with OpenAI fallback; vision path when attachments are present",
        "Portfolio-derived project index and detailed records in the system prompt, with explicit truncation when needed",
        "Honeypot and timing bot checks, same-origin gate, Zod validation, sanitized message normalization",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Composable security pipeline (withProtectedRoute)",
        "Zod validation at API boundaries",
        "Citation marker system ([[CITE:...]])",
        "Rate limiting with Vercel KV fallback",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Dual-provider LLM with automatic failover",
        "Vision model auto-detection for image attachments",
        "Source citations rendered as icon-labeled link rail",
        "Prompt injection defense",
        "Channel-aware suffixes (terminal vs web)",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "System prompt and knowledge blocks live server-only; clients cannot override persona rules",
        "Incoming text stripped of HTML-ish noise; assistant history filtered for obvious injection phrases",
        "Assistant output passed through prompt-leak redaction before returning to the client",
        "20-second upstream abort; message count and length caps to control cost and abuse surface",
        "Rate limiting with in-memory fallback suitable for dev; KV-backed limits where configured",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "No per-user accounts; widget and page chat history live in React state only (terminal calls are effectively single-turn unless the shell grows a transcript)",
        "Knowledge is curated text from this repo, not live RAG over arbitrary user documents",
        "Full project knowledge in every request is powerful but heavy; the server may truncate the detailed block with an explicit prompt instruction when needed",
        "Automated tests cover schema and citation helpers; broader integration tests are still thin",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      content:
        "Shipped a real AI feature on the live portfolio with visible boundaries: interface layer, protected backend, server-owned prompts, provider routing, and truthful handling of what is and is not grounded in project records.",
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js", category: "Framework" },
        { name: "Groq", category: "AI Provider" },
        { name: "OpenAI", category: "AI Provider" },
        { name: "Zod", category: "Validation" },
        { name: "Vercel KV", category: "Rate Limiting" },
        { name: "DOMPurify", category: "Security" },
      ],
    },
  ],
  liveUrl: "/terminal",
};

export default aiIntegrations;
