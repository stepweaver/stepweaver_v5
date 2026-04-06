import type { Project } from "../projects.schema";

export const neonProfileCard: Project = {
  slug: "neon-profile-card",
  title: "Neon Profile Card",
  description:
    "A client-side profile-card experiment that evolved into the operator-card system on the λstepweaver homepage.",
  status: "live",
  tags: ["Next.js", "React", "UI Architecture", "Animation", "Portfolio Engineering"],
  keywords: ["hero", "operator", "matrix", "animation", "identity"],
  githubRepo: "stepweaver/stepwever_v3",
  builtFor: "Portfolio hero identity",
  solved: "Hero elements with more signal than a static text block, without one-off flash",
  delivered: [
    "Reusable React component with profile data model, IBM/OCR typography, CRT-style glow",
    "Matrix Sync status animation tuned to the terminal aesthetic",
  ],
  cardDescription:
    "Homepage identity component in Next.js, React, and Tailwind. Operator-card UI aligned with the terminal system.",
  cardBuiltFor: "Portfolio homepage identity",
  cardSolved: "generic hero blocks with low signal",
  cardDelivered: [
    "Reusable React component with profile model, typography, CRT glow",
    "Matrix Sync animation tuned to λstepweaver terminal aesthetic",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Started as a reusable identity card with fallback profile data and motion. Informed the production hero card and live case-study demo path.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: ["Needed a hero with more signal than static copy; had to stay reusable, not flashy once"],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Card component, shared animation hook, route-level live demo mapping",
        "Motion logic reusable; production version can diverge where needed",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Experiment in NeonProfileCard; production in Hero; shared motion in useMatrixSync / MatrixSync",
        "Project route injects live component by slug",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Optional profile prop with fallbacks for name, role, tagline, status, avatar, badges",
        "Defensive badge handling: strings and objects tolerated",
        "MatrixSync: terminal-style status panel, phase colors, attempt counts, animated register cells",
        "useMatrixSync owns sequencing and phase transitions",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Timed animation logic separated from presentation: MatrixSync reads state, hook owns sequencing",
        "Hook configurable for glyph sets and cell counts",
        "Slug-driven project page makes interactive case studies a platform feature",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Experiment became part of the live homepage",
        "Animation as reusable hook-driven pattern",
        "Live hero demo stronger proof than screenshot-only case study",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "Live case study may render production HeroOperatorCard, not the standalone NeonProfileCard: distinction should stay explicit",
        "Lightweight validation on profile input; no formal schema",
        "Qualitative outcomes; no conversion metrics in repo",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js", category: "Framework" },
        { name: "React", category: "UI" },
        { name: "Tailwind CSS", category: "Styling" },
      ],
    },
  ],
};

export default neonProfileCard;
