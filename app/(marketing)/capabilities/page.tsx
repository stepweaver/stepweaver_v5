export const metadata = { title: "Capabilities", description: "Proof of skill." };

const CAPABILITIES = [
  { key: "architecture", title: "System Architecture", description: "Clean boundaries, typed interfaces, maintainable structure.", evidence: ["Next.js App Router", "TypeScript strict mode", "Zod validation at boundaries"] },
  { key: "automation", title: "Workflow Automation", description: "n8n workflows connecting disparate systems.", evidence: ["Custom n8n workflows", "Webhook integrations", "Error handling with retry"] },
  { key: "ai", title: "AI Integration", description: "LLM agents with project knowledge and citation systems.", evidence: ["Dual-provider fallback", "Citation marker system", "Bot protection"] },
  { key: "web", title: "Web Platforms", description: "Full-stack applications with terminal-forward identity.", evidence: ["Next.js 15", "Tailwind v4", "CSP security"] },
  { key: "terminal", title: "Terminal Experiences", description: "Interactive CLI interfaces with game engines.", evidence: ["Zork game engine", "11 commands", "Contact wizard"] },
  { key: "content", title: "Content Systems", description: "Notion-backed CMS with image token refresh.", evidence: ["Blog (Codex)", "Meshtastic docs", "7-day token TTL"] },
  { key: "security", title: "Security", description: "Defense in depth at every layer.", evidence: ["CSP nonces", "Rate limiting", "Origin validation"] },
  { key: "testing", title: "Testing", description: "Jest + Testing Library with coverage thresholds.", evidence: ["70% coverage threshold", "API route tests", "Zork engine tests"] },
  { key: "performance", title: "Performance", description: "Optimized bundles and aggressive caching.", evidence: ["WebP/AVIF images", "Package import optimization", "No prod source maps"] },
];

export default function CapabilitiesPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">{"// CAPABILITIES"}</div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))] mb-4">Capabilities Matrix</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm max-w-2xl">Nine capability buckets with evidence. Each backed by shipped work.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          {CAPABILITIES.map((cap) => (
            <div key={cap.key} className="bg-[rgb(var(--panel))] p-6">
              <div className="text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-lg mb-2">{cap.title}</div>
              <p className="text-[rgb(var(--text-secondary))] text-sm mb-4">{cap.description}</p>
              <div className="space-y-1">
                {cap.evidence.map((e, i) => (
                  <div key={i} className="text-xs text-[rgb(var(--text-meta))] flex gap-2">
                    <span className="text-[rgb(var(--neon))] shrink-0">▸</span>
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
