import type { Metadata } from "next";
import { fetchCarrierDispatches } from "@/lib/notion/carrier-journal.repo";
import { CarrierJournalPage } from "@/components/carrier-journal/carrier-journal-page";
import { isFootwearDbConfigured } from "@/lib/db";
import { getActiveShoeSummary } from "@/lib/footwear/queries";
import {
  computeTotalsFromDispatches,
  toPublicFieldDispatches,
  totalsToKpis,
} from "@/lib/data/carrier-journal";
import { computePublicAdaptationTelemetry } from "@/lib/data/carrier-adaptation";
import { computePublicDerivedTelemetry } from "@/lib/data/carrier-derived-telemetry.server";
import { computePublicFieldRecords } from "@/lib/data/carrier-field-records";
import { toPublicMassDeltaSeries } from "@/lib/data/carrier-mass-delta.server";

export const revalidate = 300;

const SITE_URL = process.env.SITE_URL || "https://stepweaver.dev";
const absoluteImageUrl = `${SITE_URL}/images/field_journal_og.png`;

export const metadata: Metadata = {
  title: "Field Journal | Stephen Weaver",
  description:
    "FIELD JOURNAL // THE LONG WALK: a human performance log — body telemetry, distance qualification, equipment roster, and field notes from high-mileage walking.",
  openGraph: {
    title: "Field Journal // The Long Walk",
    description:
      "Miles, environmental load, hydration, recovery, body mechanics, equipment wear — human performance under field conditions.",
    type: "website",
    url: `${SITE_URL}/field-journal`,
    images: [{ url: absoluteImageUrl, width: 1200, height: 630, alt: "Field Journal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Field Journal // The Long Walk",
    description:
      "Miles, environmental load, hydration, recovery, body mechanics, equipment wear — human performance under field conditions.",
    images: [absoluteImageUrl],
  },
};

export default async function Page() {
  const serverDispatches = await fetchCarrierDispatches();
  const footwearActive = isFootwearDbConfigured()
    ? await getActiveShoeSummary({ publicOnly: true }).catch(() => null)
    : null;

  const totals = computeTotalsFromDispatches(serverDispatches);
  const kpis = totalsToKpis(totals);
  const dispatches = toPublicFieldDispatches(serverDispatches);
  const massDelta = toPublicMassDeltaSeries(serverDispatches);
  const derived = computePublicDerivedTelemetry(serverDispatches, massDelta);
  const adaptation = computePublicAdaptationTelemetry(dispatches);
  const records = computePublicFieldRecords(dispatches);

  return (
    <CarrierJournalPage
      kpis={kpis}
      dispatches={dispatches}
      massDelta={massDelta}
      derived={derived}
      adaptation={adaptation}
      records={records}
      footwearActive={footwearActive}
    />
  );
}
