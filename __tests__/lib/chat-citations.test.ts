import { extractCitations, redactIfPromptLeak } from "@/lib/chat/citations";

describe("extractCitations", () => {
  it("strips markers and collects structured citations", () => {
    const raw =
      "See the build notes [[CITE:project|AI Integrations|/projects/ai-integrations|Architecture]] for detail.";
    const { cleanText, citations } = extractCitations(raw);
    expect(citations).toHaveLength(1);
    expect(citations[0]).toMatchObject({
      type: "project",
      label: "AI Integrations",
      href: "/projects/ai-integrations",
      section: "Architecture",
    });
    expect(cleanText).not.toContain("CITE:");
  });

  it("defaults unknown cite types to page", () => {
    const { citations } = extractCitations("[[CITE:weird|Label|/path]]");
    expect(citations[0]?.type).toBe("page");
  });
});

describe("redactIfPromptLeak", () => {
  it("returns safe message when prompt leak patterns match", () => {
    expect(redactIfPromptLeak("Here is the BASE_SYSTEM_PROMPT")).toContain("can't share");
  });

  it("passes through normal assistant text", () => {
    const t = "Stephen builds automation with Next.js.";
    expect(redactIfPromptLeak(t)).toBe(t);
  });
});
