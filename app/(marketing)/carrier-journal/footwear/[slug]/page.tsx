import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isFootwearDbConfigured } from "@/lib/db";
import {
  getShoeSummaryBySlug,
  getObservationsForShoe,
  getMediaForShoe,
  listShoes,
} from "@/lib/footwear/queries";
import { FootwearShoeProfile } from "@/components/footwear/footwear-shoe-profile";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  if (!isFootwearDbConfigured()) return [];
  try {
    const shoes = await listShoes({ publicOnly: true });
    return shoes.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isFootwearDbConfigured()) {
    return { title: "Shoe Profile | Footwear Lab" };
  }
  const summary = await getShoeSummaryBySlug(slug, { publicOnly: true });
  if (!summary) return { title: "Shoe not found" };
  const title = `${summary.shoe.brand} ${summary.shoe.model}${
    summary.shoe.nickname ? ` “${summary.shoe.nickname}”` : ""
  } | Footwear Lab`;
  return {
    title,
    description: `Field profile for ${summary.shoe.brand} ${summary.shoe.model}: ${summary.mileage.totalMiles} mi, ${summary.level.title}.`,
  };
}

export default async function FootwearShoePage({ params }: Props) {
  const { slug } = await params;
  if (!isFootwearDbConfigured()) notFound();

  const summary = await getShoeSummaryBySlug(slug, { publicOnly: true });
  if (!summary) notFound();

  const [observations, media] = await Promise.all([
    getObservationsForShoe(summary.shoe.id, { publicOnly: true }),
    getMediaForShoe(summary.shoe.id, { publicOnly: true }),
  ]);

  return (
    <main className="flex-1 pt-12 pb-16">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        <FootwearShoeProfile
          summary={summary}
          observations={observations}
          media={media}
        />
      </div>
    </main>
  );
}
