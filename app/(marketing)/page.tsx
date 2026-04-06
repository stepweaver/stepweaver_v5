import { Hero } from "@/components/hero/hero";
import { InkDivider } from "@/components/ui/ink-divider";
import { BackgroundCanvasWrapper } from "@/components/effects/background-canvas-wrapper";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <BackgroundCanvasWrapper />
      <div className="relative z-10">
        <Hero />
        <InkDivider />
        <QuickEntry />
      </div>
    </div>
  );
}

function QuickEntry() {
  const links = [
    { label: "Services", href: "/services", desc: "What I build" },
    { label: "Start Here", href: "/start-here", desc: "Find your path" },
    { label: "Brief", href: "/brief", desc: "One-page dossier" },
    { label: "Capabilities", href: "/capabilities", desc: "Proof of skill" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="bg-[rgb(var(--panel))] p-4 hover:bg-[rgb(var(--neon)/0.05)] transition-colors group"
          >
            <div className="text-[rgb(var(--neon))] font-[var(--font-ibm)] text-sm group-hover:text-[rgb(var(--accent))] transition-colors">
              {link.label}
            </div>
            <div className="text-[rgb(var(--text-meta))] text-xs mt-1">
              {link.desc}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
