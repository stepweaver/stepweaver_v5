import type { Metadata } from "next";
import { fetchCarrierDispatches } from "@/lib/notion/carrier-journal.repo";
import { ExperimentalMetricsPage } from "@/components/carrier-journal/experimental-metrics-page";
import { toPublicFieldDispatches } from "@/lib/data/carrier-journal";
import { computePublicAdaptationTelemetry } from "@/lib/data/carrier-adaptation";
import { computePublicDerivedTelemetry } from "@/lib/data/carrier-derived-telemetry.server";
import { toPublicMassDeltaSeries } from "@/lib/data/carrier-mass-delta.server";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Experimental Metrics | Field Journal",
  description:
    "LAB // EXPERIMENTAL METRICS: derived walking telemetry kept off the main Field Journal.",
  robots: { index: false, follow: true },
};

export default async function Page() {
  const serverDispatches = await fetchCarrierDispatches();
  const dispatches = toPublicFieldDispatches(serverDispatches);
  const massDelta = toPublicMassDeltaSeries(serverDispatches);
  const derived = computePublicDerivedTelemetry(serverDispatches, massDelta);
  const adaptation = computePublicAdaptationTelemetry(dispatches);

  return <ExperimentalMetricsPage derived={derived} adaptation={adaptation} />;
}
