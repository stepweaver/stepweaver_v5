import type { Direction } from './direction';
import { ITEMS, type ItemDef } from './world/items';
import { ROOMS, type RoomDef } from './world/rooms';

export type { Direction } from './direction';

export type OutputKind =
  | 'text'
  | 'roomTitle'
  | 'error'
  | 'dim'
  | 'itemHere'
  | 'success'
  | 'cyan';

export interface OutputLine {
  kind: OutputKind;
  text: string;
}

export interface GameState {
  currentRoom: string;
  inventory: string[];
  /** Items physically present in each room (not inside closed containers). */
  roomItems: Record<string, string[]>;
  /** Open/moved flags per item id. */
  itemStates: Record<string, { isOpen?: boolean; moved?: boolean }>;
  /** Contents still inside a container (open or closed). */
  containerContents: Record<string, string[]>;
  /** Per-room exit additions/overrides (e.g. window → in, trap door → down). */
  exitOverrides: Record<string, Partial<Record<Direction, string>>>;
  roomVisited: Record<string, boolean>;
  flags: Record<string, boolean>;
  score: number;
  moves: number;
  lampOn: boolean;
  lampFuel: number;
  gameOver: boolean;
  pendingQuitConfirm: boolean;
}

export const LAMP_ITEM_ID = 'lamp';
export const SCORE_MAX = 100;

export function emptyOutput(): OutputLine[] {
  return [];
}

export function line(kind: OutputKind, text: string): OutputLine {
  return { kind, text };
}

export function textLines(text: string, kind: OutputKind = 'text'): OutputLine[] {
  return text.split('\n').map((t) => line(kind, t));
}

export function getRoomDef(roomId: string): RoomDef | undefined {
  return ROOMS[roomId];
}

export function getItemDef(itemId: string): ItemDef | undefined {
  return ITEMS[itemId];
}

export function getEffectiveExits(
  state: GameState,
  roomId: string
): Partial<Record<Direction, string>> {
  const base = { ...(ROOMS[roomId]?.exits ?? {}) };
  const over = state.exitOverrides[roomId];
  if (!over) return base;
  return { ...base, ...over };
}

export function hasLight(state: GameState): boolean {
  if (!state.lampOn) return false;
  return state.inventory.includes(LAMP_ITEM_ID);
}

export function isPitchBlack(state: GameState): boolean {
  const room = ROOMS[state.currentRoom];
  if (!room?.dark) return false;
  return !hasLight(state);
}

export function isItemOpen(state: GameState, itemId: string): boolean {
  return state.itemStates[itemId]?.isOpen === true;
}

export function getVisibleItemIdsInRoom(state: GameState, roomId: string): string[] {
  const inRoom = [...(state.roomItems[roomId] ?? [])];
  for (const itemId of inRoom) {
    const def = ITEMS[itemId];
    if (def?.openable && isItemOpen(state, itemId)) {
      const inside = state.containerContents[itemId] ?? [];
      inRoom.push(...inside);
    }
  }
  return inRoom;
}

export function canSeeItemInContext(
  state: GameState,
  itemId: string,
  scope: 'room' | 'inventory' | 'anywhere'
): boolean {
  if (scope === 'inventory' || scope === 'anywhere') {
    if (state.inventory.includes(itemId)) return true;
    for (const carriedId of state.inventory) {
      const def = ITEMS[carriedId];
      if (def?.container && isItemOpen(state, carriedId)) {
        const inside = state.containerContents[carriedId] ?? [];
        if (inside.includes(itemId)) return true;
      }
    }
  }
  if (scope === 'room' || scope === 'anywhere') {
    const vis = getVisibleItemIdsInRoom(state, state.currentRoom);
    if (vis.includes(itemId)) return true;
  }
  return false;
}

export function createInitialState(): GameState {
  const roomItems: Record<string, string[]> = {};
  const containerContents: Record<string, string[]> = {};

  for (const [roomId, room] of Object.entries(ROOMS)) {
    roomItems[roomId] = [...room.initialItems];
  }

  for (const [itemId, def] of Object.entries(ITEMS)) {
    if (def.initialContents?.length) {
      containerContents[itemId] = [...def.initialContents];
    }
  }

  return {
    currentRoom: 'west-of-house',
    inventory: [],
    roomItems,
    itemStates: {},
    containerContents,
    exitOverrides: {},
    roomVisited: { 'west-of-house': true },
    flags: {},
    score: 0,
    moves: 0,
    lampOn: false,
    lampFuel: 200,
    gameOver: false,
    pendingQuitConfirm: false,
  };
}

export function bumpMoves(state: GameState, delta = 1): GameState {
  return { ...state, moves: state.moves + delta };
}

export function drainLampOnMove(state: GameState): { state: GameState; lines: OutputLine[] } {
  if (!state.lampOn || !state.inventory.includes(LAMP_ITEM_ID)) {
    return { state, lines: [] };
  }
  const nextFuel = state.lampFuel - 1;
  if (nextFuel > 0) {
    return { state: { ...state, lampFuel: nextFuel }, lines: [] };
  }
  return {
    state: { ...state, lampFuel: 0, lampOn: false },
    lines: [
      line('text', 'The lantern flickers and dies. You are left in darkness.'),
    ],
  };
}
