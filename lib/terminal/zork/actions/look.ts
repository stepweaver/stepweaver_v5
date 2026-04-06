import { resolveItemPhrase } from '../content/synonyms';
import {
  type GameState,
  type OutputLine,
  getVisibleItemIdsInRoom,
  isItemOpen,
  isPitchBlack,
  line,
} from '../state';
import { ITEMS } from '../world/items';
import { describeRoom } from './movement';

function mailboxDescription(state: GameState): string {
  const open = isItemOpen(state, 'mailbox');
  const hasLeaflet = (state.containerContents.mailbox ?? []).includes('leaflet');
  if (open && hasLeaflet) {
    return 'The small mailbox is open.';
  }
  if (open) {
    return 'The small mailbox is empty.';
  }
  return 'The small mailbox is closed.';
}

export function tryLookRoom(state: GameState): { state: GameState; lines: OutputLine[] } {
  return {
    state,
    lines: describeRoom(state, state.currentRoom),
  };
}

export function tryExamine(
  state: GameState,
  objectPhrase: string
): { state: GameState; lines: OutputLine[] } {
  if (!objectPhrase.trim()) {
    return tryLookRoom(state);
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

  if (itemId === 'mailbox') {
    return { state, lines: [line('text', mailboxDescription(state))] };
  }

  const def = ITEMS[itemId];
  const text = def?.description ?? 'Nothing special.';
  return { state, lines: [line('text', text)] };
}
