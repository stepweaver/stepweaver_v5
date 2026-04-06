import { createInitialState } from '../state';
import { runCommand } from '../engine';

function transcript(state: ReturnType<typeof createInitialState>, inputs: string[]) {
  let s = state;
  const chunks: string[] = [];
  for (const input of inputs) {
    const r = runCommand(s, input);
    s = r.state;
    chunks.push(...r.lines.map((l) => l.text));
  }
  return { state: s, text: chunks.join('\n').toLowerCase() };
}

describe('early game transcript', () => {
  it('mailbox, leaflet, and path toward kitchen', () => {
    let s = createInitialState();
    const steps = [
      'look',
      'open mailbox',
      'take leaflet',
      'read leaflet',
      'n',
      'e',
      'open window',
      'in',
      'e',
    ];
    const { text, state } = transcript(s, steps);

    expect(text).toContain('mailbox');
    expect(text).toContain('taken');
    expect(text).toContain('cave crawl');
    expect(state.currentRoom).toBe('kitchen');
    expect(state.inventory).toContain('leaflet');
  });
});
