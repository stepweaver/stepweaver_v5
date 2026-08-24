import Link from "next/link";

export function CloseCta() {
  return (
    <section className="relative z-30 w-full px-3 sm:px-6 md:px-8 lg:px-12 xl:px-14 pb-12">
      <div className="border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel)/0.2)] p-5 sm:p-7">
        <p className="font-[var(--font-ocr)] text-xs uppercase tracking-[0.28em] text-[rgb(var(--text-label))] mb-3">
          Next
        </p>
        <h2 className="font-[var(--font-ibm)] text-xl sm:text-2xl text-[rgb(var(--text-color))] mb-3">
          Resume, conversation, or a longer look.
        </h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <Link href="/resume" className="glitch-button glitch-button--primary">
            Resume
          </Link>
          <Link href="/contact?intent=hire" className="glitch-button">
            Contact
          </Link>
          <Link href="/work" className="glitch-button">
            Work
          </Link>
        </div>
        <p className="text-xs text-[rgb(var(--text-meta))]">
          Curious about the rest?{" "}
          <Link href="/lab" className="text-[rgb(var(--neon)/0.8)] hover:text-[rgb(var(--neon))] underline underline-offset-2">
            Lab
          </Link>
          {" · "}
          <Link href="/terminal" className="text-[rgb(var(--neon)/0.8)] hover:text-[rgb(var(--neon))] underline underline-offset-2">
            Terminal
          </Link>
        </p>
      </div>
    </section>
  );
}
