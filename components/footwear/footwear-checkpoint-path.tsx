import Link from "next/link";
import type { CheckpointProgressItem } from "@/lib/footwear/checkpoints";

const STATUS_LABEL: Record<CheckpointProgressItem["status"], string> = {
  completed: "COMPLETE",
  assessment_pending: "ASSESSMENT PENDING",
  mileage_reached: "MILEAGE REACHED",
  locked: "LOCKED",
  not_recorded: "NOT RECORDED",
  retrospective: "RETROSPECTIVE",
};

type Props = {
  items: CheckpointProgressItem[];
};

export function FootwearCheckpointPath({ items }: Props) {
  return (
    <ol className="space-y-2" aria-label="Checkpoint unlock path">
      {items.map((item) => {
        const locked = item.status === "locked" || item.status === "not_recorded";
        return (
          <li
            key={item.miles}
            className={`flex flex-wrap items-baseline justify-between gap-2 border px-3 py-2 ${
              item.status === "assessment_pending"
                ? "border-[rgb(var(--warn)/0.5)] bg-[rgb(var(--warn)/0.06)]"
                : locked
                  ? "border-[rgb(var(--neon)/0.12)] opacity-70"
                  : "border-[rgb(var(--neon)/0.25)]"
            }`}
          >
            <span
              className={`font-[var(--font-ocr)] text-[10px] tracking-widest ${
                locked
                  ? "text-[rgb(var(--text-meta))]"
                  : "text-[rgb(var(--text-color))]"
              }`}
            >
              {item.title.toUpperCase()}
              <span className="ml-2 text-[rgb(var(--text-meta))]">{item.miles} MI</span>
            </span>
            <span className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-meta))]">
              {STATUS_LABEL[item.status]}
              {item.status === "locked" && item.milesRemaining > 0
                ? ` // ${item.milesRemaining} MI`
                : ""}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

type RosterProps = {
  shoes: {
    slug: string;
    brand: string;
    model: string;
    nickname: string | null;
    status: string;
    isLegacyRecord: boolean;
    totalMiles: number;
    levelTitle: string;
    conditionLabel: string;
  }[];
};

export function FootwearRosterGrid({ shoes }: RosterProps) {
  if (!shoes.length) {
    return (
      <p className="text-sm text-[rgb(var(--text-meta))]">
        No public shoe profiles yet.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {shoes.map((shoe) => (
        <li key={shoe.slug}>
          <Link
            href={`/carrier-journal/footwear/${shoe.slug}`}
            className="block border border-[rgb(var(--neon)/0.25)] p-4 hover:border-[rgb(var(--neon)/0.55)] hover:bg-[rgb(var(--neon)/0.04)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--neon))] transition-colors"
          >
            <p className="font-[var(--font-ocr)] text-[9px] tracking-[0.25em] text-[rgb(var(--neon))] mb-2">
              {shoe.status === "active"
                ? "ACTIVE LOADOUT"
                : shoe.status === "retired" || shoe.status === "failed"
                  ? "RETIRED UNIT"
                  : shoe.status === "paused"
                    ? "PAUSED"
                    : "EQUIPMENT ROSTER"}
              {shoe.isLegacyRecord ? " // LEGACY RECORD" : ""}
            </p>
            <h3 className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))]">
              {shoe.brand} {shoe.model}
            </h3>
            {shoe.nickname && (
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                “{shoe.nickname}”
              </p>
            )}
            <p className="mt-3 font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-meta))]">
              {shoe.totalMiles} MI // {shoe.levelTitle.toUpperCase()} //{" "}
              {shoe.conditionLabel}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
