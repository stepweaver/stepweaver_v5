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
import {
  FLAG_ARTIFACT_PLACED,
  FLAG_ARTIFACT_TAKEN,
  FLAG_VICTORY,
} from '../world/flags';

function findContainerHolding(state: GameState, itemId: string): string | null {
  for (const [cid, inner] of Object.entries(state.containerContents)) {
    if (inner.includes(itemId)) return cid;
  }
  return null;
}

function candidateSetForTake(state: GameState): Set<string> {
  const ids = new Set(getVisibleItemIdsInRoom(state, state.currentRoom));
  for (const carriedId of state.inventory) {
    const def = ITEM_DEFS[carriedId];
    if (def?.container && isItemOpen(state, carriedId)) {
      for (const inner of state.containerContents[carriedId] ?? []) {
        ids.add(inner);
      }
    }
  }
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
          "It is pitch black. You can't see a thing."
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
  if (itemId === 'signal-prism' && !next.flags[FLAG_ARTIFACT_TAKEN]) {
    scoreAdd = 25;
    next = {
      ...next,
      score: next.score + scoreAdd,
      flags: { ...next.flags, [FLAG_ARTIFACT_TAKEN]: true },
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

  if (
    itemId === 'signal-prism' &&
    state.currentRoom === 'living-room' &&
    (state.roomItems['living-room'] ?? []).includes('trophy-case') &&
    !state.flags[FLAG_VICTORY]
  ) {
    next = {
      ...next,
      score: next.score + 40,
      flags: {
        ...next.flags,
        [FLAG_ARTIFACT_PLACED]: true,
        [FLAG_VICTORY]: true,
      },
      gameOver: true,
    };
    next = bumpMoves(next, 1);
    return {
      state: next,
      lines: [
        line('success', 'Placed.'),
        line('text', ''),
        line(
          'success',
          'The prism settles into the trophy case as if it was made for it.'
        ),
        line(
          'cyan',
          'A quiet chime pulses through the house, and the air feels… finished.'
        ),
        line('success', 'You have completed the adventure.'),
      ],
    };
  }

  if (itemId === 'lamp' && next.lampOn) {
    next = { ...next, lampOn: false };
  }

  next = bumpMoves(next, 1);
  return { state: next, lines: [line('success', 'Dropped.')] };
}

function splitPutPhrase(
  phrase: string
): { objectPhrase: string; targetPhrase: string } | null {
  const norm = phrase.trim().replace(/\s+/g, ' ');
  if (!norm) return null;

  // Minimal, intentionally non-general: handle the common "X in Y" / "X into Y".
  const m = norm.match(/^(.*?)\s+(?:in|into|inside)\s+(.*?)$/i);
  if (!m) return null;
  const objectPhrase = (m[1] ?? '').trim();
  const targetPhrase = (m[2] ?? '').trim();
  if (!objectPhrase || !targetPhrase) return null;
  return { objectPhrase, targetPhrase };
}

export function tryPut(
  state: GameState,
  objectPhrase: string
): { state: GameState; lines: OutputLine[] } {
  const split = splitPutPhrase(objectPhrase);
  if (!split) {
    if (!objectPhrase.trim()) {
      return { state, lines: [line('error', 'Put what?')] };
    }
    return { state, lines: [line('error', 'Put it where?')] };
  }

  const invCandidates = new Set(state.inventory);
  const itemId = resolveItemPhrase(split.objectPhrase, invCandidates);
  if (!itemId) {
    return { state, lines: [line('error', "You don't have that.")] };
  }

  // Only support a special-case placement for the trophy case; keep everything else simple.
  const visTargets = new Set(getVisibleItemIdsInRoom(state, state.currentRoom));
  const targetId = resolveItemPhrase(split.targetPhrase, visTargets);
  if (!targetId) {
    return { state, lines: [line('error', "I don't see that here.")] };
  }

  if (targetId !== 'trophy-case') {
    return { state, lines: [line('error', "That doesn't seem like something you can put things into.")] };
  }

  if (state.currentRoom !== 'living-room') {
    return { state, lines: [line('error', "That doesn't seem useful here.")] };
  }

  // Victory: placing the prism in the trophy case.
  if (
    itemId === 'signal-prism' &&
    (state.roomItems['living-room'] ?? []).includes('trophy-case') &&
    !state.flags[FLAG_VICTORY]
  ) {
    const inv = state.inventory.filter((x) => x !== itemId);
    let next: GameState = {
      ...state,
      inventory: inv,
      score: state.score + 40,
      flags: {
        ...state.flags,
        [FLAG_ARTIFACT_PLACED]: true,
        [FLAG_VICTORY]: true,
      },
      gameOver: true,
    };
    next = bumpMoves(next, 1);
    return {
      state: next,
      lines: [
        line('success', 'Placed.'),
        line('text', ''),
        line(
          'success',
          'The prism settles into the trophy case as if it was made for it.'
        ),
        line(
          'cyan',
          'A quiet chime pulses through the house, and the air feels… finished.'
        ),
        line('success', 'You have completed the adventure.'),
      ],
    };
  }

  // Reject near-misses explicitly so players understand the intended completion.
  if (itemId === 'signal-prism') {
    return { state: bumpMoves(state, 1), lines: [line('error', 'It won’t sit properly there.')] };
  }

  return { state: bumpMoves(state, 1), lines: [line('error', "That doesn't seem to fit.")] };
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
