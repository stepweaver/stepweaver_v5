import { NPCS } from '../world/npcs';
import { line, type GameState, type OutputLine } from '../state';

export function tryAttack(
  state: GameState,
  _objectPhrase: string
): { state: GameState; lines: OutputLine[] } {
  const npcIds = Object.keys(NPCS);
  if (npcIds.length === 0) {
    return {
      state,
      lines: [line('text', 'There is nothing here to fight.')],
    };
  }
  return {
    state,
    lines: [line('text', 'Violence is not the answer, yet.')],
  };
}
