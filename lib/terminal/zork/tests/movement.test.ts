import { createInitialState } from '../state';
import { tryMove } from '../actions/movement';

describe('zork movement', () => {
  it('moves west-of-house north to north-of-house', () => {
    let s = createInitialState();
    const r = tryMove(s, 'north');
    expect(r.state.currentRoom).toBe('north-of-house');
    expect(r.state.moves).toBe(1);
    expect(r.lines.some((l) => l.text.includes('North of House'))).toBe(true);
  });

  it('blocks invalid exits', () => {
    const s = createInitialState();
    const r = tryMove(s, 'up');
    expect(r.state.currentRoom).toBe('west-of-house');
    expect(r.lines.some((l) => l.kind === 'error')).toBe(true);
  });
});
