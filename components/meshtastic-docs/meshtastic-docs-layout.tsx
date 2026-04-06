import { Radio } from "lucide-react";
import type { GroupedMeshtasticSection } from "@/lib/notion/meshtastic-docs.repo";
import { MeshtasticDocsSidebar } from "./meshtastic-docs-sidebar";

type MeshtasticDocsLayoutProps = {
  grouped: GroupedMeshtasticSection[];
  currentSlug: string | null;
  currentSection: string | null;
  hasFieldNotes?: boolean;
  children: React.ReactNode;
  /** When false, hide the mesh status footer (e.g. minimal index). */
  showFooterStatus?: boolean;
};

/**
 * Docs chrome: sectioned sidebar + main column. Site navbar/background come from marketing layout.
 */
export function MeshtasticDocsLayout({
  grouped,
  currentSlug,
  currentSection,
  hasFieldNotes = false,
  children,
  showFooterStatus = true,
}: MeshtasticDocsLayoutProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-col pb-10 pt-20">
      <div className="shrink-0 border-b border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.6)] px-3 py-2 backdrop-blur-sm sm:px-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Radio className="h-3.5 w-3.5 text-[rgb(var(--neon)/0.6)]" aria-hidden />
            <span className="font-[var(--font-ocr)] text-[10px] tracking-[0.3em] text-[rgb(var(--neon)/0.5)] uppercase">
              MESH-00
            </span>
            <span className="hidden text-[rgb(var(--neon)/0.15)] sm:inline">│</span>
            <span className="hidden font-[var(--font-ibm)] text-xs text-[rgb(var(--text-secondary))] sm:inline">
              λstepweaver mesh docs
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[rgb(var(--neon)/0.4)] motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[rgb(var(--neon))]" />
              </span>
              <span className="font-[var(--font-ocr)] text-[10px] tracking-[0.15em] text-[rgb(var(--neon)/0.6)] uppercase">
                Active
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col lg:flex-row">
        <div className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-6rem)] lg:w-64 lg:flex-shrink-0 lg:self-start lg:overflow-y-auto lg:border-r lg:border-[rgb(var(--neon)/0.15)] xl:w-72">
          <MeshtasticDocsSidebar
            grouped={grouped}
            currentSlug={currentSlug}
            currentSection={currentSection}
            hasFieldNotes={hasFieldNotes}
          />
        </div>

        <main className="min-w-0 flex-1 pt-4 sm:pt-6">{children}</main>
      </div>

      {showFooterStatus ? (
        <footer className="shrink-0 border-t border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--panel)/0.6)] px-3 py-1.5 backdrop-blur-sm sm:px-5">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 sm:gap-3">
            <span className="whitespace-nowrap font-[var(--font-ocr)] text-[10px] text-[rgb(var(--neon)/0.45)]">
              &gt; mesh
            </span>
            <span className="text-[rgb(var(--neon)/0.15)]">│</span>
            <span className="whitespace-nowrap font-[var(--font-ocr)] text-[10px] uppercase text-[rgb(var(--text-meta))]">
              Documentation
            </span>
            <span className="hidden text-[rgb(var(--neon)/0.15)] sm:inline">│</span>
            <span className="hidden whitespace-nowrap font-[var(--font-ocr)] text-[10px] uppercase text-[rgb(var(--text-meta))] sm:inline">
              Off-grid comms
            </span>
            <span className="hidden text-[rgb(var(--neon)/0.15)] md:inline">│</span>
            <span className="hidden whitespace-nowrap font-[var(--font-ocr)] text-[10px] uppercase text-[rgb(var(--text-meta)/0.85)] md:inline">
              Page revalidate 60s · API cache 5m
            </span>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
