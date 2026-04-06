import Link from "next/link";

export const metadata = { title: "Brief", description: "One-page dossier." };

export default function BriefPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
          {"// BRIEF"}
        </div>
        <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))] mb-8">
          One-Page Dossier
        </h1>
        <div className="surface-panel p-6 sm:p-8 space-y-6">
          <div>
            <div className="text-label mb-2">WHO</div>
            <p className="text-[rgb(var(--text-secondary))] text-sm">Technical operator specializing in architecture, automation, and interfaces.</p>
          </div>
          <div>
            <div className="text-label mb-2">WHAT</div>
            <p className="text-[rgb(var(--text-secondary))] text-sm">Full-stack systems from first principles — AI agents, n8n workflows, web platforms, terminal experiences.</p>
          </div>
          <div>
            <div className="text-label mb-2">HOW</div>
            <p className="text-[rgb(var(--text-secondary))] text-sm">Next.js, React, TypeScript, Node, Python. Clean architecture, typed boundaries, tested surfaces.</p>
          </div>
          <div>
            <div className="text-label mb-2">PROOF</div>
            <div className="flex flex-wrap gap-2">
              {["8+ projects shipped", "AI agent architecture", "Terminal experience", "Notion CMS integration"].map((p) => (
                <span key={p} className="text-xs px-2 py-1 border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-secondary))]">{p}</span>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-[rgb(var(--border)/0.2)] flex gap-3">
            <Link href="/services" className="glitch-button glitch-button--primary">View Services</Link>
            <Link href="/contact" className="glitch-button">Get in Touch</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
