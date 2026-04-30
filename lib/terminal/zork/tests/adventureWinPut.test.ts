import { createInitialState, SCORE_MAX } from "../state";
import { runCommand } from "../engine";
import { FLAG_ARTIFACT_PLACED, FLAG_VICTORY } from "../world/flags";

function transcript(inputs: string[]) {
  let s = createInitialState();
  const chunks: string[] = [];
  for (const input of inputs) {
    const r = runCommand(s, input);
    s = r.state;
    chunks.push(...r.lines.map((l) => l.text));
    if (s.gameOver) break;
  }
  return { state: s, text: chunks.join("\n") };
}

describe("mini-adventure win condition (trophy case placement)", () => {
  it("wins via put prism in case with deterministic score", () => {
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
      "east",
      "ne",
      "south",
      "south",
      "up",
      "west",
      "put prism in case",
    ];

    const { state, text } = transcript(steps);
    expect(state.gameOver).toBe(true);
    expect(state.flags[FLAG_VICTORY]).toBe(true);
    expect(state.flags[FLAG_ARTIFACT_PLACED]).toBe(true);
    expect(state.score).toBe(SCORE_MAX);
    expect(text.toLowerCase()).toContain("completed the adventure");
  });
});

