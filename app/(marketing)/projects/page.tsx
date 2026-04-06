import Link from "next/link";
import { getAllProjects, getAllTags } from "@/lib/data/projects";
import type { Project } from "@/lib/data/projects.schema";

export const metadata = {
  title: "Projects",
  description: "Case studies and project showcases.",
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const tags = getAllTags();

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

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-label self-center mr-2">FILTER:</span>
          <span className="text-xs px-2 py-0.5 border border-[rgb(var(--neon)/0.4)] text-[rgb(var(--neon))]">
            All ({projects.length})
          </span>
          {tags.map((tag) => {
            const count = projects.filter((p) => p.tags.includes(tag)).length;
            return (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-secondary))]"
              >
                {tag} ({count})
              </span>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
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
        <div className="text-[rgb(var(--text-label))]">
          {project.slug.toUpperCase().replace(/-/g, "_")}
        </div>
        <StatusBadge status={project.status} />
      </div>
      <h2 className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))] group-hover:text-[rgb(var(--neon))] transition-colors mb-2">
        {project.title}
      </h2>
      <p className="text-[rgb(var(--text-secondary))] text-sm mb-4 line-clamp-2">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
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
