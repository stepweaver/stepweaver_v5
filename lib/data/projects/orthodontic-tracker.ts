import type { Project } from "../projects.schema";

export const orthodonticTracker: Project = {
  slug: "orthodontic-tracker",
  title: "Orthodontic Turn Tracker",
  description:
    "A mobile-first orthodontic turn and treatment-note tracker built with vanilla JavaScript, a thin Node/Vercel API layer, JWT-based household auth, and Supabase persistence.",
  status: "live",
  tags: ["Vanilla JavaScript", "Node.js", "Supabase", "JWT Auth", "Mobile-First UX"],
  keywords: ["orthodontic", "tracker", "supabase", "jwt", "household"],
  imageUrl: "/images/lambda_preview.png",
  githubRepo: "https://github.com/stepweaver/spread-turn-tracker",
  builtFor: "Shared household care workflow",
  solved: "Scattered paper and messages for expander turns and visit notes",
  delivered: [
    "Log top and bottom expander turns with a clear due-today view a household can share",
    "Store visit notes and history in Supabase instead of paper and text threads",
  ],
  cardDescription:
    "Family orthodontic expander tracker for top and bottom turns, visit notes, and progress history.",
  cardBuiltFor: "household orthodontic care tracking",
  cardSolved: "scattered turn logs and visit notes",
  cardDelivered: [
    "Turn logging for upper and lower arches with due-today visibility",
    "Treatment notes in Supabase for shared household access",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Focused full-stack utility for a shared household workflow: turns, notes, schedule state, progress.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Answer operational questions reliably: turn logged?, which arch changed?, next due?, what happened last visit?",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Lightweight client plus thin backend",
        "Browser handles state and rendering; API handles login, token verification, settings, turns, notes",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Compact single-view app: one HTML shell, one main JS controller",
        "JWT auth: approved users in env, tokens issued by backend, Supabase accessed server-side only",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Household login with JWT session verification",
        "Turn logging for upper and lower arches",
        "Interval-based and twice-per-week schedules",
        "Next-due and progress calculations",
        "Treatment notes alongside turn history",
        "Mobile-first UI for quick daily use",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Normalized tables for settings, turns, notes",
        "Parallel load of settings, turns, notes after login",
        "Escaped user note content before rendering",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Usable full-stack tracker for a real household workflow",
        "Portfolio example of right-sized architecture for a small problem",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "Most client logic in one main JS file",
        "Shared-household model, not generalized multi-user architecture",
        "Repo may contain a settings-save bug to fix before calling it polished",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Vanilla JS", category: "Frontend" },
        { name: "Node / Vercel", category: "API" },
        { name: "Supabase", category: "Database" },
      ],
    },
  ],
};

export default orthodonticTracker;
