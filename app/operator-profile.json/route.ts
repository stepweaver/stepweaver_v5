import { NextResponse } from "next/server";
import { CURRENTLY_BUILDING, IDENTITY_STATEMENT, ROLE_LINE } from "@/lib/data/identity";
import { siteBaseUrl } from "@/lib/structured-data";
import { jsonSecurityHeaders } from "@/lib/json-security-headers";

export async function GET() {
  const base = siteBaseUrl();
  const profile = {
    name: "Stephen Weaver",
    brand: "λstepweaver",
    url: base,
    role: ROLE_LINE,
    positioning: {
      primary: "hiring",
      secondary: "selective_consulting",
      consulting_focus: "custom data workflows, ops systems, guarded AI tools",
    },
    summary:
      "Product-minded software developer and business systems developer. Designs and ships internal tools, workflow automations, and AI-assisted systems. Learns the domain and stack the problem requires, then ships. Consulting is selective and relationship-gated.",
    statement: IDENTITY_STATEMENT,
    location: "Indiana, USA",
    work_modes: ["full-time hire", "contract", "sprint", "part-time", "selective project"],
    strong_fits: [
      "end-to-end systems thinking (workflow to production)",
      "entering unfamiliar domains and tools and shipping working systems",
      "full-stack implementation",
      "custom data workflows and automation",
      "API integration",
      "AI-assisted operational tooling with guardrails",
      "repo cleanup and remediation",
      "dashboard and reporting systems",
    ],
    tech: [
      "TypeScript",
      "JavaScript",
      "Python",
      "SQL",
      "React",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Supabase",
      "Vercel",
      "GitHub",
      "Notion API",
      "Stripe",
      "n8n",
      "LLM integrations",
    ],
    currently_building: {
      label: CURRENTLY_BUILDING.label,
      items: [...CURRENTLY_BUILDING.items],
      note: CURRENTLY_BUILDING.note,
      href: `${base}${CURRENTLY_BUILDING.href}`,
    },
    entry_points: {
      for_agents: `${base}/for-agents`,
      llms_txt: `${base}/llms.txt`,
      about: `${base}/about`,
      work: `${base}/work`,
      resume: `${base}/resume`,
      lab: `${base}/lab`,
    },
    proof: {
      work: `${base}/work`,
      resume: `${base}/resume`,
      lab: `${base}/lab`,
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
