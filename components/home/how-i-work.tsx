import { HOW_I_WORK } from "@/lib/data/identity";

export function HowIWork() {
  return (
    <section className="relative z-30 w-full px-3 sm:px-6 md:px-8 lg:px-12 xl:px-14 py-10">
      <p className="font-[var(--font-ocr)] text-xs uppercase tracking-[0.28em] text-[rgb(var(--text-label))] mb-2">
        How I work
      </p>
      <h2 className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))] mb-6">
        Analysis, then design, then software.
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
        {HOW_I_WORK.map((item) => (
          <div key={item.step} className="bg-[rgb(var(--panel))] p-5 sm:p-6">
            <p className="font-[var(--font-ocr)] text-[10px] tracking-[0.2em] text-[rgb(var(--neon)/0.55)] mb-2">
              {item.step}
            </p>
            <h3 className="font-[var(--font-ibm)] text-[rgb(var(--text-color))] text-base mb-2">{item.title}</h3>
            <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
