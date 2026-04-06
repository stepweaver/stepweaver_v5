# Terminal text adventure engine

Headless interactive-fiction engine used by the portfolio terminal’s `zork` command. It is **not** a Z-machine interpreter: logic is data-driven TypeScript with an explicit command pipeline.

## Layout

```text
raw input → normalize → parse → resolve objects (in handlers) → dispatch → next state + output lines
```

- **Engine:** [`engine.ts`](./engine.ts) (`runCommand`, `getOpeningLines`)
- **State:** [`state.ts`](./state.ts): serializable `GameState` (rooms, items, inventory, flags, lamp, score)
- **World data:** [`world/rooms.ts`](./world/rooms.ts), [`world/items.ts`](./world/items.ts), [`world/flags.ts`](./world/flags.ts)
- **Parser:** [`parser.ts`](./parser.ts): directions, `go`/`move`, `turn on/off`, verb + noun phrase
- **Actions:** [`actions/`](./actions/): movement, look, inventory, containers, combat stub, meta verbs
- **Adapter:** [`adapters/terminalAdapter.ts`](./adapters/terminalAdapter.ts): maps semantic `OutputLine`s to terminal HTML; handles `save` / `restore` / `restart` via [`persistence/saveGame.ts`](./persistence/saveGame.ts) (`localStorage`)
- **Integration:** [`../../data/zork.js`](../../data/zork.js) lazy-loads the adapter; session flag lives in [`../../data/zorkBridge.js`](../../data/zorkBridge.js)

## Extending content

1. **Rooms:** Add an entry to `ROOMS` with unique `id`, `exits` (targets must exist), and `initialItems`.
2. **Items:** Add to `ITEMS`; use `initialContents` for closed containers, `under` for hidden objects revealed by `move`.
3. **Synonyms:** Extend [`content/synonyms.ts`](./content/synonyms.ts) `EXTRA_ALIASES` for player phrases.
4. **Scripting:** Use `flags` and `exitOverrides` in action handlers (see window / trap door in [`actions/containers.ts`](./actions/containers.ts)).
5. **Validation:** Run tests or call `validateWorld()` from [`utils/validateWorld.ts`](./utils/validateWorld.ts) after edits.

## Tests

Jest specs live in [`tests/`](./tests/) (`parser`, `validateWorld`, `movement`, transcript-style early game).

## What’s intentionally thin

- **NPCs / combat:** `NPCS` is empty; `attack`/`kill` return a generic line until enemies exist.
- **Dungeon stubs:** `canyon-view`, `reservoir-south`, `east-west-passage`, and `crawlway` are minimal connectors so the graph validates; expand with real puzzles and prose.
- **Score:** `SCORE_MAX` is a small cap for this port; tune events in movement/inventory/actions as you add goals.

Prose and puzzles are an **homage** to classic cave-crawl games; this implementation uses original code and paraphrased descriptions to avoid trademark-heavy presentation.
