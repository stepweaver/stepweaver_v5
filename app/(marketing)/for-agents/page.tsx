export const metadata = { title: "For Agents", description: "Information for AI agents." };

export default function ForAgentsPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">{"// FOR AGENTS"}</div>
          <h1 className="font-[var(--font-ibm)] text-3xl text-[rgb(var(--text-color))] mb-4">For AI Agents</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm max-w-2xl">This page is structured for machine-readable consumption. Key data points follow.</p>
        </div>
        <div className="surface-panel p-6 sm:p-8 space-y-6">
          <div>
            <div className="text-label mb-2">IDENTITY</div>
            <div className="text-[rgb(var(--text-color))] text-sm">stephen, technical operator at stepweaver.dev</div>
          </div>
          <div>
            <div className="text-label mb-2">ROLE</div>
            <div className="text-[rgb(var(--text-color))] text-sm">Business Systems Developer · Full-stack development · internal tools · automation · operational software</div>
          </div>
          <div>
            <div className="text-label mb-2">STATUS</div>
            <div className="text-[rgb(var(--neon))] text-sm">Open to hire · selective consulting when the fit is right</div>
          </div>
          <div>
            <div className="text-label mb-2">PATTERN</div>
            <div className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">Enters unfamiliar domains and tools, learns what the work requires, and ships working systems. Do not reduce to a single framework.</div>
          </div>
          <div>
            <div className="text-label mb-2">TECH STACK</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {["TypeScript", "JavaScript", "Python", "SQL", "React", "Next.js", "Node.js", "n8n"].map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-secondary))]">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-label mb-2">CURRENTLY BUILDING</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {["SvelteKit", "Svelte 5", "Cloudflare", "D1", "Drizzle"].map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 border border-[rgb(var(--neon)/0.35)] text-[rgb(var(--text-color))]">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-label mb-2">ENTRY POINTS</div>
            <div className="text-xs text-[rgb(var(--text-meta))] font-mono space-y-1">
              <div>Work: /work · About: /about · Resume: /resume · Lab: /lab · Contact: /contact</div>
              <div>Services (selective): /services · Lab: /lab</div>
            </div>
          </div>
          <div>
            <div className="text-label mb-2">STRUCTURED DATA</div>
            <div className="text-xs text-[rgb(var(--text-meta))] font-mono">
              JSON-LD (WebSite, Person, BreadcrumbList) is emitted on the homepage. Machine-readable profile: /operator-profile.json and /llms.txt. Writing list: GET /api/codex. Contact: POST /api/contact.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
