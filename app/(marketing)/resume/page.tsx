import Link from "next/link";

export const metadata = { title: "Resume", description: "Professional background." };

export default function ResumePage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">{"// RESUME"}</div>
            <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))]">Professional Background</h1>
          </div>
          <a href="/weaver_resume.pdf" className="glitch-button text-xs">Download PDF</a>
        </div>
        <div className="surface-panel p-6 sm:p-8 space-y-8">
          <div>
            <div className="text-label mb-3">SUMMARY</div>
            <p className="text-[rgb(var(--text-secondary))] text-sm">Technical operator specializing in system architecture, workflow automation, and interactive interfaces. Builds from first principles with TypeScript, Next.js, and AI integration.</p>
          </div>
          <div>
            <div className="text-label mb-3">CORE SKILLS</div>
            <div className="flex flex-wrap gap-2">
              {["Next.js", "React", "TypeScript", "Node.js", "Python", "AI/ML", "n8n", "Tailwind CSS", "PostgreSQL", "REST APIs", "System Architecture", "Terminal UI"].map((s) => (
                <span key={s} className="text-xs px-2 py-1 border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-secondary))]">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-label mb-3">EXPERIENCE</div>
            <div className="space-y-4">
              <div>
                <div className="text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-sm">Independent Technical Operator</div>
                <div className="text-[rgb(var(--text-meta))] text-xs">stepweaver.dev · Present</div>
                <p className="text-[rgb(var(--text-secondary))] text-sm mt-1">Architecture, automation, and interfaces for clients across multiple domains.</p>
              </div>
            </div>
          </div>
          <div>
            <div className="text-label mb-3">PROJECTS</div>
            <p className="text-[rgb(var(--text-secondary))] text-sm mb-3">Detailed case studies available in the projects section.</p>
            <Link href="/projects" className="text-sm text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors">View all projects →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
