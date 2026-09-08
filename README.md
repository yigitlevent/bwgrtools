# bwgrtools

<https://yigitlevent.com/bwgrtools>

A browser-based companion toolset for the **Burning Wheel Gold Revised** tabletop RPG — a React client with a set of calculator/reference tools (character creation, dice rolling, combat and magic planners, rules lookup tables) backed by a Fastify API and a PostgreSQL reference database of the ruleset's content.

## Root Structure

```text
bwgrtools/
├── api/       Fastify REST API (auth + ruleset data)
├── client/    Vite + React frontend
├── shared/    PostgreSQL schema, migrations, type generation, env/logger utils
├── .tests/    Vitest test suite (separate package, mirrors source structure)
├── .scripts/  Deployment script and deployment guide
├── .env.example
└── package.json   root scripts (runs api + client concurrently)
```

### api/src/

| Directory | Purpose |
| --- | --- |
| `configs/` | CORS and session setup |
| `controllers/` | Request handlers (`ruleset.controller.ts`, `user.controller.ts`) |
| `middlewares/` | Auth/access guards (`access.middleware.ts`) |
| `routes/` | Route registration (`bwgr.route.ts`, `user.route.ts`) |
| `services/` | One query module per ruleset data domain (stocks, skills, traits, lifepaths, spell facets, Duel of Wits/Range and Cover/Fight actions, practices, questions, resources, abilities, settings) |
| `utils/` | Logger and error helpers |
| `validators/` | AJV schemas for auth requests |

### client/src/

| Directory | Purpose |
| --- | --- |
| `components/Menu/` | App chrome — top bar, ruleset selector, sign in/up, tool picker drawers |
| `components/Tools/` | One folder per RPG tool (Character Burner, Dice Roller, Duel of Wits/Range and Cover/Fight planners, Practice Planner, Magic Wheel, and the Lifepath/Skill/Trait/Resource lookup lists) |
| `components/Shared/` | Small reusable UI pieces |
| `hooks/apiStores/` | App-wide Zustand stores (`useRulesetStore`, `useUserStore`) |
| `hooks/featureStores/` | Per-tool Zustand stores, including `CharacterBurnerStores/` |
| `logic/` | Pure Burning Wheel rules math (attribute formulas, resource cost) |
| `utils/` | Misc pure helpers (dice probability, fetch wrapper, array/object utilities) |

### shared/

| Directory/File | Purpose |
| --- | --- |
| `@types/` | Ambient type declarations — the ruleset data contract (`bwgr.d.ts`), character sheet shapes (`character.d.ts`), branded ids, env, session, and the auto-generated `db.d.ts` |
| `db/migrations/` | Numbered SQL migrations — schema (`000xx`) then ruleset seed data (`100xx`) |
| `db/migrate.ts` | Runs pending migrations |
| `db/reset.ts` | Drops and recreates the database |
| `db/type.ts` | Generates TypeScript types from the DB schema |
| `db/utils/pgPool.ts` | Postgres pool wrapper |
| `utils/` | Env and logger utilities shared by `api/` |

## Environment

Copy `.env.example` to `.env` in the root and fill in each value:

```env
VITE_ENV=dev               # dev | prod
VITE_API_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173
API_PORT=3000
API_INTERNAL_URL=http://localhost:3000
API_SECRET=<random secret>
DB_USER=<postgres user>
DB_PASS=<postgres password>
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bwgr
SIGNIN_LOCKOUT_THRESHOLD=5
LOG_LEVEL=info              # optional, defaults to info
PGPOOL_MAX=10               # optional, defaults to 10
```

Each package reads `.env` from the repo root via `dotenv`.

## ESLint

ESLint config lives in `shared/eslint.config.mjs` and is extended by each package. Key rules:

- **TypeScript**: `strictTypeChecked` + `stylisticTypeChecked`, explicit return types required, no `any`
- **Imports**: enforced ordering (builtin → external → internal → CSS), no duplicates, `import type` preferred
- **Style**: 2-space indent, double quotes, semicolons, stroustrup brace style, no trailing commas (`@stylistic/*`)
- **Naming**: camelCase for locals/functions, PascalCase for global vars/functions/types, no restriction on properties
- Each package's `eslint.config.mjs` spreads the shared config and may turn off rules that don't apply (e.g. most React stylistic rules are disabled in `api/`)

Run `npm run lint` or `npm run lintfix` in `api/`, `client/`, or `shared/`.

## Starting Development

**Prerequisites:** Node.js, PostgreSQL running locally with a database named `bwgr`.

**1. Install dependencies** in each package:

```bash
cd api    && npm install && cd ..
cd client && npm install && cd ..
cd shared && npm install && cd ..
cd .tests && npm install && cd ..
```

**2. Set up the database** (from repo root):

```bash
npm run db:all
# runs: reset → migrate → generate types
```

**3. Start api and client** (from repo root):

```bash
npm run dev
```

Individual packages also have their own `npm run dev` scripts if you need to run them separately.
