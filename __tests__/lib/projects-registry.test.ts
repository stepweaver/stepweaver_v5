import { getAllProjects, getProjectBySlug, getHomepageCarouselProjects, getAllTags, getProjectsByTag, getProjectSlugs } from "@/lib/data/projects";

describe("projects registry", () => {
  it("returns all projects", () => {
    const projects = getAllProjects();
    expect(projects.length).toBeGreaterThan(0);
  });

  it("finds project by slug", () => {
    const project = getProjectBySlug("ai-integrations");
    expect(project).toBeDefined();
    expect(project?.title).toBe("AI Integrations");
  });

  it("returns undefined for unknown slug", () => {
    const project = getProjectBySlug("nonexistent");
    expect(project).toBeUndefined();
  });

  it("returns carousel projects", () => {
    const carousel = getHomepageCarouselProjects();
    expect(carousel.length).toBe(8);
    expect(carousel[0].slug).toBe("stepweaver-dev");
  });

  it("returns all unique tags", () => {
    const tags = getAllTags();
    expect(tags.length).toBeGreaterThan(0);
    expect(tags).toEqual([...tags].sort());
  });

  it("filters projects by tag", () => {
    const aiProjects = getProjectsByTag("Next.js");
    expect(aiProjects.length).toBeGreaterThan(0);
    aiProjects.forEach((p) => expect(p.tags).toContain("Next.js"));
  });

  it("returns all project slugs", () => {
    const slugs = getProjectSlugs();
    expect(slugs.length).toBe(getAllProjects().length);
  });

  it("each project has required fields", () => {
    const projects = getAllProjects();
    for (const p of projects) {
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.status).toBeTruthy();
      expect(p.tags.length).toBeGreaterThan(0);
      expect(p.sections.length).toBeGreaterThan(0);
    }
  });

  it("each section has valid type", () => {
    const validTypes = [
      "overview", "problem", "solution", "architecture", "features",
      "engineering", "outcome", "tradeoffs", "tech-stack", "evidence-bar",
      "terminal-integration", "key-features", "project-structure", "keyboard-shortcuts",
    ];
    const projects = getAllProjects();
    for (const p of projects) {
      for (const s of p.sections) {
        expect(validTypes).toContain(s.type);
        expect(s.id).toBeTruthy();
        expect(s.title).toBeTruthy();
      }
    }
  });
});
