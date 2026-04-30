import { createInitialState } from "../state";
import { runCommand } from "../engine";

function step(state: ReturnType<typeof createInitialState>, input: string) {
  return runCommand(state, input).state;
}

describe("carried container interaction", () => {
  it("allows opening a carried container and taking its contents", () => {
    let s = createInitialState();
    // Reach the kitchen where the sack starts.
    s = step(s, "n");
    s = step(s, "e");
    s = step(s, "open window");
    s = step(s, "in");
    s = step(s, "e");

    s = step(s, "take sack");
    expect(s.inventory).toContain("sack");

    s = step(s, "open sack");
    expect(s.itemStates.sack?.isOpen).toBe(true);

    s = step(s, "take garlic");
    expect(s.inventory).toContain("garlic");
  });
});

