import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-[11] border-t border-[rgb(var(--border)/0.2)] bg-[rgb(var(--bg))] py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-[var(--font-ocr)] text-xs text-[rgb(var(--muted-color))]">
          <Link href="/terminal" className="hover:text-[rgb(var(--neon))] transition-colors">
            λstepweaver
          </Link>
          {" "}© {new Date().getFullYear()}
        </div>
        <div className="flex items-center gap-4 text-xs text-[rgb(var(--muted-color))]">
          <a
            href="https://github.com/stephen"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[rgb(var(--neon))] transition-colors"
          >
            GitHub
          </a>
          <Link href="/work" className="hover:text-[rgb(var(--neon))] transition-colors">
            Work
          </Link>
          <Link href="/lab" className="hover:text-[rgb(var(--neon))] transition-colors">
            Lab
          </Link>
          <Link href="/privacy" className="hover:text-[rgb(var(--neon))] transition-colors">
            Privacy
          </Link>
          <Link href="/contact" className="hover:text-[rgb(var(--neon))] transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
