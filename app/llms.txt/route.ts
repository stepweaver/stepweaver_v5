import { CURRENTLY_BUILDING } from "@/lib/data/identity";
import { siteBaseUrl } from "@/lib/structured-data";

export async function GET() {
  const base = siteBaseUrl();
  const body = `# λstepweaver / Stephen Weaver

> Operator profile for recruiters, sourcing agents, and task-routing systems.

## Summary
Stephen Weaver is a Business Systems Developer: a full-stack developer who ships production software for operations-heavy work (internal tools, workflow systems, automation, AI-assisted applications). The through-line is not a single framework: he enters unfamiliar domains and tools, learns what the work requires, and ships.
Primary path: hiring for operations-heavy / internal-tools / AI-adjacent teams.
Secondary: selective consulting for custom data workflows when people and problem fit.

## Currently building
${CURRENTLY_BUILDING.items.join(" · ")}
${CURRENTLY_BUILDING.note}
Lab: ${base}${CURRENTLY_BUILDING.href}

## Best entry points
- For agents: ${base}/for-agents
- Operator profile JSON: ${base}/operator-profile.json
- Work: ${base}/work
- About: ${base}/about
- Resume: ${base}/resume
- Lab: ${base}/lab
- Contact: ${base}/contact
- Services (selective): ${base}/services

## Good fits
- product / ops / logistics-adjacent engineering roles
- work that requires acquiring an unfamiliar stack or domain and shipping
- full-stack implementation (TypeScript, JavaScript, React, Node.js, SQL)
- custom data workflows, automation, and integrations
- AI-assisted internal tooling with guardrails
- debugging and cleanup work
- dashboards and operational systems
- selective contract or sprint work when the fit is clear
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
