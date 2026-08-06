import type { Project } from "../projects.schema";

export const mailSortAcademy: Project = {
  slug: "mail-sort-academy",
  title: "Mail Sort Academy",
  description:
    "An unofficial mail-classification study drill based on publicly documented mail-handling rules. Practice class identification, undeliverable-business-mail rulings, endorsements, and accountable-mail handling. Scored, timed, and keyboard-driven.",
  status: "live",
  imageUrl: "/images/mail_sort_academy.png",
  tags: ["Next.js", "Game", "Study Tool", "TypeScript", "UX Design"],
  keywords: [
    "mail sort",
    "study game",
    "mail classification",
    "ubbm",
    "endorsements",
    "accountable mail",
    "educational drill",
  ],
  builtFor: "anyone practicing publicly documented mail-classification decisions",
  solved: "turning abstract mail-handling rules into scored, repeatable decision practice",
  delivered: [
    "Five training modes covering class sort, undeliverable rulings, endorsements, accountable chain, and mixed simulation",
    "Critical mistake system that flags illegal undeliverable rulings and dangerous endorsement errors",
    "Keyboard-first UX with number keys, Enter, and Escape; no mouse required mid-drill",
    "Persistent localStorage stats: lifetime score, best round, rounds completed, critical errors",
    "In-game study guide with core rules accessible mid-session without losing progress",
  ],
  cardDescription:
    "A scored, keyboard-driven mail-classification study drill from public educational material. Five modes, critical mistake detection, and a study guide. Unofficial — not a credential.",
  cardBuiltFor: "learners drilling publicly documented mail-classification decisions",
  cardSolved: "converting abstract mail-handling rules into fast, repeatable scored practice",
  cardDelivered: [
    "Five game modes from class sort to mixed handling simulation",
    "Scoring with speed bonuses and critical mistake penalties",
  ],
  liveUrl: "/mail-sort-academy",
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Mail Sort Academy is an unofficial study drill for mail classification, undeliverable-business-mail rulings, endorsements, and accountable-mail handling. It is built from publicly available educational references and scenario patterns — not from any employer program or official training credential. It is not an official product of any postal operator. It is a scored, keyboard-driven practice tool for pattern recognition under time pressure.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Mail handling decisions are high-stakes: marking First-Class mail undeliverable when it is not is a serious error",
        "Endorsement codes require fast, confident recall under load",
        "Passive reading of public handbooks does not build rapid pattern recognition",
        "Few practice tools model classification decisions with clear consequence signals",
        "Learners need repeatable drills, not one-time tutorials",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Five escalating training modes covering the classification decision surface",
        "A critical mistake system that distinguishes wrong answers from dangerous ones",
        "Scenario-based mail cards with shape, class, endorsement, and extra service encoded",
        "Speed bonuses for answers under 7 seconds reward pattern recognition",
        "In-game study guide with core rules, reachable mid-session without resetting progress",
        "Keyboard-first controls: number keys pick answers, Enter advances, Escape resets",
      ],
    },
    {
      id: "key-features",
      title: "Training Modes",
      type: "key-features",
      bullets: [
        "MODE-01 Class Sort: Identify the mail class from the scenario.",
        "MODE-02 Undeliverable or Not: Standard drill. Decide whether a piece is undeliverable bulk business mail or requires forwarding, return, or delivery. Critical mistake detection active.",
        "MODE-03 Endorsement Drill: Standard drill. Choose the correct endorsement from the option set.",
        "MODE-04 Accountable Chain: Inspection level. Handle Certified, Registered, COD, Signature Confirmation, and other accountable mail.",
        "MODE-05 Mixed Simulation: Sort a mixed deck into handling bins.",
      ],
    },
    {
      id: "architecture",
      title: "Scoring System",
      type: "architecture",
      content:
        "Every answer is scored against the card's known-correct answer. Correct answers earn 100 points. Answers under 7 seconds earn a 25-point speed bonus. Wrong answers cost 50 points. Critical mistakes cost 100 points and are tracked separately. Lifetime stats persist in localStorage.",
    },
    {
      id: "keyboard-shortcuts",
      title: "Keyboard Controls",
      type: "keyboard-shortcuts",
      bullets: [
        "1–N keys select answer choices by position, matching the on-screen numbered buttons",
        "Enter advances from the result panel to the next card",
        "Escape resets to the mode selection screen from any phase",
        "Study Guide is accessible during a session without losing deck state or score",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "useReducer with a typed action union models the game as a state machine",
        "Phase transitions are explicit and exhaustive",
        "buildRoundDeck filters and shuffles the mail card catalog per mode",
        "Critical mistake detection lives in gameLogic.ts beside the scoring rules",
        "useGameStorage wraps localStorage access with hydration awareness",
        "Stats are only saved once at the round_summary transition",
        "robots: noindex is set on the page; the tool is a utility, not an SEO surface",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "The mail card catalog is static TypeScript: new scenarios require a code change and deploy",
        "localStorage is the only persistence layer: no accounts, no cross-device sync",
        "Speed bonus threshold (7s) is a fixed constant",
        "Study guide content is hardcoded rather than CMS-driven",
        "robots: noindex keeps the tool off search engines by design",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "A functional study tool that models mail-classification decisions from public educational material",
        "Demonstrates domain-driven design: the MailCard model encodes handling-decision complexity",
        "Demonstrates product thinking from constraint: keyboard-first, no-account, no-server UX",
        "Standalone utility — not framed as employer training or a credential",
        "Proof that technical problem-solving skills generalize across domains",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js", category: "App" },
        { name: "TypeScript", category: "Language" },
        { name: "React useReducer", category: "State" },
        { name: "Tailwind CSS", category: "Styles" },
        { name: "localStorage", category: "Persistence" },
        { name: "lucide-react", category: "Icons" },
      ],
    },
  ],
};
