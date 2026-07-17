import type { Metadata } from "next";
import { CarrierDaybookGate } from "@/components/carrier-journal/carrier-daybook-gate";
import { CarrierDaybookUnauthorized } from "@/components/carrier-journal/carrier-daybook-unauthorized";
import { CarrierDaybookForm } from "@/components/carrier-journal/carrier-daybook-form";
import { CarrierPrivateNav } from "@/components/carrier-journal/carrier-private-nav";
import {
  verifyCarrierLogSecret,
  fetchLatestWeightLbs,
} from "@/lib/notion/carrier-journal.repo";
import { isFootwearDbConfigured } from "@/lib/db";
import { getActiveShoe, listShoes } from "@/lib/footwear/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Carrier Daybook",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function CarrierDaybookPage({ searchParams }: Props) {
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

  const latestWeightLbs = await fetchLatestWeightLbs();
  const footwearEnabled = isFootwearDbConfigured();
  const [activeShoe, allShoes] = footwearEnabled
    ? await Promise.all([getActiveShoe(), listShoes()])
    : [null, []];

  return (
    <main className="flex-1 pt-12 pb-16">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
        <CarrierPrivateNav token={token} active="daybook" />
        <CarrierDaybookForm
          token={token}
          latestWeightLbs={latestWeightLbs}
          footwearOptions={allShoes
            .filter((s) => s.status !== "retired" && s.status !== "failed")
            .map((s) => ({
              id: s.id,
              label: `${s.brand} ${s.model}${s.nickname ? ` (“${s.nickname}”)` : ""}`,
              status: s.status,
            }))}
          defaultFootwearShoeId={activeShoe?.id ?? null}
        />
      </div>
    </main>
  );
}
