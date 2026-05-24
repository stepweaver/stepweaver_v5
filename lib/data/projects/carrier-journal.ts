import type { Project } from "../projects.schema";

export const carrierJournal: Project = {
  slug: "carrier-journal",
  title: "Carrier Journal",
  description:
    "A public-safe carrier field journal that turns daily route experience into KPIs, dispatches, and operational reflection. Built as a portfolio artifact demonstrating mobile-first field UX, public/private data separation, personal KPI design, and narrative reporting from operational data.",
  status: "live",
  tags: ["Next.js", "Field Notes", "KPI Design", "Personal Systems", "Mobile UX"],
  keywords: ["carrier", "mail carrier", "field journal", "kpi", "personal systems", "portfolio"],
  builtFor: "personal operational tracking and portfolio storytelling",
  solved: "turning a physically demanding job into structured, shareable field data",
  delivered: [
    "A public KPI dashboard built from real daily walking route data",
    "Public-safe field dispatches with a strict no-PII boundary",
    "Operator reflection framing why the system belongs on a developer portfolio",
  ],
  cardDescription:
    "A public-safe field journal and KPI dashboard from life as a city mail carrier: miles, steps, weather, soreness, and operational lessons.",
  cardBuiltFor: "personal operational tracking",
  cardSolved: "turning physical field experience into structured portfolio data",
  cardDelivered: [
    "Public KPI grid computed from static dispatch entries",
    "Strict public/private data boundary with no PII exposure",
  ],
  liveUrl: "/carrier-journal",
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Carrier Journal is not a USPS project. It is a personal systems project: I became a city mail carrier and immediately started treating the experience as a field data problem. What physical load am I accumulating? How does weather affect output? How do I design a logging tool I will actually use mid-route?",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Mail carrying is physically intense: miles, heat, load, and recovery all compound across a week",
        "There was no structured way to understand my own physical trajectory — just feeling it",
        "Generic fitness apps do not model mail load, heat index, or dog encounters",
        "Any logging tool that is too slow or complex gets abandoned by shift three",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "A minimal field data model: only the signals that actually matter on a walking route",
        "Two data layers: public KPIs and dispatches visible on stepweaver.dev; private daily notes never leave the logging tool",
        "Phase 1 static: real entries in a TypeScript data file, computable KPIs, zero infrastructure",
        "Phase 2 planned: Notion database as source of truth with a public/private filter",
      ],
    },
    {
      id: "key-features",
      title: "Key Features",
      type: "key-features",
      bullets: [
        "Aggregate KPI grid: days logged, total miles, steps, heat days, weather days, heavy load days, avg soreness/energy/mood",
        "Field dispatches: public-safe entries with per-shift metrics, weather flags, and narrative",
        "Mail load severity system: light / normal / heavy / brutal",
        "Environmental signals: heat index, rain, storm, snow as structured booleans",
        "Safety markers: dog encounter flags, heat day flags, hydration notes in public prose",
        "Strict omission policy: no addresses, route numbers, coworker names, scanner data, or official volume figures",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Static TypeScript data model first: zero runtime cost, fully typed, immediately deployable",
        "Helper functions compute all KPIs from raw dispatch array — no denormalized aggregates to maintain",
        "Public/private separation is a data-layer concern, not a UI concern: only public-safe entries exist in this file",
        "Component design mirrors existing stepweaver.dev panel/surface system: OCR labels, IBM body, neon tokens",
        "No auth, no database, no API surface in Phase 1 — reduces attack surface and deployment complexity",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "Static data means entries require a deploy to appear — acceptable for a personal log at this scale",
        "Phase 2 Notion integration adds a network dependency; fallback to static stays in place",
        "KPIs are self-reported and subjective — soreness and energy are operator perception, not biometric measurement",
        "No historical charting yet: the data model supports it but the UI is not wired",
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
        "Foundation for Phase 2 Notion integration and eventual private mobile logging form",
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
        { name: "Notion (planned)", category: "Data Source" },
      ],
    },
  ],
};
