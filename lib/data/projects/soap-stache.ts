import type { Project } from "../projects.schema";

export const soapStache: Project = {
  slug: "soap-stache",
  title: "Soap Stache",
  description:
    "A CMS-backed storefront demo built with Next.js, Sanity, and Stripe. Editable catalog content, cart state, and a demo-safe checkout flow without pretending to be a live store.",
  status: "demo",
  tags: ["Next.js", "Sanity CMS", "Stripe", "E-commerce Demo", "App Router"],
  keywords: ["e-commerce", "sanity", "stripe", "next.js", "cart"],
  imageUrl: "/images/soap_stache.webp",
  link: "https://app-soap-stache.vercel.app/",
  githubRepo: "stepweaver/app-soap-stache",
  builtFor: "Non-technical sellers who need product control and a realistic checkout demo",
  solved: "Storefronts that either fake production or stay static mocks",
  delivered: [
    "Shopping cart and Stripe Checkout backed by a Sanity catalog, intentionally in demo mode",
    "Michigan-themed storefront: editors control content through Sanity Studio, mobile-first and SEO-aware",
  ],
  cardDescription:
    "Client-ready e-commerce demo with Next.js, Sanity, and Stripe. Sellers get product control and a realistic checkout without running a live store.",
  cardBuiltFor: "non-technical sellers and demo stakeholders",
  cardSolved: "brochure storefronts with no believable commerce behavior",
  cardDelivered: [
    "Cart and Stripe Checkout with Sanity catalog in demo mode",
    "Editor-controlled merchandising, mobile-first layout, structured metadata scaffolding",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Soap Stache is the storefront side of a small-brand commerce build: catalog browsing, merchandising, cart behavior, policy pages, and checkout handoff. The Sanity studio lives in a separate repo.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Wanted a storefront that felt real without faking production status",
        "Combine editable content, believable product flow, and a clear demo boundary",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Next.js 15 App Router, GROQ-fed Sanity, React Context cart, localStorage persistence",
        "Checkout posts cart data to an internal API route and redirects through Stripe in demo mode",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "`app/` routes and layout, `components/` UI, `contexts/` cart, `lib/` for Sanity and Stripe",
        "Homepage assembled from sections instead of one oversized page",
        "Some catalog data still client-fetched with useEffect: simpler build, weaker SEO than full SSG/SSR catalog",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "App Router storefront: marketing, policy, product routes, checkout success",
        "Sanity-backed catalog and media",
        "Persistent cart with quantity and derived totals",
        "Stripe checkout handoff in demo/test mode",
        "Metadata, canonical config, robots rules, JSON-LD scaffolding",
        "Responsive merchandising: featured products, reviews, brand sections",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "React Context cart with localStorage restore",
        "Composite identifiers for variants/types",
        "Sanity URL builders for resized images",
        "ProductGrid with loading, error, retry, and empty states",
        "Demo mode enforced in UI and README",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Believable storefront demo closer to a real product build than a static mockup",
        "Reference pattern for CMS-backed catalog with a safe checkout demonstration layer",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "Not a full production commerce stack: no visible auth, order persistence, inventory enforcement, or full automated test suite in-repo",
        "Client-side catalog fetch is simpler but weaker for SEO than server-rendered catalog pages",
        "Companion Sanity Studio is a separate repo; schema claims should stay modest unless both are reviewed",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js 15", category: "Framework" },
        { name: "Sanity", category: "CMS" },
        { name: "Stripe", category: "Payments" },
        { name: "Tailwind CSS", category: "Styling" },
      ],
    },
  ],
  liveUrl: "https://app-soap-stache.vercel.app/",
};

export default soapStache;
