import { NextResponse } from "next/server";
import { siteBaseUrl } from "@/lib/structured-data";
import { jsonSecurityHeaders } from "@/lib/json-security-headers";

export async function GET() {
  const base = siteBaseUrl();
  const profile = {
    name: "Stephen Weaver",
    brand: "λstepweaver",
    url: base,
    role: "Full-Stack Developer · Automation & AI Integration",
    summary:
      "Stephen Weaver is a systems builder: a full-stack developer and business-minded operator who designs, integrates, and hardens software, automation, and AI-assisted workflows for real operational use.",
    location: "Indiana, USA",
    work_modes: ["contract", "sprint", "part-time", "task-based", "trial project"],
    strong_fits: [
      "end-to-end systems thinking (workflow to production)",
      "Next.js app work",
      "React implementation",
      "automation, integrations, and workflow wiring",
      "API integration",
      "AI-assisted operational tooling",
      "repo cleanup and remediation",
      "debugging broken flows",
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
    },
    proof: {
      projects: `${base}/projects`,
      resume: `${base}/resume`,
      terminal: `${base}/terminal`,
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
