import { ITEMS } from '../world/items';

/** Extra phrases per item id (normalized matching). */
const EXTRA_ALIASES: Record<string, string[]> = {
  mailbox: ['mailbox', 'box', 'small mailbox'],
  leaflet: ['leaflet', 'paper', 'note'],
  lamp: ['lamp', 'lantern', 'brass lantern', 'light'],
  rug: ['rug', 'oriental rug', 'large rug', 'carpet'],
  'trophy-case': ['trophy case', 'case', 'cabinet'],
  sack: ['sack', 'bag', 'brown sack'],
  lunch: ['lunch', 'food', 'sandwich'],
  garlic: ['garlic', 'clove', 'clove of garlic'],
  water: ['water', 'bottle', 'bottle of water'],
  rope: ['rope', 'coil'],
  knife: ['knife', 'blade'],
  leaves: ['leaves', 'pile', 'pile of leaves'],
  grating: ['grating', 'grate'],
  window: ['window', 'kitchen window'],
  'trap-door': ['trap door', 'door', 'trapdoor'],
};

export function normalizePhrase(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^(a|an|the)\s+/, '');
}

function aliasesForItem(itemId: string): string[] {
  const def = ITEMS[itemId];
  if (!def) return [];
  const base = [
    normalizePhrase(def.name),
    normalizePhrase(itemId.replace(/-/g, ' ')),
    ...(EXTRA_ALIASES[itemId] ?? []).map(normalizePhrase),
  ];
  return [...new Set(base.filter(Boolean))];
}

function phraseMatchesAlias(norm: string, alias: string): boolean {
  if (!alias) return false;
  if (norm === alias) return true;
  const nw = norm.split(/\s+/);
  const aw = alias.split(/\s+/);
  if (aw.every((w) => nw.includes(w))) return true;
  if (nw.every((w) => aw.includes(w))) return true;
  if (norm.includes(alias) && alias.length >= 4) return true;
  if (alias.includes(norm) && norm.length >= 4) return true;
  return false;
}

/**
 * Resolve a player noun phrase to at most one item id from the candidate set.
 */
export function resolveItemPhrase(phrase: string, candidates: Set<string>): string | null {
  const norm = normalizePhrase(phrase);
  if (!norm) return null;

  const matched: string[] = [];
  for (const itemId of candidates) {
    for (const a of aliasesForItem(itemId)) {
      if (phraseMatchesAlias(norm, a)) {
        matched.push(itemId);
        break;
      }
    }
  }

  if (matched.length === 0) return null;
  if (matched.length === 1) return matched[0];

  let bestScore = -1;
  for (const id of matched) {
    let score = 0;
    for (const a of aliasesForItem(id)) {
      if (norm === a) score = Math.max(score, 100 + a.length);
      else if (phraseMatchesAlias(norm, a)) score = Math.max(score, a.length);
    }
    if (score > bestScore) {
      bestScore = score;
    }
  }
  const tops = matched.filter((id) => {
    let s = 0;
    for (const a of aliasesForItem(id)) {
      if (norm === a) s = Math.max(s, 100 + a.length);
      else if (phraseMatchesAlias(norm, a)) s = Math.max(s, a.length);
    }
    return s === bestScore;
  });
  return tops.length === 1 ? tops[0] : null;
}
