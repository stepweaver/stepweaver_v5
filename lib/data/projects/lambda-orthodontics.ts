import type { Project } from "../projects.schema";

export const lambdaOrthodontics: Project = {
  slug: "lambda-orthodontics",
  title: "Lambda Orthodontics",
  description:
    "A frameworkless orthodontics site built as a vanilla JavaScript SPA with a custom router, a centralized content model, and a small Express backend for demo-safe form handling.",
  status: "demo",
  tags: ["Vanilla JavaScript", "Express", "SPA Architecture", "Custom Router", "Responsive UI"],
  keywords: ["vanilla", "spa", "express", "router", "healthcare-demo"],
  imageUrl: "/images/lambda_ortho.webp",
  link: "https://lambdaortho.vercel.app/",
  githubRepo: "https://github.com/stepweaver/myers-vanilla.git",
  builtFor: "Practice-site demo without a heavy framework",
  solved: "Multi-page behavior, shared content, dynamic detail pages, believable forms without faking a production healthcare platform",
  delivered: [
    "Component-style ES modules with custom router, dynamic treatment and career pages, scroll restoration",
    "Six demo forms wired to Express JSON endpoints with validation and UX feedback",
  ],
  cardDescription:
    "Vanilla JS + Express orthodontic site demo: marketing, scheduling, referrals, and patient flows without a heavy framework.",
  cardBuiltFor: "practice-site demos and proposals",
  cardSolved: "framework weight for a marketing-plus-forms practice site",
  cardDelivered: [
    "Custom client router with dynamic treatment and career pages",
    "Demo forms to Express JSON endpoints with validation",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Front-end-heavy practice-site demo: custom router, modular pages, thin Node/Express server.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Real multi-page behavior, shared content, dynamic detail pages, believable forms without pretending to be production healthcare",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Persistent layout shell, route-aware page modules, reusable sections, centralized `siteData.js`",
        "Express serves static assets, narrow API endpoints, SPA fallback to index.html",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Client: layout, routing, rendering",
        "Shared content in siteData.js for homepage, treatments, careers, scheduling, FAQs",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Custom router: static and dynamic routes for treatment and career detail",
        "History API navigation with active nav state",
        "Per-route scroll save/restore",
        "Express JSON endpoints for contact, referral, scheduling demos",
        "Responsive nav with mobile menu and scroll locking",
        "Client-simulated flows where backend is intentionally out of scope",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Vanilla JS SPA: explicit routing, lifecycle, DOM updates",
        "Map-based scroll positions by route",
        "Rotating hero cleanup on route change",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Practice-site demo that behaves more like an application than a static mockup",
        "Reference build for service work where polished front end matters more than a heavy stack",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "No real auth, session, or patient portal backend; flows simulated where noted",
        "Not all form behavior consistent; some flows still use alerts",
        "No automated tests",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Vanilla JavaScript", category: "Frontend" },
        { name: "Express", category: "Server" },
      ],
    },
  ],
  liveUrl: "https://lambdaortho.vercel.app/",
};

export default lambdaOrthodontics;
