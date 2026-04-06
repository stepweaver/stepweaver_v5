import type { Dispatch, SetStateAction } from 'react';
import { describeRoom } from '../actions/movement';
import { runCommand, getOpeningLines } from '../engine';
import { createInitialState, type GameState, type OutputKind } from '../state';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
} from '../persistence/saveGame';

const KIND_CLASS: Record<OutputKind, string> = {
  text: 'text-terminal-text',
  roomTitle: 'text-terminal-green font-bold',
  error: 'text-terminal-red',
  dim: 'text-terminal-dimmed',
  itemHere: 'text-terminal-yellow',
  success: 'text-terminal-green',
  cyan: 'text-terminal-cyan',
};

function formatLine(l: { kind: OutputKind; text: string }): string {
  const cls = KIND_CLASS[l.kind];
  return `<span class="${cls}">${escapeHtml(l.text)}</span>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface ZorkSessionRef {
  isActive: boolean;
}

export type ZorkTerminalCallback = {
  setLines: Dispatch<SetStateAction<string[]>>;
};

let gameState: GameState | null = null;

function appendLines(callback: ZorkTerminalCallback, lines: string[]) {
  if (lines.length === 0) return;
  callback.setLines((prev) => [...prev, ...lines]);
}

export function startZorkGame(
  callback: ZorkTerminalCallback,
  session: ZorkSessionRef
): void {
  gameState = createInitialState();
  session.isActive = true;
  const html = getOpeningLines().map(formatLine);
  appendLines(callback, html);
}

export function handleZorkCommand(
  command: string,
  callback: ZorkTerminalCallback,
  session: ZorkSessionRef
): void {
  if (!gameState) {
    gameState = createInitialState();
    session.isActive = true;
  }

  if (!command.trim()) return;

  callback.setLines((prev) => [
    ...prev,
    `<span class="text-terminal-dimmed">&gt;${escapeHtml(command)}</span>`,
  ]);

  const cmd = command.trim().toLowerCase();
  const word = cmd.split(/\s+/)[0];

  if (word === 'save') {
    const ok = saveToLocalStorage(gameState);
    appendLines(callback, [
      ok
        ? formatLine({ kind: 'success', text: 'Game saved.' })
        : formatLine({
            kind: 'error',
            text: 'Could not save (storage unavailable).',
          }),
    ]);
    return;
  }

  if (word === 'restore' || word === 'load') {
    const loaded = loadFromLocalStorage();
    if (!loaded) {
      appendLines(callback, [
        formatLine({ kind: 'error', text: 'No saved game found.' }),
      ]);
      return;
    }
    gameState = loaded;
    session.isActive = true;
    appendLines(callback, [
      formatLine({ kind: 'success', text: 'Restored.' }),
      formatLine({ kind: 'text', text: '' }),
    ]);
    const lines = describeRoom(gameState, gameState.currentRoom).map(formatLine);
    appendLines(callback, lines);
    return;
  }

  if (word === 'restart') {
    gameState = createInitialState();
    session.isActive = true;
    appendLines(callback, [
      formatLine({ kind: 'cyan', text: 'Game restarted.' }),
      formatLine({ kind: 'text', text: '' }),
    ]);
    const html = getOpeningLines().map(formatLine);
    appendLines(callback, html);
    return;
  }

  const result = runCommand(gameState, command);
  gameState = result.state;

  appendLines(callback, result.lines.map(formatLine));

  if (gameState.gameOver) {
    session.isActive = false;
    gameState = null;
  }
}
