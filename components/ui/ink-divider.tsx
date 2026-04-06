type Props = {
  /** Center seal (λ) between ink lines; v3 home parity */
  showSeal?: boolean;
  className?: string;
};

export function InkDivider({ showSeal = false, className = "" }: Props) {
  const line = (
    <div
      className="h-0.5 flex-1 max-w-[min(120px,28vw)] opacity-60 bg-[rgb(var(--muted-color)/0.45)]"
      aria-hidden
    />
  );

  if (showSeal) {
    return (
      <div className={`flex items-center justify-center gap-3 sm:gap-4 py-4 sm:py-5 ${className}`}>
        {line}
        <span
          className="shrink-0 font-[var(--font-ocr)] text-[10px] sm:text-xs tracking-[0.35em] text-[rgb(var(--neon)/0.5)] uppercase"
          aria-hidden
        >
          λ
        </span>
        {line}
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 ${className}`}>
      <div className="h-px bg-gradient-to-r from-transparent via-[rgb(var(--border)/0.4)] to-transparent" />
    </div>
  );
}
