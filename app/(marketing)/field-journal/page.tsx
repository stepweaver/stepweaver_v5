import type { Metadata } from "next";
import { fetchCarrierDispatches } from "@/lib/notion/carrier-journal.repo";
import { CarrierJournalPage } from "@/components/carrier-journal/carrier-journal-page";
import { isFootwearDbConfigured } from "@/lib/db";
import { getActiveShoeSummary } from "@/lib/footwear/queries";
import { toPublicFieldDispatches } from "@/lib/data/carrier-journal";
import { computePublicDashboard } from "@/lib/data/carrier-dashboard";
import { computePublicFieldRecords } from "@/lib/data/carrier-field-records";
import { toPublicMassDeltaSeries } from "@/lib/data/carrier-mass-delta.server";

export const revalidate = 300;

const SITE_URL = process.env.SITE_URL || "https://stepweaver.dev";
const absoluteImageUrl = `${SITE_URL}/images/field_journal_og.png`;

export const metadata: Metadata = {
  title: "Field Journal | Stephen Weaver",
  description:
    "FIELD JOURNAL // THE LONG WALK: a human performance log — walking volume, body mass, recovery, heat, and hydration.",
  openGraph: {
    title: "Field Journal // The Long Walk",
    description:
      "Miles, body mass, recovery, heat, and hydration — human performance under field conditions.",
    type: "website",
    url: `${SITE_URL}/field-journal`,
    images: [{ url: absoluteImageUrl, width: 1200, height: 630, alt: "Field Journal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Field Journal // The Long Walk",
    description:
      "Miles, body mass, recovery, heat, and hydration — human performance under field conditions.",
    images: [absoluteImageUrl],
  },
};

export default async function Page() {
  const serverDispatches = await fetchCarrierDispatches();
  const footwearActive = isFootwearDbConfigured()
    ? await getActiveShoeSummary({ publicOnly: true }).catch(() => null)
    : null;

  const dispatches = toPublicFieldDispatches(serverDispatches);
  const massDelta = toPublicMassDeltaSeries(serverDispatches);
  const dashboard = computePublicDashboard(dispatches);
  const records = computePublicFieldRecords(dispatches);

  return (
    <CarrierJournalPage
      dispatches={dispatches}
      massDelta={massDelta}
      dashboard={dashboard}
      records={records}
      footwearActive={footwearActive}
    />
  );
}
