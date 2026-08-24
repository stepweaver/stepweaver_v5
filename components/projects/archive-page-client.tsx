"use client";

import Link from "next/link";
import { useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Project } from "@/lib/data/projects.schema";
import { ProjectCard } from "@/components/projects/projects-page-client";

function ArchiveInner({ projects, tags }: { projects: Project[]; tags: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag")?.trim() ?? "";
  const sortedTags = useMemo(() => [...tags].sort((a, b) => a.localeCompare(b)), [tags]);
  const visible = useMemo(
    () => (activeTag ? projects.filter((p) => p.tags.includes(activeTag)) : projects),
    [projects, activeTag]
  );

  const setTag = useCallback(
    (tag: string) => {
      const q = new URLSearchParams(searchParams.toString());
      if (tag) q.set("tag", tag);
      else q.delete("tag");
      const query = q.toString();
      router.replace(query ? `/work/archive?${query}` : "/work/archive", { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">
            {"// ARCHIVE"}
          </div>
          <h1 className="font-[var(--font-ibm)] text-3xl sm:text-4xl text-[rgb(var(--text-color))] mb-4">
            Work archive
          </h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm max-w-2xl mb-4">
            Additional case studies. The hiring argument lives on{" "}
            <Link href="/work" className="text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))]">
              selected work
            </Link>
            .
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="archive-tag-filter" className="text-label block mb-2">
            FILTER BY TAG
          </label>
          <select
            id="archive-tag-filter"
            value={activeTag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full max-w-md bg-[rgb(var(--window))] border border-[rgb(var(--neon)/0.35)] text-[rgb(var(--text-color))] font-[var(--font-ocr)] text-sm px-3 py-2 rounded-sm focus:border-[rgb(var(--neon))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--neon)/0.4)]"
          >
            <option value="">All archive ({projects.length})</option>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          {visible.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ArchivePageClient(props: { projects: Project[]; tags: string[] }) {
  return (
    <Suspense fallback={<div className="min-h-screen pt-20" />}>
      <ArchiveInner {...props} />
    </Suspense>
  );
}
