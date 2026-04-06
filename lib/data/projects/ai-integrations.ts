import type { Project } from "../projects.schema";

export const aiIntegrations: Project = {
  slug: "ai-integrations",
  title: "AI Integrations",
  description: "Custom AI agent architecture with project knowledge injection, dual-provider fallback, and citation system.",
  status: "live",
  tags: ["AI/ML", "Next.js", "Groq", "OpenAI"],
  keywords: ["ai", "chat", "agent", "lambda", "groq", "openai"],
  imageUrl: "/images/ai_integrations.png",
  link: "/terminal",
  builtFor: "stepweaver.dev visitors and AI agents",
  solved: "Context-aware AI responses with project-specific knowledge",
  delivered: ["Dual-provider LLM fallback (Groq → OpenAI)", "Citation marker system", "Bot protection + rate limiting", "Terminal and web chat surfaces"],
  cardDescription: "Lambda AI agent with project knowledge",
  cardBuiltFor: "Visitors + AI agents",
  cardSolved: "Context-aware responses",
  cardDelivered: ["Groq + OpenAI fallback", "Citation system", "Bot protection"],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "This case study is proof of a real AI integration pattern—not a generic pitch. The concrete system is λlambda: a shared `/api/chat` route is the single source of truth; the floating widget, project-page chat, and terminal `chat` command all consume the same backend with channel-aware prompting, server-owned system instructions, project knowledge injection, and optional `[[CITE:…]]` markers stripped server-side into a citation rail.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Generic AI chatbots lack project-specific context",
        "Single-provider APIs create cost and reliability risk",
        "Bot spam and rate abuse are constant threats",
        "Terminal and web surfaces need different response formats",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "One `/api/chat` route; web surfaces share a `useChat` hook, terminal uses the same JSON contract via `buildChatRequestPayload`",
        "Groq primary with OpenAI Responses API fallback, vision model when attachments are present",
        "Portfolio-derived project index + detailed records appended to the system prompt (with an honest truncation cap)",
        "Honeypot + timing bot checks, same-origin gate, Zod validation, sanitized message normalization",
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
        "Knowledge is curated text from this repo—not live RAG over arbitrary user documents",
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
