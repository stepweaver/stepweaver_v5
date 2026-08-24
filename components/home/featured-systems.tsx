import Link from "next/link";
import { getFeaturedProjects, getProjectProof } from "@/lib/data/projects";

export function FeaturedSystems() {
  const projects = getFeaturedProjects();

  return (
    <section className="relative z-30 w-full max-w-[1920px] mx-auto px-3 sm:px-5 md:px-6 lg:px-10 xl:px-14 2xl:px-16 py-10">
      <p className="font-[var(--font-ocr)] text-xs uppercase tracking-[0.28em] text-[rgb(var(--text-label))] mb-2">
        Featured systems
      </p>
      <h2 className="font-[var(--font-ibm)] text-2xl sm:text-3xl text-[rgb(var(--text-color))] mb-3">
        Six systems I shipped.
      </h2>
      <p className="text-[rgb(var(--text-secondary))] text-sm max-w-2xl mb-6">
        Each system shows a different operational problem modeled end to end: workflow, data, interface, and deployment.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[rgb(var(--border)/0.15)] border border-[rgb(var(--border)/0.2)]">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/work/${project.slug}`}
            className="bg-[rgb(var(--panel))] p-5 sm:p-6 hover:bg-[rgb(var(--neon)/0.04)] transition-colors group block"
          >
            <h3 className="font-[var(--font-ibm)] text-lg text-[rgb(var(--text-color))] group-hover:text-[rgb(var(--neon))] transition-colors mb-2">
              {project.title}
            </h3>
            <p className="text-xs font-[var(--font-ocr)] tracking-wide text-[rgb(var(--neon)/0.75)] mb-3">
              {getProjectProof(project.slug)}
            </p>
            <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed line-clamp-3">
              {project.cardDescription || project.description}
            </p>
          </Link>
        ))}
      </div>
      <p className="mt-4">
        <Link href="/work" className="text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))]">
          All selected work →
        </Link>
      </p>
    </section>
  );
}
