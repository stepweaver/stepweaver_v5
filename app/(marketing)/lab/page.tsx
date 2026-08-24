import Link from "next/link";
import { CURRENTLY_BUILDING, LEARNING_LAB } from "@/lib/data/identity";

export const metadata = {
  title: "Lab",
  description:
    "Experiments, field systems, and the SvelteKit instructional rebuild. Curiosity without crowding the hiring path.",
};

const LAB_ITEMS = [
  {
    href: "/terminal",
    label: "Terminal",
    description: "Command-style portfolio shell: resume, chat, writing, weather, games.",
  },
  {
    href: "/field-journal",
    label: "Field Journal",
    description: "Walking and fitness log: miles, weather, recovery, milestones.",
  },
  {
    href: "/meshtastic",
    label: "Meshtastic",
    description: "Field-guide docs and notes for mesh radio tinkering.",
  },
  {
    href: "/dice-roller",
    label: "Dice Roller",
    description: "RPG dice utility with local persistence.",
  },
  {
    href: "/yankee-samurai",
    label: "Yankee Samurai",
    description: "Identity / experiment surface.",
  },
  {
    href: "/mail-sort-academy",
    label: "Mail Sort Academy",
    description: "Unofficial mail-classification study drill from public educational material.",
  },
  {
    href: "/work/llambda-llm-agent",
    label: "λlambda",
    description: "Shared LLM agent behind the site and terminal, with guardrails and provider fallback.",
  },
] as const;

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
          {"// LAB"}
        </div>
        <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))] mb-4">
          Lab
        </h1>
        <p className="text-[rgb(var(--text-secondary))] text-sm max-w-2xl mb-10">
          Experiments, field systems, and a current instructional rebuild. The hiring path is Work, About, Resume, and Contact. This lane is for curiosity.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)] mb-12">
          {LAB_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-[rgb(var(--panel))] p-6 hover:bg-[rgb(var(--neon)/0.03)] transition-colors group block"
            >
              <h2 className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))] group-hover:text-[rgb(var(--neon))] transition-colors mb-2">
                {item.label}
              </h2>
              <p className="text-[rgb(var(--text-secondary))] text-sm">{item.description}</p>
            </Link>
          ))}
        </div>

        <p className="text-[10px] font-[var(--font-ocr)] uppercase tracking-[0.2em] text-[rgb(var(--neon)/0.6)] mb-3">
          {LEARNING_LAB.eyebrow}
        </p>
        <h2 className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--text-color))] mb-4">{LEARNING_LAB.title}</h2>
        <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed mb-8">{LEARNING_LAB.body}</p>

        <div className="surface-panel p-6 sm:p-8 space-y-8">
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
        </div>
      </div>
    </div>
  );
}
