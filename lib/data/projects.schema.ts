import { z } from "zod";

export const ProjectSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum([
    "overview",
    "problem",
    "solution",
    "architecture",
    "features",
    "engineering",
    "outcome",
    "tradeoffs",
    "tech-stack",
    "evidence-bar",
    "terminal-integration",
    "key-features",
    "project-structure",
    "keyboard-shortcuts",
    "data-flow",
  ]),
  content: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  items: z.array(z.object({
    label: z.string(),
    description: z.string().optional(),
  })).optional(),
  techStack: z.array(z.object({
    name: z.string(),
    category: z.string().optional(),
    icon: z.string().optional(),
  })).optional(),
  evidence: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
}).strict();

export const ProjectSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["live", "demo", "coming-soon", "archived"]),
  tags: z.array(z.string()),
  keywords: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  link: z.string().optional(),
  githubRepo: z.string().optional(),

  // Card preview
  cardDescription: z.string().optional(),
  cardBuiltFor: z.string().optional(),
  cardSolved: z.string().optional(),
  cardDelivered: z.array(z.string()).optional(),

  // Proof bullets (for carousel/services)
  builtFor: z.string().optional(),
  solved: z.string().optional(),
  delivered: z.array(z.string()).optional(),

  // Case study sections
  sections: z.array(ProjectSectionSchema),

  /** Optional extra figures below the hero on the project detail page */
  caseStudyGallery: z
    .array(
      z.object({
        src: z.string(),
        alt: z.string(),
      })
    )
    .optional(),

  // Optional demo/live/repo links
  demoUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  repoUrl: z.string().optional(),
}).strict();

export type ProjectSection = z.infer<typeof ProjectSectionSchema>;
export type Project = z.infer<typeof ProjectSchema>;
