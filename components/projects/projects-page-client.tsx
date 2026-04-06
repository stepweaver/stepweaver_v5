"use client";

import Link from "next/link";
import { useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Project } from "@/lib/data/projects.schema";

function ProjectsPageInner({ projects, tags }: { projects: Project[]; tags: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag")?.trim() ?? "";

  const sortedTags = useMemo(() => [...tags].sort((a, b) => a.localeCompare(b)), [tags]);

  const filtered = useMemo(
    () => (activeTag ? projects.filter((p) => p.tags.includes(activeTag)) : projects),
    [projects, activeTag]
  );

  const setTag = useCallback(
    (tag: string) => {
      const q = new URLSearchParams(searchParams.toString());
      if (tag) q.set("tag", tag);
      else q.delete("tag");
      const query = q.toString();
      router.replace(query ? `/projects?${query}` : "/projects", { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
            {"// PROJECTS"}
          </div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))] mb-4">
            Case Studies
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm max-w-2xl">
            Deep dives into systems I have designed and built. Each project includes architecture decisions, engineering tradeoffs, and outcomes.
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
              <option value="">All projects ({projects.length})</option>
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
          Showing {filtered.length} of {projects.length}
          {activeTag ? ` · tag “${activeTag}”` : ""}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          {filtered.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-[rgb(var(--text-secondary))] text-sm mt-8">No projects match this tag.</p>
        ) : null}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="bg-[rgb(var(--panel))] p-6 hover:bg-[rgb(var(--neon)/0.03)] transition-colors group block"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-[rgb(var(--text-label))]">{project.slug.toUpperCase().replace(/-/g, "_")}</div>
        <StatusBadge status={project.status} />
      </div>
      <h2 className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))] group-hover:text-[rgb(var(--neon))] transition-colors mb-2">
        {project.title}
      </h2>
      <p className="text-[rgb(var(--text-secondary))] text-sm mb-4 line-clamp-2">{project.description}</p>
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
