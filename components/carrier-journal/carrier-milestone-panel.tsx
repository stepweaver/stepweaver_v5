"use client";

import type { PublicFieldDispatch } from "@/lib/data/carrier-journal";
import {
  getCarrierLevel,
  getCarrierRankLadder,
  type CarrierRank,
} from "@/lib/data/carrier-milestones";

function ProgressBar({ value }: { value: number }) {
  return (
    <div
      className="relative h-2 w-full bg-[rgb(var(--border)/0.25)] overflow-hidden"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="absolute inset-y-0 left-0 bg-[rgb(var(--neon))] transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function RankLadderHeader() {
  return (
    <div className="hidden sm:grid sm:grid-cols-[2.5rem_1fr_5rem_6rem] sm:gap-x-3 items-baseline py-1.5 border-b border-[rgb(var(--border)/0.15)]">
      <div className="font-[var(--font-ocr)] text-[8px] tracking-widest text-[rgb(var(--text-meta))]">
        LVL
      </div>
      <div className="font-[var(--font-ocr)] text-[8px] tracking-widest text-[rgb(var(--text-meta))]">
        QUALIFICATION
      </div>
      <div className="font-[var(--font-ocr)] text-[8px] tracking-widest text-[rgb(var(--text-meta))] text-right">
        AT
      </div>
      <div className="font-[var(--font-ocr)] text-[8px] tracking-widest text-[rgb(var(--text-meta))] text-right">
        TO GO
      </div>
    </div>
  );
}

function RankToGo({ rank }: { rank: CarrierRank }) {
  if (rank.status === "reached") {
    return <span className="text-[rgb(var(--neon))]">CLEAR</span>;
  }
  if (rank.status === "current") {
    return <span className="text-[rgb(var(--text-label))]">--</span>;
  }
  return (
    <span className="text-[rgb(var(--text-meta))]">
      {rank.milesRemaining.toLocaleString()} mi
    </span>
  );
}

function RankLadderRow({ rank }: { rank: CarrierRank }) {
  const isCurrent = rank.status === "current";
  const levelLabel = String(rank.level).padStart(2, "0");
  const rowStyle = {
    opacity: rank.status === "locked" ? 0.55 : 1,
    background: isCurrent ? "rgba(var(--neon), 0.06)" : undefined,
  };

  return (
    <>
      <div
        className="sm:hidden py-2.5 border-b border-[rgb(var(--border)/0.1)] last:border-b-0"
        style={rowStyle}
      >
        <div className="flex items-start gap-2.5">
          <div
            className="font-[var(--font-ocr)] text-[9px] tracking-widest tabular-nums pt-0.5 shrink-0"
            style={{ color: isCurrent ? "rgb(var(--neon))" : "rgb(var(--text-meta))" }}
          >
            {levelLabel}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <div
                className="font-[var(--font-ibm)] text-xs leading-snug"
                style={{ color: isCurrent ? "rgb(var(--neon))" : "rgb(var(--text-color))" }}
              >
                {rank.title}
              </div>
              {isCurrent && (
                <span className="font-[var(--font-ocr)] text-[8px] tracking-widest text-[rgb(var(--neon))] shrink-0">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 font-[var(--font-ocr)] text-[9px] tracking-wide tabular-nums">
              <span className="text-[rgb(var(--text-meta))]">
                At {rank.miles.toLocaleString()} mi
              </span>
              <RankToGo rank={rank} />
            </div>
          </div>
        </div>
      </div>

      <div
        className="hidden sm:grid sm:grid-cols-[2.5rem_1fr_5rem_6rem] sm:gap-x-3 items-baseline py-1.5 border-b border-[rgb(var(--border)/0.1)] last:border-b-0"
        style={rowStyle}
      >
        <div
          className="font-[var(--font-ocr)] text-[9px] tracking-widest tabular-nums"
          style={{ color: isCurrent ? "rgb(var(--neon))" : "rgb(var(--text-meta))" }}
        >
          {levelLabel}
        </div>
        <div
          className="font-[var(--font-ibm)] text-xs"
          style={{ color: isCurrent ? "rgb(var(--neon))" : "rgb(var(--text-color))" }}
        >
          {rank.title}
          {isCurrent && (
            <span className="ml-1.5 font-[var(--font-ocr)] text-[8px] tracking-widest text-[rgb(var(--neon))]">
              ACTIVE
            </span>
          )}
        </div>
        <div className="font-[var(--font-ocr)] text-[9px] tracking-wide text-[rgb(var(--text-meta))] text-right tabular-nums">
          {rank.miles.toLocaleString()} mi
        </div>
        <div className="font-[var(--font-ocr)] text-[9px] tracking-wide text-right tabular-nums">
          <RankToGo rank={rank} />
        </div>
      </div>
    </>
  );
}

type Props = {
  dispatches: PublicFieldDispatch[];
};

export function CarrierMilestonePanel({ dispatches }: Props) {
  const level = getCarrierLevel(dispatches);
  const rankLadder = getCarrierRankLadder(level.totalMiles);

  const milesUntilNext =
    level.nextMiles != null
      ? Math.max(0, Math.round((level.nextMiles - level.totalMiles) * 10) / 10)
      : null;

  return (
    <div className="surface-panel p-5 sm:p-6 space-y-5">
      <div>
        <div className="font-[var(--font-ocr)] text-[10px] tracking-[0.3em] text-[rgb(var(--neon))] mb-1">
          DISTANCE QUALIFICATION // LEVEL {String(level.level).padStart(2, "0")}
        </div>
        <div className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))]">
          {level.title}
        </div>
        <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.25em] text-[rgb(var(--text-meta))] mt-1">
          {level.totalMiles} MI RECORDED
        </div>
      </div>

      <div className="space-y-2">
        <ProgressBar value={level.progressToNext} />
        {level.nextTitle && milesUntilNext != null && level.nextMiles != null ? (
          <div className="space-y-1 pt-1">
            <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.25em] text-[rgb(var(--text-label))]">
              NEXT QUALIFICATION
            </div>
            <div className="font-[var(--font-ocr)] text-[11px] tracking-widest text-[rgb(var(--text-color))]">
              {level.nextTitle} // {level.nextMiles.toLocaleString()} MI
            </div>
            <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-meta))]">
              {milesUntilNext} MI REMAINING
            </div>
          </div>
        ) : (
          <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--neon))] pt-1">
            MAX QUALIFICATION REACHED
          </div>
        )}
      </div>

      <div>
        <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.25em] text-[rgb(var(--text-label))] mb-2">
          SERVICE RECORD // {level.totalLevels} QUALIFICATIONS
        </div>
        <div className="border border-[rgb(var(--border)/0.2)] px-2 sm:px-3 py-0.5">
          <RankLadderHeader />
          {rankLadder.map((rank) => (
            <RankLadderRow key={rank.level} rank={rank} />
          ))}
        </div>
      </div>
    </div>
  );
}
