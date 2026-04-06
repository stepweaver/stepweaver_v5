import { parseCommand } from "@/lib/terminal/zork/parser";

describe("zork parser", () => {
  it("parses bare directions and aliases", () => {
    expect(parseCommand("n")).toEqual({ kind: "move", direction: "north" });
    expect(parseCommand("d")).toEqual({ kind: "move", direction: "down" });
    expect(parseCommand("ne")).toEqual({ kind: "move", direction: "northeast" });
    expect(parseCommand("north")).toEqual({ kind: "move", direction: "north" });
  });

  it("parses go / move + direction", () => {
    expect(parseCommand("go east")).toEqual({ kind: "move", direction: "east" });
    expect(parseCommand("move w")).toEqual({ kind: "move", direction: "west" });
  });

  it("parses enter as in", () => {
    expect(parseCommand("enter")).toEqual({ kind: "move", direction: "in" });
  });
});
