import type { GameState } from '../state';

export const SAVE_STORAGE_KEY = 'stepweaver-zork-save-v1';
const SCHEMA_VERSION = 1;

export interface SaveEnvelope {
  v: number;
  state: GameState;
}

export function serializeGameState(state: GameState): string {
  const envelope: SaveEnvelope = { v: SCHEMA_VERSION, state };
  return JSON.stringify(envelope);
}

export function parseGameState(json: string): GameState | null {
  try {
    const o = JSON.parse(json) as SaveEnvelope;
    if (o?.v !== SCHEMA_VERSION || !o.state || typeof o.state !== 'object') {
      return null;
    }
    return o.state;
  } catch {
    return null;
  }
}

export function saveToLocalStorage(state: GameState): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(SAVE_STORAGE_KEY, serializeGameState(state));
    return true;
  } catch {
    return false;
  }
}

export function loadFromLocalStorage(): GameState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    return parseGameState(raw);
  } catch {
    return null;
  }
}
