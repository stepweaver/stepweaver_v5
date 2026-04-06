"use client";

import Link from "next/link";
import { headingIndentClass } from "@/lib/meshtastic-docs-headings";

type Heading = { level: 1 | 2 | 3; text: string; id: string };

export function OnThisPage({ headings }: { headings: Heading[] }) {
  if (!headings?.length) return null;

  return (
    <aside
      className="sticky top-24 hidden min-w-64 max-w-80 flex-1 self-start border-l border-[rgb(var(--neon)/0.15)] pl-6 pr-4 pt-8 xl:block"
      aria-label="On this page"
    >
      <div className="rounded-sm border border-[rgb(var(--neon)/0.1)] bg-[rgb(var(--panel)/0.2)] px-4 py-4">
        <p className="mb-3 font-[var(--font-ocr)] text-[9px] tracking-[0.25em] text-[rgb(var(--neon)/0.45)] uppercase">
          On this page
        </p>
        <nav className="space-y-1">
          {headings.map(({ level, text, id }, index) => (
            <Link
              key={id}
              href={`#${id}`}
              className={`block py-0.5 font-[var(--font-ocr)] text-[12px] text-[rgb(var(--text-secondary))] transition-colors hover:text-neon ${headingIndentClass(level, index === 0)}`}
            >
              {text}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
