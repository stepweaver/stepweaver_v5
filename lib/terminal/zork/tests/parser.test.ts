import { parseCommand } from '../parser';

describe('zork parser', () => {
  it('parses bare directions and aliases', () => {
    expect(parseCommand('n')).toEqual({ kind: 'move', direction: 'north' });
    expect(parseCommand('d')).toEqual({ kind: 'move', direction: 'down' });
    expect(parseCommand('ne')).toEqual({ kind: 'move', direction: 'northeast' });
    expect(parseCommand('north')).toEqual({ kind: 'move', direction: 'north' });
  });

  it('parses go / move + direction', () => {
    expect(parseCommand('go east')).toEqual({ kind: 'move', direction: 'east' });
    expect(parseCommand('move w')).toEqual({ kind: 'move', direction: 'west' });
  });

  it('parses enter as in', () => {
    expect(parseCommand('enter')).toEqual({ kind: 'move', direction: 'in' });
  });

  it('parses turn on / turn off', () => {
    expect(parseCommand('turn on brass lantern')).toEqual({
      kind: 'verb',
      verb: 'turnon',
      object: 'brass lantern',
    });
    expect(parseCommand('turn off lamp')).toEqual({
      kind: 'verb',
      verb: 'turnoff',
      object: 'lamp',
    });
  });

  it('parses generic verb + object phrase', () => {
    expect(parseCommand('take trap door')).toEqual({
      kind: 'verb',
      verb: 'take',
      object: 'trap door',
    });
    expect(parseCommand('open small mailbox')).toEqual({
      kind: 'verb',
      verb: 'open',
      object: 'small mailbox',
    });
  });

  it('returns empty for blank', () => {
    expect(parseCommand('')).toEqual({ kind: 'empty' });
  });
});
