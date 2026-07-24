# λstepweaver - stepweaver.dev

> Systems built from first principles. A Next.js portfolio platform, terminal interface, Notion-backed Codex, AI advocate, and live operational case-study system for Stephen Weaver.

![stepweaver.dev project preview](public/images/stepweaver-dev.png)

## Links

| Surface | URL |
| --- | --- |
| Live site | <https://stepweaver.dev> |
| Projects | <https://stepweaver.dev/projects> |
| Terminal | <https://stepweaver.dev/terminal> |
| Codex | <https://stepweaver.dev/codex> |
| Carrier's Log | <https://stepweaver.dev/carrier-journal> |
| Resume | <https://stepweaver.dev/resume> |
| Contact | <https://stepweaver.dev/contact> |
| Repository | <https://github.com/stepweaver/stepweaver_v5> |

## What this is

`stepweaver.dev` is not a brochure site. It is the public portfolio and working systems lab for Stephen Weaver: full-stack developer, systems builder, automation builder, and AI-integration operator.

The site combines a conventional portfolio with interactive technical surfaces:

- a data-driven project/case-study catalog
- a browser terminal for command-style exploration
- a portfolio-native AI assistant named `λlambda`
- a Notion-backed writing system called the Codex
- a live Carrier's Log field journal with KPIs, milestones, and protected private logging
- standalone utilities and experiments such as Mail Sort Academy, RPG Dice Roller, Meshtastic docs, and embedded booking tools

The point of the repo is to make Stephen's work legible through the codebase itself: routes, data boundaries, security guardrails, content architecture, AI integration, and field-first UX.

## Design philosophy

This repo treats the portfolio as an application platform.

A standard portfolio answers: “What have you built?”

This repo also answers:

- How are project stories modeled?
- How are public and private data separated?
- How does the same AI backend serve a chat widget, terminal command, and project-context assistant?
- How do content systems degrade when Notion is not configured?
- How do small operational tools fit into one coherent personal platform?
- How does a strong visual identity survive real application complexity?

The visual language is terminal-forward, hard-edged, neon, cyberpunk, and system-console inspired. The architecture underneath is intentionally practical: typed data, route groups, reusable renderers, Zod validation, origin checks, cache boundaries, and tested domain utilities.

## Current stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 15 App Router |
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Content | Structured TypeScript data, Notion API |
| AI | Groq primary, OpenAI Responses API fallback |
| Validation | Zod |
| Email | Nodemailer, optional confirmation emails |
| Bot protection | Cloudflare Turnstile, honeypot/timing fields |
| Rate limiting | Vercel KV in production, in-memory fallback locally |
| Analytics | Vercel Analytics |
| Testing | Jest, Testing Library, jsdom |
| Deployment target | Vercel |

## Major surfaces

### 1. Homepage and marketing routes

The marketing side of the app presents Stephen's positioning, profile, services, capabilities, projects, resume, and contact entry points.

Important routes:

| Route | Purpose |
| --- | --- |
| `/` | Homepage, hero, operator card, featured project carousel, current positioning |
| `/brief` | One-page operator brief |
| `/capabilities` | Stack/loadout page with grouped systems and external validation |
| `/services` | Service positioning and offer lanes |
| `/services/reviews` | Review and reputation systems lane |
| `/services/follow-up` | Lead capture and follow-up lane |
| `/services/ops` | Reporting and admin relief lane |
| `/services/web-intake` | Fit-for-purpose web and intake lane |
| `/projects` | Filterable project catalog |
| `/projects/[slug]` | Reusable project case-study renderer |
| `/resume` | Web resume backed by structured data |
| `/contact` | Contact form with bot protection and email delivery |
| `/start-here` | Guided entry path for visitors |
| `/for-agents` | Recruiter/agent-oriented entry point |
| `/privacy` | Privacy page |
| `/theme-audit` | Theme/testing surface |

### 2. Project case-study system

Projects are modeled as typed records in `lib/data/projects/*` and rendered through a reusable project detail page at `/projects/[slug]`.

Key files:

```txt
lib/data/projects.schema.ts
lib/data/projects/index.ts
lib/data/projects/*.ts
app/(marketing)/projects/page.tsx
app/(marketing)/projects/[slug]/page.tsx
components/projects/projects-page-client.tsx
components/project/section-renderer.tsx
components/project/project-case-chat.tsx
```

Each project can define:

- `slug`
- `title`
- `description`
- `status`
- tags and keywords
- card-specific copy
- proof bullets: `builtFor`, `solved`, `delivered`
- case-study sections: overview, problem, solution, architecture, features, engineering, outcomes, tradeoffs, tech stack, evidence, data flow, and related structures
- optional gallery images
- optional live/demo/repo links

The same structured project data feeds the project index, homepage carousel, project pages, and `λlambda` project knowledge.

### 3. Terminal interface

The terminal is a browser-first command surface for exploring the site.

Route:

```txt
/terminal
```

Primary files:

```txt
app/(terminal)/terminal/page.tsx
components/terminal/terminal.tsx
components/terminal/terminal-page-client.tsx
components/terminal/commands/index.ts
components/terminal/types.ts
lib/terminal/*
```

Supported command families include:

| Command | Purpose |
| --- | --- |
| `help` | Show command reference |
| `resume` | Browse resume sections |
| `codex` | Browse Notion-backed posts from the terminal |
| `chat <message>` | Ask `λlambda` from terminal mode |
| `weather [location] [--forecast]` | Fetch weather data through the site API |
| `roll <notation>` | Roll RPG dice notation |
| `contact` | Start contact wizard |
| `carrier`, `mailwalker`, `fieldlog` | Open Carrier's Log |
| `zork`, `adventure` | Play the terminal adventure |
| `blackjack`, `bj` | Play Blackjack |
| `cd <destination>` | Navigate to supported routes |
| `clear` | Clear the terminal |
| `cancel` | Exit active terminal modes |

The terminal shares application logic with standalone surfaces where possible. For example, dice rolls use the same tested roller utility used by the RPG Dice Roller page.

### 4. λlambda AI assistant

`λlambda` is the portfolio-native AI advocate built into the site. It appears in the web chat widget, terminal chat command, and project detail pages.

Primary files:

```txt
app/api/chat/route.ts
hooks/use-chat.ts
components/chat/*
lib/chat/*
lib/validation/chat.schema.ts
```

The chat route:

- accepts JSON only
- validates request bodies with Zod
- normalizes incoming messages and image attachments
- uses Groq by default
- falls back to OpenAI Responses API when configured
- switches model choice when image content is present
- injects channel-aware system instructions for terminal vs widget mode
- can receive project-specific case-study context from `/projects/[slug]`
- extracts and normalizes project citations from model output
- redacts apparent prompt leaks
- caps response length before returning to the client
- uses rate limiting and protected route checks

The project knowledge system is generated from `lib/data/projects` so the assistant answers from actual project records instead of hard-coded marketing copy.

### 5. Codex writing system

The Codex is a Notion-backed publishing surface for developer notes, project posts, experiments, and technical writing.

Routes:

```txt
/codex
/codex/[slug]
/api/codex
/api/terminal/codex
```

Primary files:

```txt
app/(marketing)/codex/page.tsx
app/(marketing)/codex/[slug]/page.tsx
components/codex/*
lib/blog.ts
lib/notion/blog.repo.ts
lib/notion-blocks.ts
lib/codex/selectors.ts
```

Expected Notion blog properties:

| Property | Type | Notes |
| --- | --- | --- |
| `Title` or `Name` | title | Used for display title and slug fallback |
| `Status` | select | Only `Published` rows are read |
| `Date` | date | Display date |
| `Excerpt` or `Description` | rich text | Used as summary |
| `Tags` | multi-select | Used for filtering and labels |

### 6. Meshtastic docs and field notes

The Meshtastic section supports a hybrid content model: static TypeScript docs plus optional Notion-backed docs.

Routes:

```txt
/meshtastic
/meshtastic/[slug]
/meshtastic/field-notes
```

Primary files:

```txt
app/(marketing)/meshtastic/page.tsx
app/(marketing)/meshtastic/[slug]/page.tsx
app/(marketing)/meshtastic/field-notes/page.tsx
components/meshtastic-docs/*
lib/data/meshtastic-content.ts
lib/notion/meshtastic-docs.repo.ts
lib/meshtastic-static-sidebar.ts
lib/meshtastic-docs-headings.ts
```

Expected Notion docs properties:

| Property | Type | Notes |
| --- | --- | --- |
| `Title` | title | Document title |
| `Slug` | rich text | URL slug |
| `Section` | select | Sidebar grouping |
| `Order` | number | Sort order inside section |
| `Status` | select | Only `Published` rows are shown |
| `Summary` | rich text | Optional intro copy |
| Cover image | Notion cover | Optional Open Graph / page image |

The docs renderer can also refresh expiring Notion image URLs through a signed token flow.

### 7. Carrier's Log

Carrier's Log is a personal field log from life as a city letter carrier. It turns daily work into public KPIs, dispatches, weather signals, hydration tracking, mail-load trends, and milestone progression while preserving a strict privacy boundary.

Routes:

```txt
/carrier-journal
/carrier-journal/log
/log?token=...
/api/carrier-journal/log
/api/carrier-journal/daybook
```

Primary files:

```txt
app/(marketing)/carrier-journal/page.tsx
app/(marketing)/carrier-journal/log/page.tsx
app/log/page.tsx
components/carrier-journal/*
lib/data/carrier-journal.ts
lib/data/carrier-milestones.ts
lib/notion/carrier-journal.repo.ts
lib/carrier-journal/*
lib/validation/carrier-log.schema.ts
lib/dps.ts
lib/hydration.ts
```

Public dashboard features:

- aggregate KPI grid
- field calendar
- mileage rank ladder
- achievement/badge panel
- dispatch cards with field notes and metrics
- mail-load classification
- heat/weather flags
- hydration goal tracking
- weekly weight trend display without exposing unnecessary raw detail

Private logging features:

- quick DPS log at `/carrier-journal/log`
- full daybook at `/log?token=...`
- shared secret gate through `CARRIER_JOURNAL_LOG_SECRET`
- Notion upsert by date
- live mail-load preview
- route fuel score
- public note and private note separation

Carrier's Log public/private rules:

- Public reads only use rows where `Publish Public = true`.
- `Private Note` is written to Notion but never read for public rendering.
- The public site avoids addresses, customer names, coworker names, route numbers, scanner data, and internal operational details.
- Static seed data keeps the page deployable if Notion is not configured.

Expected Carrier's Log Notion properties:

| Property | Type |
| --- | --- |
| `Title` | title |
| `Date` | date |
| `Publish Public` | checkbox |
| `Miles Walked` | number |
| `Water Oz` | number |
| `Hydration Goal Oz` | number |
| `Weight Lbs` | number |
| `Soreness (1-10)` | number |
| `Energy (1-10)` | number |
| `Mood (1-10)` | number |
| `Temperature F` | number | Peak air temp °F during shift (9 AM–7 PM), max of 46613/46614 |
| `Heat Index F` | number | Peak heat index °F during shift (9 AM–7 PM) |
| `Average Heat Index F` | number | Average heat index °F across shift hours |
| `Precipitation In` | number | Area precip inches during shift (informational; does not set rain) |
| `Rain` | checkbox | Manual: got rained on during the route |
| `DPS Count` | number |
| `DPS Ratio` | number |
| `Parcels` | number |
| `Mail Day Context` | select |
| `Public Note` | rich text |
| `Private Note` | rich text |
| `Breakfast Protein` | checkbox |
| `Route Food Packed` | checkbox |
| `Route Food Eaten` | select |
| `Protein Anchors` | number |
| `Fruit Veg Servings` | number |
| `Gatorade Count` | number |
| `Mountain Dew Oz` | number |
| `Post Shift Meal Quality` | select |
| `Fuel Score` | number |

### 8. Mail Sort Academy

Mail Sort Academy is an unofficial USPS learning game for mail classification and carrier training practice.

Route:

```txt
/mail-sort-academy
```

Primary files:

```txt
app/(terminal)/mail-sort-academy/page.tsx
components/mail-sort-academy/*
lib/mail-sort-academy/*
__tests__/lib/mail-sort-academy.test.ts
```

It uses card data, scored rounds, study panels, and multiple choice modes to help practice categories such as UBBM, endorsements, accountable mail, and related handling concepts.

### 9. RPG Dice Roller

The dice roller is both a standalone page and a terminal command.

Route:

```txt
/dice-roller
```

Primary files:

```txt
app/(terminal)/dice-roller/page.tsx
components/dice-roller/*
lib/roller.ts
lib/dice-constants.ts
__tests__/lib/roller.test.ts
```

It supports notation parsing, roll history, advantage/disadvantage, rerolls, and Web Crypto-backed randomness.

### 10. Book shower embed

The book shower route is an embedded/minimal-chrome surface backed by a Google Apps Script proxy.

Routes/API:

```txt
/book-shower
/api/book-shower
```

The API protects the proxy with same-origin checks and rate limiting, then forwards GET/POST requests to the configured Apps Script endpoint.

## Application architecture

```txt
app/
  (marketing)/             Default public site chrome: navbar, footer, chat widget
  (terminal)/              Console-style routes: terminal, games, tools
  (embed)/                 Minimal embed routes
  api/                     Internal API routes
  log/                     Protected full Carrier's Log daybook
  llms.txt/                Machine-readable text entry point
  operator-profile.json/   Machine-readable JSON profile

components/
  carrier-journal/         Carrier dashboard, forms, calendar, milestones
  chat/                    Chat widget, messages, citations
  codex/                   Notion block rendering and Codex UI
  command-palette/         Global command palette
  dice-roller/             Standalone dice UI
  effects/                 Background canvas/circuit effects
  hero/                    Homepage hero and carousel
  layout/                  Navbar/footer
  mail-sort-academy/       Study game UI
  meshtastic-docs/         Docs layout, sidebar, affiliate blocks
  project/                 Project renderer and project-scoped chat
  projects/                Projects index UI
  terminal/                Terminal shell, commands, games
  transition/              Navigation transitions
  ui/                      Shared UI primitives

lib/
  carrier-journal/         Fuel, weather, mail-load, and public summary logic
  chat/                    Prompt, provider, citation, request, and normalization logic
  data/                    Structured page/project/resume/carrier data
  email/                   Contact email rendering and HTML escaping
  notion/                  Notion clients and repository adapters
  security/                Protected route and rate limit primitives
  terminal/                Terminal content and game engines
  validation/              Zod schemas for API payloads

hooks/                     Client hooks for chat, bot protection, scroll, swipe, viewport
styles/                    Tailwind theme tokens, base, components, animations, themes
__tests__/                 Jest tests for pure utilities and security/domain logic
public/                    Images, icons, resume PDFs, robots.txt
```

## Route groups

The app uses Next.js App Router route groups to keep UI chrome explicit:

| Group | Purpose |
| --- | --- |
| `app/(marketing)` | Standard site layout: navbar, footer, background canvas, page transitions, chat widget |
| `app/(terminal)` | Console/tool layout: navbar, background canvas, page transitions, chat widget, no standard footer |
| `app/(embed)` | Minimal embed layout for constrained surfaces |
| `app/log` | Protected daybook surface outside the marketing route group |
| `app/api` | Server-side API routes |

## API route map

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/chat` | `POST` | Shared AI chat backend for widget, terminal, and project-context chat |
| `/api/contact` | `POST` | Contact form email delivery with bot checks and rate limiting |
| `/api/weather` | `GET` | Current weather, forecast, geocoding, and carrier shift peak heat fields |
| `/api/codex` | `GET` | Public Codex post list |
| `/api/terminal/codex` | `GET` | Terminal-friendly Codex list/post endpoints |
| `/api/notion-blocks` | `POST` | Allowlisted Notion page block retrieval |
| `/api/notion-image` | `GET` | Signed Notion image URL refresh endpoint |
| `/api/rss` | `GET` | Small RSS proxy/normalizer for approved feed sources |
| `/api/book-shower` | `GET`, `POST` | Google Apps Script proxy for the book shower embed |
| `/api/carrier-journal/log` | `POST`, `PUT` | Quick DPS log save/preview |
| `/api/carrier-journal/daybook` | `POST`, `PUT` | Full Carrier's Log daybook save/preview |
| `/api/debug/carrier-journal` | `GET` | Development-only Notion diagnostic endpoint |
| `/llms.txt` | `GET` | Plain-text AI/recruiter entry point |
| `/operator-profile.json` | `GET` | JSON operator profile for agents and task-routing systems |

## Security and trust boundaries

This repo has several layers of defensive behavior:

### Global middleware

`middleware.ts` adds:

- per-request CSP nonce
- Content Security Policy
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` disabling camera, microphone, and geolocation by default
- `X-Frame-Options: SAMEORIGIN`
- production-only HSTS

### Protected mutable routes

`lib/security/with-protected-route.ts` composes:

- `POST`-only enforcement
- origin and host checks
- JSON parsing
- honeypot detection
- minimum page-age / flow-duration timing checks
- optional Zod validation

### Rate limiting

`lib/security/rate-limit.ts` uses Vercel KV when `KV_REST_API_URL` and `KV_REST_API_TOKEN` are configured, with an in-memory fixed-window fallback for local development or KV failure.

### Data validation

Zod schemas live in `lib/validation` and validate chat, contact, and carrier log payloads before they reach the business logic.

### AI boundaries

The chat system:

- builds a server-only system prompt
- uses structured project knowledge from the repo
- normalizes messages before model calls
- redacts likely prompt leaks
- extracts source citations from model output
- limits assistant text length before responding
- separates website and terminal response modes

### Notion boundaries

Notion integrations avoid broad public reads:

- Codex and docs only read `Published` content.
- Carrier's Log public reads only use `Publish Public = true`.
- `Private Note` is never read for public Carrier's Log rendering.
- `/api/notion-blocks` requires explicit page allowlisting.
- `/api/notion-image` uses signed HMAC tokens for refreshable image URLs.

### Robots and AI crawler policy

The generated `robots.ts` allows normal crawling while disallowing several AI crawlers. The site still exposes intentional agent-facing entry points through `/for-agents`, `/llms.txt`, and `/operator-profile.json`.

## Environment variables

Copy `.env.example` to `.env.local` and fill only the integrations you plan to use.

```bash
cp .env.example .env.local
```

### Site and origin controls

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Canonical site URL used for metadata, sitemap, and agent files |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins for protected routes |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts for protected routes |

### Notion

| Variable | Purpose |
| --- | --- |
| `NOTION_API_KEY` | Shared Notion integration token |
| `NOTION_BLOG_DB_ID` | Codex database ID |
| `NOTION_MESHTASTIC_DOCS_DB_ID` | Meshtastic docs database ID |
| `NOTION_CARRIER_JOURNAL_DB_ID` | Carrier's Log database ID |
| `NOTION_ACHIEVEMENT_UNLOCKS_DB_ID` | Achievement unlock database ID, when used |
| `NOTION_BLOCKS_ALLOWED_PAGE_IDS` | Comma-separated allowlist for `/api/notion-blocks` |
| `NOTION_IMAGE_TOKEN_SECRET` | HMAC secret for signed Notion image refresh tokens |

### Carrier's Log

| Variable | Purpose |
| --- | --- |
| `CARRIER_JOURNAL_LOG_SECRET` | Shared secret for private Carrier's Log forms and APIs |

### AI chat

| Variable | Purpose |
| --- | --- |
| `GROQ_API_KEY` | Primary chat provider key |
| `OPENAI_API_KEY` | Fallback chat provider key |
| `GROQ_MODEL` | Optional primary Groq model override |
| `GROQ_VISION_MODEL` | Optional Groq model for image-capable chat requests |
| `OPENAI_MODEL` | Optional OpenAI fallback model override |
| `AI_MAX_TOKENS` | Optional response token cap |
| `AI_TEMPERATURE` | Optional model temperature |
| `PORTFOLIO_KNOWLEDGE_MAX_CHARS` | Limits project knowledge appended to the system prompt |

### Weather

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_OPENWEATHER_API_KEY` | OpenWeather key for weather/geocoding/forecast support |

The weather route also uses Open-Meteo for carrier shift peak temperature, peak/average heat index, and precipitation (9 AM–7 PM local). Past dates use the Open-Meteo archive API.

### Contact form

| Variable | Purpose |
| --- | --- |
| `EMAIL_SERVICE` | Nodemailer service, defaults to `gmail` |
| `EMAIL_USER` | Sending account |
| `EMAIL_PASS` | App password or SMTP password |
| `EMAIL_TO` | Optional recipient override; defaults to `EMAIL_USER` |
| `SEND_CONFIRMATION_EMAIL` | Send user confirmation email when set to `true` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |

### Book shower embed

| Variable | Purpose |
| --- | --- |
| `BOOK_SHOWER_SCRIPT_URL` | Server-side Google Apps Script proxy target |
| `NEXT_PUBLIC_BOOK_SHOWER_SCRIPT_URL` | Optional client-side embed URL override |

### Vercel KV

| Variable | Purpose |
| --- | --- |
| `KV_REST_API_URL` | Vercel KV REST URL |
| `KV_REST_API_TOKEN` | Vercel KV token |

## Getting started

### Prerequisites

Use Node 20 LTS or newer for local development.

This project uses `npm` and includes a `package-lock.json`.

### Install dependencies

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env.local
```

At minimum, the site can run without most external services. Missing integrations usually degrade gracefully:

- no Notion key/database: Codex/docs/carrier live data return empty or static fallback where supported
- no Groq/OpenAI key: AI chat returns a configuration error
- no email credentials: contact form cannot send
- no OpenWeather key: weather endpoint returns unavailable
- no KV: rate limiting falls back to in-memory storage

### Start development server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Alternative dev port:

```bash
npm run dev:3001
```

### Build production bundle

```bash
npm run build
npm run start
```

### Lint and test

```bash
npm run lint
npm test
```

CI-style test run with coverage:

```bash
npm run test:ci
```

## Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start local Next.js dev server |
| `npm run dev:3001` | Start local dev server on port 3001 |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:ci` | Run ESLint with zero warnings allowed |
| `npm test` | Run Jest |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:coverage` | Run Jest with coverage |
| `npm run test:ci` | CI-friendly Jest run with coverage and limited workers |

## Testing strategy

The strongest test coverage is on shared utilities, parsing, schemas, and domain logic rather than every UI path.

Current test areas include:

```txt
__tests__/lib/carrier-calendar.test.ts
__tests__/lib/carrier-fuel.test.ts
__tests__/lib/carrier-journal.test.ts
__tests__/lib/chat-citations.test.ts
__tests__/lib/chat.schema.test.ts
__tests__/lib/dps.test.ts
__tests__/lib/mail-load.test.ts
__tests__/lib/mail-sort-academy.test.ts
__tests__/lib/project-share-path.test.ts
__tests__/lib/projects-registry.test.ts
__tests__/lib/rate-limit.test.ts
__tests__/lib/roller.test.ts
__tests__/lib/structured-data.test.ts
__tests__/lib/zork-parser.test.ts
```

Good future test targets:

- terminal command reducer behavior
- project filter UI
- contact form states
- Carrier's Log daybook form states
- Codex/Notion block rendering edge cases
- theme persistence and theme bootstrap behavior

## Common development workflows

### Add a new project case study

1. Create a new file in `lib/data/projects/`.
2. Export a `Project` object matching `projects.schema.ts`.
3. Add the project import to `lib/data/projects/index.ts`.
4. Add the slug to `FEATURED_SLUGS` if it belongs in the homepage carousel.
5. Add the slug to `CATALOG_ORDER` if it needs a specific catalog position.
6. Add supporting images under `public/images/`.
7. Visit `/projects` and `/projects/[slug]` locally.
8. Run `npm test` to catch schema/order issues.

### Add a Codex post

1. Create or update the page in the Notion blog database.
2. Set `Status` to `Published`.
3. Add title, date, excerpt/description, and tags.
4. Visit `/codex` and `/codex/[slug]`.
5. Check `/api/codex` if the page does not appear.

### Add a Meshtastic doc

1. Add a static doc in `lib/data/meshtastic-content.ts` or create a Notion docs row.
2. For Notion docs, set `Status = Published`, `Slug`, `Section`, and `Order`.
3. Visit `/meshtastic` and `/meshtastic/[slug]`.
4. Verify sidebar grouping and previous/next navigation.

### Log a Carrier's Log entry

1. Ensure `NOTION_API_KEY`, `NOTION_CARRIER_JOURNAL_DB_ID`, and `CARRIER_JOURNAL_LOG_SECRET` are set.
2. Open `/log?token=<secret>` for the full daybook.
3. Use `/carrier-journal/log` for quick DPS count logging.
4. Confirm the Notion row is created or updated by date.
5. Confirm public output on `/carrier-journal` only shows intended public content.

### Add a terminal command

1. Add the command handler to `components/terminal/commands/index.ts`.
2. Extend `TerminalMode` in `components/terminal/types.ts` if the command needs a persistent mode.
3. Keep shared logic in `lib/terminal` or a dedicated `lib` utility instead of burying it in the UI.
4. Add tests for parser/domain behavior when practical.

## Deployment notes

The app is designed for Vercel.

Recommended deployment checklist:

1. Set all required environment variables in Vercel for Production and Preview as needed.
2. Set `SITE_URL` to the canonical production domain.
3. Set `ALLOWED_ORIGINS` and `ALLOWED_HOSTS` explicitly in production.
4. Configure Notion integration access to each database used by the app.
5. Configure Cloudflare Turnstile for the production and local domains.
6. Configure email credentials for the contact form.
7. Configure Vercel KV for production rate limiting.
8. Redeploy after changing environment variables.
9. Smoke test `/`, `/projects`, `/terminal`, `/codex`, `/carrier-journal`, `/contact`, `/llms.txt`, and `/operator-profile.json`.

## Performance notes

Performance-oriented choices in this repo include:

- App Router server components where useful
- dynamic imports for heavy client modules
- local font loading
- image optimization with AVIF/WebP support
- cache headers on safe JSON endpoints
- Notion fetch caching through `unstable_cache`
- bounded Notion pagination
- capped AI context length through `PORTFOLIO_KNOWLEDGE_MAX_CHARS`
- middleware matcher that avoids static assets and Next internals

## Accessibility and UX notes

The app includes:

- skip link to main content
- keyboard-accessible navigation targets
- command palette entry point
- theme persistence
- reduced-overhead route groups for different UI modes
- mobile-first Carrier's Log forms
- semantic headings and metadata for project/Codex pages

Future accessibility improvements should prioritize terminal keyboard flows, focus management inside modal/chat surfaces, and richer screen-reader labels for decorative console UI.

## Machine-readable surfaces

This repo intentionally exposes agent-readable entry points:

| Route | Format | Purpose |
| --- | --- | --- |
| `/llms.txt` | text/plain | Summary and entry points for AI/recruiter agents |
| `/operator-profile.json` | JSON | Structured operator profile |
| `/for-agents` | HTML | Human/agent readable overview |
| `/sitemap.xml` | XML | Search engine sitemap |
| `/robots.txt` | text/plain | Crawler policy |

## Clean-room rebuild notes

This repo includes `AGENTS.md` and `.opencode` instructions describing the rebuild constraints and target style.

The rebuild rules emphasize:

- preserve the terminal-forward identity
- keep the cinematic cyberpunk feel and hard edges
- rebuild behavior from understanding, not mechanical copying
- improve architecture consistency, metadata, performance, and maintainability
- favor modularity and clearer boundaries over source parity

These files are useful context for agentic coding sessions and future cleanup work.

## Known tradeoffs

- Some UI components are intentionally large because the surfaces are complex, especially the terminal and generic project page.
- Test coverage is strongest around pure utilities and shared domain logic, not every rendered UI path.
- Production behavior depends on correctly configured origins, hosts, Notion access, and optional KV.
- Notion-backed content creates runtime integration complexity; static fallbacks reduce but do not remove that dependency.
- Carrier's Log uses a shared-secret gate instead of a full auth system because it is a personal tool with low user-management needs.
- Some routes are experiments or living artifacts, so not every page has the same level of polish or content density.

## Repository hygiene

Do not commit:

```txt
.env.local
.env*.local
.next/
node_modules/
coverage/
```

Before pushing meaningful changes:

```bash
npm run lint
npm test
npm run build
```

## License

This is a personal portfolio and business codebase. No open-source license is currently declared. Unless a `LICENSE` file is added, assume all rights are reserved.

## Maintainer

Built and maintained by Stephen Weaver under the `λstepweaver` brand.

- Site: <https://stepweaver.dev>
- Contact: <https://stepweaver.dev/contact>
- GitHub: <https://github.com/stepweaver>
