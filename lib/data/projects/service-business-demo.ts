import type { Project } from "../projects.schema";

/** Local-service SEO demo (v3 `service-business-demo`, λlambda Heating & Air). */
export const serviceBusinessDemo: Project = {
  slug: "service-business-demo",
  title: "λlambda Heating & Air",
  description:
    "A static-first local service business demo that turns a multi-location SEO problem into generated landing pages, reusable vanilla-JS components, and lightweight Express lead capture.",
  status: "demo",
  tags: ["Vanilla JavaScript", "Express", "SEO", "Lead Generation", "Agency Demo"],
  keywords: ["hvac", "seo", "local", "lead-capture", "static"],
  imageUrl: "/images/lambda_heating_air.webp",
  link: "https://lambda-heating-air.vercel.app/",
  githubRepo: "stepweaver/heartland-heating-air",
  builtFor: "Local service SEO and lead-gen demos",
  solved: "The usual “service in city” landing-page problem at scale",
  delivered: [
    "Dynamic service and location pages generated from a shared content model",
    "Vanilla JavaScript frontend with Express lead forms, email notifications, and Google reCAPTCHA",
  ],
  cardDescription:
    "Local-service SEO demo for HVAC-style businesses. Centralized content and generated location pages for scalable local search landing pages.",
  cardBuiltFor: "HVAC-style local service demos",
  cardSolved: "repetitive service-and-location pages without hand-maintained HTML piles",
  cardDelivered: [
    "Generated location and service pages from structured data",
    "Express-backed forms with validation, email, and reCAPTCHA",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "A generalized local-service demo adapted from real client work. The useful part is the system: structured location and service data, generated pages, and narrow backend form handling.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Local service sites often need many near-duplicate service/location pages without becoming a pile of hand-maintained HTML",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Static-first: core pages are plain HTML enhanced by ES-module components",
        "Location pages generated from structured data; Express only handles server-necessary pieces",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "`public/components` for reusable view modules, `public/data` for source data, `scripts/` for generation, `server.js` for static files and form endpoints",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Generated location/service landing pages from structured data",
        "Reusable vanilla-JS component layer for nav, hero, reviews, contact, careers, service and location pages",
        "Express contact and quote endpoints with validation and reCAPTCHA",
        "Nodemailer notifications and confirmation emails",
        "Careers section with structured job data and job-detail routes",
        "SEO metadata, schema markup, sitemap, canonical handling",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Static-first architecture: most pages cheap to host; Express reserved for real server concerns",
        "Location and service content modeled as data so long-tail SEO footprint is generated",
        "Discrete ES-module components instead of one monolithic script",
        "Client-side validation mirrored on the server for defense in depth",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Turned a repetitive local-SEO page problem into a reusable generation pattern",
        "Portfolio-safe demo abstracted from a real agency/client implementation",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "No database, no accounts, no fully integrated booking platform",
        "Some legacy branding and metadata remain in the checked-in demo",
        "No visible automated test suite or CI in the current repo",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Vanilla JS (ES modules)", category: "Frontend" },
        { name: "Express", category: "Server" },
        { name: "Nodemailer", category: "Email" },
      ],
    },
  ],
  liveUrl: "https://lambda-heating-air.vercel.app/",
};

export default serviceBusinessDemo;
