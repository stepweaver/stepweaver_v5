# stepweaver.dev rebuild lab

This repository is a clean-room rebuild workspace for stepweaver.dev.

## Non-negotiable constraints

- The ONLY writable location is the current rebuild workspace.
- `C:/Users/stephen/source/stepweaver_v3/` is a read-only reference repo.
- `C:/Users/stephen/source/ai-references/` contains read-only methodology and skill repos.
- Never copy, bulk move, or mirror files from any external directory into this workspace.
- Never reproduce the source repository mechanically file-for-file.
- Rebuild behavior, structure, and UX from understanding, not duplication.

## Required workflow

1. Inspect the source repo and reference repos.
2. Produce a concise rebuild plan:
   - architecture
   - route map
   - component map
   - data/content strategy
   - what will be preserved
   - what will be improved
3. Scaffold a fresh implementation in this workspace.
4. Rebuild feature sets incrementally.
5. Test after each major milestone.

## Rebuild standard

- Favor cleaner architecture over source parity.
- Preserve brand identity and key behaviors.
- Prefer simpler, more maintainable implementations when behavior can be preserved.
- Keep the cyberpunk / terminal / hard-edge visual language.
- Avoid rounded-corner design drift unless explicitly requested.
- Prefer Next.js App Router, React, and Tailwind if they still fit the target.

## Anti-copy rules

- Do not use copy, xcopy, robocopy, cp, mv, or move to transfer source files.
- Do not preserve filenames 1:1 unless there is a strong architectural reason.
- Do not recreate directory structure blindly.
- Summarize what you learned before implementing each subsystem.

## Reference priorities

1. `stepweaver_v3` = source of product intent, behavior, and content
2. `superpowers` = workflow discipline
3. `everything-claude-code` = agent habits / quality gates
4. `ui-ux-pro-max-skill` = UI and UX decisions
5. `browser-use` = optional browsing or behavior verification
6. `claude-mem` = optional memory across long sessions
7. `n8n-mcp` = optional automation, not required for core rebuild
