import type { Project } from "../projects.schema";

export const iamResist: Project = {
  slug: "iam-resist",
  title: "I AM [RESIST]",
  description:
    "A mission-driven publishing and commerce platform built with Next.js 15, combining Notion-backed editorial workflows, feed aggregation, and a small merch pipeline.",
  status: "live",
  tags: ["Next.js", "React", "Notion API", "Stripe", "Supabase", "Printify", "RSS"],
  keywords: ["notion", "stripe", "printify", "publishing", "commerce"],
  imageUrl: "/images/resist_sticker.png",
  link: "https://iamresist.org",
  githubRepo: "stepweaver/iamresist",
  builtFor: "Editorial + merch in one maintainable codebase",
  solved: "Splitting content streams, Notion publishing, feeds, and real checkout across separate systems",
  delivered: [
    "Notion-powered feeds for voices, protest music, book club, journal, timeline, and Intel/Newswire",
    "Stripe + Supabase + Printify shop: multi-product sticker catalog, order pages, email for confirmation and shipping",
  ],
  cardDescription:
    "Next.js publishing and merch: activism writing, curated feeds, and print-on-demand commerce in one codebase.",
  cardBuiltFor: "mission-driven publishing and commerce",
  cardSolved: "scattered content tools and separate store systems",
  cardDelivered: [
    "Notion-powered editorial feeds structured like a small publication",
    "Stripe + Supabase + Printify sticker shop with notifications",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "One codebase for editorial content, curated media, news aggregation, and a small store. The point was not to split those concerns across separate systems.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Multiple content streams, non-developer publishing through Notion, external feed aggregation, and real checkout/fulfillment in one maintainable app",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Separate layers for content access, feed assembly, order persistence, and fulfillment",
        "Route handlers validate input, create Stripe sessions, verify webhooks, persist orders, submit fulfillment",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Notion mapping, feed aggregation, checkout, and fulfillment behind explicit module boundaries",
        "Multiple content types and commerce pipeline without one giant page file",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Notion publishing: voices, videos, journal, book club, protest music",
        "Unified feed architecture: RSS, curated media, editorial",
        "Configuration-driven sticker catalog, bundles, mix-and-match cart pricing",
        "Stripe Checkout for legacy single-product and cart flows",
        "Supabase order storage with fulfillment tracking",
        "Printify: submission, production, shipment updates, tracking links",
        "Reusable OG/Twitter metadata helpers",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Repository-style Notion modules with pagination helpers",
        "Feeds: unstable_cache, p-limit, Promise.allSettled for graceful degradation",
        "Stripe webhook verification on raw bodies; retry on transient failures",
        "FulfillmentProvider abstraction isolates Printify-specific logic",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Live site combining publishing, aggregation, curation, and commerce",
        "Editorial workflow through Notion instead of code changes for each post",
        "End-to-end order pipeline through shipment updates",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "No automated test suite in repo",
        "Order page exposure by URL if known: treat as known limitation",
        "Not a full commerce platform: intentionally narrower scope",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js 15", category: "App" },
        { name: "Notion API", category: "CMS" },
        { name: "Stripe", category: "Payments" },
        { name: "Supabase", category: "Data" },
        { name: "Printify", category: "Fulfillment" },
      ],
    },
  ],
  liveUrl: "https://iamresist.org",
};

export default iamResist;
