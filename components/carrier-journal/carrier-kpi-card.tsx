import type { CarrierKpi } from "@/lib/data/carrier-journal";

type Props = {
  kpi: CarrierKpi;
  index: number;
};

export function CarrierKpiCard({ kpi, index }: Props) {
  return (
    <div className="bg-[rgb(var(--panel))] p-5 flex flex-col gap-1 border border-[rgb(var(--border)/0.15)]">
      <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-1">
        KPI.{String(index + 1).padStart(2, "0")}
      </div>
      <div className="font-[var(--font-ibm)] text-2xl text-[rgb(var(--neon))] leading-none">
        {kpi.value}
      </div>
      <div className="text-[rgb(var(--text-color))] text-sm mt-1">{kpi.label}</div>
      {kpi.detail && (
        <div className="text-[rgb(var(--text-meta))] text-xs">{kpi.detail}</div>
      )}
    </div>
  );
}
