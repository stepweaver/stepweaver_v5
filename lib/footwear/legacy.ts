/** Legacy / retrospective labeling helpers for Footwear Lab timelines. */

export type TimelineLabel = "NOT_RECORDED" | "RETROSPECTIVE" | "DOCUMENTED";

export type TimelineEntry = {
  miles: number;
  label: TimelineLabel;
  title?: string;
};

export const LEGACY_PUBLIC_DISCLAIMER =
  "The first pair inspired the Footwear Lab. Its mileage was already being captured through Carrier's Log, but standardized footwear checkpoints had not yet begun. The final portion of its lifecycle is documented prospectively. Earlier observations are retrospective and labeled accordingly.";

export function labelCheckpointForTimeline(input: {
  isLegacyRecord: boolean;
  checkpointMiles: number;
  hasObservation: boolean;
  observationRetrospective: boolean;
  firstDocumentedCheckpointMiles: number | null;
}): TimelineLabel {
  if (input.hasObservation) {
    return input.observationRetrospective ? "RETROSPECTIVE" : "DOCUMENTED";
  }

  if (
    input.isLegacyRecord &&
    input.firstDocumentedCheckpointMiles != null &&
    input.checkpointMiles < input.firstDocumentedCheckpointMiles
  ) {
    return "NOT_RECORDED";
  }

  return "NOT_RECORDED";
}

export function buildLegacyTimeline(input: {
  isLegacyRecord: boolean;
  thresholds: { miles: number; title: string }[];
  observations: {
    checkpointMiles: number;
    retrospective: boolean;
  }[];
}): TimelineEntry[] {
  const obsByMiles = new Map(
    input.observations.map((o) => [o.checkpointMiles, o])
  );
  const documented = input.observations
    .filter((o) => !o.retrospective)
    .map((o) => o.checkpointMiles);
  const firstDocumented =
    documented.length > 0 ? Math.min(...documented) : null;

  return input.thresholds.map((t) => {
    const obs = obsByMiles.get(t.miles);
    return {
      miles: t.miles,
      title: t.title,
      label: labelCheckpointForTimeline({
        isLegacyRecord: input.isLegacyRecord,
        checkpointMiles: t.miles,
        hasObservation: !!obs,
        observationRetrospective: !!obs?.retrospective,
        firstDocumentedCheckpointMiles: firstDocumented,
      }),
    };
  });
}
