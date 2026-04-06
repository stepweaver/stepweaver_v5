"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useCallback, useMemo, useState } from "react";
import type { Project } from "@/lib/data/projects.schema";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";

function getRepoHref(githubRepo: string | undefined) {
  if (!githubRepo || typeof githubRepo !== "string") return null;
  if (/^https?:\/\//i.test(githubRepo)) return githubRepo;
  return `https://github.com/${githubRepo}`;
}

function getProjectCtas(active: Project) {
  const caseStudyHref = active.slug ? `/projects/${active.slug}` : null;
  const liveHref = active.liveUrl || active.demoUrl || active.link || null;
  const repoHref = active.repoUrl || getRepoHref(active.githubRepo);
  const isService = active.tags.some((t) => /service/i.test(t));

  const ctas: Array<{
    key: string;
    href: string;
    label: string;
    external: boolean;
    variant: "primary" | "secondary" | "tertiary";
  }> = [];

  if (caseStudyHref) {
    ctas.push({
      key: "case-study",
      href: caseStudyHref,
      label: "View Case Study",
      external: false,
      variant: "primary",
    });
  }

  if (isService) return ctas;

  if (liveHref) {
    const isInternal = !/^https?:\/\//i.test(liveHref);
    ctas.push({
      key: "live-project",
      href: liveHref,
      label: isInternal ? "Open Module" : "View Live Project",
      external: !isInternal,
      variant: "secondary",
    });
    return ctas;
  }

  if (repoHref) {
    ctas.push({
      key: "repo",
      href: repoHref,
      label: "View Repo",
      external: true,
      variant: "tertiary",
    });
  }

  return ctas;
}

function deliveredSummary(p: Project): string | null {
  const lines = p.delivered ?? p.cardDelivered;
  if (!lines?.length) return null;
  return lines.slice(0, 3).join("; ");
}

export const ProjectDossier = memo(function ProjectDossier({ projects = [] }: { projects: Project[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const total = projects.length;
  const active = projects[activeIndex] || null;

  const moduleLabel = useMemo(() => {
    if (!total) return "MODULE 00";
    return `MODULE ${String(activeIndex + 1).padStart(2, "0")}`;
  }, [activeIndex, total]);

  const countLabel = useMemo(() => {
    if (!total) return "00 / 00";
    return `${String(activeIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  }, [activeIndex, total]);

  const statusChips = useMemo(() => {
    if (!active) return [];
    const chips: string[] = [];
    if (active.status === "coming-soon") {
      chips.push(active.slug === "lcerebro" ? "Build in Progress" : "Coming Soon");
    }
    if (active.status === "demo") chips.push("Demo");
    const kw = active.keywords?.[0] ?? active.tags[0];
    if (kw) chips.push(kw);
    return chips.slice(0, 2);
  }, [active]);

  const proofBullets = useMemo(() => {
    if (!active) return [];
    const built = active.cardBuiltFor || active.builtFor;
    const solved = active.cardSolved || active.solved;
    const delivered = deliveredSummary(active);
    const proof = [
      built ? `Built for ${built}` : null,
      solved ? `Solved ${solved}` : null,
      delivered ? `Delivered ${delivered}` : null,
    ].filter(Boolean) as string[];

    if (proof.length >= 2) return proof.slice(0, 3);
    const fromCard = active.cardDelivered?.slice(0, 2) ?? [];
    return [...proof, ...fromCard].slice(0, 3);
  }, [active]);

  const tags = useMemo(() => (active ? active.tags.slice(0, 5) : []), [active]);

  const ctas = useMemo(() => (active ? getProjectCtas(active) : []), [active]);

  const goPrev = useCallback(() => {
    if (!total) return;
    setActiveIndex((i) => (i === 0 ? total - 1 : i - 1));
  }, [total]);

  const goNext = useCallback(() => {
    if (!total) return;
    setActiveIndex((i) => (i === total - 1 ? 0 : i + 1));
  }, [total]);

  const { swipeBindings, dragOffset } = useSwipeNavigation({
    onPrev: goPrev,
    onNext: goNext,
    disabled: total <= 1,
    threshold: 56,
    intentRatio: 1.25,
    transitionMs: 180,
  });

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    },
    [goNext, goPrev]
  );

  if (!active) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="relative w-full max-w-md border border-[rgb(var(--green)/0.2)] bg-[rgb(var(--window)/0.3)] p-6">
          <div className="font-[var(--font-ocr)] text-xs uppercase tracking-[0.18em] text-[rgb(var(--text-label))]">
            Scanning Modules...
          </div>
          <div className="mt-4 space-y-3">
            <div className="h-3 w-[75%] bg-[rgb(var(--green)/0.1)]" />
            <div className="h-3 w-1/2 bg-[rgb(var(--green)/0.1)]" />
            <div className="h-3 w-2/3 bg-[rgb(var(--green)/0.1)]" />
          </div>
        </div>
      </div>
    );
  }

  const imageSrc = active.imageUrl || "/images/terminal_ui.png";

  return (
    <section
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="relative w-full outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--green)/0.4)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--window))]"
      aria-label="Active project module"
    >
      <div className="pointer-events-none absolute inset-0 opacity-35">
        <div className="absolute inset-x-0 top-0 h-px bg-[rgb(var(--green)/0.15)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[rgb(var(--green)/0.1)]" />
        <div className="absolute left-[12%] top-0 h-full w-px bg-[rgb(var(--green)/0.1)]" />
        <div className="absolute right-[8%] top-0 h-full w-px bg-[rgb(var(--green)/0.1)]" />
      </div>

      <div className="mb-6 flex items-start justify-between gap-4 border-b border-[rgb(var(--border)/0.4)] pb-4">
        <div className="min-w-0">
          <div className="font-[var(--font-ocr)] text-xs uppercase tracking-[0.18em] text-[rgb(var(--text-label))] sm:text-sm">
            Active Project Module
          </div>

          <div className="mt-2 flex items-center gap-3">
            <span className="h-2 w-2 bg-[rgb(var(--green))] shadow-[0_0_14px_rgb(var(--green)/0.45)]" />
            <span className="font-[var(--font-ocr)] text-xs uppercase tracking-[0.16em] text-[rgb(var(--text-secondary))] sm:text-sm">
              {moduleLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {statusChips.map((chip) => (
            <span
              key={chip}
              className="relative border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--window)/0.5)] px-2.5 py-1 font-[var(--font-ocr)] text-xs uppercase tracking-[0.18em] text-[rgb(var(--text-label))]"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.85fr)]">
        <div className="space-y-3">
          <div className="relative min-h-[320px] select-none sm:min-h-[420px] lg:min-h-[560px]">
            <div className="absolute inset-0 border border-[rgb(var(--green)/0.15)]" />

            <div className="pointer-events-none absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-[rgb(var(--green)/0.45)]" />
            <div className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-[rgb(var(--green)/0.25)]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-[rgb(var(--green)/0.25)]" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-[rgb(var(--green)/0.45)]" />

            <div className="absolute inset-0 overflow-hidden bg-[rgb(var(--window)/0.25)]">
              <div className="absolute inset-0">
                <Image
                  src={imageSrc}
                  alt=""
                  fill
                  className="object-cover scale-110 opacity-20 blur-2xl"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  loading="lazy"
                  fetchPriority="low"
                />
              </div>

              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:100%_12px] opacity-10" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--green)/0.04)_1px,transparent_1px)] bg-[size:20px_100%] opacity-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--neon)/0.08)] via-transparent to-[rgb(var(--green)/0.08)]" />
            </div>

            <div className="relative flex h-full min-h-[320px] items-center justify-center px-8 py-8 sm:px-10 lg:min-h-[560px]">
              <div className="relative h-[260px] w-full max-w-[980px] sm:h-[360px] lg:h-[520px]">
                <Image
                  src={imageSrc}
                  alt={active.title || "Project image"}
                  fill
                  className="object-contain object-center drop-shadow-[0_0_24px_rgb(var(--green)/0.16)]"
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 60vw, 900px"
                  priority={activeIndex === 0}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-center gap-3 font-[var(--font-ocr)] text-xs uppercase tracking-[0.14em] sm:text-sm">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous project"
                className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[rgb(var(--border)/0.5)] px-4 py-2 text-[rgb(var(--text-secondary))] transition hover:bg-[rgb(var(--green)/0.1)] hover:text-[rgb(var(--green))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--green)/0.4)]"
              >
                ← Prev
              </button>

              <div
                aria-live="polite"
                className="min-w-[96px] border border-[rgb(var(--border)/0.4)] px-3 py-2 text-center text-[rgb(var(--text-secondary))]"
              >
                {countLabel}
              </div>

              <button
                type="button"
                onClick={goNext}
                aria-label="Next project"
                className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[rgb(var(--border)/0.5)] px-4 py-2 text-[rgb(var(--text-secondary))] transition hover:bg-[rgb(var(--green)/0.1)] hover:text-[rgb(var(--green))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--green)/0.4)]"
              >
                Next →
              </button>
            </div>

            <Link
              href="/projects"
              className="text-center font-[var(--font-ibm)] text-sm text-[rgb(var(--text-secondary))] underline decoration-[rgb(var(--border)/0.5)] underline-offset-4 transition hover:text-[rgb(var(--green))] hover:decoration-[rgb(var(--green)/0.5)] sm:text-right"
            >
              Browse all projects →
            </Link>
          </div>
        </div>

        <div className="relative flex h-full min-w-0 flex-col justify-between border-l border-[rgb(var(--green)/0.1)] pl-0 lg:pl-6">
          <div
            {...swipeBindings}
            className="space-y-6 select-none"
            style={{
              touchAction: "pan-y",
              transform: `translate3d(${dragOffset}px, 0, 0)`,
              transition: dragOffset === 0 ? "transform 180ms ease-out" : "none",
            }}
          >
            <div className="min-w-0">
              <div className="font-[var(--font-ocr)] text-xs uppercase tracking-[0.18em] text-[rgb(var(--text-label))] sm:text-sm">
                Featured Deployment
              </div>

              <h3 className="mt-2 break-words font-[var(--font-ibm)] text-2xl uppercase leading-tight tracking-[0.04em] text-[rgb(var(--green))] sm:text-3xl">
                {active.title}
              </h3>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-[rgb(var(--green)/0.35)] to-transparent" />

            {active.description ? (
              <p className="max-w-[68ch] font-[var(--font-ibm)] text-sm leading-7 text-[rgb(var(--text-secondary))] sm:text-base">
                {active.description}
              </p>
            ) : null}

            {proofBullets.length > 0 ? (
              <div className="space-y-3">
                <div className="font-[var(--font-ocr)] text-xs uppercase tracking-wider text-[rgb(var(--text-label))]">
                  Proof
                </div>
                <ul className="space-y-2.5">
                  {proofBullets.map((line) => (
                    <li key={line} className="flex items-start gap-3 font-[var(--font-ibm)] text-sm text-[rgb(var(--text-secondary))]">
                      <span className="mt-[0.45rem] h-[6px] w-[6px] shrink-0 bg-[rgb(var(--green))] shadow-[0_0_8px_rgb(var(--green)/0.45)]" />
                      <span className="min-w-0 break-words">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {tags.length > 0 ? (
              <div className="space-y-3">
                <div className="font-[var(--font-ocr)] text-xs uppercase tracking-wider text-[rgb(var(--text-label))]">
                  Stack
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-[rgb(var(--neon)/0.2)] bg-[rgb(var(--window)/0.35)] px-2 py-1 font-[var(--font-ocr)] text-xs uppercase tracking-wider text-[rgb(var(--text-label))]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {ctas.map((cta) => {
              const base =
                "inline-flex cursor-pointer items-center justify-center border px-5 py-2.5 text-sm uppercase tracking-[0.22em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--green)/0.4)]";

              const variantClass =
                cta.variant === "primary"
                  ? "border-[rgb(var(--green)/0.35)] text-[rgb(var(--green))] hover:border-[rgb(var(--green)/0.7)] hover:bg-[rgb(var(--green)/0.1)]"
                  : cta.variant === "secondary"
                    ? "border-[rgb(var(--neon)/0.25)] text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--neon)/0.55)] hover:bg-[rgb(var(--neon)/0.1)] hover:text-neon"
                    : "border-[rgb(var(--border)/0.4)] text-[rgb(var(--text-meta))] hover:border-[rgb(var(--border)/0.7)] hover:bg-[rgb(var(--window)/0.2)] hover:text-[rgb(var(--text-secondary))]";

              return (
                <Link
                  key={cta.key}
                  href={cta.href}
                  target={cta.external ? "_blank" : undefined}
                  rel={cta.external ? "noopener noreferrer" : undefined}
                  className={`${base} ${variantClass}`}
                >
                  {cta.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});
