import { HOMEPAGE_CHAPTER_NOTE, HOMEPAGE_EXPERIENCE } from "@/lib/data/identity";

export function ExperienceStrip() {
  return (
    <section className="relative z-30 w-full px-3 sm:px-6 md:px-8 lg:px-12 xl:px-14 py-10">
      <p className="font-[var(--font-ocr)] text-xs uppercase tracking-[0.28em] text-[rgb(var(--text-label))] mb-2">
        Experience
      </p>
      <h2 className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))] mb-6">
        The chronology matches the résumé.
      </h2>
      <div className="space-y-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
        {HOMEPAGE_EXPERIENCE.map((item) => (
          <article key={item.org} className="bg-[rgb(var(--panel))] p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <h3 className="font-[var(--font-ibm)] text-[rgb(var(--text-color))]">
                {item.role} · {item.org}
              </h3>
              <p className="font-[var(--font-ocr)] text-xs tracking-wide text-[rgb(var(--text-meta))]">{item.when}</p>
            </div>
            <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">{item.body}</p>
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs text-[rgb(var(--text-meta))] leading-relaxed max-w-2xl">{HOMEPAGE_CHAPTER_NOTE}</p>
    </section>
  );
}
