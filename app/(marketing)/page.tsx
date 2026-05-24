import type { Metadata } from "next";
import { headers } from "next/headers";
import { Hero } from "@/components/hero/hero";
import { InkDivider } from "@/components/ui/ink-divider";
import { TerminalLinkStrip } from "@/components/home/terminal-link-strip";
import { getHomeRecentIntel } from "@/lib/home/recent-intel";
import { generateStructuredData } from "@/lib/structured-data";

const SITE_URL = process.env.SITE_URL || "https://stepweaver.dev";
const HOME_TITLE = "Stephen Weaver | Full-Stack Developer, Automation, and AI";
const HOME_DESCRIPTION =
  "Full-stack developer building practical web apps, automation, and AI-enabled tools that reduce friction and improve operations.";
const HOME_SHARE_IMAGE = `${SITE_URL}/images/stepweaver-dev.png`;

export function generateMetadata(): Metadata {
  return {
    title: "Stephen Weaver",
    description: HOME_DESCRIPTION,
    alternates: { canonical: SITE_URL },
    openGraph: {
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      type: "website",
      url: SITE_URL,
      images: [{ url: HOME_SHARE_IMAGE, width: 1200, height: 630, alt: "Stephen Weaver" }],
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      creator: "@stepweaver",
      site: "@stepweaver",
      images: [HOME_SHARE_IMAGE],
    },
  };
}

export default async function HomePage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const structuredData = generateStructuredData();
  const recentIntel = await getHomeRecentIntel();

  return (
    <>
      <script
        nonce={nonce}
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.website) }}
      />
      <script
        nonce={nonce}
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.person) }}
      />
      <script
        nonce={nonce}
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.breadcrumb) }}
      />
      <div className="relative min-h-screen">
        <div className="relative z-10">
          <Hero recentIntel={recentIntel} />
          <InkDivider showSeal className="py-0.5 sm:py-1" />
          <div className="relative z-30 w-full px-3 sm:px-6 md:px-8 lg:px-12 xl:px-14">
            <TerminalLinkStrip />
          </div>
          <InkDivider />
          <CurrentChapter />
          <QuickEntry />
        </div>
      </div>
    </>
  );
}

function CurrentChapter() {
  return (
    <section className="relative z-30 w-full px-3 sm:px-6 md:px-8 lg:px-12 xl:px-14 pb-8">
      <div className="relative border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel)/0.2)] p-5 sm:p-7">
        <div className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-[rgb(var(--cyan)/0.5)]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-[rgb(var(--cyan)/0.5)]" />
        <p className="font-[var(--font-ocr)] text-xs uppercase tracking-[0.28em] text-[rgb(var(--cyan)/0.7)] mb-2">
          Current chapter
        </p>
        <h2 className="font-[var(--font-ibm)] text-xl sm:text-2xl font-semibold text-[rgb(var(--text-color))] mb-3 leading-snug">
          Mail routes, miles, and systems thinking in the field.
        </h2>
        <p className="font-[var(--font-ibm)] text-sm sm:text-base text-[rgb(var(--text-secondary))] leading-relaxed mb-3 max-w-3xl">
          I&apos;m currently working as a mail carrier and documenting the adaptation: walking distance, hydration,
          soreness, weather, weight trend, recovery, and the daily reality of learning a physical route job.
        </p>
        <p className="font-[var(--font-ibm)] text-sm sm:text-base text-[rgb(var(--text-secondary))] leading-relaxed mb-5 max-w-3xl">
          Carrier&apos;s Log is part field log, part transformation record, and part public proof that systems thinking
          does not only happen behind a desk.
        </p>
        <a
          href="/carrier-journal"
          className="inline-flex items-center gap-2 border border-[rgb(var(--cyan)/0.35)] bg-[rgb(var(--window)/0.2)] px-4 py-2 text-xs font-[var(--font-ibm)] uppercase tracking-[0.1em] text-[rgb(var(--cyan))] transition-colors hover:border-[rgb(var(--cyan)/0.65)] hover:bg-[rgb(var(--cyan)/0.1)]"
        >
          Read Carrier&apos;s Log →
        </a>
      </div>
    </section>
  );
}

function QuickEntry() {
  const links = [
    { label: "Projects", href: "/projects", desc: "Proof of work" },
    { label: "Carrier's Log", href: "/carrier-journal", desc: "Letter carrier field log" },
    { label: "Codex", href: "/codex", desc: "Essays and notes" },
    { label: "Brief", href: "/brief", desc: "One-page dossier" },
  ];

  return (
    <section className="relative z-30 w-full px-3 sm:px-6 md:px-8 lg:px-12 xl:px-14 pb-10">
      <div className="max-w-none border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel)/0.2)] p-4 sm:p-5">
        <p className="font-[var(--font-ocr)] text-xs uppercase tracking-[0.28em] text-[rgb(var(--text-label))] mb-3">
          Quick entry
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="bg-[rgb(var(--panel))] p-4 sm:p-5 hover:bg-[rgb(var(--neon)/0.06)] transition-colors group border border-transparent hover:border-[rgb(var(--neon)/0.25)]"
            >
              <div className="text-[rgb(var(--neon))] font-[var(--font-ibm)] text-sm group-hover:text-[rgb(var(--accent))] transition-colors">
                {link.label} →
              </div>
              <div className="text-[rgb(var(--text-meta))] text-xs mt-1">{link.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

