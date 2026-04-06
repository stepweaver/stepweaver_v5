import type { Project } from "../projects.schema";

export const cerebro: Project = {
  slug: "cerebro",
  title: "Cerebro",
  description: "Centralized scheduling and coordination platform for multi-location operations.",
  status: "live",
  tags: ["Platform", "Next.js", "Scheduling"],
  keywords: ["scheduling", "coordination", "operations", "platform"],
  imageUrl: "/images/cerebro.png",
  builtFor: "Multi-location operations teams",
  solved: "Fragmented scheduling across locations",
  delivered: ["Unified scheduling dashboard", "Location-aware routing", "Real-time availability"],
  cardDescription: "Multi-location scheduling platform",
  cardBuiltFor: "Operations teams",
  cardSolved: "Fragmented scheduling",
  cardDelivered: ["Unified dashboard", "Location routing", "Real-time availability"],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content: "A centralized scheduling and coordination platform designed for multi-location operations. Provides unified visibility into availability, bookings, and resource allocation across distributed teams.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: [
        "Scheduling scattered across multiple tools",
        "No cross-location visibility",
        "Manual coordination overhead",
      ],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: [
        "Single dashboard for all locations",
        "Location-aware routing and filtering",
        "Real-time availability sync",
      ],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: [
        "Unified scheduling dashboard",
        "Location-based filtering",
        "Real-time availability updates",
        "Conflict detection",
      ],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      content: "Reduced scheduling coordination overhead and provided clear visibility across all operational locations.",
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      type: "tech-stack",
      techStack: [
        { name: "Next.js", category: "Framework" },
        { name: "TypeScript", category: "Language" },
        { name: "Tailwind CSS", category: "Styling" },
      ],
    },
  ],
};

export default cerebro;
