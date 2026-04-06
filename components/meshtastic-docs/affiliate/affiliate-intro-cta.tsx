export function AffiliateIntroCTA({ affiliateUrl }: { affiliateUrl: string }) {
  if (!affiliateUrl) return null;

  return (
    <section className="mb-6 overflow-hidden rounded-sm border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel)/0.2)]">
      <div className="border-b border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.5)] px-5 py-2.5 sm:px-6">
        <span className="font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon)/0.4)] uppercase">
          Equip Your Mesh Network
        </span>
      </div>
      <div className="px-5 py-4 sm:px-6">
        <p className="mb-4 font-[var(--font-ocr)] text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
          Looking for reliable Meshtastic-compatible hardware? Atlavox offers high-quality radios, repeaters, and accessories
          built for real-world use.
        </p>
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-sm border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--panel)/0.4)] px-4 py-2.5 text-center font-[var(--font-ocr)] text-xs tracking-[0.15em] text-[rgb(var(--neon)/0.9)] transition-colors hover:border-[rgb(var(--neon)/0.4)] hover:bg-[rgb(var(--panel)/0.6)] hover:text-neon sm:text-sm"
        >
          Shop Atlavox Radios
        </a>
      </div>
    </section>
  );
}
