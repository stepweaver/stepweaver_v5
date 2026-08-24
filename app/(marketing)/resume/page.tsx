import Link from "next/link";
import { RESUME_PDF } from "@/lib/data/identity";
import { resumeData } from "@/lib/data/resume-data";

export const metadata = {
  title: "Resume",
  description:
    "Business Systems Developer. Full-stack development, internal tools, automation, and operational software. 9+ years across development, analysis, data, and operations.",
};

export default function ResumePage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
              {resumeData.identity.eyebrow}
            </div>
            <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))]">
              {resumeData.identity.title}
            </h1>
            <p className="text-[rgb(var(--text-meta))] text-sm font-[var(--font-ibm)] mt-2">
              {resumeData.identity.subtitle}
            </p>
            <p className="text-[rgb(var(--text-meta))] text-xs font-mono mt-2">
              <a href={`mailto:${resumeData.identity.email}`} className="hover:text-[rgb(var(--neon))]">
                {resumeData.identity.email}
              </a>
              {" · "}
              <a href={resumeData.identity.siteUrl} className="hover:text-[rgb(var(--neon))]">
                {resumeData.identity.site}
              </a>
              {" · "}
              {resumeData.identity.location}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={RESUME_PDF.href}
              download={RESUME_PDF.downloadName}
              className="glitch-button glitch-button--primary text-xs"
            >
              Download PDF
            </a>
            <Link href="/about" className="glitch-button text-xs">
              About
            </Link>
            <Link href="/lab" className="glitch-button text-xs">
              Lab
            </Link>
            <Link href="/contact?intent=hire" className="glitch-button text-xs">
              Contact
            </Link>
          </div>
        </div>

        <div className="surface-panel p-6 sm:p-8 space-y-10">
          <section>
            <div className="text-label mb-3">IDENTITY</div>
            <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed max-w-3xl">
              {resumeData.identity.statement}
            </p>
          </section>

          <section>
            <div className="text-label mb-3">{resumeData.summary.title.toUpperCase()}</div>
            <ul className="space-y-2 max-w-4xl">
              {resumeData.summary.body.map((item) => (
                <li key={item} className="flex gap-2 text-[rgb(var(--text-secondary))] text-sm leading-relaxed">
                  <span className="text-[rgb(var(--neon)/0.5)] shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="text-label mb-4">{resumeData.skills.title.toUpperCase()}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumeData.skills.groups.map((group) => (
                <div key={group.label} className="border border-[rgb(var(--border)/0.25)] p-4 bg-[rgb(var(--panel)/0.15)]">
                  <p className="font-[var(--font-ocr)] text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--neon)/0.5)] mb-3">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((s) => (
                      <span
                        key={s}
                        className="text-xs px-2 py-1 border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-secondary))]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border border-[rgb(var(--neon)/0.28)] p-4 bg-[rgb(var(--panel)/0.15)]">
              <p className="font-[var(--font-ocr)] text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--neon)/0.7)] mb-3">
                {resumeData.currentlyBuilding.label}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {resumeData.currentlyBuilding.items.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-1 border border-[rgb(var(--neon)/0.35)] text-[rgb(var(--text-color))]"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-[rgb(var(--text-secondary))] text-xs leading-relaxed mb-2">
                {resumeData.currentlyBuilding.note}
              </p>
              <Link
                href={resumeData.currentlyBuilding.href}
                className="text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))]"
              >
                Lab notes →
              </Link>
            </div>
          </section>

          <section>
            <div className="text-label mb-4">{resumeData.experience.title.toUpperCase()}</div>
            <div className="space-y-6">
              {resumeData.experience.roles.map((r) => (
                <div key={`${r.org}-${r.role}-${r.when}`} className="border border-[rgb(var(--border)/0.25)] p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <div>
                      <div className="text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-sm">
                        {r.role}
                      </div>
                      <div className="text-[rgb(var(--text-meta))] text-xs">{r.org}</div>
                    </div>
                    <div className="text-[rgb(var(--text-meta))] text-xs font-mono">{r.when}</div>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {r.bullets.map((b) => (
                      <li key={b} className="flex gap-2 text-[rgb(var(--text-secondary))] text-sm leading-relaxed">
                        <span className="text-[rgb(var(--neon)/0.5)] shrink-0">·</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="text-label mb-4">{resumeData.projects.title.toUpperCase()}</div>
            <div className="space-y-4">
              {resumeData.projects.items.map((p) => (
                <div key={p.href} className="border border-[rgb(var(--border)/0.25)] p-4 bg-[rgb(var(--panel)/0.15)]">
                  <div className="flex flex-wrap items-baseline gap-3 mb-1">
                    <span className="text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-sm">{p.label}</span>
                    <Link href={p.href} className="text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))]">
                      View case study →
                    </Link>
                  </div>
                  <p className="text-[rgb(var(--text-secondary))] text-xs leading-relaxed">{p.summary}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/work"
                className="text-sm text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors"
              >
                View all projects →
              </Link>
            </div>
          </section>

          <section>
            <div className="text-label mb-3">{resumeData.education.title.toUpperCase()}</div>
            <ul className="space-y-2">
              {resumeData.education.items.map((item) => (
                <li key={item} className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
