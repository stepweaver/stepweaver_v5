import type { Metadata } from "next";
import { fetchCarrierDispatches } from "@/lib/notion/carrier-journal.repo";
import { CarrierJournalPage } from "@/components/carrier-journal/carrier-journal-page";
import { isFootwearDbConfigured } from "@/lib/db";
import { getActiveShoeSummary } from "@/lib/footwear/queries";

export const revalidate = 300; // 5 minutes, matches Notion cache TTL

const SITE_URL = process.env.SITE_URL || "https://stepweaver.dev";
const absoluteImageUrl = `${SITE_URL}/images/carrier_log.png`;

export const metadata: Metadata = {
  title: "Carrier's Log | Stephen Weaver",
  description:
    "A personal field log from life as a city letter carrier: miles, hydration, recovery, phase progression, and field KPIs from walking routes.",
  openGraph: {
    title: "Carrier's Log",
    description:
      "A personal field log from life as a city letter carrier: miles, hydration, recovery, phase progression, and field KPIs from walking routes.",
    type: "website",
    url: `${SITE_URL}/carrier-journal`,
    images: [{ url: absoluteImageUrl, width: 1200, height: 630, alt: "Carrier's Log" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Carrier's Log",
    description:
      "A personal field log from life as a city letter carrier: miles, hydration, recovery, phase progression, and field KPIs from walking routes.",
    images: [absoluteImageUrl],
  },
};

export default async function Page() {
  const notionDispatches = await fetchCarrierDispatches();
  const footwearActive = isFootwearDbConfigured()
    ? await getActiveShoeSummary({ publicOnly: true }).catch(() => null)
    : null;

  return (
    <CarrierJournalPage
      dispatches={notionDispatches.length > 0 ? notionDispatches : undefined}
      footwearActive={footwearActive}
    />
  );
}
