import { getArchiveProjects } from "@/lib/data/projects";
import { ArchivePageClient } from "@/components/projects/archive-page-client";

export const metadata = {
  title: "Work archive",
  description: "Additional case studies beyond the six hiring proofs.",
};

export default function WorkArchivePage() {
  const projects = getArchiveProjects();
  const tags = [...new Set(projects.flatMap((p) => p.tags))].sort();
  return <ArchivePageClient projects={projects} tags={tags} />;
}
