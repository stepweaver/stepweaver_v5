import Link from "next/link";

export const metadata = {
  title: "Play",
  description: "Playground lane: terminal, field journal, Meshtastic, and experiments. Personality without crowding the hiring path.",
};

const PLAY_ITEMS = [
  {
    href: "/terminal",
    label: "Terminal",
    description: "Command-style portfolio shell: resume, chat, codex, weather, games.",
  },
  {
    href: "/carrier-journal",
    label: "Field Journal",
    description: "Personal walking and fitness log: miles, weather, recovery, milestones.",
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
    description: "Study tool grounded in real postal decisions.",
  },
];

export default function PlayPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
            {"// PLAY"}
          </div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))] mb-4">
            Playground
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm max-w-2xl">
            Experiments and personality surfaces. The hiring path lives on Work, About, Resume, and Contact. This lane is for curiosity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          {PLAY_ITEMS.map((item) => (
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
      </div>
    </div>
  );
}
