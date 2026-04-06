import type { Project } from "../projects.schema";

export const n8nAutomations: Project = {
  slug: "n8n-automations",
  title: "N8N Automations",
  description: "Workflow automation platform connecting disparate systems with custom n8n workflows.",
  status: "live",
  tags: ["Automation", "n8n", "Integration"],
  keywords: ["automation", "n8n", "workflows", "integration"],
  imageUrl: "/images/n8n_automations.png",
  builtFor: "Business operations",
  solved: "Manual process automation",
  delivered: ["Custom workflow builder", "System integrations", "Error handling", "Monitoring dashboard"],
  cardDescription: "Workflow automation platform",
  cardBuiltFor: "Business ops",
  cardSolved: "Manual processes",
  cardDelivered: ["Workflow builder", "Integrations", "Monitoring"],
  sections: [
    { id: "overview", title: "Overview", type: "overview", content: "A workflow automation platform using n8n to connect disparate systems and automate business processes." },
    { id: "problem", title: "The Problem", type: "problem", bullets: ["Manual repetitive tasks", "Disconnected systems", "No workflow visibility"] },
    { id: "solution", title: "The Solution", type: "solution", bullets: ["Custom n8n workflows", "System integrations", "Error handling and retry", "Monitoring dashboard"] },
    { id: "features", title: "Key Features", type: "features", bullets: ["Visual workflow builder", "Multi-system integrations", "Error handling with retry", "Execution monitoring", "Custom webhook endpoints"] },
    { id: "outcome", title: "Outcome", type: "outcome", content: "Automated repetitive tasks and connected previously siloed systems." },
    { id: "tech-stack", title: "Tech Stack", type: "tech-stack", techStack: [{ name: "n8n", category: "Automation" }, { name: "Webhooks", category: "Integration" }, { name: "REST APIs", category: "Connectivity" }] },
  ],
};

export default n8nAutomations;
