import type { Project } from "../projects.schema";

export const carrierJournal: Project = {
  slug: "carrier-journal",
  title: "Field Journal",
  description:
    "A personal walking and fitness journal with Notion-backed daybook logging, KPIs, milestones, and a hard draft-by-default publication boundary. Public entries stay personal; operational and employer identity stay private.",
  status: "live",
  imageUrl: "/images/carrier_log.png",
  tags: ["Next.js", "Notion API", "Field Notes", "KPI Design", "Personal Systems", "Mobile UX"],
  keywords: ["field log", "walking", "fitness", "kpi", "personal systems", "portfolio"],
  builtFor: "personal fitness tracking and portfolio storytelling",
  solved:
    "turning long walking days into structured, shareable fitness data without leaking workplace identity or operational detail",
  delivered: [
    "Public Field Journal with KPIs, calendar, milestones, and sanitized notes",
    "Mobile daybook with session-cookie auth and draft-by-default Publish Public",
    "Computed personal workload feel, weather, hydration, and milestone aggregates",
    "Private notes never leave the logging layer",
  ],
  cardDescription:
    "A personal walking and fitness journal: miles, hydration, weather, recovery, and adaptation. Notion-backed with a protected daybook.",
  cardBuiltFor: "personal fitness tracking",
  cardSolved:
    "structured walking data with draft-by-default publish and session auth",
  cardDelivered: [
    "Public KPI grid and field calendar from intentionally published entries",
    "Protected daybook API with private notes and optional public notes",
  ],
  liveUrl: "/carrier-journal",
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Field Journal is a personal systems project: track walking load, hydration, recovery, and reflections from physically demanding days. Public presentation stays fitness-first — no employer branding, no operational scaffolding, no product-testing solicitation.\n\nLogging happens off the clock. Entries default to private draft; publishing a sanitized public note is an explicit choice.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Long walking days compound miles, heat, load, and recovery across a week",
        "Generic fitness apps do not model the signals that matter for this kind of day",
        "Any logging tool that is too slow gets abandoned",
        "Publishing personal notes requires a credible draft boundary — not auto-publish",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "A minimal field data model focused on personal adaptation signals",
        "Notion as source of truth with Publish Public defaulting to false",
        "Session-cookie authentication for private daybook APIs",
        "Public journal shows only intentionally published, fitness-framed notes",
      ],
    },
    {
      id: "key-features",
      title: "Key Features",
      type: "key-features",
      bullets: [
        "Public Field Journal with KPIs, calendar, milestones, and field notes",
        "Private daybook at /log with HttpOnly session cookie auth",
        "Draft-by-default daybook upserts; explicit publish checkbox for public notes",
        "Shoe Ledger as personal equipment tracking for shoes you own",
        "Raw mail-volume figures stay private and off the public KPI grid",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Notion database with ISR cache and tag-based revalidation on writes",
        "Seed/demo fallback disabled on the public path (fail closed)",
        "HMAC-signed HttpOnly carrier_session cookie",
        "Rate-limited POST /api/carrier-journal/session for login",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js", category: "App" },
        { name: "TypeScript", category: "Language" },
        { name: "Tailwind CSS", category: "Styles" },
        { name: "Notion API", category: "Data Source" },
        { name: "Zod", category: "Validation" },
      ],
    },
  ],
};
