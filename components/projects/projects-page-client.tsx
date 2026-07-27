"use client";

import Link from "next/link";
import { useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Project } from "@/lib/data/projects.schema";
import { FEATURED_SLUGS } from "@/lib/data/projects";

function ProjectsPageInner({ projects, tags }: { projects: Project[]; tags: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag")?.trim() ?? "";

  const sortedTags = useMemo(() => [...tags].sort((a, b) => a.localeCompare(b)), [tags]);

  const featured = useMemo(() => {
    const map = new Map(projects.map((p) => [p.slug, p]));
    return FEATURED_SLUGS.map((slug) => map.get(slug)).filter((p): p is Project => p !== undefined);
  }, [projects]);

  const featuredSlugSet = useMemo(() => new Set(FEATURED_SLUGS as readonly string[]), []);

  const archive = useMemo(() => {
    const rest = projects.filter((p) => !featuredSlugSet.has(p.slug));
    return activeTag ? rest.filter((p) => p.tags.includes(activeTag)) : rest;
  }, [projects, activeTag, featuredSlugSet]);

  const filteredFeatured = useMemo(
    () => (activeTag ? featured.filter((p) => p.tags.includes(activeTag)) : featured),
    [featured, activeTag]
  );

  const setTag = useCallback(
    (tag: string) => {
      const q = new URLSearchParams(searchParams.toString());
      if (tag) q.set("tag", tag);
      else q.delete("tag");
      const query = q.toString();
      router.replace(query ? `/work?${query}` : "/work", { scroll: false });
    },
    [router, searchParams]
  );

  const shownCount = filteredFeatured.length + archive.length;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
            {"// WORK"}
          </div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))] mb-4">
            Selected Work
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm max-w-2xl">
            Flagship case studies first: operations systems, internal tools, and AI-assisted workflows, then the full archive.
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 min-w-0">
            <label htmlFor="project-tag-filter" className="text-label block mb-2">
              FILTER BY TAG
            </label>
            <select
              id="project-tag-filter"
              value={activeTag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full max-w-md bg-[rgb(var(--window))] border border-[rgb(var(--neon)/0.35)] text-[rgb(var(--text-color))] font-[var(--font-ocr)] text-sm px-3 py-2 rounded-sm focus:border-[rgb(var(--neon))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--neon)/0.4)]"
            >
              <option value="">All work ({projects.length})</option>
              {sortedTags.map((tag) => {
                const count = projects.filter((p) => p.tags.includes(tag)).length;
                return (
                  <option key={tag} value={tag}>
                    {tag} ({count})
                  </option>
                );
              })}
            </select>
          </div>
          {activeTag ? (
            <button
              type="button"
              onClick={() => setTag("")}
              className="text-xs font-[var(--font-ocr)] text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] underline underline-offset-2 self-start sm:self-auto"
            >
              Clear filter
            </button>
          ) : null}
        </div>

        <p className="text-[rgb(var(--text-meta))] text-xs font-mono mb-4">
          Showing {shownCount} of {projects.length}
          {activeTag ? ` · tag “${activeTag}”` : ""}
        </p>

        {filteredFeatured.length > 0 ? (
          <section className="mb-10">
            <div className="text-label mb-3">FLAGSHIP</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
              {filteredFeatured.map((project) => (
                <ProjectCard key={project.slug} project={project} featured />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <div className="text-label mb-3">ARCHIVE</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
            {archive.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>

        {shownCount === 0 ? (
          <p className="text-[rgb(var(--text-secondary))] text-sm mt-8">No projects match this tag.</p>
        ) : null}
      </div>
    </div>
  );
}

function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="bg-[rgb(var(--panel))] p-6 hover:bg-[rgb(var(--neon)/0.03)] transition-colors group block"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-[rgb(var(--text-label))]">{project.slug.toUpperCase().replace(/-/g, "_")}</div>
        <StatusBadge status={project.status} />
      </div>
      <h2 className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))] group-hover:text-[rgb(var(--neon))] transition-colors mb-2">
        {project.title}
      </h2>
      <p className={`text-[rgb(var(--text-secondary))] text-sm mb-4 ${featured ? "" : "line-clamp-2"}`}>
        {project.description}
      </p>
      {featured && (project.builtFor || project.solved) ? (
        <p className="text-[rgb(var(--text-meta))] text-xs mb-4 line-clamp-2">
          {[project.builtFor, project.solved].filter(Boolean).join(" · ")}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {project.tags.slice(0, 6).map((tag) => (
          <span
            key={tag}
            className="text-xs px-1.5 py-0.5 border border-[rgb(var(--border)/0.2)] text-[rgb(var(--text-meta))]"
          >
            {tag}
          </span>
        ))}
        {project.tags.length > 6 ? (
          <span className="text-xs px-1.5 py-0.5 text-[rgb(var(--muted-color))]">+{project.tags.length - 6}</span>
        ) : null}
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: Project["status"] }) {
  const colors: Record<Project["status"], string> = {
    live: "text-[rgb(var(--neon))]",
    demo: "text-[rgb(var(--accent))]",
    "coming-soon": "text-[rgb(var(--warn))]",
    archived: "text-[rgb(var(--muted-color))]",
  };
  return (
    <span className={`text-xs font-[var(--font-ocr)] tracking-wider ${colors[status]}`}>
      [{status.toUpperCase()}]
    </span>
  );
}

export function ProjectsPageClient(props: { projects: Project[]; tags: string[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20" />}>
      <ProjectsPageInner {...props} />
    </Suspense>
  );
}
