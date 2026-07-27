import { siteBaseUrl } from "@/lib/structured-data";

export async function GET() {
  const base = siteBaseUrl();
  const body = `# λstepweaver / Stephen Weaver

> Operator profile for recruiters, sourcing agents, and task-routing systems.

## Summary
Stephen Weaver is a product-minded systems builder: full-stack developer and operator who designs, integrates, and hardens software, automation, and AI-assisted workflows for real operational use.
Primary path: hiring for operations-heavy / internal-tools / AI-adjacent teams.
Secondary: selective consulting for custom data workflows when people and problem fit.

## Best entry points
- For agents: ${base}/for-agents
- Operator profile JSON: ${base}/operator-profile.json
- Work: ${base}/work
- About: ${base}/about
- Resume: ${base}/resume
- Contact: ${base}/contact
- Services (selective): ${base}/services
- Play: ${base}/play

## Good fits
- product / ops / logistics-adjacent engineering roles
- Next.js / full-stack implementation
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
