import Link from "next/link";
import type { HomeIntelPayload } from "@/lib/home/recent-intel";
import { formatCodexDate } from "@/lib/codex/selectors";
import { LoadoutIconMarquee } from "@/components/hero/loadout-icon-marquee";

function statusLabel(status: NonNullable<HomeIntelPayload["relatedProject"]>["status"]) {
  switch (status) {
    case "live":
      return "[LIVE]";
    case "demo":
      return "[DEMO]";
    case "coming-soon":
      return "[BUILD]";
    case "archived":
      return "[ARCHIVE]";
    default:
      return "";
  }
}

export function HeroRecentIntel({ intel }: { intel: HomeIntelPayload | null }) {
  return (
    <aside
      className="mt-8 sm:mt-10 flex flex-col flex-1 rounded-sm border border-[rgb(var(--neon)/0.15)] bg-[rgb(var(--panel)/0.25)] p-4 sm:p-5 min-w-0"
      aria-label="Recent codex intel"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-[10px] sm:text-xs tracking-[0.2em] text-[rgb(var(--text-label))] font-[var(--font-ocr)] uppercase">
          Recent intel
        </p>
        <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--neon)/0.35)] shrink-0 hidden sm:inline">
          CODEX
        </span>
      </div>

      {intel ? (
        <>
          <Link
            href={`/codex/${intel.post.slug}`}
            className="font-[var(--font-ibm)] text-base sm:text-lg text-[rgb(var(--text-color))] hover:text-[rgb(var(--neon))] transition-colors leading-snug line-clamp-2"
          >
            {intel.post.title}
          </Link>
          {intel.post.description ? (
            <p className="mt-2 text-[rgb(var(--text-secondary))] text-sm leading-relaxed line-clamp-3">
              {intel.post.description}
            </p>
          ) : null}
          <p className="mt-2 font-[var(--font-ocr)] text-[10px] sm:text-xs text-[rgb(var(--text-meta))]">
            {formatCodexDate(intel.post.updated || intel.post.date)}
            {intel.post.hashtags.length > 0 ? (
              <span className="text-[rgb(var(--neon)/0.35)]"> · </span>
            ) : null}
            {intel.post.hashtags.slice(0, 4).map((t) => (
              <span key={t} className="text-[rgb(var(--muted-color)/0.9)]">
                #{t}{" "}
              </span>
            ))}
          </p>

          {intel.relatedProject ? (
            <div className="mt-4 pt-4 border-t border-[rgb(var(--border)/0.2)] flex-1 min-h-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <p className="font-[var(--font-ocr)] text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--text-meta))]">
                  Linked build
                </p>
                <span className="font-[var(--font-ocr)] text-[10px] text-[rgb(var(--neon)/0.45)]">
                  {statusLabel(intel.relatedProject.status)}
                </span>
              </div>
              <Link
                href={`/projects/${intel.relatedProject.slug}`}
                className="font-[var(--font-ibm)] text-sm text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors"
              >
                {intel.relatedProject.title}
              </Link>
              <p className="mt-1.5 text-[rgb(var(--text-secondary))] text-xs leading-relaxed line-clamp-2">
                {intel.relatedProject.summary}
              </p>
              {intel.relatedProject.highlights.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {intel.relatedProject.highlights.map((line, i) => (
                    <li
                      key={i}
                      className="text-[11px] sm:text-xs text-[rgb(var(--text-meta))] flex gap-2"
                    >
                      <span className="text-[rgb(var(--neon))] shrink-0">▸</span>
                      <span className="leading-snug line-clamp-2">{line}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 pt-3 border-t border-[rgb(var(--border)/0.12)] flex items-center justify-between gap-2">
            <Link
              href={`/codex/${intel.post.slug}`}
              className="font-[var(--font-ocr)] text-[10px] sm:text-xs uppercase tracking-wider text-[rgb(var(--neon)/0.7)] hover:text-[rgb(var(--neon))] transition-colors"
            >
              Read briefing →
            </Link>
            <Link
              href="/codex"
              className="font-[var(--font-ocr)] text-[10px] sm:text-xs uppercase tracking-wider text-[rgb(var(--muted-color)/0.7)] hover:text-[rgb(var(--neon)/0.6)] transition-colors shrink-0"
            >
              Archive
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="text-[rgb(var(--text-secondary))] text-sm font-[var(--font-ibm)] leading-relaxed flex-1">
            Wire Notion codex env vars to surface the latest entry here. Full archive lives in the codex.
          </p>
          <Link
            href="/codex"
            className="mt-4 inline-flex w-fit items-center font-[var(--font-ocr)] text-xs uppercase tracking-wider text-[rgb(var(--neon))] border border-[rgb(var(--neon)/0.4)] px-3 py-2 hover:bg-[rgb(var(--neon)/0.08)] transition-colors"
          >
            Open codex →
          </Link>
        </>
      )}

      <LoadoutIconMarquee />
    </aside>
  );
}
