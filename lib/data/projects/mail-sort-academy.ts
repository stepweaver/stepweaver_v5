import type { Project } from "../projects.schema";

export const mailSortAcademy: Project = {
  slug: "mail-sort-academy",
  title: "Mail Sort Academy",
  description:
    "An unofficial letter carrier study game built from inside the job. Practice real mail classification decisions, UBBM rulings, carrier endorsements, and accountable mail handling. Scored, timed, and keyboard-driven.",
  status: "live",
  imageUrl: "/images/mail_sort_academy.png",
  tags: ["Next.js", "Game", "Study Tool", "TypeScript", "UX Design"],
  keywords: [
    "mail sort",
    "usps",
    "letter carrier",
    "study game",
    "mail classification",
    "ubbm",
    "endorsements",
    "accountable mail",
  ],
  builtFor: "active letter carriers and USPS Academy candidates who need to drill real decisions",
  solved: "turning abstract postal rules into scored, repeatable decision practice",
  delivered: [
    "Five training modes covering the full spectrum of carrier sorting decisions",
    "Critical mistake system that flags illegal UBBM rulings and dangerous endorsement errors",
    "Keyboard-first UX with number keys, Enter, and Escape; no mouse required mid-drill",
    "Persistent localStorage stats: lifetime score, best round, rounds completed, critical errors",
    "In-game study guide with 7 core rules accessible mid-session without losing progress",
  ],
  cardDescription:
    "A scored, keyboard-driven mail sorting drill game built from inside the job. Five training modes, critical mistake detection, and a study guide. All unofficial.",
  cardBuiltFor: "letter carriers studying real postal classification decisions",
  cardSolved: "converting abstract USPS rules into fast, repeatable scored practice",
  cardDelivered: [
    "Five game modes from rookie class sort to full route case simulation",
    "Scoring with speed bonuses and critical mistake penalties",
  ],
  liveUrl: "/mail-sort-academy",
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Mail Sort Academy is an unofficial letter carrier study game built from the inside out. I became a city letter carrier and immediately noticed that learning the actual sorting rules, UBBM decisions, carrier endorsements, and accountable mail chain, requires a kind of rapid pattern recognition that reading a handbook alone does not build. So I built a scored, keyboard-driven drill tool that puts real postal scenarios in front of you and makes you decide under time pressure. It is not a USPS product. It is a study tool written by someone who does the job.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Mail handling decisions are high-stakes: UBBM-ing a First-Class letter is an illegal disposal of mail",
        "Carrier endorsements (ANK, NSN, NSS, VAC, DEC, etc.) require fast, confident recall under load",
        "The USPS handbook exists, but passive reading does not build the muscle memory the job demands",
        "No practice tool existed that modeled actual carrier-level decisions with real consequence signals",
        "New carriers learn from their trainer for a few weeks and then face the decisions alone",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Five escalating training modes covering the full sorting decision surface a carrier encounters",
        "A critical mistake system that distinguishes wrong answers from dangerous ones: illegal UBBM rulings score -100, not -50",
        "Scenario-based mail cards with shape, class, mailer endorsement, and extra service all encoded at the same complexity as real mail",
        "Speed bonuses for answers under 7 seconds reward the pattern recognition that field work actually needs",
        "In-game study guide with 7 core rules, reachable mid-session without resetting progress",
        "Keyboard-first controls: number keys pick answers, Enter advances, Escape resets, usable on any device",
      ],
    },
    {
      id: "key-features",
      title: "Training Modes",
      type: "key-features",
      bullets: [
        "MODE-01 Class Sort: Rookie friendly. Identify the mail class from the scenario: First-Class, Priority, Periodicals, Marketing Mail, Ground Advantage, and more.",
        "MODE-02 UBBM or Not: Regular carrier level. Decide whether a piece is Undeliverable Bulk Business Mail or requires forwarding, return, or delivery. Critical mistake detection active.",
        "MODE-03 Endorsement Drill: Regular carrier level. Choose the correct carrier endorsement from 13 options: ANK, IA, NSN, NSS, NMR, REF, UNC, UTF, VAC, DEC, ILL, Moved, or None.",
        "MODE-04 Accountable Chain: Inspection level. Handle Certified, Registered, COD, Signature Confirmation, and other accountable mail. Illegal UBBM rulings on accountable pieces are critical mistakes.",
        "MODE-05 Route Case Simulation: Mixed difficulty. Sort a full mixed deck into handling bins: deliver, forward CFS, return to sender, UBBM, accountable clerk, leave notice, hold, or ask supervisor.",
      ],
    },
    {
      id: "architecture",
      title: "Scoring System",
      type: "architecture",
      content:
        "Every answer is scored against the card's known-correct answer. Correct answers earn 100 points. Answers under 7 seconds earn a 25-point speed bonus on top of that. Wrong answers cost 50 points. Critical mistakes, including illegal UBBM rulings on First-Class, Priority, accountable, or return-service mail and applying DEC to mail that is not actually a deceased case, cost 100 points and are tracked separately from ordinary wrong answers. Lifetime stats persist in localStorage: lifetime score, best round score, rounds completed, cards answered, and total critical errors.",
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
        "useReducer with a typed action union models the game as a state machine: mode_select → playing → result → round_summary, with study_guide as a modal overlay phase",
        "Phase transitions are explicit and exhaustive: no boolean flag soup, no implicit side effects",
        "buildRoundDeck filters and shuffles the mail card catalog per mode, then slices to 10 cards with the same API regardless of mode",
        "Critical mistake detection lives in gameLogic.ts beside the scoring rules, not scattered across UI components",
        "useGameStorage wraps localStorage access with hydration awareness, preventing SSR mismatch without a separate library",
        "Stats are only saved once at the round_summary transition: a useRef tracks the previous phase to avoid double-counting on re-renders",
        "robots: noindex is set on the page; the tool is a utility, not an SEO surface",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "The mail card catalog is static TypeScript: no CMS, no API, which means new scenarios require a code change and deploy",
        "localStorage is the only persistence layer: no accounts, no cross-device sync, intentionally simple",
        "Speed bonus threshold (7s) is a fixed constant: there is no adaptive difficulty based on performance history",
        "Study guide content is hardcoded in the component rather than driven by the mail card data model",
        "robots: noindex keeps the tool off search engines, which limits organic discovery but avoids USPS trademark concerns",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "A functional study tool that models real carrier-level decisions, built entirely from job experience",
        "Demonstrates domain-driven design: the data model (MailCard) encodes the real complexity of postal handling decisions",
        "Demonstrates product thinking from constraint: keyboard-first, no-account, no-server UX designed for a specific, narrow use case",
        "Attached to Carrier's Log as an integrated training module, not a standalone page; it earns its place in the product story",
        "Proof that technical problem-solving skills generalize across domains: postal rules, game state machines, scoring systems",
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
