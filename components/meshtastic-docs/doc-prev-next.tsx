"use client";

import Link from "next/link";
import type { MeshtasticPublishedDoc } from "@/lib/notion/meshtastic-docs.repo";

export function DocPrevNext({
  flatList,
  currentSlug,
}: {
  flatList: MeshtasticPublishedDoc[];
  currentSlug: string;
}) {
  if (!flatList?.length) return null;
  const idx = flatList.findIndex((p) => p.slug === currentSlug);
  const prev = idx > 0 ? flatList[idx - 1] : null;
  const next = idx >= 0 && idx < flatList.length - 1 ? flatList[idx + 1] : null;

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[rgb(var(--neon)/0.1)] pt-6"
      aria-label="Previous and next doc"
    >
      <div className="min-w-0">
        {prev ? (
          <Link
            href={`/meshtastic/${prev.slug}`}
            className="group flex items-center gap-2 font-[var(--font-ocr)] text-sm text-[rgb(var(--text-secondary))] transition-colors hover:text-neon"
          >
            <span className="shrink-0 text-[rgb(var(--neon)/0.5)] transition-colors group-hover:text-neon" aria-hidden>
              ←
            </span>
            <span className="truncate">Previous: {prev.title}</span>
          </Link>
        ) : null}
      </div>
      <div className="min-w-0 text-right">
        {next ? (
          <Link
            href={`/meshtastic/${next.slug}`}
            className="group flex items-center justify-end gap-2 font-[var(--font-ocr)] text-sm text-[rgb(var(--text-secondary))] transition-colors hover:text-neon"
          >
            <span className="truncate">Next: {next.title}</span>
            <span className="shrink-0 text-[rgb(var(--neon)/0.5)] transition-colors group-hover:text-neon" aria-hidden>
              →
            </span>
          </Link>
        ) : (
          <span className="font-[var(--font-ocr)] text-sm text-[rgb(var(--text-meta))]">Next</span>
        )}
      </div>
    </nav>
  );
}
