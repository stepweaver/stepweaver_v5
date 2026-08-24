import { getFeaturedProjects } from "@/lib/data/projects";
import { ProjectsPageClient } from "@/components/projects/projects-page-client";

export const metadata = {
  title: "Work",
  description:
    "Six production systems: operational workflows, realtime apps, automation with AI boundaries, and internal tools.",
};

export default function WorkPage() {
  const projects = getFeaturedProjects();
  return <ProjectsPageClient projects={projects} />;
}
