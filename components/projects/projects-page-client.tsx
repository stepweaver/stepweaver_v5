"use client";

import Link from "next/link";
import { Suspense } from "react";
import type { Project } from "@/lib/data/projects.schema";
import { FEATURED_SLUGS, getProjectProof } from "@/lib/data/projects";

function ProjectsPageInner({ projects }: { projects: Project[] }) {
  const map = new Map(projects.map((p) => [p.slug, p]));
  const featured = FEATURED_SLUGS.map((slug) => map.get(slug)).filter((p): p is Project => p !== undefined);

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
            Six production systems that show how I turn operational problems into working software. Frontend, backend, data, and the messy middle.
          </p>
        </div>

        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
            {featured.map((project) => (
              <ProjectCard key={project.slug} project={project} featured />
            ))}
          </div>
        </section>

        <p className="text-sm text-[rgb(var(--text-secondary))]">
          Additional case studies live in the{" "}
          <Link href="/work/archive" className="text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))]">
            archive
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const proof = getProjectProof(project.slug);

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
      {proof ? (
        <p className="text-xs font-[var(--font-ocr)] tracking-wide text-[rgb(var(--neon)/0.75)] mb-3">{proof}</p>
      ) : null}
      <p className={`text-[rgb(var(--text-secondary))] text-sm mb-4 ${featured ? "" : "line-clamp-2"}`}>
        {project.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {project.tags.slice(0, 6).map((tag) => (
          <span
            key={tag}
            className="text-xs px-1.5 py-0.5 border border-[rgb(var(--border)/0.2)] text-[rgb(var(--text-meta))]"
          >
            {tag}
          </span>
        ))}
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

export function ProjectsPageClient(props: { projects: Project[]; tags?: string[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20" />}>
      <ProjectsPageInner projects={props.projects} />
    </Suspense>
  );
}
