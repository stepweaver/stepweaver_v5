export function AffiliateGearSection({ links = [] }: { links: { url: string; label: string }[] }) {
  if (!links?.length) return null;

  return (
    <section className="mt-8 border-t border-[rgb(var(--neon)/0.1)] pt-6">
      <h3 className="mb-3 font-[var(--font-ibm)] text-sm font-semibold text-[rgb(var(--text-color))]">Gear for Meshtastic Networks</h3>
      <ul className="space-y-2">
        {links.map(({ url, label }, i) => (
          <li key={`${i}-${label}`}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-[var(--font-ocr)] text-sm text-neon underline transition-colors hover:text-[rgb(var(--accent))] hover:no-underline"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
