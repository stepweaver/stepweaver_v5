import { NextResponse } from "next/server";
import { siteBaseUrl } from "@/lib/structured-data";
import { jsonSecurityHeaders } from "@/lib/json-security-headers";

export async function GET() {
  const base = siteBaseUrl();
  const profile = {
    name: "Stephen Weaver",
    brand: "λstepweaver",
    url: base,
    role: "Full-Stack Developer · Systems Builder · Automation & AI Integration",
    positioning: {
      primary: "hiring",
      secondary: "selective_consulting",
      consulting_focus: "custom data workflows, ops systems, guarded AI tools",
    },
    summary:
      "Product-minded systems builder for operations-heavy teams. Designs and ships internal tools, workflow automations, and AI-assisted systems. Consulting is selective and relationship-gated.",
    location: "Indiana, USA",
    work_modes: ["full-time hire", "contract", "sprint", "part-time", "selective project"],
    strong_fits: [
      "end-to-end systems thinking (workflow to production)",
      "Next.js app work",
      "React implementation",
      "custom data workflows and automation",
      "API integration",
      "AI-assisted operational tooling with guardrails",
      "repo cleanup and remediation",
      "dashboard and reporting systems",
    ],
    tech: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "PostgreSQL",
      "Supabase",
      "Vercel",
      "GitHub",
      "Notion API",
      "Stripe",
      "n8n",
      "LLM integrations",
    ],
    entry_points: {
      for_agents: `${base}/for-agents`,
      llms_txt: `${base}/llms.txt`,
      about: `${base}/about`,
      work: `${base}/work`,
    },
    proof: {
      work: `${base}/work`,
      resume: `${base}/resume`,
      services: `${base}/services`,
      play: `${base}/play`,
      github: "https://github.com/stepweaver",
      contact: `${base}/contact`,
    },
  };

  return NextResponse.json(profile, {
    headers: {
      ...jsonSecurityHeaders(),
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
