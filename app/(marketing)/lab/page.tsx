import Link from "next/link";
import { CURRENTLY_BUILDING, LEARNING_LAB } from "@/lib/data/identity";

export const metadata = {
  title: "Learning Lab",
  description:
    "Instructional rebuild of λstepweaver in SvelteKit: learning the framework from first principles, then Cloudflare, D1, and Drizzle.",
};

const LADDER = [
  {
    step: "01",
    title: "SvelteKit routing and loading",
    detail: "File-based routes, layouts, load functions, and the boundary between server data and client interactivity.",
  },
  {
    step: "02",
    title: "Component boundaries",
    detail: "What belongs in a page, what belongs in a reusable piece, and how Svelte 5 runes change state ownership.",
  },
  {
    step: "03",
    title: "TypeScript data modeling",
    detail: "Typed content and resume/work data that can feed both the site and a downloadable résumé without copy drift.",
  },
  {
    step: "04",
    title: "Cloudflare, D1, Drizzle",
    detail: "Move the lab onto Cloudflare architecture after the SvelteKit application model is understood, not before.",
  },
] as const;

export default function LabPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
          {"// LAB"}
        </div>
        <p className="text-[10px] font-[var(--font-ocr)] uppercase tracking-[0.2em] text-[rgb(var(--neon)/0.6)] mb-3">
          {LEARNING_LAB.eyebrow}
        </p>
        <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))] mb-4">
          {LEARNING_LAB.title}
        </h1>
        <p className="text-[rgb(var(--text-secondary))] text-sm sm:text-base leading-relaxed mb-8">
          {LEARNING_LAB.body}
        </p>

        <div className="surface-panel p-6 sm:p-8 space-y-8">
          <section>
            <div className="text-label mb-3">WHY THIS EXISTS</div>
            <div className="space-y-3 text-[rgb(var(--text-secondary))] text-sm leading-relaxed">
              <p>
                The live site remains a Next.js application. This lab is not a secret rewrite in production and not an
                AI-autopilot port of that codebase. I am rebuilding each system only after I understand the SvelteKit
                equivalent.
              </p>
              <p>
                The point is the pattern, not the framework: encounter an unfamiliar stack, learn the actual primitives,
                then ship something real. The portfolio is the artifact because hiring managers can watch the work
                instead of taking a slogan about learning at face value.
              </p>
            </div>
          </section>

          <section>
            <div className="text-label mb-3">STACK IN MOTION</div>
            <div className="flex flex-wrap gap-2 mb-3">
              {CURRENTLY_BUILDING.items.map((item) => (
                <span
                  key={item}
                  className="text-xs px-2 py-1 border border-[rgb(var(--neon)/0.35)] text-[rgb(var(--text-color))]"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="text-[rgb(var(--text-secondary))] text-xs leading-relaxed">{CURRENTLY_BUILDING.note}</p>
          </section>

          <section>
            <div className="text-label mb-4">LEARNING LADDER</div>
            <ol className="space-y-4">
              {LADDER.map((item) => (
                <li key={item.step} className="border border-[rgb(var(--border)/0.25)] p-4 bg-[rgb(var(--panel)/0.15)]">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="font-[var(--font-ocr)] text-[10px] tracking-wider text-[rgb(var(--neon)/0.55)]">
                      {item.step}
                    </span>
                    <span className="font-[var(--font-ibm)] text-sm text-[rgb(var(--text-color))]">{item.title}</span>
                  </div>
                  <p className="text-[rgb(var(--text-secondary))] text-xs leading-relaxed">{item.detail}</p>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <div className="text-label mb-3">WHAT THIS IS NOT</div>
            <ul className="space-y-2">
              {[
                "Not five years of professional SvelteKit experience quietly added to Skills",
                "Not a claim that the production site has already moved off Next.js",
                "Not a mechanical translation of an existing React tree",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-[rgb(var(--text-secondary))] text-sm leading-relaxed">
                  <span className="text-[rgb(var(--neon)/0.5)] shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="pt-4 border-t border-[rgb(var(--border)/0.2)] flex flex-wrap gap-3">
            <Link href="/resume" className="glitch-button glitch-button--primary">
              Resume
            </Link>
            <Link href="/about" className="glitch-button">
              About
            </Link>
            <Link href="/work" className="glitch-button">
              Work
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
