import type { CarrierDispatch, CarrierPhase, MailLoad } from "@/lib/data/carrier-journal";
import { splitPublicNoteParagraphs } from "@/lib/data/carrier-note-formatting";

const MAIL_LOAD_LABEL: Record<MailLoad, string> = {
  light: "LIGHT",
  normal: "NORMAL",
  heavy: "HEAVY",
  brutal: "BRUTAL",
};

const MAIL_LOAD_COLOR: Record<MailLoad, string> = {
  light: "rgb(var(--green))",
  normal: "rgb(var(--text-secondary))",
  heavy: "rgb(var(--warn))",
  brutal: "rgb(var(--danger))",
};

const PHASE_LABEL: Record<CarrierPhase, string> = {
  "break-in": "BREAK-IN",
  adapting: "ADAPTING",
  building: "BUILDING",
  regular: "REGULAR",
};

type Props = {
  dispatch: CarrierDispatch;
};

export function CarrierDispatchCard({ dispatch: d }: Props) {
  const weatherFlags: string[] = [];
  if (d.heatDay) weatherFlags.push("HEAT");
  if (d.rain) weatherFlags.push("RAIN");
  if (d.storm) weatherFlags.push("STORM");
  if (d.snow) weatherFlags.push("SNOW");

  const chips: { label: string; color?: string }[] = [];
  if (d.phase) chips.push({ label: PHASE_LABEL[d.phase] });
  if (d.waterOz !== undefined) {
    const goal = d.hydrationGoalOz;
    chips.push({
      label: goal ? `${d.waterOz}/${goal} OZ` : `${d.waterOz} OZ`,
      color: goal && d.waterOz >= goal ? "rgb(var(--green))" : "rgb(var(--neon))",
    });
  }

  return (
    <div id={d.id} className="surface-panel p-5 sm:p-6 space-y-3">
      {/* Header: date, title, mail load */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-1">
            {d.date}
            {d.phase ? ` // ${PHASE_LABEL[d.phase]}` : ""}
          </div>
          <h3 className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))] leading-snug">
            {d.title}
          </h3>
        </div>
        <div
          className="font-[var(--font-ocr)] text-xs tracking-widest px-2 py-1 border shrink-0"
          style={{
            color: MAIL_LOAD_COLOR[d.mailLoad],
            borderColor: MAIL_LOAD_COLOR[d.mailLoad],
          }}
        >
          {MAIL_LOAD_LABEL[d.mailLoad]}
        </div>
      </div>

      {/* Authored narrative: primary content */}
      {d.publicNote.trim() && (
        <div className="border-l-2 border-[rgb(var(--neon)/0.4)] pl-3 space-y-3">
          {splitPublicNoteParagraphs(d.publicNote).map((paragraph, index) => (
            <p
              key={index}
              className="text-sm text-[rgb(var(--text-color))] leading-relaxed whitespace-pre-line"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {/* KPI telemetry row: secondary */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-px bg-[rgb(var(--border)/0.12)]">
        {[
          { label: "MILES", value: `${d.milesWalked}` },
          { label: "STEPS", value: d.steps.toLocaleString() },
          { label: "SORENESS", value: `${d.soreness}/10` },
          { label: "ENERGY", value: `${d.energy}/10` },
          { label: "MOOD", value: `${d.mood}/10` },
        ].map((m) => (
          <div key={m.label} className="bg-[rgb(var(--panel))] px-3 py-2 text-center">
            <div className="font-[var(--font-ibm)] text-sm text-[rgb(var(--neon))]">{m.value}</div>
            <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] mt-0.5">
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Meta row: weather, flags, hydration */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--text-secondary))]">
        <span className="font-[var(--font-ocr)] tracking-wide text-[rgb(var(--text-meta))]">
          {d.weather}
          {d.temperatureF ? ` · ${d.temperatureF}°F` : ""}
          {d.heatIndexF ? ` (feels ${d.heatIndexF}°F)` : ""}
        </span>
        {weatherFlags.map((f) => (
          <span
            key={f}
            className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--warn))] border border-[rgb(var(--warn)/0.4)] px-1.5 py-0.5"
          >
            {f}
          </span>
        ))}
        {d.dogEncounter && (
          <span className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--yellow))] border border-[rgb(var(--yellow)/0.4)] px-1.5 py-0.5">
            DOG
          </span>
        )}
        {chips.map((chip) => (
          <span
            key={chip.label}
            className="font-[var(--font-ocr)] text-[9px] tracking-widest border px-1.5 py-0.5"
            style={{
              color: chip.color ?? "rgb(var(--text-secondary))",
              borderColor: chip.color ?? "rgb(var(--border)/0.4)",
            }}
          >
            {chip.label}
          </span>
        ))}
      </div>

      {/* Body / recovery notes */}
      {(d.bodyNote || d.recoveryNote) && (
        <div className="flex flex-col sm:flex-row gap-2 text-xs">
          {d.bodyNote && (
            <span className="text-[rgb(var(--text-secondary))] border-l border-[rgb(var(--border)/0.3)] pl-2">
              <span className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] mr-2">
                BODY
              </span>
              {d.bodyNote}
            </span>
          )}
          {d.recoveryNote && (
            <span className="text-[rgb(var(--text-secondary))] border-l border-[rgb(var(--border)/0.3)] pl-2">
              <span className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] mr-2">
                RECOVERY
              </span>
              {d.recoveryNote}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
