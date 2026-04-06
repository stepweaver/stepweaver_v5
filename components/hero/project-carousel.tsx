"use client";

import { getHomepageCarouselProjects } from "@/lib/data/projects";
import { ProjectDossier } from "@/components/hero/project-dossier";

const PROJECTS = getHomepageCarouselProjects();

export function ProjectCarousel() {
  return (
    <div className="w-full relative mt-8 sm:mt-16">
      <ProjectDossier projects={PROJECTS} />
    </div>
  );
}
