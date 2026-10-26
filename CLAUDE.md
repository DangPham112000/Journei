# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Journey Planner ("Journei") is a trip-planning web app: a React SPA (`frontend/`) talking to an Express + Apollo GraphQL server (`backend/`) backed by MongoDB. It is a pnpm workspace with those two packages.

The repo uses **pnpm** (migrated from Yarn; see `pnpm-workspace.yaml`, `.npmrc` with `shamefully-hoist=true`). Use `pnpm` for everything.

## Commands

Run from the repo root unless noted.

| Command | What it does |
| --- | --- |
| `pnpm install` | Install all workspace dependencies |
| `pnpm start` | Run backend + frontend in **Mock Mode** (see below) |
| `pnpm start:prod` | Run backend + frontend against a real MongoDB and real Google APIs (needs `.env` files) |
| `pnpm dev:backend` / `pnpm dev:frontend` | Run one side only (non-mock) |
| `pnpm generate` | Regenerate GraphQL types for both packages |
| `pnpm build:backend` / `pnpm build:frontend` | `tsc` build (backend also copies `schema.gql` to `dist/`); frontend runs `tsc -b && vite build` |
| `pnpm --filter frontend lint` | ESLint (frontend only; the backend has no lint script or ESLint config) |

There is no test suite or test runner configured in either package. The type-check via the build commands and the frontend lint are the only automated checks.

Frontend dev server is `http://localhost:5173`; backend is `http://localhost:4000/graphql`. Vite proxies `/graphql` to the backend, and the Apollo client (`src/lib/apolloClient.ts`) uses the relative `/graphql` URI, so the frontend never needs a backend URL.

## Mock Mode

`pnpm start` sets `MOCK_MODE=true VITE_MOCK_MODE=true` and is the default way to develop without Clerk or Google credentials or a database. It works at two separate layers:

- **Backend** runs `src/mock-index.ts` instead of `src/index.ts`. It starts a `mongodb-memory-server`, points `MONGODB_URI` at it, seeds data via `src/utils/seed.ts`, intercepts Google Calendar HTTP calls with `nock`, and then `require`s `index.ts`. With `MOCK_MODE=true`, the `index.ts` context skips Clerk and treats every request as the "Mock User" (`MOCK_USER` in `src/coreUsers.ts`, Clerk id `user_mock`), which `seed.ts` inserts into the in-memory `core.users`. Data is reset on every backend restart (including nodemon reloads).
- **Frontend** `vite.config.ts` aliases `@clerk/react` and `@vis.gl/react-google-maps` to stubs in `src/__mocks__/` when `VITE_MOCK_MODE` is true. The Clerk stub is always signed in and sends no token.

Application code contains no mock branches outside the `index.ts` context function; if you add a new export usage from either aliased package, add it to the matching stub too. Likewise, new models that need dev data go in `seed.ts`.

## Environment variables

- `backend/.env`: `MONGODB_URI`, `CLERK_SECRET_KEY`, `CLERK_AUTHORIZED_PARTIES` (optional, comma-separated origins allowed to use a session token), `FRONTEND_URL` (CORS origin, defaults to `http://localhost:5173`), `CLERK_PUBLISHABLE_KEY` (MCP OAuth discovery), `PORT`, `LOG_LEVEL`, `EVENT_MANAGER_GRAPHQL_URL` and `EVENT_MANAGER_URL` (calendar sync, both have production defaults).
- `frontend/.env`: `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_GOOGLE_MAPS_API_KEY`. In production these are baked into the image as Docker build args read from Doppler (`journei/prd`) with the `DOPPLER_TOKEN` GitHub secret; the Clerk key comes from Doppler's `CLERK_PUBLISHABLE_KEY` (shared with the backend).

## GraphQL workflow

`backend/src/schema.gql` is the single source of truth for the API.

- The backend reads it from disk at startup (`readFileSync` next to the compiled entry point, which is why `build` copies it into `dist/`).
- Backend codegen emits resolver types to `backend/src/__generated__/graphql.ts`.
- Frontend codegen reads the **backend's** schema (`../backend/src/**/*.gql`) plus operation documents in `frontend/src/**/*.gql`, and emits typed Apollo hooks (`useGetMyPlansQuery`, `useMeQuery`, ...) to `frontend/src/__generated__/graphql.ts`.

To change the API: edit `schema.gql`, update `backend/src/graphql/resolvers.ts`, add/adjust operations in `frontend/src/graphql/*.gql`, then run `pnpm generate`. Both `__generated__` files are committed and ESLint-ignored; never edit them by hand. Components should import the generated hooks rather than writing inline `gql` documents.

## Backend architecture

- `src/index.ts` wires Express middleware (pino-http, CORS) and mounts Apollo Server at `/graphql`. The context function resolves the user from the Clerk session token in the `Authorization: Bearer` header (`src/auth.ts`) and exposes `{ user, req, res }`, where `user` is `{ id, email }` (the Mongo user id) or `null`.
- `src/graphql/resolvers.ts` holds all resolvers in one file. Protected resolvers are wrapped in `requireAuth(...)`. Resolvers are currently typed with `any` rather than the generated resolver types.
- **Auth flow**: sign-in, sign-up and sign-out are handled entirely by Clerk on the frontend. The Apollo client attaches the Clerk session token to every request, and `src/auth.ts` verifies it with `@clerk/backend`. There are no auth mutations or REST auth routes.
- **Users (DAN-93)**: Journei has **no user table**. `context.user.id` is the Clerk user id, and `Plan.userId` stores it. Email, name and avatar come from the ecosystem's shared `core.users` (`src/coreUsers.ts`, read-only: only the core-users service in `ecosystem-infra` writes it), with a Clerk API fallback in `getUserByClerkId` when a brand-new user's webhook has not arrived yet. Never write `core`. App-specific per-user data goes in Journei's own database keyed by Clerk id. `src/migrateToClerkIds.ts` rewrote old ObjectId `userId`s on startup and dropped the old `users` collection; a pre-migration dump is in `/opt/journei/backups/pre-dan-93.archive` (made once by `scripts/backup-db.sh` in the deploy).
- **Data model and ownership** (`src/models/`): `Plan` belongs to a user (`userId` = Clerk id) and references many `Destination`s. `Place` belongs to a `Plan` and references one `Destination` and one `Category`. `ScheduledActivity` references a `Place`. Only `Plan` carries `userId`, so authorization for places and activities is done by walking up to the owning plan and comparing `plan.userId` to `context.user.id`; follow that pattern for new resolvers. Deletes cascade manually in the resolver (plan → places → activities).
- **MCP server** (`src/mcp/`): Streamable HTTP endpoint at `POST /mcp`, stateless (a fresh `McpServer` per request). Auth is a Clerk **OAuth access token** (`getUserFromOAuthHeader` in `auth.ts`), not a session token; a 401 carries `WWW-Authenticate` pointing at `/.well-known/oauth-protected-resource`, which names Clerk's Frontend API (derived from `CLERK_PUBLISHABLE_KEY`) as the authorization server. Tools in `src/mcp/tools.ts` call the GraphQL resolvers so the plan-ownership checks stay in one place; delete operations are deliberately not exposed. Mock Mode treats every `/mcp` request as the mock user.
- **Event Manager calendar sync (DAN-95)**: a plan with `calendarSync` on copies each scheduled activity to the owner's Event Manager calendar. `src/eventManager.ts` calls Event Manager's GraphQL server to server (`EVENT_MANAGER_GRAPHQL_URL`, default `http://event-manager-backend:4000/graphql` on the `ecosystem` network) with the user's own Clerk session token from the request, which works because Journei's origin is in Event Manager's `CLERK_AUTHORIZED_PARTIES`. `src/calendarSync.ts` creates, moves and deletes events from the activity, place, plan mutations, and the activity keeps only a `calendarEvent: { app, id }` reference. Failures are logged and never fail the Journei mutation; MCP requests carry an OAuth token, not a session token, so they do not sync until the user presses "Sync now". `ScheduledActivity.calendarConflicts` and `Query.calendarConflicts` use Event Manager's `conflicts` query to warn about overlaps.
- `Category` and `Destination` are global, shared across users, and `create*` for them is get-or-create by unique name. `recommendedPlaces` intentionally returns places from all users for a destination.
- **Field naming mismatch**: Mongoose stores references as `destinationId` / `categoryId` / `placeId`, while the GraphQL types expose `destination` / `category` / `place`. Queries must `.populate()` those paths and the type-level resolvers (`Place.destination`, `ScheduledActivity.place`, ...) map the populated field across. Dates are stored as `Date` and exposed as `String`.
- Logging uses pino (`src/utils/logger.ts`, pretty-printed outside production) plus an Apollo plugin in `src/utils/graphqlLogger.ts`.

## Frontend architecture

- `src/main.tsx` sets up Apollo, Clerk (`components/auth/ClerkWithRouter.tsx`), and the routes. `/sign-in` and `/sign-up` render Clerk's components (`pages/SignInPage.tsx`); everything else renders inside `RequireAuth` (redirects signed-out users to `/sign-in`) and `layouts/MainLayout.tsx`, which runs the `Me` query and shows Clerk's `UserButton`.
- The main feature lives in `src/pages/plans/` (`ManagePlansPage`, `PlanDetailsPage`) with operations in `src/graphql/plans.gql`.
- UI primitives in `src/components/ui/` are shadcn components generated with the `base-nova` style, which is built on **Base UI**, not Radix. Composition uses the `render` prop (e.g. `<Button render={<RouterLink to="/plans" />}>`), not `asChild`. Add new primitives with the shadcn CLI per `components.json`.
- `@/` aliases `frontend/src/`. Styling is Tailwind v3 with CSS variables defined in `src/index.css`.
- `tsconfig.app.json` enables `verbatimModuleSyntax`, `erasableSyntaxOnly`, and `noUnusedLocals`/`noUnusedParameters`, so use `import type` for type-only imports and avoid enums and parameter properties; the build fails otherwise.

### Unfinished / legacy areas

- `/app` (`App.tsx` with `JourneyPlanner`, `LocationInput`, `Map`) is the original prototype screen with TODO placeholders for map pins. It is routed but not linked from the nav.
- Google Calendar integration is not implemented (calendar sync goes to Event Manager instead, see above): `Plan.googleEventId` is unused, and `index.ts` only has a TODO for it. With Clerk, a Google access token can be fetched with `clerk.users.getUserOauthAccessToken`.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which **deploys to production**: it builds both Docker images (build context is the repo root so the pnpm workspace resolves), pushes them to GHCR, copies `docker-compose.yml` and `nginx/` to the VPS, and restarts the stack. `DEPLOYMENT.md` has the full setup guide.

- Production topology: `nginx-proxy` routes `/graphql` to `backend:4000` and everything else to the `frontend` container (its own nginx with SPA fallback in `frontend/nginx.conf`), with MongoDB on the ecosystem's shared instance (`ecosystem-mongo` from the `ecosystem-infra` repo, DAN-90): the backend joins the external `ecosystem` network and logs in as the `journei` Mongo user with `MONGO_PASSWORD` from Doppler, which can only write the `journey-planner` database. Deploy that stack first. Cloudflare terminates TLS.
- The `Cross-Origin-Opener-Policy: same-origin-allow-popups` header (originally for the Google login popup, kept for Clerk's OAuth popups) is set in three places that must stay in sync: `frontend/vite.config.ts`, `frontend/nginx.conf`, and `nginx/nginx.conf`.
- New backend env vars must be added to the `environment:` list in `docker-compose.yml` as well as Doppler `journei/prd`, or the container will not receive them. The VPS has no `.env`: the deploy runs `doppler run -- docker compose up -d` in `/opt/journei`. Clerk keys reference the shared ecosystem Clerk app (`${shared.prd.CLERK_*}`).
- `.github/workflows/clear-mongodb.yml` is a manual workflow that drops every collection in the production `journey-planner` database.

## Code style

Prettier config (`.prettierrc`): semicolons, single quotes, trailing commas, 100-column width, 2-space indent.
