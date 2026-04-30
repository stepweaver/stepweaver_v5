import { resolveItemPhrase } from '../content/synonyms';
import {
  type GameState,
  type OutputLine,
  isItemOpen,
  isPitchBlack,
  line,
} from '../state';
import { ITEMS } from '../world/items';
import { itemIdsVisibleForExamineOrRead } from './item-visibility';
import { describeRoom } from './movement';
import { FLAG_ARTIFACT_PLACED } from '../world/flags';

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
          "It is pitch black. You can't see a thing."
        ),
      ],
    };
  }

  const vis = itemIdsVisibleForExamineOrRead(state);

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

  if (itemId === 'trophy-case') {
    if (state.flags[FLAG_ARTIFACT_PLACED]) {
      return {
        state,
        lines: [
          line(
            'text',
            'The trophy case holds a single glass prism, catching and breaking the light into quiet angles.'
          ),
        ],
      };
    }
    return {
      state,
      lines: [line('text', 'A handsome trophy case. It is empty.')],
    };
  }

  const def = ITEMS[itemId];
  const text = def?.description ?? 'Nothing special.';
  return { state, lines: [line('text', text)] };
}
