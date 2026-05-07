# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Meta:** When the user states a new rule or convention, always add it to this file immediately before continuing with any other work.

## Monorepo Overview

FET is a Turborepo monorepo managed with **pnpm workspaces**.

```
apps/
  main/             # NestJS REST API + auth server (primary backend)
  journey-service/  # NestJS microservice for journey/location calculations
  web/              # Vite + React SPA (served by apps/main in production)
  docs/             # Docusaurus developer docs + Swagger/OpenAPI reference
packages/
  logger/           # Shared Pino logger
  errors/           # Shared error types
  http/             # Shared HTTP client utilities
  journey-service-client/  # Zod schemas + typed client for journey-service
  ui/               # Shared React components
  tsconfig/         # Shared TypeScript configs
```

`apps/template-service` and `apps/web-app` have been deleted (legacy artifacts).

## Common Commands

```bash
pnpm install                        # Install all workspace dependencies
pnpm dev                            # Start all apps in dev mode (via Turbo)
pnpm build                          # Build all apps
pnpm lint                           # Run oxlint across workspace
pnpm format                         # Run oxc formatter across workspace
pnpm test                           # Run all tests

# Scoped to a single app
pnpm --filter @fet/main dev
pnpm --filter @fet/main test
pnpm --filter @fet/main test -- --testNamePattern="JourneyService"
```

## Docker (Development)

```bash
docker compose up        # Start all services + MongoDB
docker compose up main   # Start only the main app + its deps
```

The `docker-compose.yml` at the repo root defines dev services: `main`, `journey-service`, and `mongodb`. Each app has a corresponding `Dockerfile`.

## Tech Stack

| Area                      | Choice                                                            |
| ------------------------- | ----------------------------------------------------------------- |
| Runtime                   | Node.js 24 LTS                                                    |
| Package manager           | pnpm                                                              |
| Monorepo                  | Turborepo                                                         |
| Backend framework         | NestJS with **Fastify adapter** (`@nestjs/platform-fastify`)      |
| Database                  | MongoDB via Mongoose (`@nestjs/mongoose`)                         |
| Frontend                  | Vite + React                                                      |
| Docs                      | Docusaurus + `docusaurus-plugin-openapi-docs`                     |
| Lint / Format / Transform | [OXC](https://oxc.rs/) (`oxlint`, oxc formatter, oxc transformer) |

> **Fastify adapter note:** If passport.js or a third-party middleware requires Express, swap by replacing `FastifyAdapter` with `ExpressAdapter` in `main.ts` — everything else stays the same.

## Architecture

### apps/main

NestJS application. Responsibilities:

- User auth (JWT, registration/login)
- Vehicles and odometer readings
- Integration keys (API keys issued to third-party location providers)
- Receiving location updates from external integrations, forwarding them to `journey-service`
- Creating journey records via internal API call to `journey-service`
- Serving the Vite-built `apps/web` SPA in production

Modules follow NestJS conventions: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.schema.ts` (Mongoose schemas).

### apps/journey-service

NestJS microservice. Responsibilities:

- Stateful journey tracking: receives location pings, determines when a journey starts/ends
- Exposes a POST endpoint authenticated by an internal API key
- Persists journey records to MongoDB

Communicates with `apps/main` only via HTTP (using `packages/http` + `packages/journey-service-client`).

### apps/web

Vite + React SPA. No SSR. Built output is served by `apps/main` in production.

**Stack:** Vite 5 · React 18 · React Router v6 · Tailwind CSS v4 · TypeScript (strict, `moduleResolution: bundler`)

**HTTP client** — `src/lib/api.ts` is a typed `fetch` wrapper. All API calls go through it:

- Token stored in `localStorage` under key `fet_token`; `getToken`/`setToken`/`clearToken` helpers live alongside
- `401` responses auto-redirect to `/login` and clear the token
- All endpoint methods are fully typed against the shared `src/types/index.ts` interfaces

**Auth state** — `src/context/AuthContext.tsx` provides `useAuth()` hook (`user`, `isLoading`, `login`, `logout`). On mount it calls `GET /api/me` to rehydrate from localStorage.

**Routing** — `ProtectedRoute` wraps all dashboard routes; unauthenticated users redirect to `/login`. Route tree is declared in `src/App.tsx`.

**Dev proxy** — `vite.config.ts` proxies `/api`, `/register`, `/login` to `http://localhost:3000` so no CORS config is needed during local development.

**Pages:** `DashboardPage` (journeys), `VehiclesPage` (vehicles + odometer), `IntegrationsPage` (API keys + webhook URLs), `SettingsPage` (user config), `LoginPage`, `RegisterPage`.

### apps/docs

Docusaurus site. Source docs live in `docs/` markdown files. OpenAPI spec is generated from `apps/main` and rendered via `docusaurus-plugin-openapi-docs`.

## Domain Concepts

- **Journey** — A recorded trip. Has a start/end time, start/end location, total distance, and status (`new` | `inProgress` | `completed`).
- **Location update** — A ping from an external integration containing `lat`, `lon`, `velocity`, `distance`, and `created_at`. Sent to `journey-service` to advance journey state.
- **Integration** — A named external service (e.g. a GPS tracker) that can POST location updates. Each user holds an API key per integration.
- **Vehicle** — A user's car/vehicle record.
- **OdometerReading** — A manual odometer entry associated with a vehicle.

## Inter-Service Communication

`apps/main` calls `apps/journey-service` over HTTP using the shared client in `packages/journey-service-client`. Requests are authenticated with a shared `INTERNAL_KEY` environment variable.

## Coding Conventions

### TypeScript

- **Never use `any`.** Avoid `unknown` where possible. When the type is not statically known, perform runtime validation (e.g. Zod, class-validator, or a type guard) rather than casting.
- **Explicit return types** — every function and method must have an explicit return type annotation. Enforced by ESLint.
- **Object arguments** — when a function has two or more parameters, use a single object argument instead of positional params.
- **Docstrings** — add a JSDoc comment to every public method on a class or interface, and every exported module-level function. Keep them concise: only document parameters, return value, or thrown errors when it genuinely adds information beyond the name.
- **Logging** — always place a blank line before and after a log statement, and a blank line after a closing scope brace (where the formatter allows).

### Testing

- **Co-locate test files** — place `*.spec.ts` files next to the source file they test (e.g. `src/auth/auth.spec.ts`). The vitest config picks up `src/**/*.spec.ts`; `tsconfig.build.json` excludes them from the production build.
- **Integration tests use the real DB** — prefer hitting a real MongoDB instance over mocking. Test databases are configured in `vitest.setup.ts` per app.
- **No cleanup after tests** — tests leave data in the DB. Use unique identifiers (e.g. `Date.now()`) to avoid collisions across runs.

### Auth

Current auth is NestJS-native JWT (`@nestjs/jwt`) with a custom `JwtAuthGuard` — no Passport. Clerk is planned as a future replacement; do not introduce Passport in the meantime.

### Git — Conventional Commits

All commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

types: feat | fix | chore | test | docs | refactor | style | perf | build | ci
scope: optional, e.g. main | journey-service | web | auth
```

Examples: `feat(auth): add JWT refresh token`, `chore: migrate to pnpm`, `fix(journey): correct distance calculation`

## Environment Variables

Key variables (see `.env.example` in each app for full list):

| Variable              | Used by                                          |
| --------------------- | ------------------------------------------------ |
| `MONGODB_URI`         | main, journey-service                            |
| `JWT_SECRET`          | main                                             |
| `INTERNAL_KEY`        | main (outbound) + journey-service (inbound auth) |
| `JOURNEY_SERVICE_URL` | main                                             |
| `HERE_APP_KEY`        | journey-service (HERE Maps API for geocoding)    |
