import Link from "next/link";
import { CarrierDailyLogForm } from "@/components/carrier-journal/carrier-daily-log-form";
import { getCarrierJournalLogStatus } from "@/lib/notion/carrier-journal.repo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Carrier Log | Stephen Weaver",
  robots: { index: false, follow: false },
};

export default function CarrierLogPage() {
  const logStatus = getCarrierJournalLogStatus();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
            CARRIER&apos;S LOG // PRIVATE ENTRY
          </div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))] mb-3">
            Daily Log
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm max-w-xl leading-relaxed">
            Fast mobile logging for mail volume. Enter DPS count and optional context tags. DPS
            ratio is calculated from your recent baseline.
          </p>
        </div>

        <CarrierDailyLogForm logStatus={logStatus} />

        <div className="text-center">
          <Link href="/carrier-journal" className="text-xs text-[rgb(var(--text-meta))] hover:text-[rgb(var(--neon))]">
            Back to public Carrier&apos;s Log
          </Link>
        </div>
      </div>
    </div>
  );
}
