import {
  ABOUT_STATEMENT,
  CURRENTLY_BUILDING,
  IDENTITY_STATEMENT,
  LINKEDIN,
  PRIMARY_TITLE,
  PROFESSIONAL_SUMMARY,
  RESUME_PDF,
  ROLE_LINE,
  ROLE_LINE_PDF,
  SUPPORTING_LINE,
  TRAJECTORY,
} from "@/lib/data/identity";
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
    PRIMARY_TITLE,
    SUPPORTING_LINE,
    ROLE_LINE,
    ROLE_LINE_PDF,
    PROFESSIONAL_SUMMARY.join(" "),
    IDENTITY_STATEMENT,
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
  it("locks Business Systems Developer without a synonym pile", () => {
    expect(PRIMARY_TITLE).toBe("Business Systems Developer");
    expect(ROLE_LINE).toBe(PRIMARY_TITLE);
    expect(resumeData.identity.subtitle).toBe(PRIMARY_TITLE);
    expect(resumeData.identity.subtitlePdf).toBe(ROLE_LINE_PDF);
    expect(ROLE_LINE).not.toContain("Software Developer ·");
    expect(ROLE_LINE).not.toContain("AI-Native");
    expect(SUPPORTING_LINE).toContain("Full-stack development");
    expect(SUPPORTING_LINE).toContain("internal tools");
    expect(RESUME_PDF.href).toBe("/weaver_resume.pdf");
    expect(RESUME_PDF.downloadName).toBe("Stephen_Weaver_Resume.pdf");
    expect(briefData.identity.roles).toEqual(["Business Systems Developer"]);
  });

  it("shows production software in the hiring argument, not BA-who-scripts", () => {
    const text = blob();
    expect(text).toMatch(/production software/i);
    expect(IDENTITY_STATEMENT).toMatch(/write production software/i);
    expect(PROFESSIONAL_SUMMARY.join(" ")).toMatch(/Full-stack developer/i);
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
