import type { Direction } from '../direction';
import { FLAG_FIRST_CELLAR } from '../world/flags';
import {
  type GameState,
  type OutputLine,
  getEffectiveExits,
  getRoomDef,
  getVisibleItemIdsInRoom,
  isPitchBlack,
  line,
  bumpMoves,
  drainLampOnMove,
} from '../state';
import { ITEMS } from '../world/items';

function formatItemLine(itemId: string): OutputLine {
  const def = ITEMS[itemId];
  const name = def?.name ?? itemId;
  const kind =
    name.includes('mailbox') || name.includes('trophy') || name.includes('rug')
      ? 'cyan'
      : 'itemHere';
  return line(kind, `There is a ${name} here.`);
}

export function describeRoom(state: GameState, roomId: string): OutputLine[] {
  const room = getRoomDef(roomId);
  if (!room) return [line('error', 'You seem to be nowhere.')];

  const localState = { ...state, currentRoom: roomId };
  if (isPitchBlack(localState)) {
    return [
      line(
        'error',
        'It is pitch black. You are likely to be eaten by a grue.'
      ),
    ];
  }

  const lines: OutputLine[] = [
    line('roomTitle', room.name),
    line('text', room.description),
  ];

  const visible = getVisibleItemIdsInRoom(localState, roomId).filter((id) => {
    const def = ITEMS[id];
    return def && !('hidden' in def && (def as { hidden?: boolean }).hidden);
  });

  for (const itemId of visible) {
    lines.push(formatItemLine(itemId));
  }

  return lines;
}

export function tryMove(
  state: GameState,
  direction: Direction
): { state: GameState; lines: OutputLine[] } {
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

  const roomId = state.currentRoom;
  const exits = getEffectiveExits(state, roomId);
  const target = exits[direction];

  if (!target) {
    return { state, lines: [line('error', "You can't go that way.")] };
  }

  let next: GameState = {
    ...state,
    currentRoom: target,
    roomVisited: { ...state.roomVisited, [target]: true },
  };
  next = bumpMoves(next, 1);

  const drained = drainLampOnMove(next);
  next = drained.state;
  const extra = drained.lines;

  if (target === 'cellar' && !next.flags[FLAG_FIRST_CELLAR]) {
    next = {
      ...next,
      score: next.score + 10,
      flags: { ...next.flags, [FLAG_FIRST_CELLAR]: true },
    };
  }

  const roomLines = describeRoom(next, target);
  return {
    state: next,
    lines: [line('text', ''), ...roomLines, ...extra],
  };
}
