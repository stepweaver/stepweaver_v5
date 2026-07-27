import { getAllProjects, getAllTags } from "@/lib/data/projects";
import { ProjectsPageClient } from "@/components/projects/projects-page-client";

export const metadata = {
  title: "Work",
  description: "Featured case studies and project archive: operations systems, internal tools, and AI-assisted workflows.",
};

export default function WorkPage() {
  const projects = getAllProjects();
  const tags = getAllTags();

  return <ProjectsPageClient projects={projects} tags={tags} />;
}
