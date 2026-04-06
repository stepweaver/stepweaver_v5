import type { Project } from "../projects.schema";

/** Browser terminal for the portfolio (v3 `portfolio-terminal`). */
export const portfolioTerminal: Project = {
  slug: "portfolio-terminal",
  title: "Portfolio Terminal",
  description:
    "A browser terminal for navigating the portfolio through actual commands instead of static navigation.",
  status: "live",
  tags: ["Next.js", "Terminal UI", "Interactive UX", "AI Integration", "Command Router", "JavaScript"],
  keywords: ["terminal", "cli", "commands", "zork", "interactive"],
  imageUrl: "/images/terminal_ui.png",
  link: "/terminal",
  githubRepo: "https://github.com/stepweaver/stepwever_v3",
  builtFor: "People who want proof fast instead of clicking through a brochure",
  solved: "Portfolio browsing that hides the interesting parts behind normal navigation",
  delivered: [
    "Command-driven interface for projects, tools, and chat",
    "Terminal interface: resume, Codex, λlambda chat, contact, weather, dice, games from one surface",
  ],
  cardDescription:
    "Interactive portfolio shell in Next.js and React. Commands for projects, AI chat, tools, contact, and utilities.",
  cardBuiltFor: "people who want proof fast instead of clicking through a brochure",
  cardSolved: "portfolio browsing that hides the interesting parts behind normal navigation",
  cardDelivered: [
    "Terminal routes to resume, Codex, chat, contact, weather, dice, embedded games",
    "Shared AI backend and dice engine with channel-aware behavior",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "An application layer inside the portfolio. It exposes real site behavior through commands: resume browsing, Codex content, AI chat, weather lookup, contact capture, mini-games, and shared dice rolling.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "The hard part was not the styling. It was building a command surface that could handle state, shared integrations, and client/server boundaries without collapsing into one large component",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Client-only terminal shell, modular command handlers, mode-specific helpers",
        "Reuse existing site logic: `roll` uses the shared dice engine; `chat` posts to the shared `/api/chat` route",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Sits on Next.js as a client-rendered interaction layer; heavy pieces dynamically imported",
        "Stateful modes: Resume, Codex, Zork, Blackjack, contact, weather selection",
        "Server-backed features use protected API routes: validation, rate limiting, sanitization, bot checks",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Command-driven navigation: help, resume, Codex, weather, roll, chat, contact, games",
        "Shared dice notation through the same roller logic as the RPG Dice Roller",
        "Shared AI chat through the site’s protected `/api/chat` backend",
        "Guided contact intake from inside the terminal",
        "Keyboard UX: history, cursor movement, focus recovery, terminal-style output",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Separated page shell, runtime, command handlers, hooks, and content modules",
        "Dynamic imports for client-only terminal pieces",
        "Mode-aware routing so Codex, Resume, and games intercept input before the default switch",
        "Client-side HTML sanitization; protected server routes with origin checks and rate limits",
        "`crypto.getRandomValues` when available for die results",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Distinctive interaction system without abandoning maintainability",
        "Reusable command surface: frontend systems thinking, not only visual styling",
        "Reduced duplication by reusing shared chat and dice logic",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "Browser terminal, not a full shell or virtual filesystem",
        "Main terminal component still carries substantial responsibility",
        "Weather is a client-side integration; proxying through the server would be stricter",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js", category: "Framework" },
        { name: "React", category: "UI" },
        { name: "TypeScript", category: "Language" },
      ],
    },
  ],
  liveUrl: "/terminal",
};

export default portfolioTerminal;
