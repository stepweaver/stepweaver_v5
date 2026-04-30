import { createInitialState } from "../state";
import { runCommand } from "../engine";
import { FLAG_VICTORY } from "../world/flags";

function playUntil(inputs: string[]) {
  let s = createInitialState();
  const chunks: string[] = [];
  for (const input of inputs) {
    const r = runCommand(s, input);
    s = r.state;
    chunks.push(...r.lines.map((l) => l.text));
  }
  return { state: s, text: chunks.join("\n") };
}

describe("trophy case placement", () => {
  it("does not win from the wrong room", () => {
    const steps = [
      "n",
      "e",
      "open window",
      "in",
      "take lantern",
      "move rug",
      "open trap door",
      "turn on lantern",
      "down",
      "north",
      "north",
      "sw",
      "west",
      "move debris",
      "take prism",
      // still underground here; trophy case is not present
      "put prism in case",
    ];

    const { state, text } = playUntil(steps);
    expect(state.flags[FLAG_VICTORY]).not.toBe(true);
    expect(state.gameOver).toBe(false);
    expect(text.toLowerCase()).not.toContain("completed the adventure");
  });
});

