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

function reachableCandidates(state: GameState): Set<string> {
  // Room-visible items already include contents of open room containers.
  // Add inventory items so carried containers can be opened/closed naturally.
  return new Set([
    ...getVisibleItemIdsInRoom(state, state.currentRoom),
    ...state.inventory,
  ]);
}

function canReachItem(state: GameState, itemId: string): boolean {
  return reachableCandidates(state).has(itemId);
}

function resolveOpenableTarget(
  state: GameState,
  objectPhrase: string,
  emptyPrompt: string,
  notOpenableVerb: 'open' | 'close'
):
  | { ok: true; itemId: string; def: (typeof ITEMS)[string] }
  | { ok: false; lines: OutputLine[] } {
  if (!objectPhrase.trim()) {
    return { ok: false, lines: [line('error', emptyPrompt)] };
  }
  if (isPitchBlack(state)) {
    return {
      ok: false,
      lines: [
        line(
          'error',
          "It is pitch black. You can't see a thing."
        ),
      ],
    };
  }

  const candidates = reachableCandidates(state);
  const itemId = resolveItemPhrase(objectPhrase, candidates);
  if (!itemId || !canReachItem(state, itemId)) {
    return {
      ok: false,
      lines: [line('error', "I don't see that here.")],
    };
  }

  const def = ITEMS[itemId];
  if (!def?.openable) {
    return {
      ok: false,
      lines: [line('error', `You can't ${notOpenableVerb} the ${def.name}.`)],
    };
  }

  return { ok: true, itemId, def };
}

export function tryOpen(
  state: GameState,
  objectPhrase: string
): { state: GameState; lines: OutputLine[] } {
  const resolved = resolveOpenableTarget(state, objectPhrase, 'Open what?', 'open');
  if (!resolved.ok) {
    return { state, lines: resolved.lines };
  }
  const { itemId, def } = resolved;

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
  const resolved = resolveOpenableTarget(state, objectPhrase, 'Close what?', 'close');
  if (!resolved.ok) {
    return { state, lines: resolved.lines };
  }
  const { itemId, def } = resolved;

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
          "It is pitch black. You can't see a thing."
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
      if (!next.flags[FLAG_RUG_MOVED]) {
        next = { ...next, score: next.score + 10 };
      }
      next = { ...next, flags: { ...next.flags, [FLAG_RUG_MOVED]: true } };
    }
  } else {
    lines.push(
      line('text', `You move the ${def.name}, but find nothing underneath.`)
    );
  }

  return { state: next, lines };
}
