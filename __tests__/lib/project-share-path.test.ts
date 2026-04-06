import { chooseProjectSharePath } from "@/lib/og/project-share-path";

describe("chooseProjectSharePath", () => {
  it("uses fallback when empty", () => {
    expect(chooseProjectSharePath()).toBe("/images/lambda_preview.png");
  });

  it("passes through http(s) URLs", () => {
    expect(chooseProjectSharePath("https://example.com/x.png")).toBe("https://example.com/x.png");
  });

  it("maps known webp sibling to png", () => {
    expect(chooseProjectSharePath("/images/screely-dice.webp")).toBe("/images/screely-dice.png");
  });
});
