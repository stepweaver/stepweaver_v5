import type { Project } from "../projects.schema";

/** RPG dice utility (v3 `rpg-dice-roller`). Route `/dice-roller` stays the live tool. */
export const rpgDiceRoller: Project = {
  slug: "rpg-dice-roller",
  title: "RPG Dice Roller",
  description:
    "A client-side RPG dice roller with notation-aware roll logic, Web Crypto-backed randomness, selective rerolls, and browser-persisted history.",
  status: "live",
  tags: ["Web Development", "React", "Web Crypto", "Interactive Tool"],
  keywords: ["dice", "rpg", "notation", "crypto", "roller"],
  imageUrl: "/images/dice_roller.png",
  link: "/dice-roller",
  builtFor: "Real tabletop sessions",
  solved: "Slow dice math and awkward rerolls on mobile",
  delivered: [
    "A fast dice pool builder with hold, reroll, and saved history",
    "Mixed dice pools, hold and reroll, keyboard shortcuts in a terminal-style UI",
    "Fully client-side with localStorage history, reusable engine separate from UI",
  ],
  cardDescription:
    "Browser RPG utility for actual tabletop use: mixed dice pools, hold and reroll, keyboard shortcuts, and local history.",
  cardBuiltFor: "real tabletop sessions",
  cardSolved: "slow dice math and awkward rerolls on mobile",
  cardDelivered: [
    "Mixed dice pools, hold and reroll, keyboard shortcuts in a terminal-style UI",
    "Fully client-side with localStorage history, built as a reusable small tool",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "A real utility, not a visual toy. Mixed pools, modifiers, notes, held-die rerolls, copyable notation, and keyboard shortcuts. Core split: roll logic in a portable engine, presentation in React.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Most browser rollers are shallow randomizers or noisy tools with weak logic",
        "Needed actual RPG use cases, fully client-side history, and stronger randomness than naive Math.random() for game results",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Reusable engine: parsing, validation, roll execution, rerolls, totals, formatting",
        "React UI for pool building, results, and history",
        "`crypto.getRandomValues()` when available, with rejection sampling to reduce modulo bias",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Logic layer: parsing, validation, rolling, rerolls, totals, output shaping",
        "UI layer: pool state, results, history, keyboard interaction",
        "Same engine usable from `/dice-roller` and terminal `roll` without duplicating logic",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Reusable roll engine separated from React UI",
        "Web Crypto randomization with rejection sampling",
        "Held-die rerolls with stable position-based state",
        "Notation-aware mixed pools and modifiers",
        "Browser-persisted history with localStorage",
        "Keyboard shortcuts and terminal-aligned UX",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Tests for notation parsing, pool validation, and total calculation",
        "Clipboard support for notation and results",
        "Math.random() only as compatibility fallback when crypto is unavailable",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Portfolio piece that behaves like a real utility",
        "Reusable roll engine for web UI and terminal commands",
        "Client-side only: less complexity, privacy-friendly, instant feel",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js", category: "App" },
        { name: "React", category: "UI" },
        { name: "Web Crypto API", category: "Randomness" },
        { name: "Jest", category: "Testing" },
      ],
    },
  ],
  liveUrl: "/dice-roller",
};

export default rpgDiceRoller;
