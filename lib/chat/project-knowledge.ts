import type { Project, ProjectSection } from "@/lib/data/projects.schema";
import { getAllProjects } from "@/lib/data/projects";

/**
 * Detailed project text fed into λlambda’s system prompt. Groq on-demand tiers enforce a low
 * TPM ceiling (~12.8k); the full catalog at 95k chars blows past that (~16k+ tokens).
 * Default stays conservative; raise via PORTFOLIO_KNOWLEDGE_MAX_CHARS or upgrade Groq / use OpenAI fallback.
 */
function maxDetailedChars(): number {
  const raw = process.env.PORTFOLIO_KNOWLEDGE_MAX_CHARS;
  const parsed = raw ? Number.parseInt(raw.trim(), 10) : NaN;
  const fallback = 12_000;
  if (!Number.isFinite(parsed) || parsed < 4_000) return fallback;
  return Math.min(parsed, 95_000);
}

function cleanText(value: string): string {
  return String(value ?? "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function indent(text: string, spaces = 2): string {
  const pad = " ".repeat(spaces);
  return cleanText(text)
    .split("\n")
    .map((line) => (line ? `${pad}${line}` : ""))
    .join("\n");
}

function deriveKind(status: Project["status"]): string {
  if (status === "coming-soon") return "in-progress";
  if (status === "demo") return "demo";
  return "project";
}

function formatSection(section: ProjectSection): string {
  const lines: string[] = [];
  lines.push(`${section.title} (${section.type}):`);
  if (section.content) {
    lines.push(indent(section.content, 2));
  }
  if (section.bullets?.length) {
    lines.push(indent(section.bullets.map((b) => `- ${cleanText(b)}`).join("\n"), 2));
  }
  if (section.items?.length) {
    const body = section.items
      .map((it) => `- ${it.label}${it.description ? `: ${it.description}` : ""}`)
      .join("\n");
    lines.push(indent(body, 2));
  }
  if (section.techStack?.length) {
    const body = section.techStack.map((t) => `- ${t.name}${t.category ? ` (${t.category})` : ""}`).join("\n");
    lines.push(indent(`Tech:\n${indent(body, 2)}`, 2));
  }
  if (section.evidence?.length) {
    const body = section.evidence.map((e) => `- ${e.label}: ${e.value}`).join("\n");
    lines.push(indent(body, 2));
  }
  return lines.filter(Boolean).join("\n");
}

function formatProjectDetail(project: Project): string {
  const lines: string[] = [];
  lines.push(`Slug: ${project.slug}`);
  lines.push(`Title: ${project.title}`);
  lines.push(`Kind: ${deriveKind(project.status)}`);
  lines.push(`Status: ${project.status}`);
  lines.push(`Description: ${cleanText(project.description)}`);
  if (project.cardDescription && project.cardDescription !== project.description) {
    lines.push(`Card description: ${cleanText(project.cardDescription)}`);
  }
  if (project.builtFor) lines.push(`Built for: ${cleanText(project.builtFor)}`);
  if (project.solved) lines.push(`Solved: ${cleanText(project.solved)}`);
  if (project.delivered?.length) {
    lines.push(`Delivered:\n${indent(project.delivered.map((d) => `- ${cleanText(d)}`).join("\n"), 2)}`);
  }
  if (project.tags?.length) lines.push(`Tags: ${project.tags.join(", ")}`);
  if (project.keywords?.length) lines.push(`Keywords: ${project.keywords.join(", ")}`);
  if (project.link) lines.push(`Link: ${project.link}`);
  if (project.githubRepo) lines.push(`GitHub: ${project.githubRepo}`);
  if (project.demoUrl) lines.push(`Demo URL: ${project.demoUrl}`);
  if (project.liveUrl) lines.push(`Live URL: ${project.liveUrl}`);
  if (project.repoUrl) lines.push(`Repo URL: ${project.repoUrl}`);
  if (project.caseStudyGallery?.length) {
    const body = project.caseStudyGallery.map((g) => `- ${g.src} (${g.alt})`).join("\n");
    lines.push(`Case study gallery:\n${indent(body, 2)}`);
  }

  for (const section of project.sections) {
    const block = formatSection(section);
    if (block) {
      lines.push("");
      lines.push(block);
    }
  }

  return lines.join("\n");
}

function buildProjectIndexBlock(): string {
  return getAllProjects()
    .map((project) => {
      const preview = cleanText(project.cardDescription || project.description);
      return `- ${project.title} [${project.slug}] (${deriveKind(project.status)}) - ${preview}`;
    })
    .join("\n");
}

function buildProjectKnowledgeBlock(): string {
  const parts = getAllProjects().map((project) => {
    const body = formatProjectDetail(project);
    return [`=== ${project.title} ===`, body].join("\n");
  });
  const cap = maxDetailedChars();
  let combined = parts.join("\n\n");
  if (combined.length > cap) {
    combined =
      combined.slice(0, cap) +
      "\n\n[Portfolio knowledge truncated for size. Prefer the project index and ask for specifics.]";
  }
  return combined;
}

export function buildProjectAppendix(): string {
  const index = buildProjectIndexBlock();
  const detail = buildProjectKnowledgeBlock();
  return `
Portfolio project index:
${index}

Detailed portfolio project knowledge:
${detail}

Project-answering rules:
- When asked about Stephen's work, answer from the project records first.
- Use exact project titles and be consistent about naming.
- Distinguish clearly between shipped projects, service entries, demos, and in-progress builds.
- Do not present a service page as if it were a public SaaS product unless the project record proves that.
- Do not invent metrics, users, clients, or implementation details that are not present in the project records.
- When a project is in progress, say that plainly.
- Prefer concrete architecture, UX, and boundary decisions over vague hype.
`.trim();
}
