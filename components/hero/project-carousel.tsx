"use client";

import { useState, useCallback } from "react";
import { getHomepageCarouselProjects } from "@/lib/data/projects";
import type { Project } from "@/lib/data/projects.schema";

const PROJECTS: Project[] = getHomepageCarouselProjects();

export function ProjectCarousel() {
  const [index, setIndex] = useState(0);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + PROJECTS.length) % PROJECTS.length);
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % PROJECTS.length);
  }, []);

  const project = PROJECTS[index];
  if (!project) return null;

  return (
    <div className="surface-panel p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-label">
          MODULE {String(index + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
        </span>
        <span className="text-xs px-2 py-0.5 border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-secondary))]">
          {project.tags[0]}
        </span>
      </div>
      <div className="text-[rgb(var(--text-color))] text-lg sm:text-xl font-[var(--font-ibm)] mb-4">
        {project.title}
      </div>
      {project.cardDescription && (
        <div className="text-[rgb(var(--text-secondary))] text-sm mb-4">
          {project.cardDescription}
        </div>
      )}
      {project.delivered && project.delivered.length > 0 && (
        <div className="space-y-1 mb-4">
          {project.delivered.slice(0, 3).map((d, i) => (
            <div key={i} className="text-xs text-[rgb(var(--text-meta))]">
              {"> "} {d}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={prev}
          className="glitch-button text-xs px-3 py-1"
          aria-label="Previous project"
        >
          PREV
        </button>
        <button
          onClick={next}
          className="glitch-button text-xs px-3 py-1"
          aria-label="Next project"
        >
          NEXT
        </button>
        <a
          href={`/projects/${project.slug}`}
          className="ml-auto text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors font-[var(--font-ocr)] tracking-wider"
        >
          VIEW CASE STUDY →
        </a>
      </div>
    </div>
  );
}
