import type { Project } from "../projects.schema";

export const cashflowLedger: Project = {
  slug: "cashflow-ledger",
  title: "Cash Flow Ledger",
  description: "Financial tracking dashboard with real-time balance tracking, transaction history, and reporting.",
  status: "live",
  tags: ["Finance", "Dashboard", "Next.js"],
  keywords: ["finance", "ledger", "tracking", "dashboard"],
  imageUrl: "/images/cashflow_ledger.png",
  builtFor: "Financial operations",
  solved: "Manual financial tracking",
  delivered: ["Real-time balance tracking", "Transaction history", "Automated reporting"],
  cardDescription: "Financial tracking dashboard",
  cardBuiltFor: "Finance ops",
  cardSolved: "Manual tracking",
  cardDelivered: ["Balance tracking", "Transaction history", "Reporting"],
  sections: [
    {
      id: "overview",
      title: "Overview",
      type: "overview",
      content: "A financial tracking dashboard providing real-time balance tracking, transaction history, and automated reporting for operational finance management.",
    },
    {
      id: "problem",
      title: "The Problem",
      type: "problem",
      bullets: ["Manual spreadsheet tracking", "No real-time visibility", "Error-prone reconciliation"],
    },
    {
      id: "solution",
      title: "The Solution",
      type: "solution",
      bullets: ["Automated balance tracking", "Transaction categorization", "Export-ready reports"],
    },
    {
      id: "features",
      title: "Key Features",
      type: "features",
      bullets: ["Real-time balance updates", "Transaction history with filters", "Category-based reporting", "Export to CSV/PDF"],
    },
    {
      id: "outcome",
      title: "Outcome",
      type: "outcome",
      content: "Eliminated manual financial tracking with automated, real-time visibility into cash flow.",
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

export default cashflowLedger;
