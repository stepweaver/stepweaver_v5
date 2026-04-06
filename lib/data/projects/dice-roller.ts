import type { Project } from "../projects.schema";

export const diceRoller: Project = {
  slug: "dice-roller",
  title: "Dice Roller",
  description: "RPG dice pool builder with roll history, session management, and support for standard dice notation.",
  status: "live",
  tags: ["Tool", "RPG", "React"],
  keywords: ["dice", "rpg", "roller", "gaming", "dnd"],
  imageUrl: "/images/dice_roller.png",
  link: "/dice-roller",
  builtFor: "Tabletop RPG players",
  solved: "Need for quick, reliable dice rolling",
  delivered: ["Dice pool builder", "Roll history", "Session management", "Standard notation support"],
  cardDescription: "RPG dice pool builder",
  cardBuiltFor: "Tabletop gamers",
  cardSolved: "Quick dice rolling",
  cardDelivered: ["Pool builder", "Roll history", "Session management"],
  sections: [
    { id: "overview", title: "Overview", type: "overview", content: "An RPG dice pool builder supporting standard dice notation (e.g., 3d6+2, 1d20). Features roll history, session management, and a terminal-integrated command." },
    { id: "problem", title: "The Problem", type: "problem", bullets: ["Physical dice not always available", "Complex rolls need tracking", "Session history is valuable"] },
    { id: "solution", title: "The Solution", type: "solution", bullets: ["Dice pool builder UI", "Standard notation parsing", "Persistent roll history", "Terminal command integration"] },
    { id: "features", title: "Key Features", type: "features", bullets: ["Dice pool builder", "Roll history with timestamps", "Session management", "Terminal roll command", "Standard notation (NdM+K)"] },
    { id: "outcome", title: "Outcome", type: "outcome", content: "A reliable, feature-rich dice rolling tool accessible from both the web interface and the terminal." },
    { id: "tech-stack", title: "Tech Stack", type: "tech-stack", techStack: [{ name: "React", category: "Framework" }, { name: "TypeScript", category: "Language" }, { name: "Tailwind CSS", category: "Styling" }] },
  ],
  liveUrl: "/dice-roller",
};

export default diceRoller;
