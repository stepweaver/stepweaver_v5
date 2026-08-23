import { getProjectBySlug } from "@/lib/data/projects";

export type ProjectCaseDossier = {
  slug: string;
  title: string;
  summary: string;
};

/** Resolve case-study context from the server catalog. Client title/summary are ignored. */
export function resolveProjectCaseStudy(slug: string | undefined | null): ProjectCaseDossier | undefined {
  if (!slug || typeof slug !== "string") return undefined;
  const trimmed = slug.trim();
  if (!trimmed || trimmed.length > 160) return undefined;

  const project = getProjectBySlug(trimmed);
  if (!project) return undefined;

  return {
    slug: project.slug,
    title: project.title,
    summary: project.description.slice(0, 4000),
  };
}
