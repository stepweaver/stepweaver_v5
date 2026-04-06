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
      content: "A branded AI chat agent (lambda) that serves both the terminal chat command and a web-based chat widget. Built with dual-provider LLM fallback, project knowledge injection, and a citation system.",
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
        "Groq primary with OpenAI Responses API fallback",
        "Project knowledge embedded in system prompt",
        "Three-layer bot protection (honeypot, timing, gibberish)",
        "Channel-aware response formatting",
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
        "20-second abort timeout prevents hanging",
        "Message sanitization and truncation",
        "Assistant output scanning for prompt leakage",
        "In-memory rate limit fallback for dev",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      content: "A production-ready AI chat system that handles both terminal and web interactions with proper security, validation, and fallback behavior.",
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
