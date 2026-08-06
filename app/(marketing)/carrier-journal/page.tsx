import type { Metadata } from "next";
import { fetchCarrierDispatches } from "@/lib/notion/carrier-journal.repo";
import { CarrierJournalPage } from "@/components/carrier-journal/carrier-journal-page";
import { isFootwearDbConfigured } from "@/lib/db";
import { getActiveShoeSummary } from "@/lib/footwear/queries";

export const revalidate = 300;

const SITE_URL = process.env.SITE_URL || "https://stepweaver.dev";
const absoluteImageUrl = `${SITE_URL}/images/carrier_log.png`;

export const metadata: Metadata = {
  title: "Field Journal | Stephen Weaver",
  description:
    "A personal walking and fitness journal: miles, hydration, weather, recovery, and adaptation to long walking days.",
  openGraph: {
    title: "Field Journal",
    description:
      "A personal walking and fitness journal: miles, hydration, weather, recovery, and adaptation to long walking days.",
    type: "website",
    url: `${SITE_URL}/carrier-journal`,
    images: [{ url: absoluteImageUrl, width: 1200, height: 630, alt: "Field Journal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Field Journal",
    description:
      "A personal walking and fitness journal: miles, hydration, weather, recovery, and adaptation to long walking days.",
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
      dispatches={notionDispatches}
      footwearActive={footwearActive}
    />
  );
}
