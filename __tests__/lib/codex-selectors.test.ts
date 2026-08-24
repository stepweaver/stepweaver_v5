import { partitionProfessionalPosts, type CodexPost } from "@/lib/codex/selectors";

function post(overrides: Partial<CodexPost> & Pick<CodexPost, "slug" | "title">): CodexPost {
  return {
    date: "2026-01-01",
    updated: null,
    description: "",
    hashtags: [],
    ...overrides,
  };
}

describe("writing hierarchy", () => {
  it("lists professional/technical posts before other notes", () => {
    const ladybugs = post({ slug: "ladybugs", title: "Ladybugs", hashtags: ["nature"] });
    const systems = post({
      slug: "systems-note",
      title: "Systems note",
      hashtags: ["systems"],
      date: "2025-12-01",
    });
    const { professional, other } = partitionProfessionalPosts([ladybugs, systems]);
    expect(professional.map((p) => p.slug)).toEqual(["systems-note"]);
    expect(other.map((p) => p.slug)).toEqual(["ladybugs"]);
  });
});
