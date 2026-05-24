import type { CarrierDispatch, MailLoad } from "@/lib/data/carrier-journal";

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

type Props = {
  dispatch: CarrierDispatch;
};

export function CarrierDispatchCard({ dispatch: d }: Props) {
  const weatherFlags: string[] = [];
  if (d.heatDay) weatherFlags.push("HEAT");
  if (d.rain) weatherFlags.push("RAIN");
  if (d.storm) weatherFlags.push("STORM");
  if (d.snow) weatherFlags.push("SNOW");

  return (
    <div className="surface-panel p-5 sm:p-6 space-y-3">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-[var(--font-ocr)] text-[10px] tracking-widest text-[rgb(var(--text-label))] mb-1">
            {`${d.date} // DISPATCH ${d.id.toUpperCase()}`}
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

      {/* Metrics strip */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-px bg-[rgb(var(--border)/0.12)]">
        {[
          { label: "MILES", value: `${d.milesWalked}` },
          { label: "STEPS", value: d.steps.toLocaleString() },
          { label: "SORENESS", value: `${d.soreness}/10` },
          { label: "ENERGY", value: `${d.energy}/10` },
          { label: "MOOD", value: `${d.mood}/10` },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-[rgb(var(--panel))] px-3 py-2 text-center"
          >
            <div className="font-[var(--font-ibm)] text-sm text-[rgb(var(--neon))]">
              {m.value}
            </div>
            <div className="font-[var(--font-ocr)] text-[9px] tracking-widest text-[rgb(var(--text-label))] mt-0.5">
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Weather + flags */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[rgb(var(--text-secondary))]">
        <span className="font-[var(--font-ocr)] tracking-wide">
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
      </div>

      {/* Public note */}
      <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed border-l-2 border-[rgb(var(--neon)/0.3)] pl-3">
        {d.publicNote}
      </p>
    </div>
  );
}
