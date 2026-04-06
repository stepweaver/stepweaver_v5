import { resolveItemPhrase } from '../content/synonyms';
import {
  FLAG_TRAP_DOOR_OPENED,
  FLAG_WINDOW_OPENED,
  FLAG_RUG_MOVED,
} from '../world/flags';
import {
  type GameState,
  type OutputLine,
  getVisibleItemIdsInRoom,
  isItemOpen,
  isPitchBlack,
  line,
  bumpMoves,
} from '../state';
import { ITEMS } from '../world/items';

function canReachItem(state: GameState, itemId: string): boolean {
  const vis = new Set(getVisibleItemIdsInRoom(state, state.currentRoom));
  return vis.has(itemId);
}

export function tryOpen(
  state: GameState,
  objectPhrase: string
): { state: GameState; lines: OutputLine[] } {
  if (!objectPhrase.trim()) {
    return { state, lines: [line('error', 'Open what?')] };
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

  const candidates = new Set(getVisibleItemIdsInRoom(state, state.currentRoom));
  const itemId = resolveItemPhrase(objectPhrase, candidates);
  if (!itemId || !canReachItem(state, itemId)) {
    return {
      state,
      lines: [line('error', "I don't see that here.")],
    };
  }

  const def = ITEMS[itemId];
  if (!def?.openable) {
    return {
      state,
      lines: [line('error', `You can't open the ${def.name}.`)],
    };
  }

  if (isItemOpen(state, itemId)) {
    return {
      state,
      lines: [line('text', `The ${def.name} is already open.`)],
    };
  }

  let next: GameState = {
    ...state,
    itemStates: {
      ...state.itemStates,
      [itemId]: { ...state.itemStates[itemId], isOpen: true },
    },
  };
  next = bumpMoves(next, 1);

  const lines: OutputLine[] = [line('success', 'Opened.')];

  const inner = next.containerContents[itemId] ?? [];
  if (inner.length > 0) {
    lines.push(line('cyan', `Opening the ${def.name} reveals:`));
    for (const cid of inner) {
      const cdef = ITEMS[cid];
      lines.push(line('itemHere', `• A ${cdef?.name ?? cid}`));
    }
  }

  if (itemId === 'window' && state.currentRoom === 'behind-house') {
    lines.push(
      line(
        'cyan',
        'With effort, you force the window wide enough to climb through.'
      )
    );
    next = {
      ...next,
      flags: { ...next.flags, [FLAG_WINDOW_OPENED]: true },
      exitOverrides: {
        ...next.exitOverrides,
        'behind-house': {
          ...next.exitOverrides['behind-house'],
          in: 'living-room',
        },
      },
    };
  }

  if (itemId === 'trap-door' && state.currentRoom === 'living-room') {
    lines.push(
      line(
        'cyan',
        'The trap door creaks open, revealing stairs descending into darkness.'
      )
    );
    next = {
      ...next,
      flags: { ...next.flags, [FLAG_TRAP_DOOR_OPENED]: true },
      exitOverrides: {
        ...next.exitOverrides,
        'living-room': {
          ...next.exitOverrides['living-room'],
          down: 'cellar',
        },
      },
    };
  }

  return { state: next, lines };
}

export function tryClose(
  state: GameState,
  objectPhrase: string
): { state: GameState; lines: OutputLine[] } {
  if (!objectPhrase.trim()) {
    return { state, lines: [line('error', 'Close what?')] };
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

  const candidates = new Set(getVisibleItemIdsInRoom(state, state.currentRoom));
  const itemId = resolveItemPhrase(objectPhrase, candidates);
  if (!itemId || !canReachItem(state, itemId)) {
    return {
      state,
      lines: [line('error', "I don't see that here.")],
    };
  }

  const def = ITEMS[itemId];
  if (!def?.openable) {
    return {
      state,
      lines: [line('error', `You can't close the ${def.name}.`)],
    };
  }

  if (!isItemOpen(state, itemId)) {
    return {
      state,
      lines: [line('text', `The ${def.name} is already closed.`)],
    };
  }

  let next: GameState = bumpMoves(
    {
      ...state,
      itemStates: {
        ...state.itemStates,
        [itemId]: { ...state.itemStates[itemId], isOpen: false },
      },
    },
    1
  );

  if (itemId === 'window' && state.currentRoom === 'behind-house') {
    const flags = { ...next.flags };
    delete flags[FLAG_WINDOW_OPENED];
    const bh = { ...(next.exitOverrides['behind-house'] ?? {}) };
    delete (bh as Record<string, string>).in;
    next = {
      ...next,
      flags,
      exitOverrides: { ...next.exitOverrides, 'behind-house': bh },
    };
  }

  if (itemId === 'trap-door' && state.currentRoom === 'living-room') {
    const flags = { ...next.flags };
    delete flags[FLAG_TRAP_DOOR_OPENED];
    const lr = { ...(next.exitOverrides['living-room'] ?? {}) };
    delete (lr as Record<string, string>).down;
    next = {
      ...next,
      flags,
      exitOverrides: { ...next.exitOverrides, 'living-room': lr },
    };
  }

  return { state: next, lines: [line('success', 'Closed.')] };
}

export function tryMoveObject(
  state: GameState,
  objectPhrase: string
): { state: GameState; lines: OutputLine[] } {
  if (!objectPhrase.trim()) {
    return { state, lines: [line('error', 'Move what?')] };
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

  const candidates = new Set(getVisibleItemIdsInRoom(state, state.currentRoom));
  const itemId = resolveItemPhrase(objectPhrase, candidates);
  if (!itemId) {
    return {
      state,
      lines: [line('error', "I don't see that here.")],
    };
  }

  const def = ITEMS[itemId];
  if (!def?.moveable) {
    return {
      state,
      lines: [line('error', `You can't move the ${def?.name ?? itemId}.`)],
    };
  }

  if (state.itemStates[itemId]?.moved) {
    return {
      state,
      lines: [line('text', `The ${def.name} has already been moved.`)],
    };
  }

  let next: GameState = {
    ...state,
    itemStates: {
      ...state.itemStates,
      [itemId]: { ...state.itemStates[itemId], moved: true },
    },
  };
  next = bumpMoves(next, 1);

  const lines: OutputLine[] = [];
  const under = def.under ?? [];
  if (under.length > 0) {
    lines.push(line('cyan', `Moving the ${def.name} reveals:`));
    const room = [...(next.roomItems[next.currentRoom] ?? [])];
    for (const u of under) {
      if (!room.includes(u)) room.push(u);
      const udef = ITEMS[u];
      lines.push(line('itemHere', `• A ${udef?.name ?? u}`));
    }
    next = {
      ...next,
      roomItems: { ...next.roomItems, [next.currentRoom]: room },
    };
    if (itemId === 'rug') {
      next = { ...next, flags: { ...next.flags, [FLAG_RUG_MOVED]: true } };
    }
  } else {
    lines.push(
      line('text', `You move the ${def.name}, but find nothing underneath.`)
    );
  }

  return { state: next, lines };
}
