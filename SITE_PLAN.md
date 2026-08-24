# SITE_PLAN.md

Editorial specification for stepweaver.dev. This is the source of truth for hierarchy, identity, and page tests. Visual language stays. New ideas go in `FUTURE.md`, not here.

**Design brief:** stepweaver.dev is the professional home of Stephen Weaver, a Business Systems Developer who turns operational problems into working software. It provides fast evidence for hiring managers and deep evidence for technical reviewers, while preserving a separate space for writing and experimentation.

## The test: 10 seconds → 2 minutes → 20 minutes

Every design decision must pass this test.

**10 seconds.** A hiring manager knows:

- Who: Business Systems Developer
- What: messy operational workflows into production software
- How to act: Work, Resume, Contact

**2 minutes.** They can see:

- Six strongest proofs
- How he works (analysis → design → implementation)
- Experience chronology that matches the résumé
- Skills in plain language
- A way to talk

**20 minutes.** They can fall down the rabbit hole: Terminal, Field Journal, Lab experiments, archive, deeper writing.

If a page, nav item, or homepage block fails the 10-second or 2-minute test, it does not belong in the lobby.

## Identity lock

Canonical file: [`lib/data/identity.ts`](lib/data/identity.ts)

- **Primary title:** Business Systems Developer
- **Supporting line:** Full-stack development · internal tools · automation · operational software

The title is right. It must not erase *developer*. Supporting copy, project blurbs, and the six proofs must continually show **production software shipped**, not “BA who sometimes scripts.” Preferred stack phrase:

> Full-stack development · internal tools · automation · operational software

Near-synonym title piles are forbidden on core surfaces (`Software Developer · Business Systems Developer · Automation & AI Integration` as co-equal headlines). Applications may still adapt vocabulary per job posting.

Keep `HMFIC-01`, the HUD, λ, and the terminal aesthetic. Do not make anyone decode “loadout,” “intel,” “deployment registry,” or “matrix link” to decide whether he knows TypeScript.

**Language rule:** plain language carries professional information; λstepweaver language decorates and rewards exploration.

## Route map

### CORE (primary nav)

Work · About · Writing · Resume · Contact · Lab

| Route | Job |
| --- | --- |
| `/` | One-page professional argument |
| `/work` | Six proofs only |
| `/about` | Full fit + career transition |
| `/writing` | Professional/technical first |
| `/resume` | Same argument as the site |
| `/contact` | Talk |
| `/lab` | Pressure-release valve for curiosity |

### LAB (not the lobby)

Terminal, λlambda, Meshtastic, Dice, Mail Sort Academy, Field Journal, Yankee Samurai, SvelteKit rebuild. Reached from Lab, footer, command palette, or a quiet homepage tail link.

### ARCHIVE

Remaining `/work/[slug]` case studies. Not deleted. Listed at `/work/archive`. Linked from Work as “More work.”

### SECONDARY (live, not primary nav)

`/services` — selective consulting. Linked from About, not the hero.

`/play` — permanent redirect to `/lab`.

## Featured six

Each line is what the project **proves** as production software evidence.

| Slug | Name | Proves |
| --- | --- | --- |
| `parcel-sweep` | Parcel Sweep | Operational workflow modeling + full-stack architecture |
| `silent-auction` | Silent Auction | Production app + realtime + users + business rules |
| `lsigil-setup` | λsigil | Business automation + deterministic systems + AI boundaries |
| `bill-planner` | λledger | Product thinking + data modeling + application UX |
| `mishawaka-shower-booking` | Mishawaka Shower Booking | Process analysis → practical internal tool |
| `portfolio-terminal` | Terminal | Technical creativity + AI integration + frontend systems |

Sixth slot is Terminal, not a separate λlambda card. λlambda is Lab / related work, linked from the Terminal case study.

## Homepage (2-minute résumé)

Order:

1. **Hero** — identity, supporting line, Work / Resume / Contact. Keep HUD card. Role reads Business Systems Developer. Drop services sublink. Drop Yankee Samurai / Rebel / Play as hiring CTAs. `HMFIC-01` may stay as chrome.
2. **Six proofs** — featured systems with the proves line on each card.
3. **How I work** — business analysis → system design → implementation.
4. **Experience** — chronology that matches the résumé. Lead with λstepweaver (shipping software) and Notre Dame BA (2017–2025). **Demote the mail-carrier chapter; do not hide the timeline.** One quiet present-tense line is enough so a recruiter is not confused when they open the résumé. Full transition copy lives on About.
5. **Skills** — existing stack grid, titled Skills (not Loadout).
6. **Writing** — pinned professional/technical posts.
7. **CTA** — Resume / Contact. Quiet Lab/Terminal link at the end.

Do not put Field Journal, Play, or “current mail-carrier chapter” as major homepage beats.

## Work

`/work` shows the six proofs and a short positioning sentence. No archive dump. No Learning Lab panel. Link to `/work/archive` for the rest. Tag filters belong on archive. All existing `/work/[slug]` routes stay.

About flagships must use the same six.

## Writing

Writing stays in primary nav. Default: professional/technical first, other posts below. Ladybugs remain published, not featured. Metadata should say systems / requirements / architecture writing.

## Lab

Lab absorbs Play. It is the architectural answer to “too many directions”: curiosity continues without competing with the hiring narrative.

## Implementation order

1. This file
2. Lock `lib/data/identity.ts`
3. Navigation
4. Homepage
5. Work
6. Writing

Do not invent λstepweaver v6. Edit v5 until the site makes the same argument as the résumé.

## Page test

Every core page must answer: **why hire Stephen to build business software?**
