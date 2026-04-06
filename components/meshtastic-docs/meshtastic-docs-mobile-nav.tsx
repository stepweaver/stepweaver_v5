"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { GroupedMeshtasticSection } from "@/lib/notion/meshtastic-docs.repo";
import { getMeshtasticNavLinkClass } from "@/lib/meshtastic-nav-utils";

type Props = {
  grouped: GroupedMeshtasticSection[];
  currentSlug: string | null;
  currentSection: string | null;
  hasFieldNotes?: boolean;
};

export function MeshtasticDocsMobileNav({ grouped, currentSlug, currentSection, hasFieldNotes = false }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-sm border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--panel)/0.5)] px-3 py-2 font-[var(--font-ocr)] text-xs uppercase tracking-[0.2em] text-[rgb(var(--neon)/0.9)] transition-colors hover:border-[rgb(var(--neon)/0.4)] hover:bg-[rgb(var(--panel)/0.7)] hover:text-neon lg:hidden"
        aria-label="Open docs navigation"
        aria-expanded={open}
      >
        <Menu className="h-4 w-4" aria-hidden />
        <span>Docs Menu</span>
      </button>

      {open && mounted
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-[9998] bg-black/60 lg:hidden"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <aside
                className="fixed left-0 top-0 z-[9999] h-full w-72 max-w-[85vw] lg:hidden"
                aria-label="Docs navigation"
                role="dialog"
                aria-modal
              >
                <div className="flex h-full flex-col overflow-hidden border-r border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--bg))] shadow-[var(--shadow-neon)]">
                  <div className="flex shrink-0 items-center justify-between border-b border-[rgb(var(--neon)/0.2)] p-4">
                    <Link
                      href="/meshtastic"
                      className="flex items-center gap-2 font-[var(--font-ibm)] font-semibold text-neon transition-colors hover:text-[rgb(var(--accent))]"
                      onClick={() => setOpen(false)}
                    >
                      <span className="font-mono text-lg" aria-hidden>
                        {"//\\"}
                      </span>
                      Meshtastic
                    </Link>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded p-1 text-[rgb(var(--text-secondary))] transition-colors hover:text-neon"
                      aria-label="Close docs navigation"
                    >
                      <X className="h-5 w-5" aria-hidden />
                    </button>
                  </div>

                  <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
                    {hasFieldNotes ? (
                      <div className="mb-1 border-b border-[rgb(var(--neon)/0.08)] pb-1">
                        <Link
                          href="/meshtastic/field-notes"
                          className={getMeshtasticNavLinkClass(currentSlug === "field-notes")}
                          onClick={() => setOpen(false)}
                        >
                          Field Notes
                        </Link>
                      </div>
                    ) : null}

                    {grouped.map(({ section, pages }) => {
                      if (!pages?.length) return null;
                      const sectionOpen = currentSection === section;
                      const hasActive = pages.some((p) => p.slug === currentSlug);
                      return (
                        <details
                          key={section}
                          open={sectionOpen || hasActive}
                          className="group/details border-b border-[rgb(var(--neon)/0.08)] last:border-b-0"
                        >
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-2 py-2.5 font-[var(--font-ocr)] text-sm font-medium text-[rgb(var(--text-color))] transition-colors hover:text-neon">
                            <span>{section}</span>
                            <span
                              className="text-[rgb(var(--neon)/0.5)] transition-transform group-open/details:rotate-90"
                              aria-hidden
                            >
                              ›
                            </span>
                          </summary>
                          <ul className="space-y-0.5 pb-2 pl-2">
                            {pages.map((p) => (
                              <li key={p.id}>
                                <Link
                                  href={`/meshtastic/${p.slug}`}
                                  className={getMeshtasticNavLinkClass(p.slug === currentSlug)}
                                  onClick={() => setOpen(false)}
                                >
                                  {p.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </details>
                      );
                    })}
                  </nav>
                </div>
              </aside>
            </>,
            document.body
          )
        : null}
    </>
  );
}
