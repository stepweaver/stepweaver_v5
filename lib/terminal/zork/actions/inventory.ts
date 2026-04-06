import { resolveItemPhrase } from '../content/synonyms';
import {
  type GameState,
  type OutputLine,
  getVisibleItemIdsInRoom,
  isItemOpen,
  isPitchBlack,
  line,
  bumpMoves,
} from '../state';
import { ITEMS as ITEM_DEFS } from '../world/items';

function findContainerHolding(state: GameState, itemId: string): string | null {
  for (const [cid, inner] of Object.entries(state.containerContents)) {
    if (inner.includes(itemId)) return cid;
  }
  return null;
}

function candidateSetForTake(state: GameState): Set<string> {
  const ids = new Set(getVisibleItemIdsInRoom(state, state.currentRoom));
  return ids;
}

function candidateSetForDrop(state: GameState): Set<string> {
  return new Set(state.inventory);
}

export function tryTake(
  state: GameState,
  objectPhrase: string
): { state: GameState; lines: OutputLine[] } {
  if (!objectPhrase.trim()) {
    return { state, lines: [line('error', 'Take what?')] };
  }
  if (isPitchBlack(state)) {
    return {
      state,
      lines: [
        line(
          'error',
          'It is pitch black. You are likely to be eaten by a grue.'
        ),
      ],
    };
  }

  const candidates = candidateSetForTake(state);
  const itemId = resolveItemPhrase(objectPhrase, candidates);
  if (!itemId) {
    return {
      state,
      lines: [line('error', "I don't see that here.")],
    };
  }

  const def = ITEM_DEFS[itemId];
  if (!def?.takeable) {
    return {
      state,
      lines: [line('error', `You can't take the ${def?.name ?? itemId}.`)],
    };
  }

  const parent = findContainerHolding(state, itemId);
  if (parent) {
    const parentOpen = isItemOpen(state, parent);
    const parentInRoom =
      (state.roomItems[state.currentRoom] ?? []).includes(parent);
    const parentCarried = state.inventory.includes(parent);
    if (!parentOpen || (!parentInRoom && !parentCarried)) {
      return {
        state,
        lines: [line('error', "I don't see that here.")],
      };
    }
  } else if (!(state.roomItems[state.currentRoom] ?? []).includes(itemId)) {
    return {
      state,
      lines: [line('error', "I don't see that here.")],
    };
  }

  let next: GameState = { ...state, inventory: [...state.inventory, itemId] };
  const ri = [...(next.roomItems[next.currentRoom] ?? [])];
  const idx = ri.indexOf(itemId);
  if (idx >= 0) ri.splice(idx, 1);
  next = { ...next, roomItems: { ...next.roomItems, [next.currentRoom]: ri } };

  if (parent) {
    const inner = [...(next.containerContents[parent] ?? [])].filter(
      (x) => x !== itemId
    );
    next = {
      ...next,
      containerContents: { ...next.containerContents, [parent]: inner },
    };
  }

  next = bumpMoves(next, 1);

  let scoreAdd = 0;
  if (itemId === 'lamp' && !next.flags.tookLantern) {
    scoreAdd = 5;
    next = {
      ...next,
      score: next.score + scoreAdd,
      flags: { ...next.flags, tookLantern: true },
    };
  }

  const lines: OutputLine[] = [line('success', 'Taken.')];
  return { state: next, lines };
}

export function tryDrop(
  state: GameState,
  objectPhrase: string
): { state: GameState; lines: OutputLine[] } {
  if (!objectPhrase.trim()) {
    return { state, lines: [line('error', 'Drop what?')] };
  }

  const candidates = candidateSetForDrop(state);
  const itemId = resolveItemPhrase(objectPhrase, candidates);
  if (!itemId) {
    return { state, lines: [line('error', "You don't have that.")] };
  }

  const inv = state.inventory.filter((x) => x !== itemId);
  const roomItems = [...(state.roomItems[state.currentRoom] ?? [])];
  roomItems.push(itemId);

  let next: GameState = {
    ...state,
    inventory: inv,
    roomItems: { ...state.roomItems, [state.currentRoom]: roomItems },
  };

  if (itemId === 'lamp' && next.lampOn) {
    next = { ...next, lampOn: false };
  }

  next = bumpMoves(next, 1);
  return { state: next, lines: [line('success', 'Dropped.')] };
}

export function showInventory(state: GameState): { state: GameState; lines: OutputLine[] } {
  if (state.inventory.length === 0) {
    return {
      state,
      lines: [line('itemHere', 'You are empty-handed.')],
    };
  }
  const lines: OutputLine[] = [line('cyan', 'You are carrying:')];
  for (const id of state.inventory) {
    const def = ITEM_DEFS[id];
    lines.push(line('text', `• A ${def?.name ?? id}`));
  }
  return { state, lines };
}
