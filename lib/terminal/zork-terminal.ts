import { describeRoom } from "@/lib/terminal/zork/actions/movement";
import { runCommand, getOpeningLines } from "@/lib/terminal/zork/engine";
import {
  createInitialState,
  type GameState,
  type OutputKind,
} from "@/lib/terminal/zork/state";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from "@/lib/terminal/zork/persistence/saveGame";
import type { LineVariant } from "@/components/terminal/types";

const zorkSession = { isActive: false };

let gameState: GameState | null = null;

function kindToVariant(kind: OutputKind): LineVariant {
  const m: Record<OutputKind, LineVariant> = {
    text: "default",
    roomTitle: "success",
    error: "error",
    dim: "dimmed",
    itemHere: "warning",
    success: "success",
    cyan: "lambda",
  };
  return m[kind];
}

function mapLines(lines: { kind: OutputKind; text: string }[]) {
  return lines.map((l) => ({
    content: l.text,
    variant: kindToVariant(l.kind),
  }));
}

export function startZorkGame(): { lines: { content: string; variant: LineVariant }[] } {
  gameState = createInitialState();
  zorkSession.isActive = true;
  return { lines: mapLines(getOpeningLines()) };
}

function isZorkGameActive(): boolean {
  return zorkSession.isActive;
}

function resetZorkGame(): void {
  gameState = null;
  zorkSession.isActive = false;
}

function handleZorkInput(
  raw: string
): { lines: { content: string; variant: LineVariant }[]; exit?: boolean } {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed === "cancel" || trimmed === "exit") {
    gameState = null;
    zorkSession.isActive = false;
    return { lines: [{ content: "Left the adventure.", variant: "dimmed" }], exit: true };
  }

  if (!gameState) {
    gameState = createInitialState();
    zorkSession.isActive = true;
  }

  if (!raw.trim()) {
    return { lines: [] };
  }

  const echo: { content: string; variant: LineVariant }[] = [
    { content: ">" + raw, variant: "dimmed" },
  ];

  const word = trimmed.split(/\s+/)[0]!;

  if (word === "save") {
    const ok = gameState ? saveToLocalStorage(gameState) : false;
    return {
      lines: [
        ...echo,
        {
          content: ok ? "Game saved." : "Could not save (storage unavailable).",
          variant: ok ? "success" : "error",
        },
      ],
    };
  }

  if (word === "restore" || word === "load") {
    const loaded = loadFromLocalStorage();
    if (!loaded) {
      return {
        lines: [...echo, { content: "No saved game found.", variant: "error" }],
      };
    }
    gameState = loaded;
    zorkSession.isActive = true;
    return {
      lines: [
        ...echo,
        { content: "Restored.", variant: "success" },
        { content: "", variant: "default" },
        ...mapLines(describeRoom(gameState, gameState.currentRoom)),
      ],
    };
  }

  if (word === "restart") {
    gameState = createInitialState();
    zorkSession.isActive = true;
    return {
      lines: [
        ...echo,
        { content: "Game restarted.", variant: "lambda" },
        { content: "", variant: "default" },
        ...mapLines(getOpeningLines()),
      ],
    };
  }

  const result = runCommand(gameState, raw);
  gameState = result.state;

  const lines = [...echo, ...mapLines(result.lines)];

  if (gameState.gameOver) {
    zorkSession.isActive = false;
    gameState = null;
    return { lines, exit: true };
  }

  return { lines };
}

// Neutral/public naming. `zork` is an internal/legacy filename only.
export const startAdventureGame = startZorkGame;
export const isAdventureGameActive = isZorkGameActive;
export const resetAdventureGame = resetZorkGame;
export const handleAdventureInput = handleZorkInput;
