import type { Metadata } from "next";
import { headers } from "next/headers";
import { Hero } from "@/components/hero/hero";
import { ProjectCarousel } from "@/components/hero/project-carousel";
import { ActivityStreams } from "@/components/home/activity-streams";
import { InkDivider } from "@/components/ui/ink-divider";
import { TerminalLinkStrip } from "@/components/home/terminal-link-strip";
import { getHomeCarrierPreview } from "@/lib/home/carrier-preview";
import { getHomeRecentIntel } from "@/lib/home/recent-intel";
import { generateStructuredData } from "@/lib/structured-data";

const SITE_URL = process.env.SITE_URL || "https://stepweaver.dev";
const HOME_TITLE = "Stephen Weaver | Systems Builder for Operations & AI";
const HOME_DESCRIPTION =
  "Product-minded systems builder for operations-heavy teams. Internal tools, workflow automations, and AI-assisted systems. Hiring-first, with selective consulting when the fit is right.";
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
  const [recentIntel, carrierPreview] = await Promise.all([
    getHomeRecentIntel(),
    getHomeCarrierPreview(),
  ]);

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
          <Hero />
          <InkDivider showSeal className="py-0.5 sm:py-1" />
          <ActivityStreams recentIntel={recentIntel} carrierPreview={carrierPreview} />
          <div className="relative z-30 w-full max-w-[1920px] mx-auto px-3 sm:px-5 md:px-6 lg:px-10 xl:px-14 2xl:px-16 pb-8">
            <ProjectCarousel />
          </div>
          <InkDivider />
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
    { label: "Work", href: "/work", desc: "Flagship case studies" },
    { label: "About", href: "/about", desc: "Where I fit" },
    { label: "Resume", href: "/resume", desc: "Hiring surface" },
    { label: "Play", href: "/play", desc: "Terminal & experiments" },
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
              className="bg-[rgb(var(--panel))] p-4 sm:p-5 hover:bg-[rgb(var(--neon)/0.06)] transition-colors group border border-transparent hover:border-[rgb(var(--neon)/0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--neon))]"
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
