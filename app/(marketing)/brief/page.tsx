import Link from "next/link";
import { BackgroundBio } from "@/components/brief/background-bio";
import { briefData } from "@/lib/data/brief-data";

export const metadata = {
  title: "Brief",
  description:
    "One-page operator brief for Stephen Weaver: systems builder, full-stack developer, automation and AI integration.",
};

export default function BriefPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
          {briefData.identity.eyebrow}
        </div>
        <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))] mb-2">
          {briefData.identity.name}
        </h1>
        <p className="text-[rgb(var(--text-meta))] text-sm font-[var(--font-ibm)] mb-8">
          {briefData.identity.roles.join(" · ")}
        </p>

        <div className="surface-panel p-6 sm:p-8 space-y-8 mb-8">
          <div>
            <div className="text-label mb-2">STATEMENT</div>
            <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">{briefData.identity.statement}</p>
          </div>

          <div>
            <div className="text-label mb-3">{briefData.roleFit.title}</div>
            <ul className="space-y-2">
              {briefData.roleFit.items.map((item) => (
                <li key={item} className="flex gap-2 text-[rgb(var(--text-secondary))] text-sm leading-relaxed">
                  <span className="text-[rgb(var(--neon)/0.5)] shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-label mb-3">FLAGSHIP WORK</div>
            <div className="space-y-4">
              {briefData.flagshipProjects.map((p) => (
                <div
                  key={p.slug}
                  className="border border-[rgb(var(--border)/0.25)] p-4 bg-[rgb(var(--panel)/0.15)]"
                >
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <span className="font-[var(--font-ibm)] text-[rgb(var(--text-color))] text-sm">{p.label}</span>
                    <span className="font-[var(--font-ocr)] text-[10px] uppercase tracking-wider text-[rgb(var(--neon)/0.45)]">
                      {p.type}
                    </span>
                  </div>
                  <p className="text-[rgb(var(--text-secondary))] text-xs leading-relaxed mb-2">{p.summary}</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-meta))]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <Link href={p.href} className="text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))]">
                    View case study →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-label mb-3">{briefData.stackSnapshot.title}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {briefData.stackSnapshot.categories.map((cat) => (
                <div key={cat.label}>
                  <p className="font-[var(--font-ocr)] text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--neon)/0.5)] mb-2">
                    {cat.label}
                  </p>
                  <ul className="space-y-1">
                    {cat.items.map((item) => (
                      <li key={item} className="font-[var(--font-ibm)] text-xs text-[rgb(var(--text-secondary))]">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[rgb(var(--border)/0.2)] flex flex-wrap gap-3">
            {briefData.ctas.map((c) => {
              const isExternal = c.href.startsWith("http");
              const btnClass =
                c.variant === "primary" ? "glitch-button glitch-button--primary" : "glitch-button";
              return isExternal ? (
                <a key={c.href} href={c.href} target="_blank" rel="noreferrer" className={btnClass}>
                  {c.label}
                </a>
              ) : (
                <Link key={c.href} href={c.href} className={btnClass}>
                  {c.label}
                </Link>
              );
            })}
          </div>
        </div>

        <section
          className="surface-panel border border-[rgb(var(--neon)/0.2)] p-6 sm:p-8 scroll-mt-24"
          aria-labelledby="brief-background"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <p
              className="text-xs tracking-[0.18em] text-[rgb(var(--text-label))] font-[var(--font-ocr)] uppercase sm:text-sm"
              id="brief-background"
            >
              Background
            </p>
            <div className="text-right text-xs text-[rgb(var(--muted-color))] font-mono shrink-0">
              <div className="tracking-[0.18em] text-[rgb(var(--text-meta))] uppercase font-[var(--font-ocr)] text-xs">
                Section
              </div>
              <div className="font-mono text-[rgb(var(--text-secondary))] whitespace-nowrap">BIO-01</div>
            </div>
          </div>

          <BackgroundBio />
        </section>
      </div>
    </div>
  );
}
