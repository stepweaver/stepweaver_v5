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

        <div className="surface-panel p-6 sm:p-8 space-y-8 mb-8">
          <div>
            <div className="text-label mb-2">WHO</div>
            <p className="text-[rgb(var(--text-secondary))] text-sm">
              Technical operator specializing in architecture, automation, and interfaces.
            </p>
          </div>
          <div>
            <div className="text-label mb-2">WHAT</div>
            <p className="text-[rgb(var(--text-secondary))] text-sm">
              Full-stack systems from first principles: AI agents, n8n workflows, web platforms, terminal experiences.
            </p>
          </div>
          <div>
            <div className="text-label mb-2">HOW</div>
            <p className="text-[rgb(var(--text-secondary))] text-sm">
              Next.js, React, TypeScript, Node, Python. Clean architecture, typed boundaries, tested surfaces.
            </p>
          </div>
          <div>
            <div className="text-label mb-2">PROOF</div>
            <div className="flex flex-wrap gap-2">
              {["Full project catalog", "AI agent architecture", "Terminal experience", "Notion CMS integration"].map((p) => (
                <span
                  key={p}
                  className="text-xs px-2 py-1 border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-secondary))]"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-[rgb(var(--border)/0.2)] flex gap-3 flex-wrap">
            <Link href="/services" className="glitch-button glitch-button--primary">
              View Services
            </Link>
            <Link href="/contact" className="glitch-button">
              Get in Touch
            </Link>
          </div>
        </div>

        <section
          className="surface-panel border border-[rgb(var(--neon)/0.2)] p-6 sm:p-8 scroll-mt-24"
          aria-labelledby="brief-background"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <p className="text-xs tracking-[0.18em] text-[rgb(var(--text-label))] font-[var(--font-ocr)] uppercase sm:text-sm" id="brief-background">
              Background
            </p>
            <div className="text-right text-xs text-[rgb(var(--muted-color))] font-mono shrink-0">
              <div className="tracking-[0.18em] text-[rgb(var(--text-meta))] uppercase font-[var(--font-ocr)] text-xs">Section</div>
              <div className="font-mono text-[rgb(var(--text-secondary))] whitespace-nowrap">BIO-01</div>
            </div>
          </div>

          <h2 className="font-[var(--font-ibm)] text-[rgb(var(--text-color))] text-xl md:text-2xl leading-tight mb-5">
            I translate business workflows into working systems.
          </h2>

          <div className="space-y-4 text-[rgb(var(--text-secondary))] text-sm md:text-base leading-relaxed font-[var(--font-ibm)]">
            <p>
              I&apos;m Stephen Weaver. I came into software through operations, analysis, and real-world process work:
              Airborne Cryptologic Linguist in the U.S. Air Force, then restaurant operations and business analysis, then
              development. That path still shapes how I build.
            </p>
            <p className="text-[rgb(var(--text-color))] text-xs uppercase tracking-wider font-[var(--font-ocr)]">Trajectory</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>U.S. Air Force veteran; Airborne Cryptologic Linguist</li>
              <li>Restaurant operations and management</li>
              <li>Business analysis</li>
              <li>Self-taught developer</li>
              <li>Current focus: DevOps and infrastructure</li>
            </ul>
            <p>
              I don&apos;t treat software as an isolated code problem. I look at the workflow, the handoffs, the data, the
              integrations, and the risks. Then I build systems people can use, maintain, and trust.
            </p>
          </div>

          <footer className="mt-8 pt-6 border-t border-[rgb(var(--border)/0.2)] space-y-2">
            <p className="font-[var(--font-ibm)] text-[rgb(var(--accent))] text-base md:text-lg">Curious about my work or want to chat?</p>
            <p className="text-sm md:text-base font-[var(--font-ibm)] text-[rgb(var(--text-color))] leading-relaxed">
              Check out my{" "}
              <Link href="/resume" className="text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors underline hover:no-underline font-semibold">
                resume
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors underline hover:no-underline font-semibold">
                send me a message
              </Link>
              .
            </p>
          </footer>
        </section>
      </div>
    </div>
  );
}
