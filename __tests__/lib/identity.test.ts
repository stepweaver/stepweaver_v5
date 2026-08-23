import { ABOUT_STATEMENT, CURRENTLY_BUILDING, LINKEDIN, PROFESSIONAL_SUMMARY, ROLE_LINE, ROLE_LINE_PDF, TRAJECTORY } from "@/lib/data/identity";
import { briefData } from "@/lib/data/brief-data";
import { buildResumeHtml } from "@/lib/data/resume-html";
import { resumeData } from "@/lib/data/resume-data";

const FORBIDDEN = [
  "Specializes in Next.js",
  "AI-Native Technologist",
  "lifelong learner",
  "fast learner",
  "quick learner",
];

function blob() {
  return [
    ROLE_LINE,
    ROLE_LINE_PDF,
    PROFESSIONAL_SUMMARY.join(" "),
    ABOUT_STATEMENT,
    CURRENTLY_BUILDING.note,
    TRAJECTORY.framing,
    TRAJECTORY.items.join(" "),
    briefData.identity.statement,
    briefData.identity.roles.join(" "),
    resumeData.identity.subtitle,
    resumeData.summary.body.join(" "),
    buildResumeHtml(),
    LINKEDIN.headline,
    LINKEDIN.about,
  ].join("\n");
}

describe("career identity", () => {
  it("uses the business-systems developer line on web and PDF", () => {
    expect(resumeData.identity.subtitle).toBe(ROLE_LINE);
    expect(resumeData.identity.subtitlePdf).toBe(ROLE_LINE_PDF);
    expect(ROLE_LINE).toContain("Software Developer");
    expect(ROLE_LINE).toContain("Business Systems Developer");
    expect(ROLE_LINE).not.toContain("AI-Native");
    expect(briefData.identity.roles).toEqual(expect.arrayContaining(["Software Developer", "Business Systems Developer"]));
  });

  it("does not sell a single framework or a learner slogan", () => {
    const text = blob();
    for (const phrase of FORBIDDEN) {
      expect(text.toLowerCase()).not.toContain(phrase.toLowerCase());
    }
  });

  it("shows currently building as a lab, not a silent skills addition", () => {
    expect(resumeData.currentlyBuilding.items).toEqual(
      expect.arrayContaining(["SvelteKit", "Svelte 5", "Cloudflare", "D1", "Drizzle"])
    );
    expect(resumeData.currentlyBuilding.note.toLowerCase()).toContain("instructional");
    expect(resumeData.currentlyBuilding.href).toBe("/lab");
    expect(buildResumeHtml()).toContain("Currently building");
    expect(buildResumeHtml()).toContain("SvelteKit");
  });

  it("states the learn-what-the-problem-requires claim on About", () => {
    expect(briefData.identity.statement).toContain("tools to acquire, not boundaries");
    expect(TRAJECTORY.framing).toContain("enter a complex system, learn it, become useful");
  });
});
