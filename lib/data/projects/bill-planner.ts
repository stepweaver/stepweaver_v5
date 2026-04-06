import type { Project } from "../projects.schema";

/** Household cashflow planner (v3 `bill-planner`, repo weaver-bill-planner, product name λledger). */
export const billPlanner: Project = {
  slug: "bill-planner",
  title: "λledger",
  description:
    "A paycheck-window cashflow planner for a single household. It maps bills to income events, rolls months forward from templates, and shows funding pressure before due dates hit.",
  status: "live",
  tags: ["Next.js", "TypeScript", "PostgreSQL", "Drizzle ORM", "Auth.js", "Zod", "React Hook Form", "Tailwind CSS"],
  keywords: ["cashflow", "bills", "paycheck", "household", "planner"],
  imageUrl: "/images/cashflow_ledger.png",
  githubRepo: "stepweaver/weaver-bill-planner",
  builtFor: "Real household cashflow planning",
  solved: "Timing gaps between paychecks and bill due dates",
  delivered: [
    "Month workspace with paycheck grouping, attention flags, and quick status updates",
    "Roll a month forward from templates or a previous month, then review the draft before saving",
    "Track bills by paycheck window with cushion, overdue, due-soon, unassigned, and payment-status visibility",
  ],
  cardDescription:
    "Household cashflow planner built around paycheck windows, month roll-forward, inline bill updates, and funding visibility before bills come due.",
  cardBuiltFor: "real household cashflow planning",
  cardSolved: "timing gaps between paychecks and bill due dates",
  cardDelivered: [
    "Roll a month forward from templates or a previous month, then review the draft before saving",
    "Track bills by paycheck window with cushion, overdue, due-soon, unassigned, and payment-status visibility",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "λledger is the public product name for this household bill planner (repository: weaver-bill-planner). It is built around one question: given a month of bills and a month of paychecks, what gets covered when? It models timing and funding pressure, not just categories.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Bills recur on different schedules, income clusters unevenly, and due dates do not care when a paycheck lands",
        "The hard part was making that understandable without building a spreadsheet clone or a brittle rules engine",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Next.js App Router, TypeScript, Neon Postgres, and Drizzle",
        "Forms use React Hook Form with Zod; server actions revalidate affected pages and recompute assignments when income changes",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Relational core: ledgers, months, bill templates, income events, and bill instances",
        "Feature folders own forms and actions; shared helpers handle metrics, paycheck-window generation, propagation, auth, and validation",
        "Month workspace groups bills by paycheck rail and surfaces an attention layer alongside inline editing",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Roll a month forward from bill templates or a prior month, then review the draft and fix exceptions before saving",
        "Group bills by paycheck window with cushion and over-capacity signals",
        "Attention flags for overdue, due soon, unassigned bills, and rows missing amounts",
        "Bill lifecycle: scheduled/due, pending, paid, skipped, plus quick inline edits",
        "Recurring bill templates with multi-weekday rules and safe external link handling",
        "Auto-assign bills into paycheck windows by due date with manual overrides",
        "Month-level metrics for expected vs received income, paid expenses, and counts by attention and payment state",
        "Login rate limiting on the credentials flow",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Feature-based folder structure keeps domain logic separated from page composition",
        "Server actions enforce ledger ownership before reads and writes instead of trusting client state",
        "Paycheck-window logic groups same-day income events, merges adjacent paydays, creates a pre-income window, and assigns bills by date boundaries",
        "Income edits trigger bill reassignment so the month view stays consistent",
        "Month propagation clamps carried-forward dates to valid month boundaries",
        "External payment links use safe link attributes; auth cookies configured as httpOnly",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Produced a real full-stack planning app rather than a static UI concept",
        "Encoded a household planning problem into reusable domain logic instead of burying it in components",
        "Practical workflow: draft review, paycheck grouping, and attention signals, not just logging transactions after the fact",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "Authentication is MVP-grade credentials auth, not a full account system",
        "Scoped around a default household ledger",
        "No automated tests or visible CI workflow in the repo yet",
        "Strongest at monthly planning and assignment, not long-horizon forecasting or advanced budgeting analytics",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js", category: "App" },
        { name: "Drizzle ORM", category: "Data" },
        { name: "Neon Postgres", category: "Database" },
        { name: "Auth.js", category: "Auth" },
        { name: "Zod", category: "Validation" },
      ],
    },
  ],
};

export default billPlanner;
