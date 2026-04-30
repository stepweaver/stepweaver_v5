import { tryDrop } from "../actions/inventory";
import { createInitialState } from "../state";
import { FLAG_VICTORY } from "../world/flags";

describe("trophy case completion", () => {
  it("does not award victory repeatedly", () => {
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

    const r = tryDrop(seeded, "prism");
    expect(r.state.flags[FLAG_VICTORY]).toBe(true);
    expect(r.state.gameOver).toBe(false);
    expect(r.state.score).toBe(60);
  });
});

