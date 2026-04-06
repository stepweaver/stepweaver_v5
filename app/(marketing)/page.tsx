import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Hero } from "@/components/hero/hero";
import { InkDivider } from "@/components/ui/ink-divider";
import { TerminalLinkStrip } from "@/components/home/terminal-link-strip";
import { getInitialBlogEntries } from "@/lib/blog";
import { normalizePostFromBlogEntry, sortPosts } from "@/lib/codex/selectors";
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
          <div className="relative z-30 w-full px-3 sm:px-6 md:px-8 lg:px-12 xl:px-14">
            <TerminalLinkStrip />
          </div>
          <InkDivider />
          <QuickEntry />
          <RecentIntel />
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

async function RecentIntel() {
  let latest: { title: string; slug: string } | null = null;
  if (process.env.NOTION_BLOG_DB_ID && process.env.NOTION_API_KEY) {
    try {
      const entries = await getInitialBlogEntries(80);
      const sorted = sortPosts(entries.map(normalizePostFromBlogEntry));
      const first = sorted[0];
      if (first) latest = { title: first.title, slug: first.slug };
    } catch {
      latest = null;
    }
  }

  return (
    <section className="relative z-30 pb-16">
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-10 max-w-none">
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          <div className="flex-1 min-w-0 bg-[rgb(var(--panel))] p-5 sm:p-6 lg:p-8 lg:max-w-[62%]">
            <p className="text-xs tracking-[0.18em] text-[rgb(var(--text-meta))] font-[var(--font-ocr)] uppercase mb-3 sm:text-sm">
              RECENT INTEL
            </p>
            {latest ? (
              <Link
                href={`/codex/${latest.slug}`}
                className="block text-left font-[var(--font-ibm)] text-lg sm:text-xl text-[rgb(var(--text-color))] hover:text-[rgb(var(--neon))] transition-colors leading-snug"
              >
                {latest.title}
              </Link>
            ) : (
              <p className="text-[rgb(var(--text-secondary))] text-sm font-[var(--font-ibm)]">
                Wire Notion codex env vars to surface the latest entry here. Archive lives in the codex.
              </p>
            )}
          </div>
          <div className="lg:w-[38%] shrink-0 bg-[rgb(var(--chrome))] p-5 sm:p-6 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-[rgb(var(--border)/0.15)]">
            <p className="font-[var(--font-ocr)] text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--text-meta))] mb-3">
              FIELD CHANNEL
            </p>
            <Link
              href="/codex"
              className="inline-flex w-fit items-center font-[var(--font-ocr)] text-xs uppercase tracking-wider text-[rgb(var(--neon))] border border-[rgb(var(--neon)/0.4)] px-4 py-2 hover:bg-[rgb(var(--neon)/0.08)] transition-colors"
            >
              Open codex →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
