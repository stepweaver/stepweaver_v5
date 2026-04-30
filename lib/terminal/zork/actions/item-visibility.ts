import { getVisibleItemIdsInRoom, isItemOpen, type GameState } from '../state';
import { ITEMS } from '../world/items';

/** Room-visible items plus inventory and contents of open carried containers (examine / read). */
export function itemIdsVisibleForExamineOrRead(state: GameState): Set<string> {
  const vis = new Set([
    ...getVisibleItemIdsInRoom(state, state.currentRoom),
    ...state.inventory,
  ]);
  for (const carried of state.inventory) {
    const def = ITEMS[carried];
    if (def?.container && isItemOpen(state, carried)) {
      for (const inner of state.containerContents[carried] ?? []) {
        vis.add(inner);
      }
    }
  }
  return vis;
}
