import type { Metadata } from "next";
import { fetchCarrierDispatches } from "@/lib/notion/carrier-journal.repo";
import { CarrierJournalPage } from "@/components/carrier-journal/carrier-journal-page";

export const revalidate = 300; // 5 minutes, matches Notion cache TTL

export const metadata: Metadata = {
  title: "Carrier Journal | Stephen Weaver",
  description:
    "A public-safe transformation journal from adapting to city mail delivery: miles, hydration, recovery, and field KPIs.",
};

export default async function Page() {
  const notionDispatches = await fetchCarrierDispatches();
  return (
    <CarrierJournalPage
      dispatches={notionDispatches.length > 0 ? notionDispatches : undefined}
    />
  );
}
