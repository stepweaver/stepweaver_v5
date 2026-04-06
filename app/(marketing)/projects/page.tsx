import { getAllProjects, getAllTags } from "@/lib/data/projects";
import { ProjectsPageClient } from "@/components/projects/projects-page-client";

export const metadata = {
  title: "Projects",
  description: "Case studies and project showcases.",
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const tags = getAllTags();

  return <ProjectsPageClient projects={projects} tags={tags} />;
}
