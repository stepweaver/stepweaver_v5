import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProjectBySlug, getProjectSlugs } from "@/lib/data/projects";
import { ProjectSectionRenderer } from "@/components/project/section-renderer";
import { ProjectCaseChat } from "@/components/project/project-case-chat";
import type { Project } from "@/lib/data/projects.schema";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };
  const base = process.env.SITE_URL || "https://stepweaver.dev";
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
      url: `${base}/projects/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <Link
            href="/projects"
            className="text-xs text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors font-[var(--font-ocr)] tracking-wider"
          >
            ← BACK TO PROJECTS
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <aside className="space-y-4">
            <div className="surface-panel p-4">
              <div className="text-label mb-2">SYS.BRIEF</div>
              <h1 className="font-[var(--font-ibm)] text-xl text-[rgb(var(--text-color))] mb-3">
                {project.title}
              </h1>
              <StatusBadge status={project.status} />
              <p className="text-[rgb(var(--text-secondary))] text-sm mt-3">
                {project.description}
              </p>
            </div>

            {project.tags.length > 0 && (
              <div className="surface-panel p-4">
                <div className="text-label mb-2">TAGS</div>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 border border-[rgb(var(--border)/0.3)] text-[rgb(var(--text-secondary))]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(project.liveUrl || project.repoUrl || project.demoUrl) && (
              <div className="surface-panel p-4">
                <div className="text-label mb-2">LINKS</div>
                <div className="space-y-2">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      className="block text-sm text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors"
                    >
                      Live Demo →
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors"
                    >
                      GitHub →
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      className="block text-sm text-[rgb(var(--neon))] hover:text-[rgb(var(--accent))] transition-colors"
                    >
                      Demo →
                    </a>
                  )}
                </div>
              </div>
            )}

            <ProjectCaseChat slug={slug} title={project.title} summary={project.description} />
          </aside>

          <div className="space-y-6 min-w-0">
            {project.imageUrl ? (
              <div className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[480px] border border-[rgb(var(--green)/0.15)] bg-[rgb(var(--window)/0.2)] overflow-hidden">
                <div className="absolute inset-0">
                  <Image
                    src={project.imageUrl}
                    alt=""
                    fill
                    className="object-cover scale-110 opacity-15 blur-2xl"
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    priority
                  />
                </div>
                <div className="relative flex min-h-[280px] sm:min-h-[360px] lg:min-h-[480px] items-center justify-center px-6 py-8">
                  <div className="relative h-[220px] w-full max-w-[920px] sm:h-[300px] lg:h-[420px]">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-contain object-center drop-shadow-[0_0_24px_rgb(var(--green)/0.14)]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 900px"
                      priority
                    />
                  </div>
                </div>
              </div>
            ) : null}
            {project.caseStudyGallery && project.caseStudyGallery.length > 0 ? (
              <div className="surface-panel p-4">
                <div className="text-label mb-3">SCREENSHOTS</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {project.caseStudyGallery.map((shot) => (
                    <figure
                      key={shot.src}
                      className="overflow-hidden border border-[rgb(var(--border)/0.2)] bg-[rgb(var(--window)/0.2)]"
                    >
                      <div className="relative aspect-video w-full">
                        <Image
                          src={shot.src}
                          alt={shot.alt}
                          fill
                          className="object-contain object-center"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 560px"
                        />
                      </div>
                    </figure>
                  ))}
                </div>
              </div>
            ) : null}
            {project.sections.map((section) => (
              <ProjectSectionRenderer key={section.id} section={section} />
            ))}
          </div>
        </div>
      </div>
    </div>
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
