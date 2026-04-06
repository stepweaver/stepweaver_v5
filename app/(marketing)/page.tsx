import type { Metadata } from "next";
import Link from "next/link";
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
          <QuickEntry />
        </div>
      </div>
    </>
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

