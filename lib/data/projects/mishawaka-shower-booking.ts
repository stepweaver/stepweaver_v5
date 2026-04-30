import type { Project } from "../projects.schema";

export const mishawakaShowerBooking: Project = {
  slug: "mishawaka-shower-booking",
  title: "Food Pantry Shower Booking System",
  description:
    "A Google Apps Script and Google Sheets booking prototype that replaces an ad hoc shower line with same-day reservations, phone lookup, and a staff dashboard.",
  status: "demo",
  tags: ["Google Apps Script", "Google Sheets", "Vanilla JavaScript", "PWA", "Operational Workflow"],
  keywords: ["apps-script", "scheduling", "pantry", "mobile", "operations"],
  imageUrl: "/images/shower_booking.png",
  link: "https://github.com/stepweaver/food-pantry-shower-scheduler",
  githubRepo: "stepweaver/food-pantry-shower-scheduler",
  builtFor: "a community food pantry",
  solved: "all-day waiting and staff scheduling bottlenecks",
  delivered: [
    "A self-service booking flow with a staff dashboard",
    "Self-service mobile booking: one slot per day, short check-in windows, nightly cleanup",
    "Staff dashboard in Sheets: real-time visibility, rate limiting, lock protection against double-booking",
  ],
  cardDescription:
    "Shower booking for a community food pantry: Google Apps Script and Sheets. Guests reserve slots and return in a short window instead of waiting all day.",
  cardBuiltFor: "a community food pantry",
  cardSolved: "all-day waiting and staff scheduling bottlenecks",
  cardDelivered: [
    "Self-service mobile booking with one-slot-per-day limits and short check-in windows",
    "Staff dashboard with real-time bookings, rate limiting, and lock protection",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Low-cost operational workflow: limited budget, stressed users on phones, no paid infrastructure, staff who should not manage custom software.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Prevent double-booking, stay usable on mobile, respect Apps Script limits, give staff an operational view",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Web app backed by a Sheet for config and slots",
        "Public flow: phone lookup and single-page state machine",
        "Staff dashboard: visibility, check-in, cancellation, open/close control",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Function-oriented backend: caching, locking, validation, scheduling, admin actions separated",
        "Sheets as datastore and config",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Same-day reservation with phone lookup instead of accounts",
        "Config-driven hours, slot duration, grace period, concurrency",
        "Guest countdowns, check-in window logic, cancellation, recovery",
        "Staff dashboard: masked phones, manual check-in, open/close",
        "PWA manifest and basic service worker caching",
        "Time-driven triggers for expiration and cleanup",
        "Setup, user, and signage documentation",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "CacheService for config, slots, rate limits to reduce spreadsheet churn",
        "LockService on booking write path",
        "Normalize Sheet time values before business logic",
        "Validation on UI and server; admin key in URL (simple deployment, weaker than full sessions)",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Working prototype under real constraints: concurrency, privacy, latency, handoff",
        "Documentation so another organization could deploy",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "Presented as concept/working prototype, not measured production rollout",
        "No automated tests",
        "Admin auth is shared secret in URL",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Google Apps Script", category: "Backend" },
        { name: "Google Sheets", category: "Data" },
        { name: "Vanilla JS", category: "Frontend" },
      ],
    },
  ],
};
