import type { Project } from "../projects.schema";

export const silentAuction: Project = {
  slug: "silent-auction",
  title: "Silent Auction Platform",
  description:
    "A full-stack silent auction platform built with Next.js, Supabase, and Resend for real event operations: bidder onboarding, alias-based bidding, live auction updates, donation pledges, donor workflows, and closeout administration.",
  status: "live",
  tags: ["Next.js", "Supabase", "Realtime", "Security", "Resend"],
  keywords: ["auction", "supabase", "realtime", "fundraiser", "bidding"],
  imageUrl: "/images/lambda_preview.png",
  link: "https://tinyurl.com/mary-frank-silent-auction",
  githubRepo: "stepweaver/silent-auction",
  builtFor: "a school PTO fundraiser",
  solved: "paper bidding and live event admin overhead",
  delivered: [
    "A mobile-first auction system with live updates and organizer controls",
    "Real-time bidding flow with clear item status and winning bids during the event",
    "Organizer controls for opening and closing items, resolving ties, and announcing winners",
  ],
  cardDescription:
    "Next.js + Supabase auction platform for a school PTO fundraiser. Mobile sign-up, live bidding, QR-linked items, and closeout tools for organizers.",
  cardBuiltFor: "a school PTO fundraiser",
  cardSolved: "paper bidding and live event admin overhead",
  cardDelivered: [
    "Real-time bidding flow with clear item status and winning bids during the event",
    "Organizer controls for opening and closing items, resolving ties, and announcing winners",
  ],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content:
        "Built as a real operations tool for a school fundraiser. Public bidding stays simple for families; organizers get the controls they actually need.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Trust model and event logistics: fast phone-friendly bidding, organizer visibility, donor workflows, bidder privacy, server-enforced auction rules",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Trust boundaries: public catalog and bidding stay fast; sensitive operations run through server routes backed by Supabase and validation before state changes",
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      type: "architecture",
      bullets: [
        "Next.js App Router shell, Supabase for PostgreSQL and realtime, Resend for transactional email",
        "Public pages, donor flows, and admin routes separated; anon access for catalog/realtime, service-role for protected operations",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Bidder onboarding with email verification and alias/avatar creation",
        "Alias-based bidding for privacy during the live auction",
        "Mobile catalog with categories and per-item detail",
        "Realtime updates via Supabase",
        "Bidder dashboard, leaderboards, donation pledges, donor portal",
        "Admin dashboard: items, timing, QR, donation review, closeout",
        "Automated winner and admin email workflows",
      ],
    },
    {
      id: "engineering",
      title: "Engineering Decisions",
      type: "engineering",
      bullets: [
        "Zod validation and server-side bid enforcement keep rules out of the UI",
        "Anon client access vs service-role server access as the right boundary for public bidding",
        "CSRF protection and rate limiting on state-changing flows",
        "Demo-mode path isolates showcase behavior from real-event data and email side effects",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      bullets: [
        "Real event operations platform, not a one-off fundraiser microsite",
        "Stronger reference for full-stack architecture, realtime UX, security hardening, and operational tooling",
      ],
    },
    {
      id: "tradeoffs",
      title: "Tradeoffs",
      type: "tradeoffs",
      bullets: [
        "Targeted unit tests for bid rules; not a heavily test-saturated codebase yet",
        "Documented rate limiting in-memory at this scale",
        "Some pages client-heavy for event responsiveness",
      ],
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js", category: "App" },
        { name: "Supabase", category: "Backend" },
        { name: "Resend", category: "Email" },
        { name: "Zod", category: "Validation" },
      ],
    },
  ],
  liveUrl: "https://tinyurl.com/mary-frank-silent-auction",
};
