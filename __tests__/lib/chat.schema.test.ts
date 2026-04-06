import { chatBodySchema } from "@/lib/validation/chat.schema";

describe("chatBodySchema", () => {
  it("accepts optional projectCaseStudy", () => {
    const parsed = chatBodySchema.safeParse({
      messages: [{ role: "user", content: "Hello" }],
      channel: "widget",
      projectCaseStudy: {
        slug: "ai-integrations",
        title: "AI Integrations",
        summary: "Short summary of the dossier.",
      },
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.projectCaseStudy?.slug).toBe("ai-integrations");
    }
  });

  it("rejects oversized project slug", () => {
    const parsed = chatBodySchema.safeParse({
      messages: [{ role: "user", content: "x" }],
      projectCaseStudy: { slug: "x".repeat(200), title: "t", summary: "s" },
    });
    expect(parsed.success).toBe(false);
  });
});
