import type { ReactNode } from "react";
import { CARRIER_KPI_EMPTY } from "@/lib/data/carrier-journal";
import { weeklyWalkingComparison } from "@/lib/data/carrier-dashboard";
import { formatFieldDateStamp } from "@/lib/data/carrier-journal-dates";
import type { PublicDashboardTelemetry } from "@/lib/types/carrier-public-telemetry";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

type Props = {
  dashboard: PublicDashboardTelemetry;
  afterWorkload?: ReactNode;
};

function monthLabel(monthKey: string | null): string {
  if (!monthKey) return "";
  const month = Number(monthKey.slice(5, 7));
  const name = MONTHS[month - 1];
  if (!name) return monthKey;
  return `${name} ${monthKey.slice(0, 4)}`;
}

function miles(value: number | null, suffix = " mi"): string {
  if (value === null) return CARRIER_KPI_EMPTY;
  return `${value.toFixed(1)}${suffix}`;
}

function score(value: number | null): string {
  if (value === null) return CARRIER_KPI_EMPTY;
  return `${value.toFixed(1)} / 10`;
}

function ounces(value: number | null): string {
  if (value === null) return CARRIER_KPI_EMPTY;
  return `${value.toFixed(1)} oz`;
}

function ReadoutStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="bg-[rgb(var(--panel))] p-4 sm:p-5 flex flex-col gap-1">
      <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--neon))]">
        {label}
      </div>
      <div className="font-[var(--font-ibm)] text-xl sm:text-2xl text-[rgb(var(--text-color))] leading-none tabular-nums">
        {value}
      </div>
      {detail ? (
        <div className="text-[rgb(var(--text-meta))] text-[10px] font-[var(--font-ocr)] tracking-wide mt-1">
          {detail}
        </div>
      ) : null}
    </div>
  );
}

export function DashboardReadout({ dashboard, afterWorkload }: Props) {
  const { workload, recovery, environment, hydration } = dashboard;
  const comparison = weeklyWalkingComparison(workload.vsRecentAvgPct);
  const month = monthLabel(environment.monthKey);
  const hottest = environment.hottestRecent;

  return (
    <>
      <section id="workload" className="scroll-mt-28 space-y-4">
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
          WORKLOAD
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          <ReadoutStat
            label="TOTAL MILES"
            value={miles(workload.totalMiles)}
            detail="Lifetime odometer"
          />
          <ReadoutStat
            label="LAST 7 DAYS"
            value={miles(workload.milesLast7Days)}
            detail="Rolling 7 days ending on the latest logged date"
          />
          <ReadoutStat
            label="4-WEEK AVERAGE"
            value={
              workload.fourWeekAvgMilesPerWeek === null
                ? CARRIER_KPI_EMPTY
                : `${workload.fourWeekAvgMilesPerWeek.toFixed(1)} mi/week`
            }
            detail="Recent weekly average"
          />
        </div>
        {comparison ? (
          <p className="font-[var(--font-ocr)] text-[11px] sm:text-xs tracking-[0.14em] text-[rgb(var(--text-color))]">
            Latest 7 logged days: {miles(workload.milesLast7Days)} ·{" "}
            {workload.fourWeekAvgMilesPerWeek === null
              ? CARRIER_KPI_EMPTY
              : `${workload.fourWeekAvgMilesPerWeek.toFixed(1)} mi/week 4-week average`}
            {" · "}
            <span className="text-[rgb(var(--neon))]">{comparison}</span>
          </p>
        ) : null}
      </section>

      {afterWorkload}

      <section id="recovery" className="scroll-mt-28 space-y-4">
        <div>
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
            RECOVERY
          </div>
          <p className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--text-meta))] mt-1">
            AVERAGE SORENESS AND ENERGY · NOT LIFETIME MEANS
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          <ReadoutStat label="SORENESS · 7 DAY" value={score(recovery.soreness7d)} />
          <ReadoutStat label="ENERGY · 7 DAY" value={score(recovery.energy7d)} />
          <ReadoutStat label="SORENESS · 30 DAY" value={score(recovery.soreness30d)} />
          <ReadoutStat label="ENERGY · 30 DAY" value={score(recovery.energy30d)} />
        </div>
      </section>

      <section id="environment" className="scroll-mt-28 space-y-4">
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
          ENVIRONMENT
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          <ReadoutStat
            label="90°F+ DAYS"
            value={String(environment.heatDaysThisMonth)}
            detail={month ? `Heat-index days in ${month}` : "Heat-index days this month"}
          />
          <ReadoutStat
            label="HOTTEST RECENT WORKDAY"
            value={hottest ? `${hottest.heatF}°F` : CARRIER_KPI_EMPTY}
            detail={hottest ? formatFieldDateStamp(hottest.date) : "Last 30 days"}
          />
        </div>
      </section>

      <section id="hydration" className="scroll-mt-28 space-y-4">
        <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
          HYDRATION
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          <ReadoutStat
            label="WORKDAY AVERAGE"
            value={ounces(hydration.avgWorkdayOz)}
            detail="Recorded water on walking days"
          />
          <ReadoutStat
            label="LAST 30 DAYS"
            value={ounces(hydration.avgLast30dOz)}
            detail="Recent workday average"
          />
        </div>
      </section>
    </>
  );
}
