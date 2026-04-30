import { createInitialState } from "../state";
import { runCommand } from "../engine";
import { FLAG_VICTORY } from "../world/flags";

describe("trophy case completion (put/place/insert)", () => {
  it("does not award victory points repeatedly", () => {
    const s = createInitialState();
    const seeded = {
      ...s,
      currentRoom: "living-room",
      inventory: ["signal-prism"],
      score: 60,
      flags: { ...s.flags, [FLAG_VICTORY]: true },
      gameOver: false,
      roomVisited: { ...s.roomVisited, "living-room": true },
    };

    const r = runCommand(seeded, "put prism in case");
    expect(r.state.flags[FLAG_VICTORY]).toBe(true);
    expect(r.state.gameOver).toBe(false);
    expect(r.state.score).toBe(60);
  });
});

