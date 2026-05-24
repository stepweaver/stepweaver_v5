import type { Metadata } from "next";
import { fetchCarrierDispatches } from "@/lib/notion/carrier-journal.repo";
import { CarrierJournalPage } from "@/components/carrier-journal/carrier-journal-page";

export const revalidate = 300; // 5 minutes, matches Notion cache TTL

export const metadata: Metadata = {
  title: "Carrier's Log | Stephen Weaver",
  description:
    "A public-safe letter carrier field log: miles, hydration, recovery, phase progression, and field KPIs from city mail routes.",
};

export default async function Page() {
  const notionDispatches = await fetchCarrierDispatches();
  return (
    <CarrierJournalPage
      dispatches={notionDispatches.length > 0 ? notionDispatches : undefined}
    />
  );
}
