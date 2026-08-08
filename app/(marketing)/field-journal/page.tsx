import type { Metadata } from "next";
import { fetchCarrierDispatches } from "@/lib/notion/carrier-journal.repo";
import { CarrierJournalPage } from "@/components/carrier-journal/carrier-journal-page";
import { isFootwearDbConfigured } from "@/lib/db";
import { getActiveShoeSummary } from "@/lib/footwear/queries";

export const revalidate = 300;

const SITE_URL = process.env.SITE_URL || "https://stepweaver.dev";
const absoluteImageUrl = `${SITE_URL}/images/field_journal_og.png`;

export const metadata: Metadata = {
  title: "Field Journal | Stephen Weaver",
  description:
    "FIELD JOURNAL // THE LONG WALK: a personal human-machine field notebook with body telemetry, distance class, equipment roster, and field notes from high-mileage walking.",
  openGraph: {
    title: "Field Journal // The Long Walk",
    description:
      "The body is the system. The miles are the test environment. The journal is the telemetry.",
    type: "website",
    url: `${SITE_URL}/field-journal`,
    images: [{ url: absoluteImageUrl, width: 1200, height: 630, alt: "Field Journal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Field Journal // The Long Walk",
    description:
      "The body is the system. The miles are the test environment. The journal is the telemetry.",
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
