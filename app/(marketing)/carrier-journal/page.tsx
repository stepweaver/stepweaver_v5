import type { Metadata } from "next";
import { fetchCarrierDispatches } from "@/lib/notion/carrier-journal.repo";
import { fetchAchievementUnlocks } from "@/lib/notion/carrier-achievement-unlocks.repo";
import { CarrierJournalPage } from "@/components/carrier-journal/carrier-journal-page";

export const revalidate = 300; // 5 minutes, matches Notion cache TTL

const SITE_URL = process.env.SITE_URL || "https://stepweaver.dev";
const absoluteImageUrl = `${SITE_URL}/images/carrier_log.png`;

export const metadata: Metadata = {
  title: "Carrier's Log | Stephen Weaver",
  description:
    "A public-safe letter carrier field log: miles, hydration, recovery, phase progression, and field KPIs from city mail routes.",
  openGraph: {
    title: "Carrier's Log",
    description:
      "A public-safe letter carrier field log: miles, hydration, recovery, phase progression, and field KPIs from city mail routes.",
    type: "website",
    url: `${SITE_URL}/carrier-journal`,
    images: [{ url: absoluteImageUrl, width: 1200, height: 630, alt: "Carrier's Log" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Carrier's Log",
    description:
      "A public-safe letter carrier field log: miles, hydration, recovery, phase progression, and field KPIs from city mail routes.",
    images: [absoluteImageUrl],
  },
};

export default async function Page() {
  const [notionDispatches, notionUnlockedIds] = await Promise.all([
    fetchCarrierDispatches(),
    fetchAchievementUnlocks(),
  ]);
  return (
    <CarrierJournalPage
      dispatches={notionDispatches.length > 0 ? notionDispatches : undefined}
      notionUnlockedIds={notionUnlockedIds}
    />
  );
}
