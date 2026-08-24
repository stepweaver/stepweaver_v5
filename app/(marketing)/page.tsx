import type { Metadata } from "next";
import { headers } from "next/headers";
import { Hero } from "@/components/hero/hero";
import { FeaturedSystems } from "@/components/home/featured-systems";
import { HowIWork } from "@/components/home/how-i-work";
import { ExperienceStrip } from "@/components/home/experience-strip";
import { WritingStrip } from "@/components/home/writing-strip";
import { CloseCta } from "@/components/home/close-cta";
import { LoadoutSection } from "@/components/capabilities/loadout-section";
import { InkDivider } from "@/components/ui/ink-divider";
import { getHomeWritingPosts } from "@/lib/home/recent-intel";
import { generateStructuredData } from "@/lib/structured-data";
import { PRIMARY_TITLE, SUPPORTING_LINE } from "@/lib/data/identity";

const SITE_URL = process.env.SITE_URL || "https://stepweaver.dev";
const HOME_TITLE = `Stephen Weaver | ${PRIMARY_TITLE}`;
const HOME_DESCRIPTION = `${PRIMARY_TITLE}. ${SUPPORTING_LINE}. I ship internal tools, workflow systems, and AI-assisted applications for operations-heavy teams.`;
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
  const writingPosts = await getHomeWritingPosts();

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
          <FeaturedSystems />
          <InkDivider />
          <HowIWork />
          <InkDivider />
          <ExperienceStrip />
          <InkDivider />
          <div className="relative z-30 w-full px-3 sm:px-6 md:px-8 lg:px-12 xl:px-14 py-10">
            <LoadoutSection />
          </div>
          <InkDivider />
          <WritingStrip posts={writingPosts} />
          <CloseCta />
        </div>
      </div>
    </>
  );
}
