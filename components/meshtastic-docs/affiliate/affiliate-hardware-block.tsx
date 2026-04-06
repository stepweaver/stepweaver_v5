export function AffiliateHardwareBlock({ affiliateUrl }: { affiliateUrl: string }) {
  if (!affiliateUrl) return null;

  return (
    <section className="my-6 overflow-hidden rounded-sm border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel)/0.2)]">
      <div className="border-b border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.5)] px-5 py-2.5 sm:px-6">
        <span className="font-[var(--font-ocr)] text-[10px] tracking-[0.18em] text-[rgb(var(--neon)/0.4)] uppercase">
          Hardware Recommendation
        </span>
      </div>
      <div className="px-5 py-4 sm:px-6">
        <p className="mb-4 font-[var(--font-ocr)] text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
          Atlavox builds Meshtastic-compatible radios, repeaters, and cases with solid build quality, GPS support, and long
          battery life (a step up from generic mesh radios).
        </p>
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="glitch-button glitch-button--primary inline-flex text-sm"
        >
          Shop Atlavox Hardware
        </a>
      </div>
    </section>
  );
}
