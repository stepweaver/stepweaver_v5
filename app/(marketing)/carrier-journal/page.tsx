import type { Metadata } from "next";
import { fetchCarrierDispatches } from "@/lib/notion/carrier-journal.repo";
import { CarrierJournalPage } from "@/components/carrier-journal/carrier-journal-page";

export const revalidate = 300; // 5 minutes — matches Notion cache TTL

export const metadata: Metadata = {
  title: "Carrier Journal | Stephen Weaver",
  description:
    "A public-safe field journal and KPI dashboard from life as a city mail carrier.",
};

export default async function Page() {
  const notionDispatches = await fetchCarrierDispatches();
  return (
    <CarrierJournalPage
      dispatches={notionDispatches.length > 0 ? notionDispatches : undefined}
    />
  );
}
