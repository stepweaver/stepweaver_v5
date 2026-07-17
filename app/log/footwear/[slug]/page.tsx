import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CarrierDaybookGate } from "@/components/carrier-journal/carrier-daybook-gate";
import { CarrierDaybookUnauthorized } from "@/components/carrier-journal/carrier-daybook-unauthorized";
import { CarrierPrivateNav } from "@/components/carrier-journal/carrier-private-nav";
import { FootwearShoeManageClient } from "@/components/footwear/footwear-shoe-manage-client";
import { verifyCarrierLogSecret } from "@/lib/notion/carrier-journal.repo";
import { isFootwearDbConfigured } from "@/lib/db";
import { getShoeSummaryBySlug } from "@/lib/footwear/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Shoe | Footwear Lab",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ManageShoePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="flex-1">
        <CarrierDaybookGate />
      </main>
    );
  }

  if (!verifyCarrierLogSecret(token)) {
    return (
      <main className="flex-1">
        <CarrierDaybookUnauthorized />
      </main>
    );
  }

  if (!isFootwearDbConfigured()) {
    return (
      <main className="flex-1 pt-12 px-4">
        <p>DATABASE_URL is not configured.</p>
      </main>
    );
  }

  const summary = await getShoeSummaryBySlug(slug);
  if (!summary) notFound();

  const pending = summary.checkpointProgress.filter(
    (c) => c.status === "assessment_pending"
  );

  return (
    <main className="flex-1 pt-12 pb-16">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        <CarrierPrivateNav token={token} active="footwear" />
        <p className="mb-4">
          <Link
            href={`/log/footwear?token=${encodeURIComponent(token)}`}
            className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))] hover:underline"
          >
            ← Equipment roster
          </Link>
        </p>
        <FootwearShoeManageClient
          token={token}
          shoe={{
            id: summary.shoe.id,
            slug: summary.shoe.slug,
            brand: summary.shoe.brand,
            model: summary.shoe.model,
            nickname: summary.shoe.nickname,
            status: summary.shoe.status,
            isLegacyRecord: summary.shoe.isLegacyRecord,
          }}
          totalMiles={summary.mileage.totalMiles}
          pendingCheckpoints={pending.map((p) => ({
            miles: p.miles,
            title: p.title,
          }))}
        />
      </div>
    </main>
  );
}
