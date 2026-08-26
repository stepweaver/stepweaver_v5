import { formatFieldDateStamp } from "@/lib/data/carrier-journal-dates";
import type { PublicFieldRecord, PublicFieldRecords } from "@/lib/types/carrier-public-telemetry";

type Props = {
  records: PublicFieldRecords;
};

export function FieldRecordsPanel({ records }: Props) {
  return (
    <section id="field-records" className="scroll-mt-28 space-y-4">
      <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-xs tracking-widest">
        FIELD RECORDS // WALK-01
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
        {records.map((record) => (
          <RecordCell key={record.key} record={record} />
        ))}
      </div>
    </section>
  );
}

function RecordCell({ record }: { record: PublicFieldRecord }) {
  const stamp = record.date ? formatFieldDateStamp(record.date) : null;
  const value =
    record.value === "n/a"
      ? "n/a"
      : record.unit
        ? `${record.value} ${record.unit}`
        : record.value;

  const body = (
    <>
      <div className="font-[var(--font-ocr)] text-[9px] tracking-[0.18em] text-[rgb(var(--neon))]">
        {record.label}
      </div>
      <div className="font-[var(--font-ibm)] text-xl sm:text-2xl text-[rgb(var(--text-color))] leading-tight mt-1 tabular-nums">
        {value}
      </div>
      {stamp ? (
        <time
          dateTime={record.date ?? undefined}
          className="block font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--text-meta))] mt-2"
        >
          {stamp}
        </time>
      ) : (
        <div className="font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--text-meta))] mt-2">
          —
        </div>
      )}
    </>
  );

  if (record.dispatchId) {
    return (
      <a
        href={`#${record.dispatchId}`}
        className="bg-[rgb(var(--panel))] p-4 block hover:bg-[rgb(var(--neon)/0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[rgb(var(--neon))]"
      >
        {body}
      </a>
    );
  }

  return <div className="bg-[rgb(var(--panel))] p-4">{body}</div>;
}
