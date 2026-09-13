import Link from "next/link";
import { AdaptationTelemetryPanel } from "./adaptation-telemetry-panel";
import { ConditioningDeltaPanel } from "./conditioning-delta-panel";
import { DerivedTelemetryPanel } from "./derived-telemetry-panel";
import {
  EMPTY_ADAPTATION_TELEMETRY,
  EMPTY_DERIVED_TELEMETRY,
  type PublicAdaptationTelemetry,
  type PublicDerivedTelemetry,
} from "@/lib/types/carrier-public-telemetry";

type Props = {
  derived?: PublicDerivedTelemetry;
  adaptation?: PublicAdaptationTelemetry;
};

export function ExperimentalMetricsPage({
  derived = EMPTY_DERIVED_TELEMETRY,
  adaptation = EMPTY_ADAPTATION_TELEMETRY,
}: Props) {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div>
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
            FIELD JOURNAL // LAB
          </div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-5xl text-[rgb(var(--text-color))] mb-3">
            Experimental Metrics
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm sm:text-base max-w-3xl leading-relaxed">
            Machine-telemetry experiments from the same walking log. Interesting as λstepweaver
            calculations. Not clinical measurements, and not on the main journal.
          </p>
          <Link
            href="/field-journal"
            className="inline-flex mt-6 border border-[rgb(var(--neon)/0.4)] px-4 py-2 font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.1)]"
          >
            BACK TO FIELD JOURNAL
          </Link>
        </div>

        <section id="adaptation" className="scroll-mt-28 space-y-10">
          <ConditioningDeltaPanel data={adaptation.conditioning} />
          <AdaptationTelemetryPanel adaptation={adaptation} />
        </section>

        <DerivedTelemetryPanel derived={derived} />
      </div>
    </div>
  );
}
