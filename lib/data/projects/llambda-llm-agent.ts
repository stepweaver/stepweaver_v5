import type { Project } from "../projects.schema";

export const llambdaLlmAgent: Project = {
  slug: "llambda-llm-agent",
  title: "λlambda LLM Agent",
  description:
    "A portfolio-native LLM assistant built into the Next.js site and exposed through a widget, a dedicated chat page, and a terminal command, all backed by one protected route.",
  status: "live",
  tags: ["Next.js", "React", "LLM", "Groq", "OpenAI", "Prompt Architecture", "Terminal UX", "AI Integration"],
  keywords: ["lambda", "chat", "api", "groq", "openai", "terminal"],
  imageUrl: "/images/chatbot.png",
  link: "/terminal",
  githubRepo: "stepweaver/stepweaver_v5",
  builtFor: "Recruiters and clients trying to understand what I build",
  solved: "Too much portfolio clicking and not enough context",
  delivered: [
    "One shared chat backend across the site and terminal",
    "Terminal at `/terminal` with commands for resume, Codex, dice roller, chat, navigation, tools",
  ],
  cardDescription:
    "Portfolio LLM agent answering questions about my work in both site chat and the terminal chat command.",
  cardBuiltFor: "recruiters and clients trying to understand what I build",
  cardSolved: "too much portfolio clicking and not enough context",
  cardDelivered: [
    "Shared λlambda chat backend for terminal chat command and web chat UI",
    "Commands for resume, Codex, dice, chat, navigation",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "λlambda is not a generic embed. It is a shared AI layer so visitors can ask direct questions about the portfolio through multiple interfaces without duplicating backend logic.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Portfolio sites make people infer too much",
        "Needed faster discovery, native to the site, with prompt logic on the server",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "One `/api/chat` backend; widget and page chat share a path; terminal uses the same route through a command bridge",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Server over client: prompts stay server-side",
        "`withProtectedRoute`: origin/host allowlist, Zod, rate limits, bot heuristics, timeouts, provider fallback",
        "Shared request builder so widget and terminal share an explicit contract",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Shared backend across widget, page chat, and terminal",
        "Channel-aware prompting: terminal terse/plain, site can use richer formatting",
        "Groq-first with OpenAI fallback; image attachments on web chat",
        "Sticky-bottom scroll and jump-to-latest in transcript UI",
        "Sanitization, suspicious-message filtering, prompt-leak redaction, allowlisted links in rendered markdown",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Same-origin enforcement on chat endpoint",
        "History normalized before model submission: roles constrained, depth capped",
        "Responses marked no-store; upstream timeouts return bounded errors",
        "CSP and security headers at middleware reinforce client trust boundaries",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Reusable AI layer instead of three disconnected chat implementations",
        "Prompt architecture and route protection visible in shipped code",
        "v5 adds citation markers and project knowledge injection where configured; see AI Integrations for integration framing",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "Prompt-driven assistant, not a tool-using autonomous agent with long-term memory in the chat layer",
        "Terminal and web share the route but not always the same front-end hook path",
        "Production chat depends on same KV and origin requirements as other hardened APIs",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js", category: "App" },
        { name: "Groq / OpenAI", category: "Models" },
        { name: "Zod", category: "Validation" },
      ],
    },
  ],
  liveUrl: "/terminal",
};
