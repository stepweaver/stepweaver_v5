import type { LineVariant } from "@/components/terminal/types";

type RoomId = string;

type Room = {
  name: string;
  desc: string;
  exits: Partial<Record<string, RoomId>>;
  items?: string[];
};

const world: Record<RoomId, Room> = {
  field: {
    name: "Open field",
    desc: "Rolling grass. A path leads north toward a rocky ridge. Something glints east in the weeds.",
    exits: { north: "ridge", east: "clearing", south: "trailhead" },
    items: ["rusty key"],
  },
  ridge: {
    name: "Rocky ridge",
    desc: "Wind whistles through stone teeth. A narrow crack leads west into darkness.",
    exits: { south: "field", west: "cave" },
  },
  cave: {
    name: "Limestone cave",
    desc: "Drip water echoes. A locked iron door blocks a tunnel south.",
    exits: { east: "ridge" },
  },
  clearing: {
    name: "Mossy clearing",
    desc: "A ring of stones surrounds cold ash. Footprints lead west back to the field.",
    exits: { west: "field" },
    items: ["note"],
  },
  trailhead: {
    name: "Trailhead",
    desc: "A weathered sign: \"RETURN NORTH TO CONTINUE\". This is the edge of the demo.",
    exits: { north: "field" },
  },
};

type AdvState = {
  active: boolean;
  room: RoomId;
  inventory: string[];
  doorUnlocked: boolean;
};

const state: AdvState = {
  active: false,
  room: "field",
  inventory: [],
  doorUnlocked: false,
};

function line(content: string, variant: LineVariant = "default") {
  return { content, variant };
}

export function startCaveAdventure(): { lines: { content: string; variant: LineVariant }[] } {
  state.active = true;
  state.room = "field";
  state.inventory = [];
  state.doorUnlocked = false;
  return {
    lines: [
      line("Cave Crawl (demo) — type look, go <dir>, take <item>, use key, inventory, exit", "success"),
      line("", "default"),
      ...describeRoom(),
    ],
  };
}

function describeRoom(): { content: string; variant: LineVariant }[] {
  const r = world[state.room];
  const lines = [
    line(r.name.toUpperCase(), "lambda"),
    line(r.desc, "default"),
    line("Exits: " + Object.keys(r.exits).join(", "), "dimmed"),
  ];
  if (r.items?.length) {
    lines.push(line("You see: " + r.items.join(", "), "default"));
  }
  if (state.room === "cave" && !state.doorUnlocked) {
    lines.push(line("The iron door is locked.", "warning"));
  }
  return lines;
}

export function handleCaveInput(raw: string): { lines: { content: string; variant: LineVariant }[]; exit?: boolean } {
  if (!state.active) {
    return { lines: [line("Adventure not running. Type zork to start.", "warning")] };
  }
  const input = raw.trim().toLowerCase();
  const tokens = input.split(/\s+/).filter(Boolean);
  const verb = tokens[0];
  const rest = tokens.slice(1).join(" ");

  if (!verb || verb === "exit" || verb === "quit" || verb === "cancel") {
    state.active = false;
    return { lines: [line("You leave the story.", "dimmed")], exit: true };
  }

  if (verb === "look" || verb === "l") {
    return { lines: describeRoom() };
  }

  if (verb === "inventory" || verb === "i") {
    return {
      lines: [
        line(state.inventory.length ? "Carrying: " + state.inventory.join(", ") : "Empty pockets.", "default"),
      ],
    };
  }

  if (verb === "go" || verb === "walk") {
    const dir = rest || tokens[1];
    if (!dir) return { lines: [line("Go where? (north south east west)", "warning")] };
    const r = world[state.room];
    const next = r.exits[dir];
    if (!next) return { lines: [line("You can't go that way.", "error")] };
    state.room = next;
    return { lines: describeRoom() };
  }

  if (["n", "s", "e", "w"].includes(verb)) {
    const map: Record<string, string> = { n: "north", s: "south", e: "east", w: "west" };
    const dir = map[verb];
    const r = world[state.room];
    const next = r.exits[dir];
    if (!next) return { lines: [line("You can't go that way.", "error")] };
    state.room = next;
    return { lines: describeRoom() };
  }

  if (verb === "take" || verb === "get") {
    const name = rest || tokens[1];
    if (!name) return { lines: [line("Take what?", "warning")] };
    const room = world[state.room];
    const idx = (room.items ?? []).findIndex((i) => i.includes(name) || name.includes(i));
    if (idx < 0) return { lines: [line("Not here.", "error")] };
    const [item] = room.items!.splice(idx, 1);
    state.inventory.push(item);
    return { lines: [line("Taken: " + item, "success")] };
  }

  if (verb === "use" && rest.includes("key")) {
    if (!state.inventory.includes("rusty key")) {
      return { lines: [line("You don't have a key.", "error")] };
    }
    if (state.room !== "cave") {
      return { lines: [line("Nothing to unlock here.", "warning")] };
    }
    state.doorUnlocked = true;
    return {
      lines: [
        line("The lock grinds open. Beyond: a faint glow.", "success"),
        line("(Demo ends — you found the exit.)", "dimmed"),
      ],
    };
  }

  return {
    lines: [line("Try: look, n/s/e/w, go north, take rusty key, use key, inventory, exit", "dimmed")],
  };
}

export function isCaveActive(): boolean {
  return state.active;
}
