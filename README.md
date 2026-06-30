# λstepweaver portfolio & terminal

Practical transformations, powered by code. A Next.js portfolio with a terminal-first interface, structured case studies, Notion-backed content, and embedded utilities.

## Key surfaces

- Homepage and marketing routes at `/` (projects, resume, codex, contact, capabilities, services)
- Terminal UI at `/terminal` with command-driven navigation, tools, and chat
- λlambda LLM agent for portfolio-native AI chat (terminal `chat <message>` and web chat surfaces)
- Project detail system at `/projects/[slug]` driven by structured case-study data
- Notion-backed codex at `/codex` and Meshtastic docs at `/meshtastic`
- Embedded utilities: RPG Dice Roller, Mail Sort Academy, Yankee Samurai, book-shower embed

## Features

- CRT-inspired hero UI with Operator Card, animated status pill, and Matrix Sync terminal effects
- Next.js 15 App Router with route groups: `(marketing)`, `(terminal)`, and `(embed)`
- Tailwind CSS styling with a cyberpunk / terminal visual language
- Contact form with Nodemailer and Cloudflare Turnstile
- Protected `/api/chat` with CSP nonce middleware, origin checks, Zod validation, and KV rate limits
- Responsive design and machine-readable agent entry points (`/for-agents`, `/llms.txt`, `/operator-profile.json`)

## Flagship systems

- **stepweaver.dev platform**: The portfolio itself. App Router surfaces, reusable project pages, shared chat backend, Notion integrations, and hardened API routes.
- **Carrier's Log**: A personal field log from life as a city letter carrier. Public KPI dashboard, field dispatches, and milestone tracking, fed by a Notion database with a strict public/private boundary. See [Carrier's Log](#carriers-log) below.
- **Mail Sort Academy**: An unofficial letter carrier study game with five scored training modes for mail classification, UBBM, endorsements, and accountable mail.
- **λlambda LLM Chat Agent**: Portfolio-native chat that shares a protected `/api/chat` route across the terminal and web chat widget.

## Carrier's Log

Live at `/carrier-journal`. Case study at `/projects/carrier-journal`.

This is a portfolio artifact, not a USPS product. It documents a personal transformation arc (miles, hydration, recovery, weight trend) while demonstrating systems thinking applied to a physically demanding job.

### Public dashboard (`/carrier-journal`)

- **Aggregate KPI grid**: days logged, miles, hydration, weight lost (not raw weight), heat and weather days, mail load, soreness/energy/mood averages, and DPS stats when logged
- **Field calendar**: month grid of logged days with mileage intensity and weather pips (heat, rain, storm, snow)
- **Milestone panel**: mileage rank ladder (Recruit Walker through Carrier Legend) plus computed field badges for days, distance, weather, load, hydration, safety, and service
- **Field dispatches**: per-shift cards with narrative, metrics, and mail load tier. Only entries with authored public notes appear in the feed; all published rows still feed aggregates
- **Field method and transformation arc**: how the log is used, what is tracked, and lessons for future carriers
- **Strict omission policy**: no addresses, route numbers, coworker names, scanner data, or official volume figures on the public site

### Private logging

Two mobile-first entry points write to the same Notion database:

| Route | Purpose |
| --- | --- |
| `/carrier-journal/log` | Fast DPS count logging with live baseline ratio preview |
| `/log?token=…` | Full daybook: miles, DPS, parcels, hydration, fuel score, mood/energy/soreness, weather, public and private notes |

Both require `NOTION_CARRIER_JOURNAL_DB_ID`, `NOTION_API_KEY`, and `CARRIER_JOURNAL_LOG_SECRET`. Private notes are stored in Notion but never read for public display.

### Data model highlights

- **Mail load tiers** (light / medium / heavy): computed from DPS count and parcel count vs a rolling personal baseline, not manual labels
- **Weather signals**: derived from temperature, heat index, and field notes rather than hand-toggled flags
- **Fuel score**: a six-point daily checklist (breakfast protein, route food, anchors, fruit/veg, Mountain Dew tracking, post-shift meal quality) scored privately in Notion
- **Hydration goals**: weight-aware recommendations with heat band adjustments and optional override
- **Static fallback**: typed seed data in `lib/data/carrier-journal.ts` when Notion is not configured

### Related routes and APIs

- `GET /carrier-journal` (ISR, 5-minute revalidation)
- `POST /api/carrier-journal/log` (DPS upsert)
- `POST /api/carrier-journal/daybook` (full daybook upsert with mail load and fuel score preview)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables from `.env.example` into `.env.local` and fill in what you need (Notion, email, AI chat, Carrier's Log, weather, Turnstile, KV).

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000). Terminal at `/terminal`. Carrier's Log at `/carrier-journal`.

## Environment variables

See [`.env.example`](./.env.example) for the full list. Common groups:

- **Site**: `SITE_URL`, `ALLOWED_ORIGINS`, `ALLOWED_HOSTS`
- **Notion**: `NOTION_API_KEY`, blog/docs/carrier journal database IDs
- **Carrier's Log**: `NOTION_CARRIER_JOURNAL_DB_ID`, `CARRIER_JOURNAL_LOG_SECRET`
- **AI chat**: `GROQ_API_KEY`, `OPENAI_API_KEY`, `PORTFOLIO_KNOWLEDGE_MAX_CHARS`
- **Contact**: `EMAIL_*`, Turnstile keys
- **Rate limiting (production)**: `KV_REST_API_URL`, `KV_REST_API_TOKEN`

## Available Scripts

- `npm run dev` - Start development server
- `npm run dev:3001` - Dev server on port 3001
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Jest
- `npm run test:ci` - CI test run with coverage

## Project Structure

```
├── app/
│   ├── (marketing)/          # Default chrome: navbar, footer, chat widget
│   │   ├── page.tsx          # Home
│   │   ├── carrier-journal/  # Public log + DPS quick log
│   │   ├── codex/            # Notion-backed writing
│   │   ├── projects/         # Project index + [slug] case studies
│   │   └── …                 # resume, contact, meshtastic, services, etc.
│   ├── (terminal)/           # Console-style pages (nav + chat, no site footer)
│   │   ├── terminal/
│   │   ├── mail-sort-academy/
│   │   └── dice-roller/
│   ├── (embed)/              # Minimal chrome (book-shower)
│   ├── log/                  # Protected full daybook (token gate)
│   └── api/                  # chat, contact, codex, carrier-journal, weather, …
├── components/
│   ├── carrier-journal/      # KPI grid, calendar, dispatches, daybook forms
│   ├── terminal/             # Terminal shell and commands
│   └── …
├── lib/
│   ├── data/                 # Project case studies, carrier seed data, milestones
│   ├── carrier-journal/      # Mail load, fuel, weather signals, helpers
│   ├── notion/               # Notion repos (codex, carrier journal, meshtastic)
│   └── validation/           # Zod schemas for API routes
└── __tests__/                # Jest tests for lib utilities and security helpers
```

## Technologies Used

- Next.js 15, React 19, TypeScript
- Tailwind CSS 4
- Notion API (codex, carrier journal, Meshtastic docs)
- Nodemailer, Zod, Jest, Vercel Analytics/KV
- Lucide React and React Icons
