# codebase.md

This file provides guidance to LLMs when working with code in this repository.

## Project Overview

bwgrtools is a browser-based companion toolset for the **Burning Wheel Gold Revised** tabletop RPG. It's a monorepo with three packages: `api/`, `client/`, and `shared/`. The client offers a set of calculator/reference tools built around the ruleset — a character-creation wizard ("Character Burner"), a dice roller, Duel of Wits / Range and Cover / Fight action planners, a Practice (training) planner, a Magic Wheel spell builder, and browsable Lifepath/Skill/Trait/Resource lookup lists — backed by a static PostgreSQL database of the ruleset's content.

There is no game server, no WebSocket protocol, no worker/tick pipeline, no Rust/wasm rendering layer, and no user accounts / auth system — this is a plain, unauthenticated REST API + SPA.

## Commands

```bash
# Development (from repo root)
npm run dev              # starts api + client concurrently

# Database (from repo root)
npm run db:all           # reset → migrate (schema + seed data) → generate types

# Individual DB steps (from shared/)
npm run db:reset         # drops and recreates database
npm run db:migrate       # runs pending SQL migrations (schema + seed data both live here)
npm run db:type          # regenerates shared/@types/db.d.ts from DB schema

# Tests (from repo root)
npm test                 # vitest run (api/shared node tests + client jsdom tests)
npm run test:watch       # vitest watch mode
npm run test:coverage    # vitest with v8 coverage

# Lint (from api/, client/, or shared/)
npm run lint
npm run lintfix

# Build (api/ or client/)
npm run build            # api: tsc --build · client: tsc && vite build
```

## Architecture

### Package Relationships

- **shared/** — DB migrations, auto-generated types, Postgres pool wrapper, and env utilities. Not a standalone app; imported by `api/` and `client/` via relative `../../shared/` paths. Unlike a split "protocol vs. db" layout, `shared/` here is flat:
  - `shared/@types/` — ambient `.d.ts` files (`declare namespace`, no imports needed): `bwgr.d.ts` (Ability, Skill, Trait, Lifepath, Resource, Ruleset, Stock, Setting, DoWAction, FightAction, RaCAction, SpellFacets/AltSpellFacets, Practice, Question, and the `RulesetResponse`/`RulesetsResponse` API contract), `character.d.ts` (Character Burner-specific shapes — `CharacterAttribute`/`Skill`/`Trait`/`Resource`, `CharacterSpecial`, `CharacterStockLimits`, `CharacterBurnerExportSnapshot`), `db.d.ts` (auto-generated row types), `env.d.ts` (`Env`/`ClientEnv`/`ApiEnv`), `id.d.ts` (branded id types per schema, `Nominal<>` pattern).
  - `shared/db/` — `migrate.ts`/`reset.ts`/`type.ts` DB tooling scripts, `_initial/0_reset.sql`, `migrations/` (numbered SQL files), and `utils/pgPool.ts` (the `Queryable`/`PgPool` wrapper, `WithTransaction`, `CheckDbPool`). Reachable from `api/` and `shared/`'s own tooling; not imported by `client/`.
  - `shared/utils/` — `env.ts`, shared by `api/` (and imported directly rather than split into client-safe/server-only halves).
- **api/** — Fastify REST API (no WebSockets). Handles ruleset data (`bwgr.route.ts`) over plain HTTP under an `/api` prefix — no auth, no sessions. Helmet, CORS, and rate-limit plugins are registered in `api/src/index.ts`, along with a global error handler and graceful SIGINT/SIGTERM shutdown.
- **client/** — Vite + React frontend. Mantine UI, Zustand state, a thin `Fetch` wrapper for REST calls — no WebSocket client. Routed tools live under `components/Tools/`; app chrome (top bar, ruleset selector, tool picker) lives under `components/Menu/`.

### Database

PostgreSQL with a `dat` schema (ruleset content — stocks, skills, traits, lifepaths, spell facets, combat actions, resources, practices, questions) plus a `meta` schema (migration bookkeeping), plus list views (`00001_create_list_views.sql`). The database (`DB_NAME=bwgr`) is entirely read-only reference data — the Burning Wheel Gold Revised rulebook content — seeded directly by migrations rather than loaded from a separate data source.

Migrations live in `shared/db/migrations/`. After adding or changing a migration, check whether `shared/db/type.ts` needs a matching update — it is not regenerated automatically.

### Type System

- `shared/@types/db.d.ts` is **auto-generated** from the DB schema via `npm run db:type` (uses `sql-ts`). Do not edit manually.
- Branded ID types (per schema, `Nominal<>`-based) live in `shared/@types/id.d.ts`. Always use the branded id for any id-shaped value — never a bare `string`/`number`.
- All types are declared as ambient (`declare namespace`) — no imports needed.

### API Request Pattern

The client fetches the full ruleset dataset in two calls, both handled by `ruleset.controller.ts`: `GET /ruleset/list` (`GetRulesetsList`, backed by `rulesets.service.ts`) to populate the ruleset selector, then `POST /ruleset/data` (`GetRulesetsData`) once a ruleset is chosen, which aggregates every other `api/src/services/*.service.ts` query (stocks, skills, traits, lifepaths, spell facets — base and `.alt` for the alternate magic system — DoW/RaC/fight actions, practices, questions, resources, abilities, settings) into one `RulesetResponse` payload. There is no auth — every endpoint is public.

### Client State

- `hooks/apiStores/` holds the app-wide Zustand store: `useRulesetStore` (fetches and holds the entire ruleset dataset, both as arrays and `*ById` `Map`s, plus by-name/by-id lookup helpers).
- `hooks/featureStores/` holds one Zustand store per tool: `CharacterBurnerStores/` splits the Character Burner into `useCharacterBurnerBasics`/`Stat`/`Skill`/`Trait`/`Attribute`/`Lifepath`/`Resource`/`Limits`/`Special` (plus helpers like `recomputeCharacter.ts`, not stores), and each planner tool (`useDuelOfWitsPlannerStore`, `useFightPlannerStore`, `useRangeAndCoverPlannerStore`, `usePracticePlannerStore`, `useLifepathRandomizerStore`) has its own store.
- `logic/` holds pure Burning Wheel rules math kept separate from the stores: `attributeFormulas.ts` (derived-stat formulas, e.g. Mortal Wound, Reflexes) and `resourceCost.ts` (resource cost/modifier calculation for the Character Burner's Resources section).

### Tools (client/src/components/Tools/)

| Tool | Purpose |
| --- | --- |
| `CharacterBurner/` | Character-creation wizard — Stock, Lifepaths, stat/skill/trait point spending, derived stats, Beliefs/Instincts, and export of a character sheet snapshot |
| `DiceRoller/` | Dice roller with probability display |
| `DuelOfWitsPlanner/` | Duel of Wits (social combat) action reference/planner |
| `FightPlanner/` | Melee/fight action reference/planner |
| `RangeAndCoverPlanner/` | Ranged combat action reference/planner |
| `LifepathLists/` | Browsable lifepath table with requirements/skills/traits sub-views |
| `SkillLists/` / `TraitLists/` / `ResourcesList/` | Browsable reference tables |
| `MagicWheel/` | Interactive spell-building wheel (plus a `MagicWheelAlt` variant for the alternate magic system) |
| `PracticePlanner/` | Training/practice test timetable planner |

## Code Style

### Formatting

- Double quotes, semicolons, 2-space indent, stroustrup brace style (single-line allowed).
- No trailing commas. No multiline ternaries.
- Arrow parens only when needed (`as-needed`).
- Two blank lines after imports (`import/newline-after-import` count: 2).

### Naming

- `camelCase` for locals and non-exported functions.
- `PascalCase` for exported/global functions, global variables, types, enum members, and React components.
- Exported React hooks (`use*`) stay `camelCase`.
- No format restriction on object properties.

### TypeScript

- Strict mode with `strictTypeChecked` + `stylisticTypeChecked`.
- Explicit return types required on functions (`explicit-function-return-type`, `explicit-module-boundary-types`).
- `no-explicit-any` is an error.
- Use `import type` for type-only imports (`consistent-type-imports`).
- Unused vars are warnings; prefix with `_` to silence.

### Imports

- Ordered: builtin → external → internal → parent/sibling → type-only → CSS. Alphabetized within groups.
- `import type` preferred via `consistent-type-imports`.
- No duplicate imports, no self-imports.

### React

- JSX runtime (no `import React`).
- `useShallow` from `zustand/shallow` when selecting multiple store fields.
- Zustand state mutations use `immer`'s `produce`.

### SQL / Database

- DB column names use quoted `"camelCase"` in SQL (e.g., `"regionId"`).
- Services in `api/src/services/` use raw `pg` queries via `shared/db/utils/pgPool.ts` (no ORM).
- All `db.query` calls pass the SQL as a template literal (backticks), never a plain/escaped string — even one-liners. The query is assigned to a `query` variable first, opening on its own line indented one level under the backtick, and passed to `db.query` separately from the params array. Each clause (`SELECT`, `FROM`, `WHERE`, etc.) goes on its own line even when the whole query would otherwise fit on one:

  ```ts
  const query = `
    SELECT "name"
    FROM dat."Skill"
    WHERE "id" = $1
  `;
  db.query<{ name: string }>(query, [skillId]);
  ```

### ESLint

ESLint config is in `shared/eslint.config.mjs`, extended by each package. `api/eslint.config.mjs` turns off most React-specific stylistic rules (`react/*`, `react-hooks/*`, `react-refresh/*`) since `api/` has no JSX.

## Testing

Tests live in `.tests/` (separate package), not alongside source files. Vitest with two project configs: `node` environment for `api/`/`shared/` tests (mocking `shared/db/utils/pgPool`'s `PgPool` and `shared/utils/env`'s `Env`) and `jsdom` for `client/` tests (stubbing `VITE_ENV`/`VITE_API_URL` via `vi.stubEnv`). Test files mirror source structure (e.g., `.tests/api/utils/controllerError.test.ts`).

```bash
npm test                              # run all tests
npm run test:watch                    # watch mode
npx vitest run -t "test name"         # run a single test by name (from .tests/)
```

`.tests/` has no ESLint config and is not linted — don't run `npm run lint`/`lintfix` there or try to fix lint errors in test files.

## Environment

Requires `.env` at repo root (copy from `.env.example`). PostgreSQL database named `bwgr` must exist locally. All packages read env via `dotenv` from root.
