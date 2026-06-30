import type { Project } from "../projects.schema";

export const carrierJournal: Project = {
  slug: "carrier-journal",
  title: "Carrier's Log",
  description:
    "A personal field log that turns daily route experience into KPIs, dispatches, and operational reflection. Notion-backed with a mobile daybook, computed mail load tiers, and a hard public/private data boundary. Built as a portfolio artifact demonstrating field-first UX, KPI design, and narrative reporting from operational data.",
  status: "live",
  imageUrl: "/images/carrier_log.png",
  tags: ["Next.js", "Notion API", "Field Notes", "KPI Design", "Personal Systems", "Mobile UX"],
  keywords: ["carrier", "letter carrier", "field log", "kpi", "personal systems", "portfolio"],
  builtFor: "personal operational tracking and portfolio storytelling",
  solved: "turning a physically demanding job into structured, shareable field data without leaking private operational detail",
  delivered: [
    "A public KPI dashboard fed by a Notion database with static seed fallback",
    "Mobile daybook and quick DPS log forms that write to Notion via protected APIs",
    "Computed mail load, weather, hydration, and milestone aggregates with no manual trophy maintenance",
    "Strict public/private boundary: private notes never leave the logging layer",
  ],
  cardDescription:
    "A personal field log and KPI dashboard from life as a city letter carrier: miles, hydration, mail load, weather, soreness, and operational lessons. Notion-backed with a protected mobile daybook.",
  cardBuiltFor: "personal operational tracking",
  cardSolved: "turning physical field experience into structured portfolio data with a credible privacy boundary",
  cardDelivered: [
    "Public KPI grid and field calendar computed from published Notion entries",
    "Protected daybook API with DPS, parcels, fuel score, and private notes",
  ],
  liveUrl: "/carrier-journal",
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Carrier's Log is not a USPS project. It is a personal systems project: I became a city letter carrier and immediately started treating the experience as a field data problem. What physical load am I accumulating? How does weather affect output? How do I design a logging tool I will actually use mid-route?\n\nThe method is observation-led: track the repeatable signals, avoid private operational details, and adjust behavior only when the logged pattern is strong enough to justify a change. It is not a strict diet, not a biometric dashboard, and not a productivity fantasy. It is a field record of adaptation, rendered as a live portfolio artifact.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Mail carrying is physically intense: miles, heat, load, and recovery all compound across a week",
        "There was no structured way to understand my own physical trajectory, just feeling it",
        "Generic fitness apps do not model mail load, heat index, or dog encounters",
        "Any logging tool that is too slow or complex gets abandoned by shift three",
        "Publishing any of this on a developer portfolio requires a credible public/private split",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "A minimal field data model: only the signals that actually matter on a walking route",
        "Notion as source of truth with a Publish Public filter; static TypeScript seed data as deploy-time fallback",
        "Two logging surfaces: a fast DPS quick log and a full mobile daybook behind a shared secret",
        "Computed mail load tiers from DPS count and parcel count vs a rolling personal baseline",
        "Weather and heat signals derived from temperature, heat index, and field notes",
        "Miles as the primary movement metric; weight tracked weekly and published as cumulative loss, not raw weight",
        "Food, hydration, and recovery captured as adaptation signals with a private fuel score checklist",
      ],
    },
    {
      id: "key-features",
      title: "Key Features",
      type: "key-features",
      bullets: [
        "Aggregate KPI grid: days logged, total/average miles, hydration averages and goal hit rate, weight lost, heat and weather days, heavy mail days, avg soreness/energy/mood, and DPS stats when logged",
        "Field calendar: month grid of logged days with mileage intensity and weather pips",
        "Milestone panel: ten-rank mileage ladder plus computed badges for days, distance, weather, load, hydration, safety, and service",
        "Field dispatches: per-shift metrics, weather flags, mail load tier, and published narrative. Feed shows only entries with authored public notes; all published rows still feed aggregates",
        "Mail load system: light / medium / heavy tiers from blended DPS and parcel ratios vs personal baseline",
        "Hydration discipline: weight-aware goal calculation with heat band adjustments and operational risk framing",
        "Fuel score: six-point daily checklist (protein, route food, anchors, fruit/veg, Mountain Dew tracking, post-shift meal) scored privately in Notion",
        "Protected daybook at /log: miles, DPS, parcels, mood/energy/soreness, weather auto-fetch, public and private notes",
        "Quick DPS log at /carrier-journal/log: fast mobile entry with live baseline ratio preview",
        "Strict omission policy: no addresses, route numbers, coworker names, scanner data, or official volume figures on the public site",
      ],
    },
    {
      id: "method",
      title: "Method",
      type: "solution",
      bullets: [
        "Miles are the core movement signal because they map cleanly to route load",
        "Weight is treated as a weekly trend, not a daily scoreboard; only cumulative loss is public",
        "Food and hydration are logged as field adaptations, not diet rules",
        "Subjective scores are accepted as useful operator signals, not clinical measurements",
        "Published data is filtered at the data layer: only Publish Public rows reach the site; Private Note is never read on the public path",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Notion database as live source with 5-minute ISR cache and tag-based revalidation on writes",
        "Static TypeScript seed in lib/data/carrier-journal.ts as zero-config fallback when Notion is absent",
        "enrichDispatchesFields computes mail load tiers, DPS ratios, and weather signals from raw rows at read time, so aggregates stay correct without denormalized maintenance",
        "Split feed logic: isDispatchFeedWorthy gates narrative cards; computeTotalsFromDispatches uses all published rows for KPIs and calendar",
        "Protected POST APIs (/api/carrier-journal/log, /api/carrier-journal/daybook) gated by CARRIER_JOURNAL_LOG_SECRET and Zod schemas",
        "Component design mirrors stepweaver.dev panel/surface system: OCR labels, IBM body, neon tokens",
        "Milestone and rank logic is aggregate-first: achievements computed from repeatable field signals, not manually awarded trophies",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "Notion dependency for live logging; static seed keeps the public page deployable without it",
        "Self-reported field signals make the log practical but not clinical",
        "Weekly weight tracking reduces noise but delays feedback",
        "Mail load calibration needs enough historical DPS/parcel days before tiers stabilize",
        "The achievement system stays grounded in expected carrier events, which keeps the log credible but limits novelty badges",
        "Full daybook and quick log require secret management on a personal device; no full auth stack by design",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "A live portfolio artifact that connects real working life to systems thinking",
        "Demonstrates public/private data design in a context most developers have never modeled",
        "Framing proof: I build practical systems that turn messy operations into clearer decisions",
        "Pairs naturally with Mail Sort Academy as two artifacts from the same job, one operational and one study-focused",
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
