"use client";

import Link from "next/link";
import type { GroupedMeshtasticSection } from "@/lib/notion/meshtastic-docs.repo";
import { getMeshtasticNavLinkClass } from "@/lib/meshtastic-nav-utils";

type Props = {
  grouped: GroupedMeshtasticSection[];
  currentSlug: string | null;
  currentSection: string | null;
  hasFieldNotes?: boolean;
};

export function MeshtasticDocsSidebar({ grouped, currentSlug, currentSection, hasFieldNotes = false }: Props) {
  return (
    <aside className="flex min-h-0 flex-col" aria-label="Docs navigation">
      <div className="shrink-0 border-b border-[rgb(var(--neon)/0.15)] p-3">
        <Link
          href="/meshtastic"
          className="group flex items-center gap-2 text-neon transition-colors hover:text-[rgb(var(--accent))]"
        >
          <span className="font-mono text-lg" aria-hidden>
            {"//\\"}
          </span>
          <span className="font-[var(--font-ibm)] text-sm">Meshtastic</span>
        </Link>
        <p className="mt-1 font-[var(--font-ocr)] text-[9px] tracking-[0.2em] text-[rgb(var(--neon)/0.3)] uppercase">
          Field guide
        </p>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {hasFieldNotes ? (
          <div className="mb-1 border-b border-[rgb(var(--neon)/0.1)] pb-1">
            <Link href="/meshtastic/field-notes" className={getMeshtasticNavLinkClass(currentSlug === "field-notes")}>
              Field Notes
            </Link>
          </div>
        ) : null}

        {grouped.map(({ section, pages }) => {
          if (!pages?.length) return null;
          const isOpen = currentSection === section;
          const hasActive = pages.some((p) => p.slug === currentSlug);
          return (
            <details
              key={section}
              open={isOpen || hasActive}
              className="group/details border-b border-[rgb(var(--neon)/0.1)] last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-2 py-2.5 font-[var(--font-ocr)] text-sm font-medium text-[rgb(var(--text-color))] transition-colors hover:text-neon">
                <span>{section}</span>
                <span className="text-[rgb(var(--neon)/0.5)] transition-transform group-open/details:rotate-90" aria-hidden>
                  ›
                </span>
              </summary>
              <ul className="space-y-0.5 pb-2 pl-2">
                {pages.map((p) => (
                  <li key={p.id}>
                    <Link href={`/meshtastic/${p.slug}`} className={getMeshtasticNavLinkClass(p.slug === currentSlug)}>
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </nav>

      <div className="border-t border-[rgb(var(--neon)/0.1)] p-3">
        <p className="font-[var(--font-ibm)] text-[11px] text-[rgb(var(--text-meta))]">Content syncs automatically.</p>
      </div>
    </aside>
  );
}
