import Link from "next/link";

export function HeroDescription() {
  return (
    <div className="mt-6 min-w-0 w-full max-w-4xl 2xl:max-w-6xl">
      <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed max-w-2xl">
        Strongest where operations, data handoffs, and software meet: internal tools, workflow automation, and AI with clear boundaries.
      </p>
      <Link
        href="/about"
        className="inline-block mt-3 text-xs font-[var(--font-ocr)] tracking-wider text-[rgb(var(--neon)/0.8)] hover:text-[rgb(var(--neon))] underline underline-offset-2"
      >
        About / where I fit →
      </Link>
    </div>
  );
}
