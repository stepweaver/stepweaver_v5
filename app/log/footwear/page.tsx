import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CarrierDaybookGate } from "@/components/carrier-journal/carrier-daybook-gate";
import { CarrierDaybookUnauthorized } from "@/components/carrier-journal/carrier-daybook-unauthorized";
import { CarrierPrivateNav } from "@/components/carrier-journal/carrier-private-nav";
import { FootwearLabPrivateClient } from "@/components/footwear/footwear-lab-private-client";
import { verifyCarrierLogSecret } from "@/lib/notion/carrier-journal.repo";
import { isFootwearDbConfigured } from "@/lib/db";
import {
  getActiveShoe,
  listShoeSummaries,
} from "@/lib/footwear/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Footwear Lab | Carrier Daybook",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ token?: string; roster?: string }>;
};

export default async function FootwearLabPrivatePage({ searchParams }: Props) {
  const { token, roster } = await searchParams;

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

  const showRoster = roster === "1" || roster === "true";

  if (isFootwearDbConfigured() && !showRoster) {
    const active = await getActiveShoe();
    if (active) {
      redirect(
        `/log/footwear/${active.slug}?token=${encodeURIComponent(token)}`
      );
    }
  }

  const shoes = isFootwearDbConfigured() ? await listShoeSummaries() : [];

  return (
    <main className="flex-1 pt-12 pb-16">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        <CarrierPrivateNav token={token} active="footwear" />
        {!isFootwearDbConfigured() ? (
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            Footwear Lab database is not configured. Set DATABASE_URL and
            redeploy.
          </p>
        ) : (
          <FootwearLabPrivateClient
            token={token}
            shoes={shoes.map((s) => ({
              id: s.shoe.id,
              slug: s.shoe.slug,
              brand: s.shoe.brand,
              model: s.shoe.model,
              nickname: s.shoe.nickname,
              status: s.shoe.status,
              isLegacyRecord: s.shoe.isLegacyRecord,
              public: s.shoe.public,
              mileage: s.mileage,
              level: s.level,
              conditionLabel: s.conditionLabel,
            }))}
          />
        )}
      </div>
    </main>
  );
}
