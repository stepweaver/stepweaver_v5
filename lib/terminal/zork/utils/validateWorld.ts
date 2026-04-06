import { ITEMS } from '../world/items';
import { ROOMS } from '../world/rooms';
import type { Direction } from '../direction';

export interface WorldValidationIssue {
  code: string;
  message: string;
}

export function validateWorld(): WorldValidationIssue[] {
  const issues: WorldValidationIssue[] = [];
  const roomIds = new Set(Object.keys(ROOMS));

  for (const [roomId, room] of Object.entries(ROOMS)) {
    for (const [dir, target] of Object.entries(room.exits)) {
      if (!target) continue;
      if (!roomIds.has(target)) {
        issues.push({
          code: 'BAD_EXIT',
          message: `Room "${roomId}" exit ${dir} → unknown room "${target}"`,
        });
      }
    }
    for (const itemId of room.initialItems) {
      if (!ITEMS[itemId]) {
        issues.push({
          code: 'BAD_ROOM_ITEM',
          message: `Room "${roomId}" references unknown item "${itemId}"`,
        });
      }
    }
  }

  for (const [itemId, def] of Object.entries(ITEMS)) {
    for (const inner of def.initialContents ?? []) {
      if (!ITEMS[inner]) {
        issues.push({
          code: 'BAD_CONTAINER_CONTENT',
          message: `Item "${itemId}" initialContents references unknown "${inner}"`,
        });
      }
    }
    for (const u of def.under ?? []) {
      if (!ITEMS[u]) {
        issues.push({
          code: 'BAD_UNDER',
          message: `Item "${itemId}" under[] references unknown "${u}"`,
        });
      }
    }
  }

  return issues;
}

export function assertValidWorld(): void {
  const issues = validateWorld();
  if (issues.length > 0) {
    const msg = issues.map((i) => i.message).join('\n');
    throw new Error(`Invalid world data:\n${msg}`);
  }
}

/** All direction strings used in room defs (for scripted overrides). */
export const ALL_DIRECTIONS: Direction[] = [
  'north',
  'south',
  'east',
  'west',
  'northeast',
  'northwest',
  'southeast',
  'southwest',
  'up',
  'down',
  'in',
  'out',
];
