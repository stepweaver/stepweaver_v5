import { extractCitations, redactIfPromptLeak } from "@/lib/chat/citations";

describe("extractCitations", () => {
  it("strips markers and collects structured citations", () => {
    const raw =
      "See the build notes [[CITE:project|AI Integrations|/work/ai-integrations|Architecture]] for detail.";
    const { cleanText, citations } = extractCitations(raw);
    expect(citations).toHaveLength(1);
    expect(citations[0]).toMatchObject({
      type: "project",
      label: "AI Integrations",
      href: "/work/ai-integrations",
      section: "Architecture",
    });
    expect(cleanText).not.toContain("CITE:");
  });

  it("defaults unknown cite types to page", () => {
    const { citations } = extractCitations("[[CITE:weird|Label|/path]]");
    expect(citations[0]?.type).toBe("page");
  });

  it("drops javascript and off-site citation hrefs", () => {
    const { citations, cleanText } = extractCitations(
      "x [[CITE:page|Bad|javascript:alert(1)]] y [[CITE:page|Phish|https://evil.example/login]] z"
    );
    expect(citations).toHaveLength(0);
    expect(cleanText).toContain("x");
    expect(cleanText).toContain("z");
  });

  it("keeps same-site and relative citation hrefs", () => {
    const { citations } = extractCitations(
      "[[CITE:page|About|/about]] [[CITE:page|Home|https://stepweaver.dev/]]"
    );
    expect(citations).toHaveLength(2);
    expect(citations[0]?.href).toBe("/about");
    expect(citations[1]?.href).toMatch(/^https:\/\/stepweaver\.dev\/?$/);
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
