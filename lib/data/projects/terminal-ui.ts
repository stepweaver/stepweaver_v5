import type { Project } from "../projects.schema";

export const terminalUI: Project = {
  slug: "terminal-ui",
  title: "Terminal UI",
  description: "Interactive terminal experience with command system, Zork game engine, weather API, and contact form.",
  status: "live",
  tags: ["Terminal", "Interactive", "React"],
  keywords: ["terminal", "cli", "zork", "interactive", "command"],
  imageUrl: "/images/terminal_ui.png",
  link: "/terminal",
  builtFor: "stepweaver.dev visitors",
  solved: "Engaging technical portfolio experience",
  delivered: ["Full command system", "Zork game engine", "Weather integration", "Contact form wizard", "AI chat command"],
  cardDescription: "Interactive terminal experience",
  cardBuiltFor: "Portfolio visitors",
  cardSolved: "Engagement through interactivity",
  cardDelivered: ["Command system", "Zork game", "Weather", "Contact form"],
  sections: [
    { id: "overview", title: "Overview", type: "overview", content: "An interactive terminal experience serving as the flagship portfolio feature. Includes a full command system, Zork text adventure, weather API integration, contact form wizard, and AI chat." },
    { id: "problem", title: "The Problem", type: "problem", bullets: ["Portfolio sites are static and forgettable", "No way to demonstrate technical skill interactively", "Terminal aesthetic without terminal function"] },
    { id: "solution", title: "The Solution", type: "solution", bullets: ["Full interactive terminal in the browser", "Zork game engine with pure functional architecture", "Real weather data via API", "Contact form as terminal wizard", "AI chat as terminal command"] },
    { id: "architecture", title: "Architecture", type: "architecture", bullets: ["Mode-based command routing (contact, codex, resume, zork)", "Hidden input for keyboard capture", "DOMPurify HTML sanitization", "Lazy-loaded game engines"] },
    { id: "features", title: "Key Features", type: "features", bullets: ["10+ terminal commands", "Zork text adventure with save/restore", "Weather with geolocation", "Contact form wizard", "AI chat integration", "Codex browsing", "Resume viewer"] },
    { id: "engineering", title: "Engineering Decisions", type: "engineering", bullets: ["Pure functional Zork engine (testable)", "Lazy loading for game code", "Command history with up/down arrows", "Structured output rendering"] },
    { id: "outcome", title: "Outcome", type: "outcome", content: "A memorable, interactive terminal experience that demonstrates technical capability while serving as a functional portfolio piece." },
    { id: "tech-stack", title: "Tech Stack", type: "tech-stack", techStack: [{ name: "React", category: "Framework" }, { name: "TypeScript", category: "Language" }, { name: "OpenWeatherMap", category: "API" }, { name: "DOMPurify", category: "Security" }] },
  ],
  liveUrl: "/terminal",
};

export default terminalUI;
