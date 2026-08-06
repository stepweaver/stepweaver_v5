import type { Metadata } from "next";
import { isFootwearDbConfigured } from "@/lib/db";
import {
  getActiveShoeSummary,
  listShoeSummaries,
  getObservationsForShoe,
} from "@/lib/footwear/queries";
import { toMilesNumber } from "@/lib/footwear/mileage";
import { FootwearLabIndex } from "@/components/footwear/footwear-lab-index";

export const revalidate = 300;

const SITE_URL = process.env.SITE_URL || "https://stepweaver.dev";

export const metadata: Metadata = {
  title: "Shoe Ledger | Field Journal",
  description:
    "Independent personal footwear journal: brands, mileage, ratings, and honest conclusions for shoes on high-mileage walking days.",
  openGraph: {
    title: "Shoe Ledger",
    description:
      "Independent personal footwear journal: brands, mileage, ratings, and honest conclusions.",
    url: `${SITE_URL}/field-journal/footwear`,
    type: "website",
  },
};

export default async function FootwearLabPage() {
  if (!isFootwearDbConfigured()) {
    return (
      <main className="flex-1 pt-12 pb-16">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
          <FootwearLabIndex active={null} roster={[]} recentNotes={[]} />
        </div>
      </main>
    );
  }

  const [active, roster] = await Promise.all([
    getActiveShoeSummary({ publicOnly: true }),
    listShoeSummaries({ publicOnly: true }),
  ]);

  const recentNotes: {
    shoeSlug: string;
    shoeLabel: string;
    date: string;
    title: string | null;
    notes: string;
    entryType: string;
    mileage: number;
  }[] = [];

  for (const s of roster.slice(0, 6)) {
    const obs = await getObservationsForShoe(s.shoe.id, { publicOnly: true });
    for (const o of obs.slice(0, 2)) {
      if (o.entryType === "checkpoint") continue;
      recentNotes.push({
        shoeSlug: s.shoe.slug,
        shoeLabel: `${s.shoe.brand} ${s.shoe.model}`,
        date: o.date,
        title: o.title,
        notes: o.notes,
        entryType: o.entryType,
        mileage: toMilesNumber(o.shoeMileageAtEntry),
      });
    }
  }

  recentNotes.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="flex-1 pt-12 pb-16">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        <FootwearLabIndex
          active={active}
          roster={roster}
          recentNotes={recentNotes.slice(0, 5)}
        />
      </div>
    </main>
  );
}
