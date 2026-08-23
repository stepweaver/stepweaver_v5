import type { Project } from "../projects.schema";

export const carrierJournal: Project = {
  slug: "carrier-journal",
  title: "Field Journal",
  description:
    "A human performance log: Notion-backed daybook, body telemetry, distance qualification, equipment roster, and a public Field Journal that stays personal and equipment-focused.",
  status: "live",
  imageUrl: "/images/field_journal_og.png",
  tags: ["Next.js", "Notion API", "Field Notes", "Telemetry", "Personal Systems", "Mobile UX"],
  keywords: ["field journal", "long walk", "telemetry", "walking", "personal systems", "portfolio"],
  builtFor: "personal field logging and live systems storytelling",
  solved:
    "turning high-mileage walking days into structured public telemetry without leaking workplace identity or operational detail",
  delivered: [
    "Public Field Journal with body telemetry, distance qualification, calendar, and sanitized notes",
    "Mobile daybook with session-cookie auth; saving a carrier day publishes it to Field Journal",
    "Computed weather, hydration, and equipment mileage aggregates",
    "Private notes never leave the logging layer",
  ],
  cardDescription:
    "Human-machine field notebook: miles, hydration, recovery, footwear, and what the chassis does under load.",
  cardBuiltFor: "personal field logging",
  cardSolved:
    "structured walking telemetry with automatic public publish and session auth",
  cardDelivered: [
    "Public telemetry grid and activity record from logged days",
    "Protected daybook API with private notes and optional public notes",
  ],
  liveUrl: "/field-journal",
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Field Journal is a live systems artifact: the body as the system, the miles as the test environment, the journal as telemetry. Public presentation stays personal and equipment-focused.\n\nSaving a carrier day publishes it. Private notes stay off the public surface.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Long walking days compound miles, heat, load, and recovery across a week",
        "Generic fitness apps do not model the signals that matter for this kind of day",
        "Any logging tool that is too slow gets abandoned",
        "Public notes need a sanitization habit, not an extra Notion checkbox after save",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "A minimal field data model focused on body and equipment signals",
        "Notion as source of truth with Publish Public set on daybook save",
        "Session-cookie authentication for private daybook APIs",
        "Public journal shows published days and aggregate telemetry; private notes stay off that surface",
      ],
    },
    {
      id: "key-features",
      title: "Key Features",
      type: "key-features",
      bullets: [
        "Public Field Journal with body telemetry, distance qualification, calendar, and field notes",
        "Private daybook at /log with HttpOnly session cookie auth",
        "Daybook upserts publish to Field Journal on save; private notes never leave the logging layer",
        "Equipment Roster as footwear telemetry with brands, ratings, and conclusions",
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
