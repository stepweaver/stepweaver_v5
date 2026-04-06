/**
 * Dice notation engine (ported from v3 lib/roller.js).
 */

export function randomIntInclusive(min: number, max: number): number {
  const low = Math.ceil(min);
  const high = Math.floor(max);

  if (!Number.isInteger(low) || !Number.isInteger(high) || high < low) {
    throw new Error(`Invalid random range: [${min}, ${max}]`);
  }

  const range = high - low + 1;
  if (range <= 0) {
    throw new Error(`Invalid random range size: ${range}`);
  }

  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    const maxUint32 = 0xffffffff;
    const bucketSize = Math.floor((maxUint32 + 1) / range);
    const limit = bucketSize * range;
    const buffer = new Uint32Array(1);
    let value: number;
    do {
      globalThis.crypto.getRandomValues(buffer);
      value = buffer[0]!;
    } while (value >= limit);
    return low + (value % range);
  }

  return Math.floor(Math.random() * range) + low;
}

export function rollSingleDie(sides: number): number {
  if (!Number.isInteger(sides) || sides < 2) {
    throw new Error(`Invalid die sides: ${sides}`);
  }
  return randomIntInclusive(1, sides);
}

export function rollDice(sides: number, count: number): number[] {
  if (!Number.isInteger(count) || count < 1) {
    return [];
  }
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(rollSingleDie(sides));
  }
  return results;
}

export type DiceGroup = { sides: number; count: number };

export function parseDiceNotation(notation: string): { groups: DiceGroup[]; modifier: number } {
  if (!notation || typeof notation !== "string") {
    return { groups: [], modifier: 0 };
  }

  const cleaned = notation.toLowerCase().replace(/\s+/g, "");
  const groups: DiceGroup[] = [];
  let modifier = 0;

  const diceRegex = /(\d+)?d(\d+)/g;
  let match: RegExpExecArray | null;
  while ((match = diceRegex.exec(cleaned)) !== null) {
    const count = match[1] ? parseInt(match[1], 10) : 1;
    const sides = parseInt(match[2], 10);
    if (count > 0 && sides > 1) {
      groups.push({ sides, count });
    }
  }

  const modifierRegex = /([+-]\d+)(?!d)/g;
  let modMatch: RegExpExecArray | null;
  while ((modMatch = modifierRegex.exec(cleaned)) !== null) {
    modifier += parseInt(modMatch[1], 10);
  }

  return { groups, modifier };
}

export type RollBreakdown = {
  notation: string;
  results: number[];
  subtotal: number;
};

export type RollResult = {
  notation: string;
  rolls: { sides: number; count: number; results: number[]; subtotal: number }[];
  modifier: number;
  subtotal: number;
  total: number;
  breakdown: RollBreakdown[];
};

export function roll(notation: string): RollResult {
  const { groups, modifier } = parseDiceNotation(notation);

  if (groups.length === 0) {
    return {
      notation,
      rolls: [],
      modifier,
      subtotal: 0,
      total: modifier,
      breakdown: [],
    };
  }

  const rolls: RollResult["rolls"] = [];
  const breakdown: RollBreakdown[] = [];
  let subtotal = 0;

  groups.forEach((group) => {
    const results = rollDice(group.sides, group.count);
    const groupTotal = results.reduce((sum, val) => sum + val, 0);
    rolls.push({
      sides: group.sides,
      count: group.count,
      results,
      subtotal: groupTotal,
    });
    breakdown.push({
      notation: `${group.count}d${group.sides}`,
      results,
      subtotal: groupTotal,
    });
    subtotal += groupTotal;
  });

  return {
    notation,
    rolls,
    modifier,
    subtotal,
    total: subtotal + modifier,
    breakdown,
  };
}

export function formatRollResult(result: RollResult): string {
  if (!result?.breakdown) {
    return "Invalid roll";
  }

  let output = `Rolling ${result.notation}:\n`;

  result.breakdown.forEach((group) => {
    output += `  ${group.notation}: [${group.results.join(", ")}] = ${group.subtotal}\n`;
  });

  if (result.modifier !== 0) {
    const sign = result.modifier > 0 ? "+" : "";
    output += `  Modifier: ${sign}${result.modifier}\n`;
  }

  output += `Total: ${result.total}`;
  return output;
}
