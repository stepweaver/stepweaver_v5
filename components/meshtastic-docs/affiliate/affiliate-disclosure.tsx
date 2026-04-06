export function AffiliateDisclosure({ show = false }: { show?: boolean }) {
  if (!show) return null;

  return (
    <p className="mb-3 font-[var(--font-ocr)] text-xs italic leading-relaxed text-[rgb(var(--text-secondary))]">
      Disclosure: Some links on this page are affiliate links. If you purchase through them, I may earn a commission at no
      extra cost to you.
    </p>
  );
}
