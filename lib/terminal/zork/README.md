# Terminal text adventure engine

Headless interactive-fiction engine used by the portfolio terminal’s `adventure` command. It is **not** a Z-machine interpreter: logic is browser-native TypeScript with an explicit command pipeline.

The bundled content is a compact, finishable mini-adventure (about 10–15 minutes): explore the house and cellar, recover a single original artifact from the underground, and return it to the trophy case to win.

## Layout

```text
raw input → normalize → parse → resolve objects (in handlers) → dispatch → next state + output lines
```

- **Engine:** [`engine.ts`](./engine.ts) (`runCommand`, `getOpeningLines`)
- **State:** [`state.ts`](./state.ts): serializable `GameState` (rooms, items, inventory, flags, lamp, score)
- **World data:** [`world/rooms.ts`](./world/rooms.ts), [`world/items.ts`](./world/items.ts), [`world/flags.ts`](./world/flags.ts)
- **Parser:** [`parser.ts`](./parser.ts): directions, `go`/`move`, `turn on/off`, verb + noun phrase
- **Actions:** [`actions/`](./actions/): movement, look, inventory, containers, lightweight combat verbs, meta verbs
- **Adapter:** [`adapters/terminalAdapter.ts`](./adapters/terminalAdapter.ts): maps semantic `OutputLine`s to terminal HTML; handles `save` / `restore` / `restart` via [`persistence/saveGame.ts`](./persistence/saveGame.ts) (`localStorage`)
- **Integration:** the portfolio terminal uses a small adapter in [`../../zork-terminal.ts`](../zork-terminal.ts) to map engine output lines into terminal line variants and to handle `save` / `restore` / `restart`.

## Extending content

1. **Rooms:** Add an entry to `ROOMS` with unique `id`, `exits` (targets must exist), and `initialItems`.
2. **Items:** Add to `ITEMS`; use `initialContents` for closed containers, `under` for hidden objects revealed by `move`.
3. **Synonyms:** Extend [`content/synonyms.ts`](./content/synonyms.ts) `EXTRA_ALIASES` for player phrases.
4. **Scripting:** Use `flags` and `exitOverrides` in action handlers (see window / trap door in [`actions/containers.ts`](./actions/containers.ts)).
5. **Validation:** Run tests or call `validateWorld()` from [`utils/validateWorld.ts`](./utils/validateWorld.ts) after edits.

## Tests

Jest specs live in [`tests/`](./tests/) (`parser`, `validateWorld`, `movement`, transcript-style early game).

## What this is / isn’t

- **This is** an original, browser-native text adventure engine (parser-driven interactive fiction).
- **This is** inspired by classic command-line parser games.
- **This is not** a full Zork clone or recreation.
- **This is not** a Z-machine interpreter.

## Mini-adventure win condition (high level)

- Explore into the cellar and underground passages.
- Use light to safely navigate the dark.
- Find the **glass signal prism** (the single artifact).
- Return to the living room and place it at the **trophy case** to complete the adventure.

## Engine features

- Parser directions + verb/noun phrases (`go`, `turn on/off`, etc.)
- Rooms, exits, inventory, containers (including carried containers)
- `move` reveal mechanics (`under`)
- Lamp/darkness + fuel drain on movement
- Score/moves + named story flags
- Save/restore/restart (via adapter + localStorage)

## What’s intentionally thin

- **NPCs / combat:** `NPCS` is empty; `attack`/`kill` return a generic line until enemies exist.
- **Score:** `SCORE_MAX` is a small cap for this port; tune events in movement/inventory/actions as you add goals.

This project aims to capture the *feel* of classic cave-crawl adventures while remaining an original work.
