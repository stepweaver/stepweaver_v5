import { normalizeInput } from './utils/normalize';
import { parseCommand } from './parser';
import { createInitialState, line, type GameState, type OutputLine } from './state';
import { tryMove, describeRoom } from './actions/movement';
import { tryTake, tryDrop, showInventory } from './actions/inventory';
import { tryLookRoom, tryExamine } from './actions/look';
import { tryOpen, tryClose, tryMoveObject } from './actions/containers';
import { tryAttack } from './actions/combat';
import {
  tryRead,
  tryScore,
  tryHelp,
  tryTurnOn,
  tryTurnOff,
} from './actions/verbs';

export interface RunResult {
  state: GameState;
  lines: OutputLine[];
}

/**
 * Pure command step: normalize → parse → dispatch. Does not throw on player input.
 */
export function runCommand(state: GameState, rawInput: string): RunResult {
  const normalized = normalizeInput(rawInput);
  if (!normalized) {
    return { state, lines: [] };
  }

  if (state.pendingQuitConfirm) {
    const w = normalized.split(' ')[0];
    if (w === 'y' || w === 'yes') {
      return {
        state: { ...state, pendingQuitConfirm: false, gameOver: true },
        lines: [line('success', 'Thanks for playing!')],
      };
    }
    if (w === 'n' || w === 'no') {
      return {
        state: { ...state, pendingQuitConfirm: false },
        lines: [line('text', 'OK.')],
      };
    }
    return {
      state,
      lines: [line('error', 'Please answer yes or no.')],
    };
  }

  const parsed = parseCommand(normalized);

  if (parsed.kind === 'empty') {
    return { state, lines: [] };
  }

  if (parsed.kind === 'move') {
    return tryMove(state, parsed.direction);
  }

  const verb = parsed.verb;
  const obj = parsed.object;

  try {
    switch (verb) {
      case 'take':
      case 'get':
        return tryTake(state, obj);
      case 'drop':
        return tryDrop(state, obj);
      case 'i':
      case 'inventory':
        return showInventory(state);
      case 'l':
      case 'look':
        if (!obj.trim()) return tryLookRoom(state);
        return tryExamine(state, obj);
      case 'examine':
      case 'x':
        return tryExamine(state, obj);
      case 'open':
        return tryOpen(state, obj);
      case 'close':
        return tryClose(state, obj);
      case 'read':
        return tryRead(state, obj);
      case 'move':
        return tryMoveObject(state, obj);
      case 'score':
        return tryScore(state);
      case 'help':
        return tryHelp(state);
      case 'turnon':
        return tryTurnOn(state, obj);
      case 'turnoff':
        return tryTurnOff(state, obj);
      case 'attack':
      case 'kill':
      case 'fight':
        return tryAttack(state, obj);
      case 'quit':
      case 'q':
        return {
          state: { ...state, pendingQuitConfirm: true },
          lines: [
            line('text', 'Do you really want to quit? (y/n)'),
          ],
        };
      default:
        return {
          state,
          lines: [line('error', "I don't understand that.")],
        };
    }
  } catch {
    return {
      state,
      lines: [line('error', 'Something went wrong.')],
    };
  }
}

/** Opening transcript for a new game (semantic lines; adapter adds HTML). */
export function getOpeningLines(): OutputLine[] {
  const initial = createInitialState();
  return [
    line('success', 'The Underground Empire, a browser text adventure'),
    line('dim', 'Inspired by classic interactive fiction. All-new prose and code.'),
    line('text', ''),
    ...describeRoom(initial, 'west-of-house'),
    line('text', ''),
    line('cyan', "Type 'help' for commands, 'quit' to exit the game."),
  ];
}
