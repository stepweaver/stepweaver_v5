import type { Direction } from './direction';
import { tokenize } from './utils/normalize';

export type ParsedCommand =
  | { kind: 'empty' }
  | { kind: 'move'; direction: Direction }
  | { kind: 'verb'; verb: string; object: string };

const DIR_MAP: Record<string, Direction> = {
  n: 'north',
  s: 'south',
  e: 'east',
  w: 'west',
  u: 'up',
  d: 'down',
  ne: 'northeast',
  nw: 'northwest',
  se: 'southeast',
  sw: 'southwest',
  north: 'north',
  south: 'south',
  east: 'east',
  west: 'west',
  up: 'up',
  down: 'down',
  northeast: 'northeast',
  northwest: 'northwest',
  southeast: 'southeast',
  southwest: 'southwest',
  in: 'in',
  inside: 'in',
  enter: 'in',
  out: 'out',
  outside: 'out',
  exit: 'out',
};

function asDirection(word: string): Direction | null {
  return DIR_MAP[word] ?? null;
}

/**
 * Parse already-normalized input (lowercase, single spaces).
 */
export function parseCommand(normalized: string): ParsedCommand {
  const words = tokenize(normalized);
  if (words.length === 0) return { kind: 'empty' };

  const w0 = words[0];

  if (words.length === 1) {
    const d = asDirection(w0);
    if (d) return { kind: 'move', direction: d };
  }

  if (w0 === 'go' && words.length >= 2) {
    const d = asDirection(words[1]);
    if (d) return { kind: 'move', direction: d };
  }

  if (w0 === 'move' && words.length >= 2) {
    const d = asDirection(words[1]);
    if (d) return { kind: 'move', direction: d };
  }

  if (w0 === 'enter' && words.length === 1) {
    return { kind: 'move', direction: 'in' };
  }

  if (w0 === 'turn' && words.length >= 2) {
    if (words[1] === 'on') {
      const obj = words.slice(2).join(' ');
      return { kind: 'verb', verb: 'turnon', object: obj };
    }
    if (words[1] === 'off') {
      const obj = words.slice(2).join(' ');
      return { kind: 'verb', verb: 'turnoff', object: obj };
    }
    if (words.length >= 3 && words[words.length - 1] === 'on') {
      const obj = words.slice(1, -1).join(' ');
      return { kind: 'verb', verb: 'turnon', object: obj };
    }
    if (words.length >= 3 && words[words.length - 1] === 'off') {
      const obj = words.slice(1, -1).join(' ');
      return { kind: 'verb', verb: 'turnoff', object: obj };
    }
  }

  const rest = words.slice(1).join(' ');
  return { kind: 'verb', verb: w0, object: rest };
}
