import type { Project } from "../projects.schema";

const DATA_FLOW_DIAGRAM = `Notion API
  → fetch / map (lib/notion)
  → normalize → shared internal models
  → enrich (videoContent, curated, protest music)
  → domain loaders
  → UI (routes + modular home sections)
  → shop (Stripe checkout + webhooks → Printify)`;

export const iamResist: Project = {
  slug: "iam-resist",
  title: "I AM [RESIST]",
  description:
    "Content and commerce platform for independent reporting, curated media, and physical protest materials: Notion as headless CMS, a unified editorial pipeline (newswire, voices, protest music, video), Stripe + Printify merch, and a composable homepage. Rebuilt for domain-driven structure and full feature parity with the original, with coherent boundaries rather than a product pivot.",
  status: "live",
  tags: ["Next.js", "React", "Notion API", "Stripe", "Supabase", "Printify", "RSS"],
  keywords: ["notion", "stripe", "printify", "publishing", "commerce", "refactor"],
  imageUrl: "/images/resist_sticker.png",
  link: "https://iamresist.org",
  githubRepo: "stepweaver/iamresist",
  builtFor:
    "A single system that surfaces reporting, curated feeds, and protest merch without splitting tools or stores",
  solved:
    "Organic growth: content logic scattered across layers, UI coupled to fetching, duplicate hooks/utils, and hard-to-extend structure, without throwing away a proven product",
  delivered: [
    "Full structural refactor: domains own components, transforms, and route logic; data pipelines separated from rendering",
    "Normalized content model with shared rendering across types; modular homepage (shop promo, reading, newswire, voices, protest music)",
    "Commerce kept simple: Stripe sessions + webhooks, Printify fulfillment, cart context, and no over-engineered state layer",
  ],
  cardDescription:
    "Notion-backed publishing + feeds + Stripe/Printify shop, rebuilt domain-first: same capabilities, clearer pipelines and boundaries.",
  cardBuiltFor: "editorial, curation, and merch in one codebase",
  cardSolved: "architecture drift in a feature-rich live site",
  cardDelivered: [
    "Domain-driven layout: shop, voices, newswire, journal, book-club, home composition",
    "Focused API surface: checkout, webhooks, voices feed/archive, revalidate",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "iamresist is a content and commerce platform built to surface independent reporting, curated media, and physical protest materials in one system. This rebuild restructures into a domain-driven, maintainable codebase without losing functionality: not a redesign, a coherence pass.",
      bullets: [
        "Notion as headless CMS",
        "Unified pipeline: newswire, voices, protest music, curated video",
        "Commerce: Stripe + Printify",
        "Modular homepage composing editorial + product surfaces",
      ],
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Content logic spread across multiple layers",
        "Tight coupling between UI and data-fetching",
        "Inconsistent file organization and duplicate utilities/hooks",
        "Hard to extend without regressions",
        "Despite that, the system performed and validated the product; the goal was extensibility and clarity, not changing what shipped",
      ],
    },
    {
      id: "approach",
      title: "The Approach",
      type: "solution",
      content:
        "Full structural refactor, not a feature chase. Manual ownership of architecture and integrations; agent-assisted implementation (Cursor + AI tooling) for speed on mechanical moves.",
      bullets: [
        "Preserve all existing functionality",
        "Reorganize around domains, not component folders alone",
        "Separate data pipelines from UI rendering",
        "Normalize content types into a shared model where it pays off",
        "Keep the graph simple enough to reason about",
      ],
    },
    {
      id: "data-flow",
      title: "Data flow",
      type: "data-flow",
      content: DATA_FLOW_DIAGRAM,
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Domain structure. Shop: catalog, cart, checkout | voices: aggregated reporting | newswire: headline feed | journal: long-form | book-club: reading pipeline | home: composition layer",
        "Each domain owns components, data transforms, and route logic",
        "Data layer: Notion as primary CMS; fetch via lib/notion, normalize to internal models, enrich (e.g. video, curated, protest music), deliver through domain-specific loaders so types can share rendering with different sources",
        "Homepage composition: independent sections (e.g. shop promo, currently reading, featured newswire, voices feed, protest music) each pull from their pipeline, then render into a unified feed; extend without coupling everything to one data blob",
        "Commerce: Stripe (checkout + webhooks), Printify fulfillment; CartContext for client state, /api/checkout for sessions, /api/webhooks for orders; product config stays close to UI (e.g. lib/shopProducts) without extra abstraction layers",
        "API surface: /api/checkout, /api/webhooks, /api/voices-feed, /api/voices-archive, /api/revalidate; each route maps to one system concern",
      ],
    },
    {
      id: "features",
      title: "UI and interaction",
      type: "features",
      bullets: [
        "Modal system for inline video playback",
        "Swipe and keyboard navigation on feeds",
        "Theme (light/dark) with SSR-aware handling",
        "Terminal-forward aesthetic without sacrificing scan speed or density",
      ],
    },
    {
      id: "improvements",
      title: "Key improvements",
      type: "project-structure",
      items: [
        { label: "Structure", description: "Before: organic growth. After: domain-driven ownership." },
        { label: "Data flow", description: "Before: mixed. After: centralized fetch/normalize + domain loaders." },
        { label: "Homepage", description: "Before: coupled. After: composable sections." },
        { label: "Shop integration", description: "Before: working. After: structured and isolated." },
        { label: "Maintainability", description: "Before: fragile. After: extensible." },
      ],
    },
    {
      id: "engineering",
      title: "Engineering decisions",
      type: "engineering",
      bullets: [
        "Rebuild focused on extracting real structure from an organic codebase and reassembling it, prioritizing control and stability over theoretical elegance",
        "Some duplication tolerated early to avoid breaking flows; clarity chosen over deep abstraction where it did not buy leverage",
        "Security and metadata handling brought back in line for production (OG/Twitter helpers, webhook verification patterns)",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "Notion as CMS: API limits and latency are real constraints",
        "Not every path is DRY: deliberate where merging risk outweighed cleanup",
        "Scope stays a focused publication + shop, not a generic commerce platform",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      content:
        "Full feature parity with the original system. Clearer architecture, composable home, isolated shop layer, production-ready boundaries. The site behaves like a platform (a set of pipelines and surfaces), not a pile of one-off features.\n\nRebuilding without breaking a live product means naming the real structure, extracting it, and reassembling something durable. That is the gap between “works” and “can scale.”",
      bullets: [
        "Easier to add content types and homepage modules",
        "Predictable place for shop, feeds, and editorial code to live",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js", category: "App" },
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
