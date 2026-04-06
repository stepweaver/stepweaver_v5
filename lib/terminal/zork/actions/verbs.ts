import { resolveItemPhrase } from '../content/synonyms';
import {
  type GameState,
  type OutputLine,
  SCORE_MAX,
  getVisibleItemIdsInRoom,
  isItemOpen,
  isPitchBlack,
  line,
  bumpMoves,
  LAMP_ITEM_ID,
} from '../state';
import { ITEMS } from '../world/items';

export function tryRead(
  state: GameState,
  objectPhrase: string
): { state: GameState; lines: OutputLine[] } {
  if (!objectPhrase.trim()) {
    return { state, lines: [line('error', 'Read what?')] };
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

  const vis = new Set([
    ...getVisibleItemIdsInRoom(state, state.currentRoom),
    ...state.inventory,
  ]);
  for (const carried of state.inventory) {
    const def = ITEMS[carried];
    if (def?.container && isItemOpen(state, carried)) {
      for (const inner of state.containerContents[carried] ?? []) {
        vis.add(inner);
      }
    }
  }

  const itemId = resolveItemPhrase(objectPhrase, vis);
  if (!itemId) {
    return {
      state,
      lines: [line('error', "I don't see that here.")],
    };
  }

  const def = ITEMS[itemId];
  const text = def?.readText ?? def?.description;
  if (!text) {
    return {
      state,
      lines: [line('text', 'Nothing is written on it.')],
    };
  }

  return { state, lines: text.split('\n').map((t) => line('text', t)) };
}

export function tryScore(state: GameState): { state: GameState; lines: OutputLine[] } {
  return {
    state,
    lines: [
      line(
        'cyan',
        `Your score is ${state.score} (out of ${SCORE_MAX} points), in ${state.moves} moves.`
      ),
      line('text', 'This gives you the rank of Beginner.'),
    ],
  };
}

export function tryHelp(state: GameState): { state: GameState; lines: OutputLine[] } {
  return {
    state,
    lines: [
      line('success', 'Brief help:'),
      line('text', ''),
      line('cyan', 'DIRECTIONS:'),
      line(
        'text',
        'north, south, east, west, northeast, northwest, southeast, southwest, up, down, in, out (or n/s/e/w/u/d).'
      ),
      line('cyan', 'INVENTORY:'),
      line('text', 'take / get, drop, inventory (i)'),
      line('cyan', 'ACTIONS:'),
      line(
        'text',
        'open / close, read, move, go, turn on / turn off, attack'
      ),
      line('cyan', 'META:'),
      line(
        'text',
        'look / examine, score, save, restore, restart, quit (then y/n)'
      ),
    ],
  };
}

function resolveHeldLightSource(state: GameState, phrase: string): string | null {
  const inv = new Set(state.inventory);
  if (!phrase.trim()) return inv.has(LAMP_ITEM_ID) ? LAMP_ITEM_ID : null;
  return resolveItemPhrase(phrase, inv);
}

export function tryTurnOn(
  state: GameState,
  objectPhrase: string
): { state: GameState; lines: OutputLine[] } {
  const itemId = resolveHeldLightSource(state, objectPhrase);
  if (!itemId) {
    if (!objectPhrase.trim()) {
      return { state, lines: [line('error', 'Turn on what?')] };
    }
    return { state, lines: [line('error', "You don't have that.")] };
  }

  const def = ITEMS[itemId];
  if (!def?.lightSource) {
    return {
      state,
      lines: [line('error', `You can't turn on the ${def.name}.`)],
    };
  }

  if (state.lampOn) {
    return {
      state,
      lines: [line('text', 'The lantern is already on.')],
    };
  }

  let next = bumpMoves({ ...state, lampOn: true }, 1);
  return {
    state: next,
    lines: [line('success', 'The brass lantern is now on.')],
  };
}

export function tryTurnOff(
  state: GameState,
  objectPhrase: string
): { state: GameState; lines: OutputLine[] } {
  const itemId = resolveHeldLightSource(state, objectPhrase);
  if (!itemId) {
    if (!objectPhrase.trim()) {
      return { state, lines: [line('error', 'Turn off what?')] };
    }
    return { state, lines: [line('error', "You don't have that.")] };
  }

  const def = ITEMS[itemId];
  if (!def?.lightSource) {
    return {
      state,
      lines: [line('error', `You can't turn off the ${def.name}.`)],
    };
  }

  if (!state.lampOn) {
    return {
      state,
      lines: [line('text', 'The lantern is already off.')],
    };
  }

  let next = bumpMoves({ ...state, lampOn: false }, 1);
  return {
    state: next,
    lines: [line('success', 'The brass lantern is now off.')],
  };
}
